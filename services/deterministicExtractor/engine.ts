import crypto from "crypto";
import { parseContactInfo } from "./contactParser";
import { parseDocument } from "./documentParser";
import { parseEducation } from "./educationParser";
import { parseExperience } from "./experienceParser";
import { validateResumeFile } from "./fileValidator";
import { parseAchievements, parseCertifications, parseLanguages, parseProjects, parseSummary } from "./otherParsers";
import { detectSections } from "./sectionDetector";
import { parseSkills } from "./skillsParser";
import { CanonicalResume, CanonicalResumeSchema } from "./types";
import { validateCanonicalResume } from "./validationEngine";

export async function runDeterministicExtractionEngine(
  fileBuffer: Buffer,
  fileName: string
): Promise<CanonicalResume> {
  const extractedAt = new Date().toISOString();

  // 1. File Validation
  const fileValidation = validateResumeFile(fileBuffer, fileName);
  if (!fileValidation.isValid) {
    throw new Error(`File Validation Error: ${fileValidation.error}`);
  }

  const resumeId = `res_${crypto.randomBytes(8).toString("hex")}`;

  // 2. Document Parser
  const docParsed = await parseDocument(fileBuffer, fileValidation.detectedType as "pdf" | "docx");

  // Handle scanned / image-only PDFs
  if (docParsed.isScannedOrImageOnly) {
    const scannedResume: CanonicalResume = {
      resume_id: resumeId,
      metadata: {
        file_name: fileName,
        file_type: fileValidation.detectedType as "pdf" | "docx",
        file_size_bytes: fileValidation.fileSizeBytes,
        file_hash: fileValidation.fileHash,
        page_count: docParsed.page_count,
        parser: "JobMerge-DeterministicEngine",
        parser_version: "1.0.0",
        schema_version: "1.0.0",
        extracted_at: extractedAt
      },
      personal: {
        name: { value: null, raw: null, source: null, modified_by_user: false },
        email: { value: null, raw: null, source: null, modified_by_user: false },
        phone: { raw: null, normalized: null, source: null, modified_by_user: false },
        location: { value: null, raw: null, source: null, modified_by_user: false },
        linkedin: { value: null, raw: null, source: null, modified_by_user: false },
        github: { value: null, raw: null, source: null, modified_by_user: false },
        portfolio: { value: null, raw: null, source: null, modified_by_user: false }
      },
      summary: { value: null, raw: null, source: null, modified_by_user: false },
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],
      raw: {
        full_text: docParsed.full_text,
        pages: docParsed.pages,
        sections: []
      },
      validation: {
        status: "failed",
        items: [
          {
            code: "SCANNED_DOCUMENT_DETECTED",
            field: "document",
            message: "⚠️ Document appears to be a scanned image or lacks a readable text layer. No text could be extracted.",
            level: "error"
          }
        ]
      }
    };

    return CanonicalResumeSchema.parse(scannedResume);
  }

  // 3. Section Detection
  const rawSections = detectSections(docParsed.pages);

  // 4. Deterministic Field Extractions
  const personal = parseContactInfo(docParsed.full_text, docParsed.pages, rawSections);
  const summary = parseSummary(docParsed.full_text, docParsed.pages, rawSections);
  const skills = parseSkills(docParsed.full_text, docParsed.pages, rawSections);
  const experience = parseExperience(docParsed.full_text, docParsed.pages, rawSections);
  const education = parseEducation(docParsed.full_text, docParsed.pages, rawSections);
  const projects = parseProjects(docParsed.full_text, docParsed.pages, rawSections);
  const certifications = parseCertifications(docParsed.full_text, docParsed.pages, rawSections);
  const achievements = parseAchievements(docParsed.full_text, docParsed.pages, rawSections);
  const languages = parseLanguages(docParsed.full_text, docParsed.pages, rawSections);

  // 5. Construct Canonical Resume
  const canonicalCandidate: CanonicalResume = {
    resume_id: resumeId,
    metadata: {
      file_name: fileName,
      file_type: fileValidation.detectedType as "pdf" | "docx",
      file_size_bytes: fileValidation.fileSizeBytes,
      file_hash: fileValidation.fileHash,
      page_count: docParsed.page_count,
      parser: "JobMerge-DeterministicEngine",
      parser_version: "1.0.0",
      schema_version: "1.0.0",
      extracted_at: extractedAt
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
      full_text: docParsed.full_text,
      pages: docParsed.pages,
      sections: rawSections
    },
    validation: {
      status: "passed",
      items: []
    }
  };

  // 6. Run Validation Engine
  const valResult = validateCanonicalResume(canonicalCandidate);
  canonicalCandidate.validation = valResult;

  // 7. Validate through Zod Schema
  return CanonicalResumeSchema.parse(canonicalCandidate);
}
