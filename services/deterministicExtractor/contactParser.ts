import { ExtractedSource, PersonalInfo, RawPage, RawSection } from "./types";

export function parseContactInfo(
  fullText: string,
  pages: RawPage[],
  sections: RawSection[]
): PersonalInfo {
  const contactSection = sections.find((s) => s.section_type === "contact");
  const headerText = contactSection?.content_text || pages[0]?.text || fullText;

  // 1. Email Extraction
  const emailRegex = /[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = fullText.match(emailRegex);

  let emailValue: string | null = null;
  let emailSource: ExtractedSource | null = null;

  if (emailMatch) {
    emailValue = emailMatch[0].trim();
    emailSource = findSourceForText(emailValue, pages, "contact");
  }

  // 2. Phone Extraction (Indian & International)
  // Supports: +91 9876543210, 9876543210, +91-98765-43210, +1 (555) 000-0000
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  const phoneMatches = [...fullText.matchAll(phoneRegex)]
    .map((m) => m[0].trim())
    .filter((p) => {
      const digits = p.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 13;
    });

  let phoneRaw: string | null = null;
  let phoneNormalized: string | null = null;
  let phoneSource: ExtractedSource | null = null;

  if (phoneMatches.length > 0) {
    phoneRaw = phoneMatches[0];
    const digits = phoneRaw.replace(/\D/g, "");
    if (digits.length === 10) {
      phoneNormalized = `+91${digits}`;
    } else if (digits.length === 12 && digits.startsWith("91")) {
      phoneNormalized = `+${digits}`;
    } else {
      phoneNormalized = `+${digits}`;
    }
    phoneSource = findSourceForText(phoneRaw, pages, "contact");
  }

  // 3. LinkedIn Extraction
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+/i;
  const linkedinMatch = fullText.match(linkedinRegex);

  let linkedinValue: string | null = null;
  let linkedinSource: ExtractedSource | null = null;

  if (linkedinMatch) {
    linkedinValue = linkedinMatch[0].trim();
    if (!linkedinValue.startsWith("http")) {
      linkedinValue = `https://${linkedinValue}`;
    }
    linkedinSource = findSourceForText(linkedinMatch[0], pages, "contact");
  }

  // 4. GitHub Extraction
  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-]+/i;
  const githubMatch = fullText.match(githubRegex);

  let githubValue: string | null = null;
  let githubSource: ExtractedSource | null = null;

  if (githubMatch) {
    githubValue = githubMatch[0].trim();
    if (!githubValue.startsWith("http")) {
      githubValue = `https://${githubValue}`;
    }
    githubSource = findSourceForText(githubMatch[0], pages, "contact");
  }

  // 5. Portfolio / Website Extraction
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?[\w\-]+\.(?:io|dev|me|com|org|net|app)(?:\/[\w\-]*)*\/?/gi;
  const allUrls = [...fullText.matchAll(urlRegex)].map((m) => m[0].trim());

  let portfolioValue: string | null = null;
  let portfolioSource: ExtractedSource | null = null;

  const otherUrl = allUrls.find(
    (u) => !u.includes("linkedin.com") && !u.includes("github.com") && !u.includes("@")
  );

  if (otherUrl) {
    portfolioValue = otherUrl;
    if (!portfolioValue.startsWith("http")) {
      portfolioValue = `https://${portfolioValue}`;
    }
    portfolioSource = findSourceForText(otherUrl, pages, "contact");
  }

  // 6. Name Extraction (Deterministic Heuristics)
  let nameValue: string | null = null;
  let nameSource: ExtractedSource | null = null;

  const page1Blocks = pages[0]?.blocks || [];
  const topLines = page1Blocks.slice(0, 10);

  const genericCVKeywords = [
    "resume",
    "curriculum vitae",
    "cv",
    "profile",
    "bio",
    "page",
    "contact",
    "experience",
    "education",
    "skills"
  ];

  for (const b of topLines) {
    const lineText = b.text.trim();
    const lower = lineText.toLowerCase();

    // Exclude emails, phones, URLs, and generic CV titles
    if (
      emailRegex.test(lineText) ||
      phoneRegex.test(lineText) ||
      linkedinRegex.test(lineText) ||
      githubRegex.test(lineText) ||
      urlRegex.test(lineText)
    ) {
      continue;
    }

    if (genericCVKeywords.some((kw) => lower === kw || lower.startsWith(kw + " "))) {
      continue;
    }

    // Name heuristic: 2 to 4 words, contains letters, no numbers/symbols
    const words = lineText.split(/\s+/).filter(Boolean);
    const isCleanName =
      words.length >= 2 &&
      words.length <= 4 &&
      /^[a-zA-Z\s.'\-]+$/.test(lineText) &&
      lineText.length >= 3 &&
      lineText.length <= 40;

    if (isCleanName) {
      nameValue = lineText;
      nameSource = {
        page: 1,
        section: "contact",
        block_ids: [b.id],
        raw_text: lineText
      };
      break;
    }
  }

  // 7. Location Extraction
  const locationRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2}|[A-Z][a-z]+)\b/;
  const locationMatch = headerText.match(locationRegex);

  let locationValue: string | null = null;
  let locationSource: ExtractedSource | null = null;

  if (locationMatch) {
    locationValue = locationMatch[0].trim();
    locationSource = findSourceForText(locationMatch[0], pages, "contact");
  }

  return {
    name: {
      value: nameValue,
      raw: nameValue,
      source: nameSource,
      modified_by_user: false
    },
    email: {
      value: emailValue,
      raw: emailValue,
      source: emailSource,
      modified_by_user: false
    },
    phone: {
      raw: phoneRaw,
      normalized: phoneNormalized,
      source: phoneSource,
      modified_by_user: false
    },
    location: {
      value: locationValue,
      raw: locationValue,
      source: locationSource,
      modified_by_user: false
    },
    linkedin: {
      value: linkedinValue,
      raw: linkedinValue,
      source: linkedinSource,
      modified_by_user: false
    },
    github: {
      value: githubValue,
      raw: githubValue,
      source: githubSource,
      modified_by_user: false
    },
    portfolio: {
      value: portfolioValue,
      raw: portfolioValue,
      source: portfolioSource,
      modified_by_user: false
    }
  };
}

export function findSourceForText(
  targetText: string,
  pages: RawPage[],
  sectionName: string | null
): ExtractedSource | null {
  if (!targetText || targetText.trim().length < 2) return null;

  const cleanTarget = targetText.toLowerCase().trim();

  for (const p of pages) {
    for (const b of p.blocks) {
      const blockLower = b.text.toLowerCase();
      if (blockLower.includes(cleanTarget) || cleanTarget.includes(blockLower)) {
        return {
          page: p.page,
          section: sectionName,
          block_ids: [b.id],
          raw_text: b.text
        };
      }
    }
  }
  return null;
}
