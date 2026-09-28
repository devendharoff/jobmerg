import { CanonicalResume } from "./deterministicExtractor/types";
import { parseDocument, ParsedDocument } from "./deterministicExtractor/documentParser";
import { detectSections } from "./deterministicExtractor/sectionDetector";
import { parseContactInfo } from "./deterministicExtractor/contactParser";
import { parseSkills } from "./deterministicExtractor/skillsParser";
import { parseExperience } from "./deterministicExtractor/experienceParser";
import { parseEducation } from "./deterministicExtractor/educationParser";
import { parseProjects, parseCertifications, parseAchievements, parseLanguages, parseSummary } from "./deterministicExtractor/otherParsers";
import { validateCanonicalResume } from "./deterministicExtractor/validationEngine";
import { validateResumeFile } from "./deterministicExtractor/fileValidator";
import { saveDeterministicResume } from "./deterministicDb";
import { runDeterministicExtractionEngine } from "./deterministicExtractor/engine";

export type ExtractionStatus =
  | "queued"
  | "processing"
  | "text_extracted"
  | "sections_detected"
  | "structured"
  | "validated"
  | "completed"
  | "failed";

export interface ExtractionJob {
  resumeId: string;
  jobId: string;
  status: ExtractionStatus;
  progress: number;
  step: string;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  fileName: string;
  fileType: "pdf" | "docx";
  fileSize: number;
  pageCount: number;
  charCount: number;
  rawText: string | null;
  rawPages: any[] | null;
  sections: any[] | null;
  structured: any | null;
  canonical: CanonicalResume | null;
  validation: any | null;
  userId?: string;
}

const jobStore = new Map<string, ExtractionJob>();

export function createJob(
  fileName: string,
  buffer: Buffer,
  userId?: string
): ExtractionJob {
  const ext = fileName.split(".").pop()?.toLowerCase() === "docx" ? "docx" : "pdf";
  const resumeId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const job: ExtractionJob = {
    resumeId,
    jobId,
    status: "queued",
    progress: 0,
    step: "Job queued",
    error: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    durationMs: null,
    fileName,
    fileType: ext,
    fileSize: buffer.length,
    pageCount: 0,
    charCount: 0,
    rawText: null,
    rawPages: null,
    sections: null,
    structured: null,
    canonical: null,
    validation: null,
    userId
  };

  jobStore.set(resumeId, job);
  jobStore.set(jobId, job);

  console.log(`[ResumeExtraction] upload_started resumeId=${resumeId} jobId=${jobId} fileName="${fileName}" fileSize=${buffer.length}`);

  return job;
}

export function getJobByResumeId(resumeId: string): ExtractionJob | undefined {
  return jobStore.get(resumeId);
}

