import { CanonicalResume, ValidationItem } from "./types";

export function validateCanonicalResume(resume: CanonicalResume): {
  status: "passed" | "warnings" | "failed";
  items: ValidationItem[];
} {
  const items: ValidationItem[] = [];

  // 1. Email structure check
  const email = resume.personal.email.value;
  if (!email) {
    items.push({
      code: "MISSING_EMAIL",
      field: "personal.email",
      message: "No email address detected in document contact header.",
      level: "warning"
    });
  } else if (!/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(email)) {
    items.push({
      code: "INVALID_EMAIL_FORMAT",
      field: "personal.email",
      message: `Email format "${email}" may be invalid.`,
      level: "warning"
    });
  }

  // 2. Phone structure check
  const phone = resume.personal.phone.raw;
  if (!phone) {
    items.push({
      code: "MISSING_PHONE",
      field: "personal.phone",
      message: "No phone number detected in document header.",
      level: "info"
    });
  }

  // 3. Name check
  if (!resume.personal.name.value) {
    items.push({
      code: "MISSING_NAME",
      field: "personal.name",
      message: "Could not deterministically verify full name at top of document.",
      level: "warning"
    });
  }

  // 4. Date sanity checks (start <= end)
  resume.experience.forEach((exp, idx) => {
    const start = exp.date.start_normalized;
    const end = exp.date.end_normalized;
    if (start && end) {
      if (start > end) {
        items.push({
          code: "INVALID_EXPERIENCE_DATE_RANGE",
          field: `experience[${idx}].date`,
          message: `End date (${end}) occurs before start date (${start}) for role "${exp.title.raw}".`,
          level: "warning"
        });
      }
    }
  });

  resume.education.forEach((edu, idx) => {
    const start = edu.date.start_normalized;
    const end = edu.date.end_normalized;
    if (start && end) {
      if (start > end) {
        items.push({
          code: "INVALID_EDUCATION_DATE_RANGE",
          field: `education[${idx}].date`,
          message: `End date (${end}) occurs before start date (${start}) for degree "${edu.degree}".`,
          level: "warning"
        });
      }
    }
  });

  // 5. Duplicate skill check
  const skillValues = resume.skills.map((s) => s.raw_value.toLowerCase());
  const duplicates = skillValues.filter((item, index) => skillValues.indexOf(item) !== index);

  if (duplicates.length > 0) {
    items.push({
      code: "DUPLICATE_SKILLS_DETECTED",
      field: "skills",
      message: `Duplicate skills detected in document: ${[...new Set(duplicates)].join(", ")}. Raw values preserved.`,
      level: "info"
    });
  }

  // 6. Section check
  if (resume.experience.length === 0) {
    items.push({
      code: "MISSING_EXPERIENCE_SECTION",
      field: "experience",
      message: "No work experience entries extracted from document.",
      level: "info"
    });
  }

  if (resume.skills.length === 0) {
    items.push({
      code: "MISSING_SKILLS_SECTION",
      field: "skills",
      message: "No technical skills extracted from document.",
      level: "info"
    });
  }

  const hasWarnings = items.some((i) => i.level === "warning");
  const hasErrors = items.some((i) => i.level === "error");

  const status = hasErrors ? "failed" : hasWarnings ? "warnings" : "passed";

  return {
    status,
    items
  };
}
