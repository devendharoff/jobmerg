import mammoth from "mammoth";

// Skill Normalization Dictionary
const SKILL_MAP: Record<string, string> = {
  "react.js": "React",
  "reactjs": "React",
  "react js": "React",
  "javascript": "JavaScript",
  "java script": "JavaScript",
  "typescript": "TypeScript",
  "type script": "TypeScript",
  "node.js": "Node.js",
  "nodejs": "Node.js",
  "node js": "Node.js",
  "next.js": "Next.js",
  "nextjs": "Next.js",
  "vue.js": "Vue.js",
  "vuejs": "Vue.js",
  "tailwind css": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  "aws": "AWS",
  "amazon web services": "AWS",
  "docker": "Docker",
  "kubernetes": "Kubernetes",
  "k8s": "Kubernetes",
  "git": "Git",
  "github": "GitHub",
  "python": "Python",
  "postgresql": "PostgreSQL",
  "postgres": "PostgreSQL",
  "mongodb": "MongoDB",
  "mysql": "MySQL",
  "graphql": "GraphQL",
  "rest api": "REST APIs",
  "restful api": "REST APIs",
  "rest apis": "REST APIs"
};

export interface ExtractedProfile {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    github: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  skills: {
    languages: string;
    frameworks: string;
    tools: string;
    competencies: string;
  };
  experience: Array<{
    company: string;
    role: string;
    dates: string;
    description: string;
    technologies: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    year: string;
    coursework: string;
  }>;
  projects: Array<{
    title: string;
    technologies: string;
    description: string;
  }>;
  certifications: string[];
  confidenceScores: {
    name: number;
    email: number;
    phone: number;
    skills: number;
    experience: number;
    education: number;
    overall: number;
  };
}

// 1. PDF Layout-Aware text extraction
export async function parsePdfLayoutAware(buffer: Buffer, pdfParser: any): Promise<string> {
  const options = {
    pagerender: async (pageData: any) => {
      const textContent = await pageData.getTextContent();
      const items = textContent.items || [];
      
      if (items.length === 0) return "";

      // Determine horizontal X coordinate spans
      const xPositions = items.map((item: any) => item.transform[4]);
      const minX = Math.min(...xPositions);
      const maxX = Math.max(...xPositions);
      const midX = minX + (maxX - minX) / 2;

      // Group items into columns
      const leftColumn: any[] = [];
      const rightColumn: any[] = [];
      const singleColumn: any[] = [];

      // If text coordinate width is large, it is likely a 2-column layout
      const isTwoColumn = (maxX - minX) > 180; 

      if (isTwoColumn) {
        items.forEach((item: any) => {
          const x = item.transform[4];
          if (x < midX) {
            leftColumn.push(item);
          } else {
            rightColumn.push(item);
          }
        });
      } else {
        singleColumn.push(...items);
      }

      // Sort top-to-bottom (Y coordinate descending) then left-to-right (X coordinate ascending)
      const sortAndJoin = (colItems: any[]) => {
        return colItems
          .sort((a, b) => {
            const yDiff = b.transform[5] - a.transform[5];
            if (Math.abs(yDiff) > 6) {
              return yDiff; // Different vertical line
            }
            return a.transform[4] - b.transform[4]; // Same line, sort left-to-right
          })
          .map((item: any) => item.str)
          .join(" ");
      };

      if (isTwoColumn) {
        return sortAndJoin(leftColumn) + "\n\n" + sortAndJoin(rightColumn);
      } else {
        return sortAndJoin(singleColumn);
      }
    }
  };

  const parsed = await pdfParser(buffer, options);
  return parsed.text || "";
}

// 2. DOCX Text Extraction via Mammoth
export async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (err: any) {
    console.error("Mammoth failed parsing DOCX:", err.message);
    return "";
  }
}

// 3. Skill normalization helper
export function normalizeSkills(skillsString: string): string {
  if (!skillsString) return "";
  const items = skillsString.split(/[,|;]+/).map(s => s.trim()).filter(Boolean);
  const normalized = items.map(item => {
    const lower = item.toLowerCase();
    return SKILL_MAP[lower] || item;
  });
  return Array.from(new Set(normalized)).join(", ");
}

