import { findSourceForText } from "./contactParser";
import { parseDateString } from "./dateParser";
import {
  Achievement,
  Certification,
  ExtractedField,
  Language,
  Project,
  RawPage,
  RawSection
} from "./types";

export function parseSummary(
  fullText: string,
  pages: RawPage[],
  sections: RawSection[]
): ExtractedField<string> {
  const summarySection = sections.find((s) => s.section_type === "summary");
  if (!summarySection || !summarySection.content_text.trim()) {
    return {
      value: null,
      raw: null,
      source: null,
      modified_by_user: false
    };
  }

  const text = summarySection.content_text.trim();
  return {
    value: text,
    raw: text,
    source: findSourceForText(text.slice(0, 30), pages, "summary"),
    modified_by_user: false
  };
}

export function parseProjects(
  fullText: string,
  pages: RawPage[],
  sections: RawSection[]
): Project[] {
  const projSection = sections.find((s) => s.section_type === "projects");
  if (!projSection || !projSection.content_text.trim()) {
    return [];
  }

  const lines = projSection.content_text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const projects: Project[] = [];
  let currentProject: Partial<Project> | null = null;
  let currentBullets: string[] = [];

  lines.forEach((line) => {
    const isBullet = /^[•\-\*\–\d+\.]\s+/.test(line);

    if (!isBullet && line.length < 60) {
      if (currentProject && currentProject.name) {
        currentProject.description = [...currentBullets];
        projects.push(currentProject as Project);
        currentBullets = [];
      }

      currentProject = {
        id: `proj_${projects.length + 1}`,
        name: line,
        description: [],
        technologies: [],
        source: findSourceForText(line, pages, "projects")
      };
    } else if (isBullet) {
      const clean = line.replace(/^[•\-\*\–\d+\.]\s+/, "").trim();
      currentBullets.push(clean);
    } else {
      currentBullets.push(line);
    }
  });

  if (currentProject && currentProject.name) {
    currentProject.description = [...currentBullets];
    projects.push(currentProject as Project);
  }

  return projects;
}

export function parseCertifications(
  fullText: string,
  pages: RawPage[],
  sections: RawSection[]
): Certification[] {
  const certSection = sections.find((s) => s.section_type === "certifications");
  if (!certSection || !certSection.content_text.trim()) {
    return [];
  }

  const lines = certSection.content_text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((line, idx) => ({
    id: `cert_${idx + 1}`,
    name: line,
    source: findSourceForText(line, pages, "certifications")
  }));
}

export function parseAchievements(
  fullText: string,
  pages: RawPage[],
  sections: RawSection[]
): Achievement[] {
  const achSection = sections.find((s) => s.section_type === "achievements");
  if (!achSection || !achSection.content_text.trim()) {
    return [];
  }

  const lines = achSection.content_text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((line, idx) => ({
    id: `ach_${idx + 1}`,
    title: line,
    description: line,
    source: findSourceForText(line, pages, "achievements")
  }));
}

export function parseLanguages(
  fullText: string,
  pages: RawPage[],
  sections: RawSection[]
): Language[] {
  const langSection = sections.find((s) => s.section_type === "languages");
  if (!langSection || !langSection.content_text.trim()) {
    return [];
  }

  const lines = langSection.content_text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const languages: Language[] = [];

  lines.forEach((line) => {
    const parts = line.split(/[-–—:|]/).map((p) => p.trim());
    if (parts.length >= 2) {
      languages.push({
        name: parts[0],
        proficiency: parts[1],
        source: findSourceForText(line, pages, "languages")
      });
    } else {
      languages.push({
        name: line,
        source: findSourceForText(line, pages, "languages")
      });
    }
  });

  return languages;
}
