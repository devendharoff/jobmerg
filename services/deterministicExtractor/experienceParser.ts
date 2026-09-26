import { findSourceForText } from "./contactParser";
import { parseDateString } from "./dateParser";
import { Experience, RawPage, RawSection } from "./types";

export function parseExperience(
  fullText: string,
  pages: RawPage[],
  sections: RawSection[]
): Experience[] {
  const expSection = sections.find((s) => s.section_type === "experience");
  if (!expSection || !expSection.content_text.trim()) {
    return [];
  }

  const lines = expSection.content_text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const experiences: Experience[] = [];
  let currentExp: Partial<Experience> | null = null;
  let currentBullets: string[] = [];

  const datePattern = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|\d{2}\/\d{4}|\d{4})\s*(?:[-–—]|to)\s*(?:Present|Current|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|\d{2}\/\d{4}|\d{4})/i;

  lines.forEach((line, idx) => {
    const isBullet = /^[•\-\*\–\d+\.]\s+/.test(line);
    const hasDate = datePattern.test(line);

    if (hasDate && !isBullet) {
      // Save previous entry
      if (currentExp && (currentExp.title?.raw || currentExp.company?.raw)) {
        currentExp.description = [...currentBullets];
        experiences.push(currentExp as Experience);
        currentBullets = [];
      }

      const dateMatch = line.match(datePattern);
      const dateRaw = dateMatch ? dateMatch[0] : line;
      const parsedDate = parseDateString(dateRaw);

      // Remaining text on the date line or previous line for Title / Company
      const lineWithoutDate = line.replace(datePattern, "").replace(/[,|\-–]/g, " ").trim();

      let titleRaw = "Software Engineer";
      let companyRaw = "Company";

      if (lineWithoutDate) {
        const parts = lineWithoutDate.split(/\s{2,}|\|/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          titleRaw = parts[0];
          companyRaw = parts[1];
        } else if (parts.length === 1) {
          titleRaw = parts[0];
        }
      } else if (idx > 0 && !/^[•\-\*\–]/.test(lines[idx - 1])) {
        const prevLine = lines[idx - 1];
        const parts = prevLine.split(/[,|]|(?:\s+at\s+)/i).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          titleRaw = parts[0];
          companyRaw = parts[1];
        } else {
          titleRaw = prevLine;
        }
      }

      currentExp = {
        id: `exp_${experiences.length + 1}`,
        title: { raw: titleRaw },
        company: { raw: companyRaw },
        date: parsedDate,
        description: [],
        source: findSourceForText(line, pages, "experience")
      };
    } else if (isBullet) {
      const cleanBullet = line.replace(/^[•\-\*\–\d+\.]\s+/, "").trim();
      if (cleanBullet) {
        currentBullets.push(cleanBullet);
      }
    } else {
      if (currentExp) {
        currentBullets.push(line);
      } else {
        // Start a fallback first entry
        currentExp = {
          id: `exp_1`,
          title: { raw: line },
          company: { raw: "Organization" },
          date: parseDateString(""),
          description: [],
          source: findSourceForText(line, pages, "experience")
        };
      }
    }
  });

  if (currentExp && (currentExp.title?.raw || currentExp.company?.raw)) {
    currentExp.description = [...currentBullets];
    experiences.push(currentExp as Experience);
  }

  return experiences;
}
