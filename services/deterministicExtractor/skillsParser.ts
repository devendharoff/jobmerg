import { findSourceForText } from "./contactParser";
import { RawPage, RawSection, Skill } from "./types";

const KNOWN_SKILLS_DICTIONARY: string[] = [
  "React", "React.js", "ReactJS", "TypeScript", "JavaScript", "Node.js", "NodeJS", "Express.js",
  "Next.js", "NextJS", "Vue.js", "VueJS", "Angular", "Tailwind CSS", "Bootstrap", "HTML", "HTML5",
  "CSS", "CSS3", "Sass", "SCSS", "Python", "Java", "C++", "C#", ".NET", "Go", "Golang", "Rust",
  "Kotlin", "Swift", "Dart", "Flutter", "React Native", "PostgreSQL", "Postgres", "MySQL",
  "MongoDB", "Redis", "Elasticsearch", "Supabase", "Firebase", "DynamoDB", "Oracle", "SQLite",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "K8s", "Terraform", "Ansible", "Jenkins",
  "GitHub Actions", "CI/CD", "Git", "GitHub", "GitLab", "GraphQL", "REST API", "RESTful API",
  "Microservices", "System Design", "Agile", "Scrum", "Jira", "Confluence", "Figma", "Linux",
  "Bash", "Shell", "PowerShell", "Jest", "Vitest", "Cypress", "Playwright", "Selenium", "Webpack",
  "Vite", "Babel", "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-learn", "Tableau",
  "Power BI", "Excel", "R", "MATLAB", "Kafka", "RabbitMQ", "Nginx", "Redux", "Zustand", "Prisma"
];

export function parseSkills(
  fullText: string,
  pages: RawPage[],
  sections: RawSection[]
): Skill[] {
  const skillSection = sections.find((s) => s.section_type === "skills");
  const skillsText = skillSection?.content_text || "";

  const extractedMap = new Map<string, Skill>();

  // 1. Parse explicit comma/bullet/newline items inside the Skills section
  if (skillsText) {
    const rawTokens = skillsText
      .split(/[,•|\n;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2 && s.length <= 40);

    for (const token of rawTokens) {
      // Clean up headers or label prefixes like "Languages: Java, Python"
      const cleanToken = token.replace(/^(?:languages|frameworks|tools|databases|technologies|skills)\s*:\s*/i, "").trim();
      if (!cleanToken || cleanToken.length < 2) continue;

      if (!extractedMap.has(cleanToken.toLowerCase())) {
        extractedMap.set(cleanToken.toLowerCase(), {
          raw_value: cleanToken,
          normalized_value: cleanToken,
          category: skillSection ? "Extracted Skills Section" : "Document Text",
          source: findSourceForText(cleanToken, pages, "skills")
        });
      }
    }
  }

  // 2. Exact keyword matching against known tech terms across full text
  const fullTextLower = fullText.toLowerCase();

  for (const knownSkill of KNOWN_SKILLS_DICTIONARY) {
    const keyLower = knownSkill.toLowerCase();
    // Word boundary regex check
    const regex = new RegExp(`\\b${escapeRegExp(keyLower)}\\b`, "i");
    if (regex.test(fullTextLower)) {
      if (!extractedMap.has(keyLower)) {
        extractedMap.set(keyLower, {
          raw_value: knownSkill,
          normalized_value: knownSkill,
          category: "Extracted Keyword Match",
          source: findSourceForText(knownSkill, pages, "skills")
        });
      }
    }
  }

  return Array.from(extractedMap.values());
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
