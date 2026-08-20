import mammoth from "mammoth";

// ─── Skill Normalization Dictionary ──────────────────────────────────────────
const SKILL_MAP: Record<string, string> = {
  "react.js": "React", "reactjs": "React", "react js": "React",
  "javascript": "JavaScript", "java script": "JavaScript",
  "typescript": "TypeScript", "type script": "TypeScript",
  "node.js": "Node.js", "nodejs": "Node.js", "node js": "Node.js",
  "next.js": "Next.js", "nextjs": "Next.js",
  "vue.js": "Vue.js", "vuejs": "Vue.js",
  "tailwind css": "Tailwind CSS", "tailwindcss": "Tailwind CSS",
  "aws": "AWS", "amazon web services": "AWS",
  "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes",
  "git": "Git", "github": "GitHub",
  "python": "Python", "postgresql": "PostgreSQL", "postgres": "PostgreSQL",
  "mongodb": "MongoDB", "mysql": "MySQL", "graphql": "GraphQL",
  "rest api": "REST APIs", "restful api": "REST APIs", "rest apis": "REST APIs",
  "c++": "C++", "c#": "C#"
};

export interface ExtractedProfile {
  personal: {
    name: string; title: string; email: string; phone: string;
    location: string; github: string; linkedin: string; portfolio: string;
  };
  summary: string;
  skills: { languages: string; frameworks: string; tools: string; competencies: string; };
  experience: Array<{ company: string; role: string; dates: string; description: string; technologies: string; }>;
  education: Array<{ school: string; degree: string; year: string; coursework: string; }>;
  projects: Array<{ title: string; technologies: string; description: string; }>;
  certifications: string[];
  confidenceScores: {
    name: number; email: number; phone: number;
    skills: number; experience: number; education: number; overall: number;
  };
}

// ─── Helper: escape regex special chars ──────────────────────────────────────
function escapeRegex(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// ─── 1. PDF extraction using pdfjs-dist directly ─────────────────────────────
// This replaces the broken pdf-parse pagerender approach. pdfjs-dist gives us
// real per-page text content with bounding boxes that we can sort correctly.
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid ESM/CJS issues at module load time
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs" as any);

  // pdfjs needs a Uint8Array
  const uint8 = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8, disableFontFace: true });
  const pdfDoc = await loadingTask.promise;

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<{ str: string; transform: number[] }>;

    if (items.length === 0) {
      pageTexts.push("");
      continue;
    }

    // Detect two-column layout via X coordinate spread
    const xPositions = items.map(item => item.transform[4]);
    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);
    const xSpread = maxX - minX;
    const isTwoColumn = xSpread > 200;
    const midX = minX + xSpread / 2;

    const sortByPosition = (colItems: typeof items) =>
      colItems
        .sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5]; // Higher Y = higher on page
          if (Math.abs(yDiff) > 5) return yDiff;
          return a.transform[4] - b.transform[4]; // Same line: left to right
        })
        .map(item => item.str)
        .join(" ");

    let pageText: string;
    if (isTwoColumn) {
      const left = items.filter(item => item.transform[4] < midX);
      const right = items.filter(item => item.transform[4] >= midX);
      pageText = sortByPosition(left) + "\n\n" + sortByPosition(right);
    } else {
      pageText = sortByPosition(items);
    }

    // Collapse excessive whitespace while preserving newlines
    pageText = pageText.replace(/ {2,}/g, ' ').trim();
    pageTexts.push(pageText);
  }

  return pageTexts.join("\n\n--- PAGE BREAK ---\n\n");
}

// ─── 2. DOCX extraction via Mammoth ──────────────────────────────────────────
export async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

// ─── 3. File type detection ───────────────────────────────────────────────────
export function detectFileType(fileName: string, base64Data: string): "pdf" | "docx" | "unsupported" {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  // Also check magic bytes in base64
  const prefix = base64Data.substring(0, 8);
  const decoded = Buffer.from(prefix, 'base64').toString('hex').toLowerCase();
  if (decoded.startsWith("25504446")) return "pdf"; // %PDF
  if (decoded.startsWith("504b0304")) return "docx"; // PK.. (ZIP, which DOCX is)
  return "unsupported";
}

// ─── 4. Skill normalization helper ───────────────────────────────────────────
export function normalizeSkills(skillsString: string): string {
  if (!skillsString) return "";
  const items = skillsString.split(/[,|;]+/).map(s => s.trim()).filter(Boolean);
  const normalized = items.map(item => {
    const lower = item.toLowerCase();
    return SKILL_MAP[lower] || item;
  });
  return Array.from(new Set(normalized)).join(", ");
}

