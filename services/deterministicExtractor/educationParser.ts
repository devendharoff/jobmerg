import { findSourceForText } from "./contactParser";
import { parseDateString } from "./dateParser";
import { Education, Grade, RawPage, RawSection } from "./types";

export function parseEducation(
  fullText: string,
  pages: RawPage[],
  sections: RawSection[]
): Education[] {
  const eduSection = sections.find((s) => s.section_type === "education");
  if (!eduSection || !eduSection.content_text.trim()) {
    return [];
  }

  const lines = eduSection.content_text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const result: Education[] = [];

  const degreeRegex = /(B\.Tech|B\.E\.|B\.S\.|B\.Sc|M\.Tech|M\.S\.|M\.Sc|Ph\.D\.|Bachelor|Master|Diploma|Associate|High School|Senior Secondary)/i;
  const gradeRegex = /(?:cgpa|gpa|percentage|marks)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:\/|\s*%|\s*out of)?/i;

  lines.forEach((line, idx) => {
    const isDegreeLine = degreeRegex.test(line);
    const datePattern = /(\d{4}\s*[-–—]\s*\d{4}|\d{4})/;
    const dateMatch = line.match(datePattern);

    if (isDegreeLine || dateMatch) {
      let degree = line;
      let institution = "University / College";
      let fieldOfStudy: string | null = null;
      let grade: Grade | null = null;

      const gradeMatch = line.match(gradeRegex);
      if (gradeMatch) {
        const val = parseFloat(gradeMatch[1]);
        const typeStr = line.toLowerCase().includes("cgpa")
          ? "CGPA"
          : line.toLowerCase().includes("gpa")
          ? "GPA"
          : line.toLowerCase().includes("percentage") || line.includes("%")
          ? "Percentage"
          : "Other";

        grade = {
          type: typeStr,
          raw: gradeMatch[1],
          value: isNaN(val) ? null : val
        };
      }

      // Check next line for institution if present
      if (idx + 1 < lines.length && !degreeRegex.test(lines[idx + 1])) {
        institution = lines[idx + 1];
      }

      const dateRaw = dateMatch ? dateMatch[0] : "";
      const parsedDate = parseDateString(dateRaw);

      result.push({
        id: `edu_${result.length + 1}`,
        degree,
        institution,
        field_of_study: fieldOfStudy,
        date: parsedDate,
        grade,
        source: findSourceForText(line, pages, "education")
      });
    }
  });

  return result;
}