export async function processExtractionJobAsync(
  resumeId: string,
  buffer: Buffer
): Promise<void> {
  const job = jobStore.get(resumeId);
  if (!job) return;

  const startTime = Date.now();

  try {
    // Stage 1: Processing & File Validation
    job.status = "processing";
    job.progress = 10;
    job.step = "File validated. Starting text extraction...";
    console.log(`[ResumeExtraction] file_validated resumeId=${resumeId} duration=${Date.now() - startTime}ms`);

    const fileValidation = validateResumeFile(buffer, job.fileName);
    if (!fileValidation.isValid) {
      throw new Error(fileValidation.error || "File validation failed.");
    }

    // Stage 2: Raw Text Extraction
    console.log(`[ResumeExtraction] text_extraction_started resumeId=${resumeId}`);
    const parsedDoc: ParsedDocument = await parseDocument(buffer, fileValidation.detectedType as "pdf" | "docx");

    if (parsedDoc.isScannedOrImageOnly) {
      throw new Error("No usable text layer detected in PDF (scanned or image-only document).");
    }

    job.rawText = parsedDoc.full_text;
    job.rawPages = parsedDoc.pages;
    job.pageCount = parsedDoc.page_count;
    job.charCount = parsedDoc.char_count;
    job.status = "text_extracted";
    job.progress = 35;
    job.step = `Text extracted (${parsedDoc.char_count} chars, ${parsedDoc.page_count} pages)`;

    const textExtractedDuration = Date.now() - startTime;
    console.log(`[ResumeExtraction] text_extraction_completed resumeId=${resumeId} duration=${textExtractedDuration}ms pages=${parsedDoc.page_count} charCount=${parsedDoc.char_count}`);

    // Stage 3: Section Detection
    console.log(`[ResumeExtraction] section_detection_started resumeId=${resumeId}`);
    const sections = detectSections(parsedDoc.pages);
    job.sections = sections;
    job.status = "sections_detected";
    job.progress = 50;
    job.step = `Detected ${sections.length} resume section headers`;
    console.log(`[ResumeExtraction] section_detection_completed resumeId=${resumeId} sections=${sections.length}`);

    // Stage 4: Structured Fact Extraction
    const personal = parseContactInfo(parsedDoc.full_text, parsedDoc.pages, sections);
    const summary = parseSummary(parsedDoc.full_text, parsedDoc.pages, sections);
    const skills = parseSkills(parsedDoc.full_text, parsedDoc.pages, sections);
    const experience = parseExperience(parsedDoc.full_text, parsedDoc.pages, sections);
    const education = parseEducation(parsedDoc.full_text, parsedDoc.pages, sections);
    const projects = parseProjects(parsedDoc.full_text, parsedDoc.pages, sections);
    const certifications = parseCertifications(parsedDoc.full_text, parsedDoc.pages, sections);
    const achievements = parseAchievements(parsedDoc.full_text, parsedDoc.pages, sections);
    const languages = parseLanguages(parsedDoc.full_text, parsedDoc.pages, sections);

    const canonical: CanonicalResume = {
      resume_id: resumeId,
      metadata: {
        file_name: job.fileName,
        file_type: fileValidation.detectedType as "pdf" | "docx",
        file_size_bytes: fileValidation.fileSizeBytes,
        file_hash: fileValidation.fileHash,
        page_count: parsedDoc.page_count,
        parser: "JobMerge-DeterministicEngine",
        parser_version: "1.0.0",
        schema_version: "1.0.0",
        extracted_at: new Date().toISOString()
      },
      personal,
      summary,
      skills,
      experience,
      education,
      projects,
      certifications,
      achievements,
      languages,
      raw: {
        full_text: parsedDoc.full_text,
        pages: parsedDoc.pages,
        sections
      },
      validation: { status: "passed", items: [] }
    };

    job.structured = {
      personal,
      skills,
      experience,
      education,
      projects,
      certifications,
      achievements,
      languages,
      summary
    };
    job.status = "structured";
    job.progress = 75;
    job.step = "Extracted contact details, experience, skills & education";
    console.log(`[ResumeExtraction] structured_extraction_completed resumeId=${resumeId} expCount=${experience.length} skillCount=${skills.length}`);

    // Stage 5: Validation
    const validationResult = validateCanonicalResume(canonical);
    canonical.validation = validationResult;
    job.canonical = canonical;
    job.validation = validationResult;
    job.status = "validated";
    job.progress = 90;
    job.step = "Completed data consistency & date audit";
    console.log(`[ResumeExtraction] validation_completed resumeId=${resumeId} warnings=${validationResult.items.length}`);

    // Stage 6: Completion & DB Save
    await saveDeterministicResume(canonical, buffer, job.userId);
    const totalDuration = Date.now() - startTime;
    job.status = "completed";
    job.progress = 100;
    job.step = "Completed";
    job.completedAt = new Date().toISOString();
    job.durationMs = totalDuration;

    console.log(`[ResumeExtraction] extraction_completed resumeId=${resumeId} duration=${totalDuration}ms pages=${parsedDoc.page_count} charCount=${parsedDoc.char_count}`);

  } catch (err: any) {
    const errorDuration = Date.now() - startTime;
    job.status = "failed";
    job.progress = 0;
    job.step = "Extraction failed";
    job.error = err.message || "An unexpected error occurred during extraction.";
    job.completedAt = new Date().toISOString();
    job.durationMs = errorDuration;

    console.error(`[ResumeExtraction] extraction_failed resumeId=${resumeId} duration=${errorDuration}ms error="${job.error}"`);
  }
}
