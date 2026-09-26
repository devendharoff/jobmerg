import { z } from "zod";

// Source metadata tracking exact origin of extracted values
export const ExtractedSourceSchema = z.object({
  page: z.number(),
  section: z.string().nullable(),
  block_ids: z.array(z.string()),
  raw_text: z.string()
});
export type ExtractedSource = z.infer<typeof ExtractedSourceSchema>;

// Generic ExtractedField structure preserving raw and normalized values
export function createExtractedFieldSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    value: valueSchema.nullable(),
    raw: z.string().nullable(),
    source: ExtractedSourceSchema.nullable(),
    modified_by_user: z.boolean().default(false)
  });
}

export type ExtractedField<T> = {
  value: T | null;
  raw: string | null;
  source: ExtractedSource | null;
  modified_by_user?: boolean;
};

// Date Field Schema
export const DateFieldSchema = z.object({
  raw: z.string(),
  start_normalized: z.string().nullable(),
  end_normalized: z.string().nullable(),
  is_current: z.boolean().default(false)
});
export type DateField = z.infer<typeof DateFieldSchema>;

// Personal Information Schema
export const PersonalInfoSchema = z.object({
  name: createExtractedFieldSchema(z.string()),
  email: createExtractedFieldSchema(z.string()),
  phone: z.object({
    raw: z.string().nullable(),
    normalized: z.string().nullable(),
    source: ExtractedSourceSchema.nullable(),
    modified_by_user: z.boolean().default(false)
  }),
  location: createExtractedFieldSchema(z.string()),
  linkedin: createExtractedFieldSchema(z.string()),
  github: createExtractedFieldSchema(z.string()),
  portfolio: createExtractedFieldSchema(z.string())
});
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

// Skill Schema (strictly extracted from document)
export const SkillSchema = z.object({
  raw_value: z.string(),
  normalized_value: z.string(),
  category: z.string().optional(),
  source: ExtractedSourceSchema.nullable()
});
export type Skill = z.infer<typeof SkillSchema>;

// Experience Entry Schema
export const ExperienceSchema = z.object({
  id: z.string(),
  title: z.object({ raw: z.string() }),
  company: z.object({ raw: z.string() }),
  location: z.object({ raw: z.string() }).optional(),
  date: DateFieldSchema,
  description: z.array(z.string()),
  source: ExtractedSourceSchema.nullable()
});
export type Experience = z.infer<typeof ExperienceSchema>;

// Grade Schema for Education
export const GradeSchema = z.object({
  type: z.enum(["CGPA", "GPA", "Percentage", "Marks", "Other"]),
  raw: z.string(),
  value: z.number().nullable()
});
export type Grade = z.infer<typeof GradeSchema>;

// Education Entry Schema
export const EducationSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  field_of_study: z.string().nullable(),
  location: z.string().optional(),
  date: DateFieldSchema,
  grade: GradeSchema.nullable(),
  source: ExtractedSourceSchema.nullable()
});
export type Education = z.infer<typeof EducationSchema>;

// Project Schema
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  subtitle: z.string().optional(),
  description: z.array(z.string()),
  technologies: z.array(z.string()),
  url: z.string().optional(),
  source: ExtractedSourceSchema.nullable()
});
export type Project = z.infer<typeof ProjectSchema>;

// Certification Schema
export const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string().optional(),
  date: DateFieldSchema.optional(),
  credential_id: z.string().optional(),
  credential_url: z.string().optional(),
  source: ExtractedSourceSchema.nullable()
});
export type Certification = z.infer<typeof CertificationSchema>;

// Achievement Schema
export const AchievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  date: z.string().optional(),
  source: ExtractedSourceSchema.nullable()
});
export type Achievement = z.infer<typeof AchievementSchema>;

// Language Schema
export const LanguageSchema = z.object({
  name: z.string(),
  proficiency: z.string().optional(),
  source: ExtractedSourceSchema.nullable()
});
export type Language = z.infer<typeof LanguageSchema>;

// Validation Warning / Message Schema
export const ValidationItemSchema = z.object({
  code: z.string(),
  field: z.string(),
  message: z.string(),
  level: z.enum(["info", "warning", "error"])
});
export type ValidationItem = z.infer<typeof ValidationItemSchema>;

// Raw Document Page Block Structure
export const TextBlockSchema = z.object({
  id: z.string(),
  text: z.string(),
  line: z.number()
});
export type TextBlock = z.infer<typeof TextBlockSchema>;

export const RawPageSchema = z.object({
  page: z.number(),
  text: z.string(),
  blocks: z.array(TextBlockSchema)
});
export type RawPage = z.infer<typeof RawPageSchema>;

export const RawSectionSchema = z.object({
  section_type: z.string(),
  heading_raw: z.string(),
  page: z.number(),
  start_line: z.number(),
  end_line: z.number(),
  content_text: z.string()
});
export type RawSection = z.infer<typeof RawSectionSchema>;

// Document Metadata
export const MetadataSchema = z.object({
  file_name: z.string(),
  file_type: z.enum(["pdf", "docx"]),
  file_size_bytes: z.number(),
  file_hash: z.string(),
  page_count: z.number(),
  parser: z.string().default("JobMerge-DeterministicEngine"),
  parser_version: z.string().default("1.0.0"),
  schema_version: z.string().default("1.0.0"),
  extracted_at: z.string()
});
export type Metadata = z.infer<typeof MetadataSchema>;

// Full Canonical Deterministic Resume Schema
export const CanonicalResumeSchema = z.object({
  resume_id: z.string(),
  metadata: MetadataSchema,
  personal: PersonalInfoSchema,
  summary: createExtractedFieldSchema(z.string()),
  skills: z.array(SkillSchema),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  projects: z.array(ProjectSchema),
  certifications: z.array(CertificationSchema),
  achievements: z.array(AchievementSchema),
  languages: z.array(LanguageSchema),
  raw: z.object({
    full_text: z.string(),
    pages: z.array(RawPageSchema),
    sections: z.array(RawSectionSchema)
  }),
  validation: z.object({
    status: z.enum(["passed", "warnings", "failed"]),
    items: z.array(ValidationItemSchema)
  })
});
export type CanonicalResume = z.infer<typeof CanonicalResumeSchema>;
