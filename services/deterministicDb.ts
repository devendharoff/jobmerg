import { supabase } from "../src/supabaseClient";
import { runDeterministicExtractionEngine } from "./deterministicExtractor/engine";
import { CanonicalResume } from "./deterministicExtractor/types";

// In-memory resume store fallback
const inMemoryResumes = new Map<string, { resume: CanonicalResume; buffer: Buffer; fileName: string }>();

export async function saveDeterministicResume(
  resume: CanonicalResume,
  buffer: Buffer,
  userId?: string
): Promise<void> {
  // 1. Always store in-memory store for instant zero-latency retrieval
  inMemoryResumes.set(resume.resume_id, {
    resume,
    buffer,
    fileName: resume.metadata.file_name
  });

  // 2. Persist to Supabase DB if client is connected
  try {
    const { data, error } = await supabase
      .from("resumes")
      .upsert({
        id: resume.resume_id,
        user_id: userId || null,
        file_name: resume.metadata.file_name,
        file_type: resume.metadata.file_type,
        file_hash: resume.metadata.file_hash,
        page_count: resume.metadata.page_count,
        raw_text: resume.raw.full_text,
        structured_json: resume,
        parser_version: resume.metadata.parser_version,
        created_at: resume.metadata.extracted_at
      });

    if (error) {
      console.warn("[DeterministicDB] Supabase upsert notice (using in-memory store):", error.message);
    } else {
      console.log(`[DeterministicDB] Successfully stored resume ${resume.resume_id} in Supabase DB.`);
    }
  } catch (err: any) {
    console.warn("[DeterministicDB] Supabase DB write skipped (fallback active):", err.message);
  }
}

export async function getDeterministicResumeById(resumeId: string): Promise<CanonicalResume | null> {
  // Check in-memory store first
  const memoryRecord = inMemoryResumes.get(resumeId);
  if (memoryRecord) {
    return memoryRecord.resume;
  }

  // Check Supabase DB
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("structured_json")
      .eq("id", resumeId)
      .single();

    if (data && data.structured_json) {
      return data.structured_json as CanonicalResume;
    }
  } catch (err: any) {
    console.warn("[DeterministicDB] Supabase DB lookup warning:", err.message);
  }

  return null;
}

export async function getDeterministicResumeRaw(resumeId: string): Promise<{
  full_text: string;
  pages: any[];
  sections: any[];
} | null> {
  const resume = await getDeterministicResumeById(resumeId);
  if (resume) {
    return resume.raw;
  }
  return null;
}

export async function reprocessDeterministicResume(resumeId: string): Promise<CanonicalResume | null> {
  const memoryRecord = inMemoryResumes.get(resumeId);
  if (!memoryRecord) {
    return null;
  }

  const freshResume = await runDeterministicExtractionEngine(
    memoryRecord.buffer,
    memoryRecord.fileName
  );

  // Update stores
  inMemoryResumes.set(resumeId, {
    resume: freshResume,
    buffer: memoryRecord.buffer,
    fileName: memoryRecord.fileName
  });

  return freshResume;
}

export function updateDeterministicResume(
  resumeId: string,
  updatedResume: CanonicalResume
): boolean {
  const memoryRecord = inMemoryResumes.get(resumeId);
  if (memoryRecord) {
    inMemoryResumes.set(resumeId, {
      ...memoryRecord,
      resume: updatedResume
    });
    return true;
  }
  return false;
}
