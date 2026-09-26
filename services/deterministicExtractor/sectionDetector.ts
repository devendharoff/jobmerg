import { RawPage, RawSection, TextBlock } from "./types";

export const SECTION_ALIASES: Record<string, string[]> = {
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "work history",
    "career history",
    "roles & responsibilities",
    "positions held",
    "career trajectory"
  ],
  education: [
    "education",
    "academic background",
    "educational qualifications",
    "academic record",
    "qualifications",
    "education & credentials"
  ],
  skills: [
    "skills",
    "technical skills",
    "core skills",
    "technical expertise",
    "technologies",
    "tech stack",
    "competencies",
    "programming languages",
    "tools & technologies",
    "key skills"
  ],
  projects: [
    "projects",
    "personal projects",
    "academic projects",
    "key projects",
    "technical projects",
    "featured projects"
  ],
  certifications: [
    "certifications",
    "certificates",
    "licenses & certifications",
    "certifications & licenses",
    "licenses",
    "professional certifications"
  ],
  achievements: [
    "achievements",
    "accomplishments",
    "awards",
    "honors & awards",
    "key accomplishments",
    "recognition"
  ],
  languages: [
    "languages",
    "language proficiency",
    "languages spoken"
  ],
  summary: [
    "summary",
    "professional summary",
    "profile",
    "about me",
    "career objective",
    "objective",
    "executive summary",
    "background summary"
  ],
  contact: [
    "contact",
    "contact details",
    "contact information",
    "personal information",
    "personal details"
  ]
};

export function detectSections(pages: RawPage[]): RawSection[] {
  const sections: RawSection[] = [];
  const allBlocks: { page: number; block: TextBlock }[] = [];

  pages.forEach((p) => {
    p.blocks.forEach((b) => {
      allBlocks.push({ page: p.page, block: b });
    });
  });

  if (allBlocks.length === 0) return sections;

  interface DetectedHeading {
    type: string;
    rawHeading: string;
    blockIndex: number;
    page: number;
    line: number;
  }

  const headings: DetectedHeading[] = [];

  allBlocks.forEach((item, index) => {
    const text = item.block.text.trim();
    if (!text || text.length > 60) return;

    // Remove trailing colons, dashes, or bullet symbols for heading matching
    const cleanHeading = text
      .toLowerCase()
      .replace(/^[:\-\s\•\|\*]+|[:\-\s\•\|\*]+$/g, "")
      .trim();

    for (const [sectionType, aliases] of Object.entries(SECTION_ALIASES)) {
      if (aliases.includes(cleanHeading)) {
        headings.push({
          type: sectionType,
          rawHeading: text,
          blockIndex: index,
          page: item.page,
          line: item.block.line
        });
        break;
      }
    }
  });

  // If no sections detected, treat top block as header/contact and rest as general body
  if (headings.length === 0) {
    const totalLines = allBlocks.length;
    sections.push({
      section_type: "contact",
      heading_raw: "Header",
      page: 1,
      start_line: 1,
      end_line: Math.min(10, totalLines),
      content_text: allBlocks
        .slice(0, 10)
        .map((i) => i.block.text)
        .join("\n")
    });

    if (totalLines > 10) {
      sections.push({
        section_type: "experience",
        heading_raw: "Body",
        page: 1,
        start_line: 11,
        end_line: totalLines,
        content_text: allBlocks
          .slice(10)
          .map((i) => i.block.text)
          .join("\n")
      });
    }

    return sections;
  }

  // Handle text before the first section heading as "contact" section
  if (headings[0].blockIndex > 0) {
    const preBlocks = allBlocks.slice(0, headings[0].blockIndex);
    sections.push({
      section_type: "contact",
      heading_raw: "Contact Information",
      page: preBlocks[0].page,
      start_line: preBlocks[0].block.line,
      end_line: preBlocks[preBlocks.length - 1].block.line,
      content_text: preBlocks.map((b) => b.block.text).join("\n")
    });
  }

  // Partition blocks into detected sections
  headings.forEach((h, i) => {
    const nextHeadingIndex = i + 1 < headings.length ? headings[i + 1].blockIndex : allBlocks.length;
    const sectionBlocks = allBlocks.slice(h.blockIndex + 1, nextHeadingIndex);

    const startLine = h.line;
    const endLine = sectionBlocks.length > 0 ? sectionBlocks[sectionBlocks.length - 1].block.line : h.line;

    sections.push({
      section_type: h.type,
      heading_raw: h.rawHeading,
      page: h.page,
      start_line: startLine,
      end_line: endLine,
      content_text: sectionBlocks.map((b) => b.block.text).join("\n")
    });
  });

  return sections;
}