// ─── 5. Deterministic entity extractor ───────────────────────────────────────
// Used as a pre-pass before LLM, and as the final fallback.
export function extractProfileFromText(text: string): ExtractedProfile {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Name: first short line that has no digits, no @, no common section labels
  let name = "";
  let nameConfidence = 0;
  for (const line of lines.slice(0, 12)) {
    if (
      line.length >= 3 && line.length <= 40 &&
      !line.includes('@') && !line.includes(':') && !line.includes('/') &&
      !/\d{4}/.test(line) &&
      !/^\s*(experience|education|skills|projects|summary|profile|resume|about|career|work)/i.test(line)
    ) {
      name = line;
      nameConfidence = 85;
      break;
    }
  }
  if (!name) { name = ""; nameConfidence = 0; }

  // Deterministic contact extraction
  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,15}\d)/);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-_%]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-]+/i);
  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?!linkedin|github|twitter|facebook|instagram|youtube)[\w-]+\.[a-z]{2,}(?:\/[\w\-./]*)?/i);

  const email = emailMatch ? emailMatch[0].trim() : "";
  const phone = phoneMatch ? phoneMatch[0].trim() : "";
  const linkedin = linkedinMatch ? linkedinMatch[0].trim() : "";
  const github = githubMatch ? githubMatch[0].trim() : "";
  const portfolio = portfolioMatch && portfolioMatch[0] !== linkedin && portfolioMatch[0] !== github ? portfolioMatch[0].trim() : "";

  // Skills dictionary scan
  const skillGroups = {
    languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'kotlin', 'swift', 'php', 'sql', 'html', 'css', 'r', 'scala', 'bash'],
    frameworks: ['react', 'vue', 'angular', 'next.js', 'nuxt', 'django', 'flask', 'express', 'spring', 'fastapi', 'tailwind', 'bootstrap', 'svelte', 'laravel', 'rails', 'nestjs', 'fastify'],
    tools: ['git', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'firebase', 'supabase', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'kafka', 'terraform', 'nginx', 'linux', 'ci/cd', 'jenkins', 'github actions']
  };

  const lowerText = text.toLowerCase();
  const foundLanguages: string[] = [];
  const foundFrameworks: string[] = [];
  const foundTools: string[] = [];

  skillGroups.languages.forEach(lang => {
    if (new RegExp(`\\b${escapeRegex(lang)}\\b`, 'i').test(lowerText))
      foundLanguages.push(SKILL_MAP[lang] || (lang.charAt(0).toUpperCase() + lang.slice(1)));
  });
  skillGroups.frameworks.forEach(fw => {
    if (new RegExp(`\\b${escapeRegex(fw)}\\b`, 'i').test(lowerText))
      foundFrameworks.push(SKILL_MAP[fw] || (fw.charAt(0).toUpperCase() + fw.slice(1)));
  });
  skillGroups.tools.forEach(tool => {
    if (new RegExp(`\\b${escapeRegex(tool)}\\b`, 'i').test(lowerText))
      foundTools.push(SKILL_MAP[tool] || (tool.charAt(0).toUpperCase() + tool.slice(1)));
  });

  // Experience section extraction
  const experience: ExtractedProfile['experience'] = [];
  const expIdx = lines.findIndex(l => /^(work\s+)?experience|professional\s+experience|employment|work\s+history|career\s+history/i.test(l));
  if (expIdx !== -1) {
    let current: ExtractedProfile['experience'][0] | null = null;
    const stopSection = /^(education|skills|projects|certifications|achievements|publications|languages|interests)/i;
    for (let i = expIdx + 1; i < Math.min(lines.length, expIdx + 60); i++) {
      const line = lines[i];
      if (stopSection.test(line)) break;
      const dateMatch = line.match(/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|\d{4})[\s,–\-–to]+(?:present|current|\d{4})/i);
      if (dateMatch && line.length < 80 && !line.startsWith('•')) {
        if (current) experience.push(current);
        current = { company: line.replace(dateMatch[0], '').replace(/[,|–\-]+$/, '').trim(), role: "", dates: dateMatch[0].trim(), description: "", technologies: "" };
      } else if (current && line.length > 5 && line.length < 60 && !line.startsWith('•') && !line.startsWith('-') && !current.role) {
        current.role = line.trim();
      } else if (current && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
        current.description += `• ${line.replace(/^[•\-*]\s*/, '').trim()}\n`;
      }
    }
    if (current) experience.push(current);
  }

  // Education section extraction
  const education: ExtractedProfile['education'] = [];
  const eduIdx = lines.findIndex(l => /^education|academic|qualifications/i.test(l));
  if (eduIdx !== -1) {
    for (let i = eduIdx + 1; i < Math.min(lines.length, eduIdx + 15); i++) {
      const line = lines[i];
      if (/^(experience|skills|projects|certifications)/i.test(line)) break;
      if (line.length > 10 && !line.startsWith('•') && !line.startsWith('-')) {
        education.push({ school: line.trim(), degree: lines[i + 1]?.trim() || "", year: lines[i + 2]?.trim() || "", coursework: "" });
        break;
      }
    }
  }

  // Confidence scoring
  const totalSkills = foundLanguages.length + foundFrameworks.length + foundTools.length;
  const skillsConf = totalSkills >= 5 ? 95 : totalSkills >= 2 ? 75 : totalSkills > 0 ? 55 : 0;
  const expConf = experience.length > 0 ? 90 : 0;
  const eduConf = education.length > 0 ? 90 : 0;
  const nameConf = nameConfidence;
  const emailConf = email ? 99 : 0;
  const phoneConf = phone ? 95 : 0;
  const overall = Math.round(
    (nameConf * 0.15) + (emailConf * 0.15) + (phoneConf * 0.10) +
    (skillsConf * 0.20) + (expConf * 0.25) + (eduConf * 0.15)
  );

  return {
    personal: { name, title: experience[0]?.role || "", email, phone, location: "", github, linkedin, portfolio },
    summary: "",
    skills: {
      languages: foundLanguages.join(', '),
      frameworks: foundFrameworks.join(', '),
      tools: foundTools.join(', '),
      competencies: ""
    },
    experience,
    education,
    projects: [],
    certifications: [],
    confidenceScores: { name: nameConf, email: emailConf, phone: phoneConf, skills: skillsConf, experience: expConf, education: eduConf, overall }
  };
}
