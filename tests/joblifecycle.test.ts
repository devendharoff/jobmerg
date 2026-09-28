import { createJob, getJobByResumeId, processExtractionJobAsync } from "../services/extractionJobManager";

async function testJobLifecycle() {
  console.log("========================================================================");
  console.log(" RUNNING ASYNC RESUME EXTRACTION JOB LIFECYCLE TEST ");
  console.log("========================================================================\n");

  const sampleResumeText = `
DEVEN OFF
Email: deven.dev@gmail.com
Phone: +91 98765 43210
Location: Bengaluru, India
LinkedIn: linkedin.com/in/devendhar
GitHub: github.com/devendharoff

PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 5+ years of experience building high-performance web platforms and automated extraction systems.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, C++
Frameworks: React, Next.js, Express, Node.js, Tailwind CSS
Tools: Docker, Kubernetes, Git, Supabase, AWS

WORK EXPERIENCE
Senior Frontend Engineer | Tech Corp
Jan 2023 - Present
• Designed and shipped scalable frontend components serving over 500k monthly active users.
• Reduced page load latency by 45% through aggressive code splitting and asset optimization.

Full Stack Developer | Cloud Solutions
June 2021 - Dec 2022
• Built microservices in Node.js and PostgreSQL to process high-throughput data streams.

EDUCATION
Bachelor of Technology in Computer Science
Anna University | 2017 - 2021 | CGPA: 8.8
  `;

  const dummyBuffer = Buffer.from(sampleResumeText, "utf8");
  const fileName = "test_resume.docx";

  // 1. Test Job Creation (Instant)
  const startTime = Date.now();
  const job = createJob(fileName, dummyBuffer);
  const queueTime = Date.now() - startTime;

  console.log(`✅ [Step 1] Upload request created job in ${queueTime}ms:`);
  console.log(`   - Resume ID: ${job.resumeId}`);
  console.log(`   - Job ID:    ${job.jobId}`);
  console.log(`   - Status:    ${job.status} (Expected: queued)\n`);

  if (job.status !== "queued" || queueTime > 50) {
    throw new Error("Job creation failed or took longer than 50ms!");
  }

  // 2. Start Async Job Execution
  console.log("🚀 [Step 2] Executing async pipeline...");
  const processPromise = processExtractionJobAsync(job.resumeId, dummyBuffer);

  // Poll status while processing
  let pollCount = 0;
  while (job.status !== "completed" && job.status !== "failed" && pollCount < 10) {
    pollCount++;
    const currentJob = getJobByResumeId(job.resumeId);
    console.log(`   - Poll #${pollCount}: Status = ${currentJob?.status} | Progress = ${currentJob?.progress}% | Step = "${currentJob?.step}"`);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  await processPromise;

  const finalJob = getJobByResumeId(job.resumeId);
  console.log(`\n✅ [Step 3] Pipeline finished with Status: ${finalJob?.status}`);
  console.log(`   - Total Duration: ${finalJob?.durationMs}ms`);
  console.log(`   - Raw Text Length: ${finalJob?.rawText?.length} chars`);
  console.log(`   - Skills Extracted: ${finalJob?.canonical?.skills.length}`);
  console.log(`   - Experience Entries: ${finalJob?.canonical?.experience.length}`);
  console.log(`   - Education Entries: ${finalJob?.canonical?.education.length}`);

  if (finalJob?.status !== "completed") {
    throw new Error(`Job failed: ${finalJob?.error}`);
  }

  console.log("\n========================================================================");
  console.log(" ✅ JOB LIFECYCLE TEST PASSED SUCCESSFULLY ");
  console.log("========================================================================\n");
}

testJobLifecycle().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
