import { extractKeywordsFromJD } from "../services/jdAnalyzer";

function testDynamicJDAnalyzer() {
  console.log("========================================================================");
  console.log(" TESTING DYNAMIC JOB DESCRIPTION KEYWORD EXTRACTOR ");
  console.log("========================================================================\n");

  // TEST 1: Software Engineer JD
  const techJD = `
Senior React Developer
We are looking for a Senior React Developer to join our engineering team.
Requirements:
- Strong proficiency in React, TypeScript, and Redux Toolkit.
- Hands-on experience with Next.js, Node.js, and GraphQL APIs.
- Familiarity with Docker, Kubernetes, AWS S3, and CI/CD pipelines.
- Experience writing automated unit tests using Jest and Cypress.
  `;
  const candidateSkillsTech = ["React", "TypeScript", "Node.js", "Docker", "Git"];
  const resTech = extractKeywordsFromJD(techJD, "Experienced in React and Node.js with TypeScript", candidateSkillsTech);

  console.log("✅ [TEST 1: Software Engineer JD]");
  console.log(`   - Job Title: ${resTech.jobTitle}`);
  console.log(`   - Found Keywords (${resTech.extractedKeywords.found.length}):`, resTech.extractedKeywords.found);
  console.log(`   - Missing Keywords (${resTech.extractedKeywords.missing.length}):`, resTech.extractedKeywords.missing);
  console.log(`   - Current Match Score: ${resTech.currentMatchScore}%\n`);

  if (!resTech.extractedKeywords.found.some(k => k.toLowerCase().includes('react')) ||
      !resTech.extractedKeywords.missing.some(k => k.toLowerCase().includes('graphql') || k.toLowerCase().includes('cypress'))) {
    throw new Error("Tech JD extraction failed!");
  }

  // TEST 2: Digital Marketing Manager JD
  const marketingJD = `
Digital Marketing Manager
We are seeking an experienced Digital Marketing Manager to lead our growth strategy.
Key Responsibilities:
- Manage multi-channel SEO and PPC campaigns on Google Ads and Facebook Ads.
- Optimize conversion rates via A/B Testing, HubSpot, and Google Analytics.
- Oversee Content Strategy, Email Marketing, and Lead Generation campaigns.
- Perform Budgeting, ROI analysis, and Customer Acquisition Cost (CAC) tracking.
  `;
  const candidateSkillsMarketing = ["SEO", "Google Analytics", "Content Strategy"];
  const resMarketing = extractKeywordsFromJD(marketingJD, "Skilled in SEO and Google Analytics", candidateSkillsMarketing);

  console.log("✅ [TEST 2: Digital Marketing Manager JD]");
  console.log(`   - Job Title: ${resMarketing.jobTitle}`);
  console.log(`   - Found Keywords (${resMarketing.extractedKeywords.found.length}):`, resMarketing.extractedKeywords.found);
  console.log(`   - Missing Keywords (${resMarketing.extractedKeywords.missing.length}):`, resMarketing.extractedKeywords.missing);
  console.log(`   - Current Match Score: ${resMarketing.currentMatchScore}%\n`);

  if (!resMarketing.extractedKeywords.found.some(k => k.toLowerCase().includes('seo')) ||
      !resMarketing.extractedKeywords.missing.some(k => k.toLowerCase().includes('hubspot') || k.toLowerCase().includes('ppc'))) {
    throw new Error("Marketing JD extraction failed!");
  }

  // TEST 3: Financial Analyst JD
  const financeJD = `
Senior Financial Analyst
Responsibilities:
- Build complex Financial Modeling and Forecasting spreadsheets in Excel.
- Conduct Valuation, Budgeting, Variance Analysis, and GAAP Compliance.
- Utilize SAP, Oracle Financials, and Bloomberg Terminal for financial reporting.
  `;
  const resFinance = extractKeywordsFromJD(financeJD, "Experienced in Excel and Budgeting", ["Excel"]);

  console.log("✅ [TEST 3: Financial Analyst JD]");
  console.log(`   - Job Title: ${resFinance.jobTitle}`);
  console.log(`   - Found Keywords (${resFinance.extractedKeywords.found.length}):`, resFinance.extractedKeywords.found);
  console.log(`   - Missing Keywords (${resFinance.extractedKeywords.missing.length}):`, resFinance.extractedKeywords.missing);
  console.log(`   - Current Match Score: ${resFinance.currentMatchScore}%\n`);

  if (!resFinance.extractedKeywords.missing.some(k => k.toLowerCase().includes('sap') || k.toLowerCase().includes('valuation') || k.toLowerCase().includes('gaap'))) {
    throw new Error("Finance JD extraction failed!");
  }

  console.log("========================================================================");
  console.log(" ✅ ALL DYNAMIC JD ANALYZER TESTS PASSED SUCCESSFULLY ");
  console.log("========================================================================\n");
}

testDynamicJDAnalyzer();
