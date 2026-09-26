import { parseContactInfo } from "../services/deterministicExtractor/contactParser";
import { parseDateString } from "../services/deterministicExtractor/dateParser";
import { parseDocument } from "../services/deterministicExtractor/documentParser";
import { parseEducation } from "../services/deterministicExtractor/educationParser";
import { parseExperience } from "../services/deterministicExtractor/experienceParser";
import { validateResumeFile } from "../services/deterministicExtractor/fileValidator";
import { detectSections } from "../services/deterministicExtractor/sectionDetector";
import { parseSkills } from "../services/deterministicExtractor/skillsParser";
import { CanonicalResumeSchema } from "../services/deterministicExtractor/types";
import { validateCanonicalResume } from "../services/deterministicExtractor/validationEngine";

console.log("========================================================================");
console.log(" RUNNING JOBMERGE DETERMINISTIC RESUME EXTRACTION ENGINE UNIT TESTS ");
console.log("========================================================================\n");

let passedCount = 0;
let totalCount = 0;

function assert(condition: boolean, testName: string) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(` ✅ PASS: ${testName}`);
  } else {
    console.error(` ❌ FAIL: ${testName}`);
  }
}

async function runTests() {
  // Test 1: Email Extraction
  const sampleText1 = "DEVENDER SINGH\njohn.doe@example.com\n+91 9876543210\nBengaluru, India";
  const pages1 = [{ page: 1, text: sampleText1, blocks: sampleText1.split('\n').map((t, i) => ({ id: `b_${i}`, text: t, line: i + 1 })) }];
  const sections1 = detectSections(pages1);
  const contact1 = parseContactInfo(sampleText1, pages1, sections1);

  assert(contact1.name.value === "DEVENDER SINGH", "Name extraction from top block");
  assert(contact1.email.value === "john.doe@example.com", "Email extraction regex");
  assert(contact1.phone.normalized === "+919876543210", "Indian phone number normalization (+919876543210)");

  // Test 2: Date Parsing (Jan 2025 - Present)
  const dateResult1 = parseDateString("Jan 2025 - Present");
  assert(dateResult1.start_normalized === "2025-01", "Date parsing start_normalized '2025-01'");
  assert(dateResult1.end_normalized === null, "Date parsing end_normalized null for Present");
  assert(dateResult1.is_current === true, "Date parsing is_current flag");

  // Test 3: Date Range Validation Warning (Start > End)
  const invalidDateResume: any = {
    experience: [
      {
        title: { raw: "Lead Developer" },
        company: { raw: "TechCorp" },
        date: { start_normalized: "2025-05", end_normalized: "2023-01", raw: "May 2025 - Jan 2023" }
      }
    ],
    education: [],
    skills: [],
    personal: { email: { value: "test@example.com" }, phone: { raw: "9876543210" }, name: { value: "John" } }
  };
  const valResult = validateCanonicalResume(invalidDateResume);
  assert(valResult.items.some(i => i.code === "INVALID_EXPERIENCE_DATE_RANGE"), "Validation Engine detects end date before start date");

  // Test 4: Skills Extraction (No Artificial Inventions)
  const skillsText = "TECHNICAL SKILLS\nReact, TypeScript, Node.js, PostgreSQL";
  const pagesSkills = [{ page: 1, text: skillsText, blocks: skillsText.split('\n').map((t, i) => ({ id: `b_${i}`, text: t, line: i + 1 })) }];
  const sectionsSkills = detectSections(pagesSkills);
  const skillsResult = parseSkills(skillsText, pagesSkills, sectionsSkills);
  const skillNames = skillsResult.map(s => s.raw_value);

  assert(skillNames.includes("React") || skillNames.includes("React.js"), "Extracts explicit skill 'React'");
  assert(skillNames.includes("TypeScript"), "Extracts explicit skill 'TypeScript'");
  assert(!skillNames.includes("Python"), "Does NOT invent unmentioned skill 'Python'");

  // Test 5: Scanned Document Guard (< 80 chars)
  const shortBuffer = Buffer.from("%PDF-1.4 Scanned image without text layer");
  const valShort = validateResumeFile(shortBuffer, "scanned.pdf");
  assert(valShort.isValid === true, "Magic bytes PDF validation for scanned PDF");

  // Test 6: Section Aliases Detection
  const sectionText = "EMPLOYMENT HISTORY\nSoftware Engineer at ABC Tech\nACADEMIC BACKGROUND\nB.Tech in CS";
  const pagesSec = [{ page: 1, text: sectionText, blocks: sectionText.split('\n').map((t, i) => ({ id: `b_${i}`, text: t, line: i + 1 })) }];
  const detectedSec = detectSections(pagesSec);
  assert(detectedSec.some(s => s.section_type === "experience"), "Alias 'employment history' maps to experience section");
  assert(detectedSec.some(s => s.section_type === "education"), "Alias 'academic background' maps to education section");

  console.log("\n========================================================================");
  console.log(` TEST SUMMARY: ${passedCount} / ${totalCount} TESTS PASSED SUCCESSFULLY `);
  console.log("========================================================================\n");
}

runTests().catch(err => {
  console.error("Test Suite Error:", err);
  process.exit(1);
});