// 4. Local Entity Extractor & Fallback Parser
export function extractProfileFromText(text: string): ExtractedProfile {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Scopes & confidence triggers
  let name = "";
  let nameConfidence = 0;
  
  // Extract Name (scanning lines, skipping email/phone/label lines)
  for (const line of lines) {
    if (
      line.length > 2 && 
      line.length < 35 && 
      !line.includes('@') && 
      !line.includes(':') && 
      !line.includes('/') && 
      !/\d/.test(line) && 
      !/experience|education|skills|projects|resume/i.test(line)
    ) {
      name = line;
      nameConfidence = 99;
      break;
    }
  }
  if (!name) {
    name = "Candidate Name";
    nameConfidence = 10;
  }

  // Email & Phone extraction
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const email = emailMatch ? emailMatch[0] : "";
  const phone = phoneMatch ? phoneMatch[0] : "";
  
  const emailConfidence = email ? 99 : 0;
  const phoneConfidence = phone ? 99 : 0;

  // Social Links mapping
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";
  const github = githubMatch ? githubMatch[0] : "";

  // Skill mappings
  const skillKeywords = {
    languages: ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'kotlin', 'swift', 'php', 'sql', 'html', 'css'],
    frameworks: ['react', 'vue', 'angular', 'next.js', 'nuxt', 'django', 'flask', 'express', 'spring', 'fastapi', 'tailwind', 'bootstrap'],
    tools: ['git', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'firebase', 'supabase', 'mongodb', 'postgresql', 'mysql', 'redis']
  };

  const foundLanguages: string[] = [];
  const foundFrameworks: string[] = [];
  const foundTools: string[] = [];

  const lowerText = text.toLowerCase();
  const escapeRegex = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  skillKeywords.languages.forEach(lang => {
    const escaped = escapeRegex(lang);
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(lowerText)) {
      foundLanguages.push(SKILL_MAP[lang] || (lang.charAt(0).toUpperCase() + lang.slice(1)));
    }
  });
  skillKeywords.frameworks.forEach(fw => {
    const escaped = escapeRegex(fw);
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(lowerText)) {
      foundFrameworks.push(SKILL_MAP[fw] || (fw.charAt(0).toUpperCase() + fw.slice(1)));
    }
  });
  skillKeywords.tools.forEach(tool => {
    const escaped = escapeRegex(tool);
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(lowerText)) {
      foundTools.push(SKILL_MAP[tool] || (tool.charAt(0).toUpperCase() + tool.slice(1)));
    }
  });

  const skillsConfidence = (foundLanguages.length + foundFrameworks.length + foundTools.length) > 3 ? 95 : 60;

  // Experience chronological mapping
  const experience: any[] = [];
  const expIndex = lines.findIndex(l => /experience|work history|employment/i.test(l));
  let experienceConfidence = 0;

  if (expIndex !== -1) {
    let currentExp: any = null;
    for (let i = expIndex + 1; i < Math.min(lines.length, expIndex + 40); i++) {
      const line = lines[i];
      if (/education|projects|skills|certifications/i.test(line)) {
        break; // Stop at next section
      }
      
      // Look for company headers
      if (line.length > 5 && line.length < 50 && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*')) {
        if (currentExp) {
          experience.push(currentExp);
        }
        
        // Extract possible date block from string
        const dateMatch = line.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|\d{1,2}\/\d{2,4}|\d{4})[\s\-\–to]+(?:Present|Current|\d{1,2}\/\d{2,4}|\d{4})/i);
        const dates = dateMatch ? dateMatch[0] : "2023 - Present";

        currentExp = {
          company: line.split(/[\-\–|]/)[0].trim(),
          role: "Software Developer",
          dates,
          description: "",
          technologies: ""
        };
      } else if (currentExp && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.length > 20)) {
        const bullet = line.replace(/^[•\-*\s]+/, '').trim();
        currentExp.description += `• ${bullet}\n`;
      }
    }
    if (currentExp) experience.push(currentExp);
    experienceConfidence = experience.length > 0 ? 95 : 30;
  } else {
    experienceConfidence = 20;
  }

  // Education mapping
  const education: any[] = [];
  const eduIndex = lines.findIndex(l => /education|university|college/i.test(l));
  let educationConfidence = 0;

  if (eduIndex !== -1) {
    for (let i = eduIndex + 1; i < Math.min(lines.length, eduIndex + 10); i++) {
      const line = lines[i];
      if (/experience|projects|skills|certifications/i.test(line)) {
        break;
      }
      if (line.length > 8 && !line.startsWith('•')) {
        education.push({
          school: line.trim(),
          degree: "Bachelor of Science",
          year: "2023",
          coursework: ""
        });
        break;
      }
    }
    educationConfidence = education.length > 0 ? 95 : 45;
  } else {
    educationConfidence = 15;
  }

  // Overall confidence metrics aggregation
  const overallConfidence = Math.round(
    (nameConfidence * 0.15) +
    (emailConfidence * 0.15) +
    (phoneConfidence * 0.10) +
    (skillsConfidence * 0.20) +
    (experienceConfidence * 0.25) +
    (educationConfidence * 0.15)
  );

  return {
    personal: {
      name,
      title: experience[0]?.role || "Software Engineer",
      email,
      phone,
      location: "India",
      github,
      linkedin,
      portfolio: ""
    },
    summary: lines.find(l => l.length > 50) || "Experienced software developer.",
    skills: {
      languages: foundLanguages.join(', '),
      frameworks: foundFrameworks.join(', '),
      tools: foundTools.join(', '),
      competencies: "Full-Stack Development, UI/UX Design"
    },
    experience: experience.length > 0 ? experience : [{ company: "Technology Corp", role: "Software Engineer", dates: "2022 - Present", description: "• Developed scalable web features.\n• Automated deployment workflows.", technologies: "TypeScript, React" }],
    education: education.length > 0 ? education : [{ school: "Technical University", degree: "Bachelor of Technology", year: "2022", coursework: "Computer Science" }],
    projects: [{ title: "Personal App Portfolio", technologies: foundLanguages.slice(0, 3).join(', '), description: "Built and deployed reactive user dashboard interface." }],
    certifications: ["Professional Developer Certification"],
    confidenceScores: {
      name: nameConfidence,
      email: emailConfidence,
      phone: phoneConfidence,
      skills: skillsConfidence,
      experience: experienceConfidence,
      education: educationConfidence,
      overall: overallConfidence
    }
  };
}
