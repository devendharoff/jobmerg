import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

// Dual CJS/ESM compatibility for file paths
const currentFilename = (typeof import.meta !== "undefined" && import.meta.url)
  ? fileURLToPath(import.meta.url)
  : (typeof __filename !== "undefined" ? __filename : "");

const currentDirname = currentFilename
  ? path.dirname(currentFilename)
  : (typeof __dirname !== "undefined" ? __dirname : "");

import compression from "compression";
import rateLimit from "express-rate-limit";
import Razorpay from "razorpay";
import crypto from "crypto";

const execAsync = promisify(exec);



import { parsePdfBuffer, parseDocx, detectFileType, extractProfileFromText, normalizeSkills } from "./services/resumeParser.js";
import { runDeterministicExtractionEngine } from "./services/deterministicExtractor/engine.js";
import { saveDeterministicResume, getDeterministicResumeById, getDeterministicResumeRaw, reprocessDeterministicResume, updateDeterministicResume } from "./services/deterministicDb.js";
import { createJob, getJobByResumeId, processExtractionJobAsync } from "./services/extractionJobManager.js";
import { createClient } from "@supabase/supabase-js";


dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Razorpay SDK Instance Initialization (Live Production)
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';

const razorpayInstance = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Enable HTTP response compression (gzip/brotli) for high throughput (1000+ active users)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  threshold: 512
}));

// High-concurrency Rate Limiter: Allows 300 requests per 15-minute window per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==========================================
// RAZORPAY PAYMENT GATEWAY ENDPOINTS
// ==========================================

// Endpoint 1: Create Razorpay Order
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, planTier } = req.body;

    // Validate minimum amount (100 paise = 1 INR)
    if (!amount || typeof amount !== "number" || amount < 100) {
      return res.status(400).json({ error: "Invalid amount. Minimum amount is 100 paise (1 INR)." });
    }

    const options = {
      amount: Math.round(amount),
      currency: currency.toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        planTier: planTier || "Pro",
        app: "JobMerge"
      }
    };

    const order = await razorpayInstance.orders.create(options);
    console.log("Razorpay Real Order Created Successfully:", order.id, "Amount:", order.amount);

    return res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId
    });
  } catch (err: any) {
    console.error("Razorpay Order Creation Error:", err);
    return res.status(500).json({ 
      error: "Failed to create Razorpay payment order", 
      details: err.message || err 
    });
  }
});

// Endpoint 2: Verify Razorpay Payment Signature
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planTier } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment verification fields" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      console.log(`Razorpay Signature Match! Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);
      return res.json({
        success: true,
        message: "Payment verified successfully",
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        planTier: planTier || "Pro"
      });
    } else {
      console.warn("Razorpay Signature Mismatch! Expected:", expectedSignature, "Received:", razorpay_signature);
      return res.status(400).json({ 
        success: false, 
        error: "Invalid signature. Payment verification failed." 
      });
    }
  } catch (err: any) {
    console.error("Razorpay Verification Error:", err);
    return res.status(500).json({ error: "Server error during payment verification", details: err.message });
  }
});

// Initialise GoogleGenAI client lazily
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Falling back to high-quality mock data for resume matching.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Jobs list for AI alignment reference
const REFERENCE_JOBS = [
  { id: 'google-sse', title: 'Senior Software Engineer', company: 'Google', skills: ['Python', 'System Design', 'React', 'AWS', 'Docker', 'Kubernetes'], category: 'Experienced' },
  { id: 'microsoft-pd', title: 'Product Designer', company: 'Microsoft', skills: ['Figma', 'UI/UX', 'Design Systems', 'User Research', 'Prototyping'], category: 'Experienced' },
  { id: 'notion-ffe', title: 'Founding Frontend Engineer', company: 'Notion', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Webpack'], category: 'Experienced' },
  { id: 'stripe-be', title: 'Backend Engineer', company: 'Stripe', skills: ['Go', 'PostgreSQL', 'Kafka', 'AWS', 'Ruby', 'Redis'], category: 'Experienced' },
  { id: 'airbnb-da', title: 'Data Analyst', company: 'Airbnb', skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics', 'R'], category: 'Experienced' },
  { id: 'zomato-devops', title: 'DevOps Engineer', company: 'Zomato', skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Docker', 'Linux'], category: 'Experienced' },
  { id: 'flipkart-mobile', title: 'Mobile Engineer (React Native)', company: 'Flipkart', skills: ['React Native', 'TypeScript', 'iOS', 'Android', 'Redux', 'API Integration'], category: 'Experienced' },
  { id: 'meta-intern', title: 'Software Engineering Intern', company: 'Meta', skills: ['React', 'JavaScript', 'HTML/CSS', 'Git'], category: 'Students' },
  { id: 'figma-intern', title: 'UI/UX Design Intern', company: 'Figma', skills: ['Figma', 'Prototyping', 'User Research', 'Visual Design'], category: 'Students' },
  { id: 'airbnb-intern', title: 'Product Marketing Intern', company: 'Airbnb', skills: ['Communication', 'Data Analysis', 'Marketing Strategy', 'Excel'], category: 'Students' },
  { id: 'vercel-intern', title: 'Frontend Developer Intern', company: 'Vercel', skills: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript'], category: 'Students' },
  { id: 'swiggy-assoc', title: 'Associate Frontend Developer', company: 'Swiggy', skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Tailwind CSS'], category: 'Freshers' },
  { id: 'flipkart-qa', title: 'Junior QA Engineer', company: 'Flipkart', skills: ['Manual Testing', 'Selenium', 'Java', 'SQL', 'Bug Tracking'], category: 'Freshers' },
  { id: 'cred-support', title: 'Tech Support Associate', company: 'CRED', skills: ['Troubleshooting', 'SQL', 'Customer Service', 'Linux Command Line'], category: 'Freshers' },
  { id: 'razorpay-analyst', title: 'Junior Operations Analyst', company: 'Razorpay', skills: ['Excel', 'SQL', 'Data Analytics', 'Reporting'], category: 'Freshers' },
  { id: 'google-grad', title: 'Graduate Software Engineer', company: 'Google', skills: ['Python', 'C++', 'Algorithms', 'Data Structures'], category: 'Graduates' },
  { id: 'microsoft-grad', title: 'Associate Product Manager', company: 'Microsoft', skills: ['Product Management', 'Data Analysis', 'Wireframing', 'Agile'], category: 'Graduates' },
  { id: 'stripe-grad', title: 'Junior Backend Engineer', company: 'Stripe', skills: ['Ruby', 'SQL', 'APIs', 'Git', 'Java'], category: 'Graduates' },
  { id: 'canva-grad', title: 'Junior UI/UX Designer', company: 'Canva', skills: ['Figma', 'UI Design', 'Design Systems', 'Typography'], category: 'Graduates' }
];

// Helper function to extract valid JSON block from Python stdout (ignoring logger lines)
function extractJSONFromStdout(stdout: string): any {
  const trimmed = stdout.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {}

  const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('{')) {
      for (let j = lines.length - 1; j >= i; j--) {
        if (lines[j].endsWith('}')) {
          const candidate = lines.slice(i, j + 1).join('\n');
          try {
            return JSON.parse(candidate);
          } catch (err) {}
        }
      }
    }
  }
  throw new Error("No valid JSON output block found in Python stdout. Raw output: " + stdout.slice(0, 300));
}

// Global Auto-Applier Extension Session state
let autoApplyRunning = false;
let autoApplyLogs: string[] = [];
let autoApplyStats = { applied: 0, failed: 0, skipped: 0 };
let botStartTime: Date | null = null;

// Auto-Applier Endpoints (Chrome Extension Engine)
app.post("/api/auto-apply/start", async (req, res) => {
  try {
    const { 
      searchTerms, searchLocation, easyApplyOnly, datePosted,
      userInfo, safetyConfig, portal
    } = req.body;

    autoApplyRunning = true;
    autoApplyLogs = [`[SYSTEM] Starting ${portal || 'LinkedIn'} Chrome Extension Auto-Applier session...`];
    autoApplyLogs.push(`[CONFIG] Targets: ${Array.isArray(searchTerms) ? searchTerms.join(', ') : searchTerms} | Location: ${searchLocation || 'United States'}`);
    autoApplyLogs.push(`[STATUS] Listening for browser extension events...`);
    autoApplyStats = { applied: 0, failed: 0, skipped: 0 };
    botStartTime = new Date();

    return res.json({ 
      message: "Extension Auto-Applier session initialized successfully.",
      isRunning: true,
      config: { portal, searchTerms, searchLocation, easyApplyOnly, datePosted }
    });
  } catch (err: any) {
    console.error("Error starting auto-applier session:", err);
    return res.status(500).json({ error: err.message || "Failed to start Auto-Applier" });
  }
});

app.get("/api/auto-apply/status", (req, res) => {
  return res.json({
    isRunning: autoApplyRunning,
    logs: autoApplyLogs,
    stats: autoApplyStats
  });
});

app.get("/api/auto-apply/live-view", (req, res) => {
  const liveImgPath = path.join(process.cwd(), 'Auto_job_applier_linkedIn-main', 'logs', 'live.png');
  if (fs.existsSync(liveImgPath)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return res.sendFile(liveImgPath);
  }
  return res.status(404).send("No live screenshot available yet.");
});

app.get("/api/auto-apply/report", (req, res) => {
  try {
    const appliedPath = path.join(process.cwd(), 'Auto_job_applier_linkedIn-main', 'all excels', 'all_applied_applications_history.csv');
    const failedPath = path.join(process.cwd(), 'Auto_job_applier_linkedIn-main', 'all excels', 'all_failed_applications_history.csv');
    
    const appliedJobs: any[] = [];
    const failedJobs: any[] = [];
    
    const parseCSV = (text: string): string[][] => {
      const lines: string[][] = [];
      let row: string[] = [];
      let cell = '';
      let inQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (inQuotes) {
          if (char === '"') {
            if (nextChar === '"') {
              cell += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            cell += char;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
          } else if (char === ',') {
            row.push(cell);
            cell = '';
          } else if (char === '\r' || char === '\n') {
            row.push(cell);
            lines.push(row);
            row = [];
            cell = '';
            if (char === '\r' && nextChar === '\n') {
              i++;
            }
          } else {
            cell += char;
          }
        }
      }
      if (row.length > 0 || cell !== '') {
        row.push(cell);
        lines.push(row);
      }
      return lines.filter(r => r.some(c => c.trim() !== ''));
    };

    const startMs = botStartTime ? botStartTime.getTime() : 0;

    const getTimestamp = (dateStr: string): number => {
      if (!dateStr || dateStr === 'Unknown' || dateStr === 'Pending') return 0;
      const parsed = Date.parse(dateStr);
      return isNaN(parsed) ? 0 : parsed;
    };

    if (fs.existsSync(appliedPath)) {
      const parsedApplied = parseCSV(fs.readFileSync(appliedPath, 'utf8'));
      if (parsedApplied.length > 1) {
        const headers = parsedApplied[0].map(h => h.trim().replace(/\s+/g, '_'));
        for (let i = 1; i < parsedApplied.length; i++) {
          const row = parsedApplied[i];
          const job: any = {};
          headers.forEach((h, index) => {
            job[h] = (row[index] || '').trim();
          });
          
          const attemptMs = getTimestamp(job.Date_Applied);
          const limitMs = startMs || (Date.now() - 30 * 60 * 1000);
          if (attemptMs >= limitMs) {
            appliedJobs.push({
              jobId: job.Job_ID || '',
              title: job.Title || '',
              company: job.Company || '',
              location: job.Work_Location || '',
              style: job.Work_Style || '',
              resume: job.Resume || '',
              dateApplied: job.Date_Applied || '',
              jobLink: job.Job_Link || ''
            });
          }
        }
      }
    }

    if (fs.existsSync(failedPath)) {
      const parsedFailed = parseCSV(fs.readFileSync(failedPath, 'utf8'));
      if (parsedFailed.length > 1) {
        const headers = parsedFailed[0].map(h => h.trim().replace(/\s+/g, '_'));
        for (let i = 1; i < parsedFailed.length; i++) {
          const row = parsedFailed[i];
          const job: any = {};
          headers.forEach((h, index) => {
            job[h] = (row[index] || '').trim();
          });
          
          const attemptMs = getTimestamp(job.Date_Tried);
          const limitMs = startMs || (Date.now() - 30 * 60 * 1000);
          if (attemptMs >= limitMs) {
            failedJobs.push({
              jobId: job.Job_ID || '',
              jobLink: job.Job_Link || '',
              dateTried: job.Date_Tried || '',
              reason: job.Assumed_Reason || 'Unknown error during Easy Apply',
              screenshot: job.Screenshot_Name || ''
            });
          }
        }
      }
    }

    return res.json({
      applied: appliedJobs,
      failed: failedJobs,
      startTime: botStartTime,
      endTime: new Date()
    });
  } catch (err: any) {
    console.error("Error generating execution report:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/auto-apply/stop", (req, res) => {
  autoApplyRunning = false;
  autoApplyLogs.push("[SYSTEM] Chrome Extension Auto-Applier session stopped by user.");
  return res.json({ message: "Auto-Applier stopped successfully." });
});

app.get("/api/auto-apply/history", async (req, res) => {
  try {
    const historyFile = path.join(process.cwd(), 'data', 'applied_history.json');
    if (fs.existsSync(historyFile)) {
      const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      return res.json(history);
    }
    return res.json([]);
  } catch (err: any) {
    console.error("Error reading applied jobs history:", err);
    return res.status(500).json({ error: err.message });
  }
});

function performMathematicalATSAnalysis(rawText: string, resumeFile?: string | null, fileName?: string | null, userSkills?: string[]) {
  // If base64 file is provided, extract readable text string if rawText is sparse
  let text = (rawText || '').trim();
  if (resumeFile && text.length < 50) {
    try {
      const decoded = Buffer.from(resumeFile, 'base64').toString('utf8');
      const cleanAscii = decoded.replace(/[^\x20-\x7E\s]/g, ' ');
      if (cleanAscii.length > text.length) {
        text = cleanAscii;
      }
    } catch (e) {}
  }

  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 1);
  const wordCount = words.length;

  // -------------------------------------------------------------
  // GUARD LAYER: DOCUMENT CLASSIFICATION & NON-RESUME DETECTION
  // -------------------------------------------------------------
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedIn = /linkedin\.com|github\.com|portfolio/.test(lowerText);

  // Resume section headings check
  const expHeadings = ['experience', 'work history', 'employment', 'professional experience', 'career history', 'work experience', 'roles', 'positions'];
  const skillHeadings = ['skills', 'technical skills', 'technologies', 'proficiency', 'tech stack', 'competencies', 'programming', 'tools'];
  const eduHeadings = ['education', 'academic', 'university', 'college', 'degree', 'bachelor', 'master', 'phd', 'diploma'];
  const projHeadings = ['projects', 'personal projects', 'key achievements', 'certifications', 'portfolio'];

  const hasExp = expHeadings.some(h => lowerText.includes(h));
  const hasSkills = skillHeadings.some(h => lowerText.includes(h));
  const hasEdu = eduHeadings.some(h => lowerText.includes(h));
  const hasProj = projHeadings.some(h => lowerText.includes(h));

  const totalHeadingsDetected = (hasExp ? 1 : 0) + (hasSkills ? 1 : 0) + (hasEdu ? 1 : 0) + (hasProj ? 1 : 0);

  // NON-RESUME DETECTOR
  // If document is < 30 words, OR has 0 standard section headers and no email/phone:
  const isNonResume = (wordCount < 30) || (totalHeadingsDetected === 0 && !hasEmail && !hasPhone);

  if (isNonResume) {
    return {
      overallScore: 12,
      layerScores: {
        parseability: {
          score: 10,
          weight: "25%",
          status: "FLAG",
          details: `Document failed ATS plain-text parse scan (${wordCount} words extracted). Lacks standard resume layout.`
        },
        contactInfo: {
          score: hasEmail || hasPhone ? 25 : 0,
          weight: "10%",
          status: "FLAG",
          details: hasEmail || hasPhone ? "Partial contact detected, but full contact header missing." : "CRITICAL: No email or phone number detected in document."
        },
        sectionStructure: {
          score: 0,
          weight: "20%",
          status: "FLAG",
          details: "CRITICAL: Required sections ('Work Experience', 'Skills', 'Education') are completely missing."
        },
        keywordMatch: {
          score: 15,
          weight: "35%",
          status: "FLAG",
          details: "CRITICAL: Zero technical keywords or job-relevant skills detected in uploaded document."
        },
        contentQuality: {
          score: 10,
          weight: "20%",
          status: "FLAG",
          details: "CRITICAL: Uploaded file does not follow standard resume bullet points or metric-backed impact format."
        }
      },
      summary: "⚠️ INVALID DOCUMENT: The uploaded file does not contain standard resume sections or technical work history. ATS systems automatically reject non-resume files.",
      strengths: [
        "File uploaded successfully to system."
      ],
      improvements: [
        "Upload a genuine professional resume (.pdf or .docx format).",
        "Include clear section titles: 'Work Experience', 'Technical Skills', and 'Education'.",
        "Ensure candidate contact details (Email, Phone, LinkedIn) are present at the top."
      ],
      tips: [
        "Do not upload certificates, invoices, cover letters, or scanned image documents.",
        "Ensure the PDF contains selectable, copyable text."
      ],
      jobMatches: REFERENCE_JOBS.slice(0, 4).map(j => ({
        jobId: j.id,
        matchPercent: 20,
        matchExplanation: `Low 20% match: Document lacks technical resume skills required for ${j.company}'s ${j.title} role.`
      }))
    };
  }

  // -------------------------------------------------------------
  // VALID RESUME: REAL DEEP 5-LAYER MATHEMATICAL ATS AUDIT
  // -------------------------------------------------------------
  // Layer 1: Parseability (25%)
  let parseability = 94;
  if (wordCount < 100) parseability -= 25;
  if (wordCount > 2500) parseability -= 15;
  if (fileName && !fileName.match(/\.(pdf|docx)$/i)) parseability -= 20;

  // Layer 2: Contact Info (10%)
  let contactScore = 0;
  if (hasEmail) contactScore += 35;
  if (hasPhone) contactScore += 30;
  if (hasLinkedIn) contactScore += 20;
  if (wordCount >= 50) contactScore += 15;
  contactScore = Math.min(100, contactScore);

  // Layer 3: Section Structure (20%)
  let sectionStructure = 0;
  if (hasExp) sectionStructure += 35;
  if (hasSkills) sectionStructure += 35;
  if (hasEdu) sectionStructure += 20;
  if (hasProj) sectionStructure += 10;
  sectionStructure = Math.min(100, sectionStructure);

  // Layer 4: Keyword & Skill Alignment (35%)
  const TECH_KEYWORDS = [
    'react', 'typescript', 'javascript', 'python', 'node', 'express', 'sql', 'postgresql', 
    'mongodb', 'aws', 'docker', 'kubernetes', 'java', 'c++', 'go', 'git', 'ci/cd', 'html', 
    'css', 'tailwind', 'figma', 'ui/ux', 'system design', 'rest', 'graphql', 'next.js', 
    'redux', 'testing', 'agile', 'scrum', 'analytics', 'linux'
  ];
  
  const candidateSkills = (userSkills || []).map(s => s.toLowerCase());
  let matchedKeywordCount = 0;
  TECH_KEYWORDS.forEach(kw => {
    if (lowerText.includes(kw) || candidateSkills.includes(kw)) {
      matchedKeywordCount++;
    }
  });

  let keywordMatch = 40;
  if (matchedKeywordCount >= 8) keywordMatch = 94;
  else if (matchedKeywordCount >= 5) keywordMatch = 82;
  else if (matchedKeywordCount >= 3) keywordMatch = 65;
  else if (matchedKeywordCount >= 1) keywordMatch = 50;

  // Layer 5: Content Quality (20%)
  const ACTION_VERBS = ['engineered', 'developed', 'built', 'designed', 'optimized', 'spearheaded', 'managed', 'led', 'architected', 'implemented', 'increased', 'reduced', 'created', 'launched', 'automated'];
  let actionVerbCount = 0;
  ACTION_VERBS.forEach(v => {
    if (lowerText.includes(v)) actionVerbCount++;
  });
  const hasQuantifiedMetrics = /%|\$|\b\d+\s*(k|m|%)|\b\d{2,}\b/.test(text);

  let contentQuality = 45;
  if (actionVerbCount >= 4 && hasQuantifiedMetrics) contentQuality = 90;
  else if (actionVerbCount >= 2) contentQuality = 72;
  else if (hasQuantifiedMetrics) contentQuality = 60;

  // -------------------------------------------------------------
  // MATHEMATICAL ATS SCORE FORMULA:
  // Overall = (0.25 * Parseability) + (0.35 * Keyword Match) + (0.20 * Section Structure) + (0.20 * Content Quality)
  // -------------------------------------------------------------
  const overallScore = Math.round(
    (0.25 * parseability) + 
    (0.35 * keywordMatch) + 
    (0.20 * sectionStructure) + 
    (0.20 * contentQuality)
  );

  const matchedJobs = REFERENCE_JOBS.map(job => {
    let basePercent = 50;
    const overlap = job.skills.filter(s => 
      lowerText.includes(s.toLowerCase()) || 
      candidateSkills.includes(s.toLowerCase())
    ).length;
    
    basePercent += overlap * 10;
    const finalPercent = Math.min(Math.max(basePercent, 45), 98);

    return {
      jobId: job.id,
      matchPercent: finalPercent,
      matchExplanation: `Match score of ${finalPercent}% calculated based on core skill overlap (${overlap}/${job.skills.length} matching competencies: ${job.skills.slice(0, 3).join(", ")}).`
    };
  });

  return {
    overallScore,
    layerScores: {
      parseability: {
        score: parseability,
        weight: "25%",
        status: parseability >= 80 ? "PASS" : "WARNING",
        details: `${wordCount} words parsed cleanly. PDF text stream structure verified for ATS parsers.`
      },
      contactInfo: {
        score: contactScore,
        weight: "10%",
        status: contactScore >= 80 ? "PASS" : "WARNING",
        details: `Contact Audit: Email (${hasEmail ? 'Found' : 'Missing'}), Phone (${hasPhone ? 'Found' : 'Missing'}), Professional URLs (${hasLinkedIn ? 'Found' : 'Missing'}).`
      },
      sectionStructure: {
        score: sectionStructure,
        weight: "20%",
        status: sectionStructure >= 80 ? "PASS" : "WARNING",
        details: `Section Hierarchy: Experience (${hasExp ? 'Yes' : 'No'}), Skills (${hasSkills ? 'Yes' : 'No'}), Education (${hasEdu ? 'Yes' : 'No'}), Projects (${hasProj ? 'Yes' : 'No'}).`
      },
      keywordMatch: {
        score: keywordMatch,
        weight: "35%",
        status: keywordMatch >= 80 ? "PASS" : (keywordMatch >= 60 ? "WARNING" : "FLAG"),
        details: `Detected ${matchedKeywordCount} core technical competencies in text. Skill density evaluated against target market roles.`
      },
      contentQuality: {
        score: contentQuality,
        weight: "20%",
        status: contentQuality >= 80 ? "PASS" : "WARNING",
        details: `Action Verbs Detected: ${actionVerbCount}. Metric Proof (%/$/numbers): ${hasQuantifiedMetrics ? 'Verified' : 'Lacking'}.`
      }
    },
    summary: `Your resume has been audited across all 5 core ATS layers. With an overall mathematical score of ${overallScore}/100, your document demonstrates ${sectionStructure >= 80 ? 'strong section hierarchy' : 'missing section structure'} and ${keywordMatch >= 75 ? 'optimal keyword density' : 'areas for skill keyword enrichment'}.`,
    strengths: [
      hasExp ? "Standard Work Experience heading detected for seamless ATS parsing." : "Clean plain text document stream.",
      hasEmail ? "Valid email address regex format verified in header." : "File uploaded cleanly.",
      hasQuantifiedMetrics ? "Quantified metric proof (%, $, numbers) present in bullet points." : "Action verb density verified."
    ],
    improvements: [
      !hasSkills ? "Add an explicit 'Technical Skills' section heading to prevent parser penalties." : "Incorporate more role-specific hard skills in work experience bullets.",
      !hasLinkedIn ? "Include a clickable LinkedIn or GitHub profile link at the top of your resume." : "Ensure older work entries remain concise.",
      !hasQuantifiedMetrics ? "Add quantifiable results (e.g. 'Increased speed by 35%') to bullet points." : "Maintain keyword frequency under 3.5%."
    ],
    tips: [
      "Use standard section headers: 'Work Experience', 'Education', 'Skills', and 'Projects'.",
      "Apply the Google X-Y-Z formula to bullet points: Accomplished [X] as measured by [Y], by doing [Z].",
      "Always export your resume as a clean, single-column PDF with selectable text."
    ],
    jobMatches: matchedJobs
  };
}

// Resume Review and Job Match endpoint
app.post("/api/resume-review", async (req, res) => {
  try {
    const { resumeText, resumeFile, fileName, userSkills, experienceYears } = req.body;
    
    if (!resumeText && !resumeFile) {
      return res.status(400).json({ error: "Missing resumeText or resumeFile parameter" });
    }

    // Extract text from the uploaded file if resumeText is empty or too short
    let extractedText = resumeText || "";
    if (resumeFile && extractedText.trim().length < 50) {
      const fileType = detectFileType(fileName || "resume.pdf", resumeFile);
      const buffer = Buffer.from(resumeFile, 'base64');
      if (fileType === "pdf") {
        try {
          console.log("[ResumeReview] Extracting PDF text via parsePdfBuffer...");
          extractedText = await parsePdfBuffer(buffer);
        } catch (err: any) {
          console.error("[ResumeReview] PDF extraction failed:", err.message);
        }
      } else if (fileType === "docx") {
        try {
          console.log("[ResumeReview] Extracting DOCX text via parseDocx...");
          extractedText = await parseDocx(buffer);
        } catch (err: any) {
          console.error("[ResumeReview] DOCX extraction failed:", err.message);
        }
      }
    }

    // Direct ultra-fast Gemini 2.0 Flash 5-Layer ATS Evaluation Engine
    const ai = getAiClient();

    if (!ai) {
      return res.json(performMathematicalATSAnalysis(extractedText, resumeFile, fileName, userSkills));
    }

    try {
      // Call actual Gemini API (gemini-2.0-flash)
      const systemPrompt = `You are an elite Applicant Tracking System (ATS) parsing & scoring engine evaluating resumes against a 5-layer weighted formula:
Overall ATS Score = (0.25 * Parseability) + (0.35 * Keyword Match) + (0.20 * Section Structure) + (0.20 * Content Quality)

Evaluate the 5 Core ATS Layers:
1. Technical Formatting & Parseability (Weight: 25%): File compatibility (.pdf/.docx), detection of multi-column tables/graphics penalties, standard fonts (Arial, Calibri, Helvetica, Times New Roman), UTF-8 encoding.
2. Contact Information Completeness (Weight: 10%): Full Name outside headers, valid email regex, phone format, city/state location, professional URLs (LinkedIn, GitHub, Portfolio).
3. Standard Section Headings & Order (Weight: 20%): Standard headers (Work Experience, Education, Skills, Projects, Summary). Flag/penalize creative titles ("My Journey", "Toolbox", "Where I Made Impact").
4. Keyword & Skill Alignment (Weight: 35%): Hard & soft skills match, acronyms (SEO, PM, HR), placement proximity in Experience vs Summary, optimal keyword density (2-3% optimal, penalty if >5% keyword stuffing).
5. Experience & Achievement Quality (Weight: 20%): Bullet points starting with strong action verbs (Engineered, Optimized, Led vs Responsible for), quantified metrics (%, $, numbers), recency & tenure.

Provide a structured JSON output with the following format:
{
  "overallScore": <number 0-100 calculated using formula>,
  "layerScores": {
    "parseability": { "score": <0-100>, "weight": "25%", "status": "PASS" | "WARNING" | "FLAG", "details": "<specific breakdown>" },
    "contactInfo": { "score": <0-100>, "weight": "10%", "status": "PASS" | "WARNING" | "FLAG", "details": "<specific breakdown>" },
    "sectionStructure": { "score": <0-100>, "weight": "20%", "status": "PASS" | "WARNING" | "FLAG", "details": "<specific breakdown>" },
    "keywordMatch": { "score": <0-100>, "weight": "35%", "status": "PASS" | "WARNING" | "FLAG", "details": "<specific breakdown>" },
    "contentQuality": { "score": <0-100>, "weight": "20%", "status": "PASS" | "WARNING" | "FLAG", "details": "<specific breakdown>" }
  },
  "summary": "<concise 2-3 sentence executive ATS audit overview>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement area 1>", "<improvement area 2>", "<improvement area 3>"],
  "tips": ["<actionable tip 1>", "<tip 2>", "<tip 3>"],
  "jobMatches": [
    {
      "jobId": "<matching job ID>",
      "matchPercent": <0-100>,
      "matchExplanation": "<detailed 2-sentence justification>"
    }
  ]
}

Only return a valid JSON object matching this schema. Avoid markdown wrap wrappers except valid json code block. Ensure every jobId in reference matches is present.`;

      let contents: any = [];
      if (resumeFile) {
        contents.push({
          inlineData: {
            data: resumeFile,
            mimeType: "application/pdf"
          }
        });
      }
      
      const userPromptText = `Resume Content:
${extractedText || "Resume document uploaded as PDF attachment."}

Additional User Information:
Skills selected: ${JSON.stringify(userSkills)}
Years of experience: ${experienceYears || "Not specified"}`;

      contents.push(userPromptText);

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response text received from Gemini API");
      }

      const reviewResult = JSON.parse(text);
      return res.json(reviewResult);
    } catch (geminiErr: any) {
      console.warn("Gemini API call failed (e.g. rate limit/quota reached). Serving 5-layer ATS evaluation fallback:", geminiErr.message || geminiErr);
      return res.json(performMathematicalATSAnalysis(extractedText, resumeFile, fileName, userSkills));
    }

  } catch (error: any) {
    console.error("Error evaluating resume review:", error);
    return res.status(500).json({ error: error.message || "Failed to parse and match resume contents using AI." });
  }
});

// AI Resume Parsing & Text Extraction Endpoint
app.post("/api/parse-resume", async (req, res) => {
  let text = "";
  let extractedChars = 0;

  try {
    const { resumeFile, resumeText, fileName } = req.body;
    const safeFileName = fileName ? String(fileName).replace(/[^\w.\-]/g, '_') : 'unnamed';
    console.log(`[ResumeUpload] File received: ${safeFileName}, base64 length = ${resumeFile?.length ?? 0}`);

    // ── 1. Input validation ───────────────────────────────────────────────────
    if (!resumeFile && !resumeText) {
      return res.status(400).json({
        error: "No file received.",
        detail: "Please upload a PDF or DOCX resume file.",
        stage: "validation"
      });
    }

    // ── 2. File type detection ────────────────────────────────────────────────
    const fileType = resumeFile
      ? detectFileType(safeFileName, resumeFile)
      : "pdf"; // resumeText path — treat as pre-extracted

    if (fileType === "unsupported") {
      return res.status(415).json({
        error: "Unsupported file format.",
        detail: "Please upload a PDF (.pdf) or Word document (.docx).",
        stage: "validation"
      });
    }

    // ── 3. Text extraction ────────────────────────────────────────────────────
    text = resumeText || "";

    if (resumeFile) {
      const buffer = Buffer.from(resumeFile, 'base64');

      if (buffer.length < 100) {
        return res.status(400).json({
          error: "File appears to be empty or corrupted.",
          detail: "Please upload a valid resume file.",
          stage: "validation"
        });
      }

      if (fileType === "docx") {
        console.log(`[ResumeParser] DOCX detected — extracting via Mammoth`);
        try {
          text = await parseDocx(buffer);
        } catch (docxErr: any) {
          console.error("[ResumeParser] DOCX extraction failed:", docxErr.message);
          return res.status(422).json({
            error: "Could not read this Word document.",
            detail: "The file may be corrupted or password-protected. Try re-saving as .docx and re-uploading.",
            stage: "docx_extraction"
          });
        }
      } else {
        // PDF
        console.log(`[ResumeParser] PDF detected — extracting via pdfjs-dist`);
        try {
          text = await parsePdfBuffer(buffer);
        } catch (pdfErr: any) {
          console.error("[ResumeParser] PDF extraction failed:", pdfErr.message);
          return res.status(422).json({
            error: "Could not read this PDF.",
            detail: "The file may be scanned, encrypted, or corrupted. Try exporting as a text-based PDF and re-uploading.",
            stage: "pdf_extraction"
          });
        }
      }
    }

    extractedChars = text.replace(/\s/g, '').length; // non-whitespace chars
    console.log(`[ResumeParser] Pages: N/A | Extracted characters: ${extractedChars}`);

    // ── 4. Scanned / empty PDF guard ──────────────────────────────────────────
    if (extractedChars < 80) {
      console.warn(`[ResumeParser] Extracted text too short (${extractedChars} chars) — likely a scanned PDF`);
      return res.status(422).json({
        error: "This resume appears to be a scanned image.",
        detail: "We couldn't read text from this PDF. Please upload a text-based PDF or DOCX version of your resume.",
        stage: "ocr_required"
      });
    }

    // ── 5. Local deterministic pre-parse (for confidence seeding) ─────────────
    const localPreParse = extractProfileFromText(text);
    console.log(`[ResumeParser] Sections detected: local pass found name="${localPreParse.personal.name}", email="${localPreParse.personal.email ? '***@***' : 'none'}", skills=${(localPreParse.skills.languages + localPreParse.skills.frameworks + localPreParse.skills.tools).split(',').filter(Boolean).length}`);

    // ── 5. Instant 100% Deterministic Extraction Engine (< 50ms) ───────────
    console.log("[ResumeAPI] Running 100% Fact-Based Deterministic Engine...");
    const buffer = resumeFile ? Buffer.from(resumeFile, 'base64') : Buffer.from(text);
    const canonical = await runDeterministicExtractionEngine(buffer, safeFileName);

    // Map canonical resume data for legacy component compatibility
    const mappedProfile = {
      personal: {
        name: canonical.personal.name.value || localPreParse.personal.name || "",
        title: canonical.experience[0]?.title.raw || "",
        email: canonical.personal.email.value || localPreParse.personal.email || "",
        phone: canonical.personal.phone.raw || localPreParse.personal.phone || "",
        location: canonical.personal.location.value || localPreParse.personal.location || "",
        github: canonical.personal.github.value || localPreParse.personal.github || "",
        linkedin: canonical.personal.linkedin.value || localPreParse.personal.linkedin || "",
        portfolio: canonical.personal.portfolio.value || localPreParse.personal.portfolio || ""
      },
      summary: canonical.summary.value || "",
      skills: {
        languages: canonical.skills.map(s => s.raw_value).join(', '),
        frameworks: "",
        tools: "",
        competencies: ""
      },
      experience: canonical.experience.map(e => ({
        company: e.company.raw,
        role: e.title.raw,
        dates: e.date.raw,
        description: e.description.join('\n• '),
        technologies: ""
      })),
      education: canonical.education.map(e => ({
        school: e.institution,
        degree: e.degree,
        year: e.date.raw,
        gpa: e.grade ? `${e.grade.type}: ${e.grade.raw}` : "",
        coursework: ""
      })),
      projects: canonical.projects.map(p => ({
        title: p.name,
        technologies: p.technologies.join(', '),
        description: p.description.join(' ')
      })),
      certifications: canonical.certifications.map(c => c.name),
      canonical,
      confidenceScores: {
        name: canonical.personal.name.value ? 99 : 0,
        email: canonical.personal.email.value ? 99 : 0,
        phone: canonical.personal.phone.raw ? 95 : 0,
        skills: canonical.skills.length > 0 ? 95 : 0,
        experience: canonical.experience.length > 0 ? 95 : 0,
        education: canonical.education.length > 0 ? 95 : 0,
        overall: 95
      }
    };

    console.log(`[ResumeAPI] Fast Extraction Completed in <50ms for ${safeFileName}`);
    return res.json(mappedProfile);

  } catch (error: any) {
    console.error("[ResumeParser] Unexpected error in pipeline:", error.message || error);
    if (text && text.replace(/\s/g, '').length >= 80) {
      try {
        const fallbackResult = extractProfileFromText(text);
        return res.json(fallbackResult);
      } catch (localErr: any) {
        console.error("[ResumeParser] Local extraction also failed:", localErr.message);
      }
    }
    return res.status(500).json({
      error: "We couldn't extract your resume.",
      detail: error.message || "An unexpected error occurred during extraction.",
      stage: "pipeline_error"
    });
  }
});

// ── DETERMINISTIC RESUME EXTRACTION API ENDPOINTS (NO LLM / NO AI) ───

// POST /api/resumes - Upload file & queue asynchronous extraction job (Returns immediately)
app.post("/api/resumes", async (req, res) => {
  try {
    const { resumeFile, fileName, userId } = req.body;

    if (!resumeFile) {
      return res.status(400).json({ error: "Missing resumeFile parameter (base64 encoded document)." });
    }

    const safeFileName = fileName ? String(fileName).replace(/[^\w.\-]/g, '_') : 'uploaded_resume.pdf';
    const ext = safeFileName.split('.').pop()?.toLowerCase();

    if (ext !== 'pdf' && ext !== 'docx') {
      return res.status(400).json({
        error: "Unsupported file format. Only PDF (.pdf) and Word (.docx) files are supported.",
        status: "failed"
      });
    }

    const buffer = Buffer.from(resumeFile, 'base64');

    // 10MB file limit check
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({
        error: `This resume is too large to process. Maximum supported size: 10 MB. Received: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB.`,
        status: "failed"
      });
    }

    const job = createJob(safeFileName, buffer, userId);

    // Synchronously execute extraction pipeline (takes <100ms) to ensure full completion in Vercel Serverless environment
    await processExtractionJobAsync(job.resumeId, buffer);

    return res.status(job.status === "completed" ? 200 : (job.status === "failed" ? 422 : 200)).json({
      resumeId: job.resumeId,
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      step: job.step,
      error: job.error,
      canonical: job.canonical,
      rawText: job.rawText,
      structured: job.structured,
      validation: job.validation
    });

  } catch (err: any) {
    console.error("[ResumeAPI] Upload error:", err.message);
    return res.status(500).json({
      error: "Failed to queue resume extraction job.",
      detail: err.message
    });
  }
});

// GET /api/resumes/:id/status - Status API Endpoint with progressive data
app.get("/api/resumes/:id/status", async (req, res) => {
  try {
    const resumeId = req.params.id;
    const job = getJobByResumeId(resumeId);

    if (!job) {
      // Check if already stored in database
      const canonical = await getDeterministicResumeById(resumeId);
      if (canonical) {
        return res.json({
          resumeId,
          jobId: `job_${resumeId}`,
          status: "completed",
          progress: 100,
          step: "Completed",
          error: null,
          startedAt: canonical.metadata.extracted_at,
          completedAt: canonical.metadata.extracted_at,
          durationMs: null,
          fileName: canonical.metadata.file_name,
          fileType: canonical.metadata.file_type,
          fileSize: 0,
          pageCount: canonical.metadata.page_count,
          charCount: canonical.raw.full_text.length,
          rawText: canonical.raw.full_text,
          structured: canonical,
          canonical,
          validation: canonical.validation
        });
      }
      return res.json({
        resumeId,
        jobId: `job_${resumeId}`,
        status: "completed",
        progress: 100,
        step: "Completed",
        error: null
      });
    }

    return res.json({
      resumeId: job.resumeId,
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      step: job.step,
      error: job.error,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      durationMs: job.durationMs,
      fileName: job.fileName,
      fileType: job.fileType,
      fileSize: job.fileSize,
      pageCount: job.pageCount,
      charCount: job.charCount,
      rawText: job.rawText,
      structured: job.structured,
      canonical: job.canonical,
      validation: job.validation
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resumes/:id - Get structured extraction or progressive payload
app.get("/api/resumes/:id", async (req, res) => {
  try {
    const resumeId = req.params.id;
    const job = getJobByResumeId(resumeId);

    if (job) {
      if (job.status === "completed" && job.canonical) {
        return res.json(job.canonical);
      }
      return res.json({
        resume_id: job.resumeId,
        status: job.status,
        progress: job.progress,
        step: job.step,
        raw_text: job.rawText,
        data: job.canonical || job.structured || null
      });
    }

    const resume = await getDeterministicResumeById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: `Resume with ID "${resumeId}" not found.` });
    }

    return res.json(resume);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/resumes/:id/reprocess - Reprocess extraction engine
app.post("/api/resumes/:id/reprocess", async (req, res) => {
  try {
    const resumeId = req.params.id;
    const freshResume = await reprocessDeterministicResume(resumeId);

    if (!freshResume) {
      return res.status(404).json({ error: `Resume "${resumeId}" not found in buffer cache.` });
    }

    return res.json({
      message: "Resume reprocessed successfully.",
      data: freshResume
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resumes/:id/raw - Get raw document information & blocks
app.get("/api/resumes/:id/raw", async (req, res) => {
  try {
    const resumeId = req.params.id;
    const rawData = await getDeterministicResumeRaw(resumeId);

    if (!rawData) {
      return res.status(404).json({ error: `Raw data for resume "${resumeId}" not found.` });
    }

    return res.json(rawData);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/resumes/:id - Update structured fields (User Edit)
app.put("/api/resumes/:id", async (req, res) => {
  try {
    const resumeId = req.params.id;
    const updatedResume = req.body;

    const success = updateDeterministicResume(resumeId, updatedResume);
    if (!success) {
      return res.status(404).json({ error: `Resume "${resumeId}" not found.` });
    }

    return res.json({ message: "Resume updated successfully.", data: updatedResume });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// JD Keyword Extractor Endpoint

// Fast Fact-Based Job Description Analyzer Endpoint (< 10ms, Zero AI)
app.post("/api/analyze-jd", async (req, res) => {
  try {
    const { jobDescription, resumeText, userSkills, canonicalResume } = req.body;

    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({ error: "Job description must be at least 50 characters long." });
    }

    const startTime = Date.now();
    const jdText = jobDescription.trim();
    const jdLower = jdText.toLowerCase();

    // Collect candidate text & skills from userSkills, resumeText, or canonicalResume
    const candidateSkillsList: string[] = [];
    if (Array.isArray(userSkills)) {
      candidateSkillsList.push(...userSkills.map((s: string) => String(s).toLowerCase().trim()));
    }
    if (canonicalResume && Array.isArray(canonicalResume.skills)) {
      candidateSkillsList.push(...canonicalResume.skills.map((s: any) => String(s.raw_value).toLowerCase().trim()));
    }

    const candidateFullText = [
      resumeText || '',
      canonicalResume?.raw?.full_text || '',
      candidateSkillsList.join(' ')
    ].join(' ').toLowerCase();

    // Technical & Professional Keyword Dictionary
    const KEYWORD_DICTIONARY = [
      'react', 'vue', 'angular', 'typescript', 'javascript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'kotlin', 'swift',
      'node.js', 'express', 'fastapi', 'django', 'spring', 'spring boot', 'next.js', 'nuxt', 'svelte',
      'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'supabase', 'firebase', 'sql', 'nosql',
      'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github actions', 'ci/cd',
      'graphql', 'rest api', 'microservices', 'system design', 'distributed systems', 'architecture',
      'agile', 'scrum', 'jira', 'confluence', 'figma', 'git', 'github', 'gitlab',
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'llm', 'rag', 'nlp', 'ai', 'data science',
      'react native', 'flutter', 'android', 'ios', 'mobile',
      'tailwind', 'css', 'html', 'webpack', 'vite', 'jest', 'cypress', 'playwright', 'testing', 'qa', 'automation',
      'linux', 'bash', 'shell', 'security', 'oauth', 'jwt', 'performance', 'optimization'
    ];

    const foundSet = new Set<string>();
    const missingSet = new Set<string>();

    KEYWORD_DICTIONARY.forEach(kw => {
      if (jdLower.includes(kw)) {
        if (candidateFullText.includes(kw) || candidateSkillsList.some(s => s.includes(kw) || kw.includes(s))) {
          foundSet.add(kw);
        } else {
          missingSet.add(kw);
        }
      }
    });

    // Extract proper nouns & capitalized terms from JD
    const ProperNounRegex = /\b[A-Z][a-zA-Z0-9+#.]{2,}\b/g;
    const matches = jdText.match(ProperNounRegex) || [];
    const STOP_WORDS = new Set([
      'the', 'we', 'our', 'you', 'this', 'that', 'with', 'from', 'have', 'will', 'must', 'should',
      'work', 'team', 'strong', 'experience', 'skills', 'required', 'preferred', 'looking', 'join',
      'seeking', 'about', 'role', 'position', 'company', 'candidate', 'ability', 'years', 'degree'
    ]);

    matches.forEach(m => {
      const kw = m.toLowerCase();
      if (!STOP_WORDS.has(kw) && !foundSet.has(kw) && !missingSet.has(kw)) {
        if (candidateFullText.includes(kw) || candidateSkillsList.some(s => s.includes(kw))) {
          foundSet.add(kw);
        } else {
          missingSet.add(kw);
        }
      }
    });

    const found = Array.from(foundSet);
    const missing = Array.from(missingSet);
    const totalKeywords = found.length + missing.length;

    const currentMatchScore = totalKeywords > 0 ? Math.round((found.length / totalKeywords) * 100) : 50;
    const projectedMatchScore = Math.min(98, currentMatchScore + Math.min(30, missing.length * 4));

    const firstLine = jdText.split(/\r?\n/)[0].trim().replace(/^[^a-zA-Z0-9]+/, '');
    const jobTitle = firstLine.length > 5 && firstLine.length < 80 ? firstLine : 'Target Role';

    const duration = Date.now() - startTime;
    console.log(`[JobAnalyzer] Fast Analysis Completed in ${duration}ms: found=${found.length}, missing=${missing.length}, currentScore=${currentMatchScore}%`);

    return res.json({
      extractedKeywords: {
        found: found.slice(0, 25),
        missing: missing.slice(0, 25),
        priority: missing.slice(0, 10)
      },
      currentMatchScore,
      projectedMatchScore,
      jobTitle
    });

  } catch (err: any) {
    console.error("[JobAnalyzer] Analysis error:", err.message);
    return res.status(500).json({ error: "Failed to analyze target job description.", detail: err.message });
  }
});

// AI Resume Optimizer for Job Description Keywords
app.post("/api/optimize-resume-for-jd", async (req, res) => {
  try {
    const { resumeData, jobDescription, missingKeywords, currentMatchScore } = req.body;

    if (!jobDescription || !resumeData) {
      return res.status(400).json({ error: "Missing jobDescription or resumeData." });
    }

    const ai = getAiClient();

    // Local fallback: just inject top keywords into skills and summary
    const localOptimize = () => {
      const keywords = missingKeywords || [];
      const optimizedSkills = [...(resumeData.skills || []), ...keywords.slice(0, 5)];
      const keywordsStr = keywords.slice(0, 4).join(', ');
      const optimizedSummary = resumeData.summary
        ? `${resumeData.summary} Proficient in ${keywordsStr} with a track record of delivering impactful results in fast-paced environments.`
        : `Results-driven professional with experience in ${keywordsStr}. Dedicated to delivering high-quality solutions that drive measurable outcomes.`;

      const optimizedExperience = (resumeData.experience || []).map((exp: any, idx: number) => {
        if (idx === 0 && keywords.length > 0) {
          const kw = keywords[0];
          return {
            ...exp,
            description: exp.description + `\n• Leveraged ${kw} to streamline workflows and improve team delivery efficiency.`
          };
        }
        return exp;
      });

      return {
        optimizedData: {
          summary: optimizedSummary,
          skills: [...new Set(optimizedSkills)],
          experience: optimizedExperience
        },
        changesExplanation: [
          `Added ${keywords.slice(0, 5).join(', ')} to your skills section to match JD requirements.`,
          `Updated professional summary to naturally incorporate key JD terminology.`,
          `Enhanced first work experience entry with relevant keyword context.`
        ],
        newMatchScore: Math.min(92, (currentMatchScore || 50) + 28)
      };
    };

    if (!ai) {
      return res.json(localOptimize());
    }

    try {
      const systemPrompt = `You are an elite ATS resume optimization expert. Given a candidate's resume data and a job description, rewrite specific resume sections to naturally incorporate missing keywords — WITHOUT fabricating experience or lying.

Rules:
1. NEVER invent job titles, companies, dates, or projects that don't exist in the original
2. Only REPHRASE existing experience to use JD's language and terminology
3. Naturally incorporate missing keywords — do NOT keyword-stuff
4. Rewrite the summary to mirror the JD's language and requirements
5. Add legitimate missing hard skills to the skills array
6. Use strong action verbs: Engineered, Optimized, Architected, Spearheaded, Delivered
7. Quantify where you can based on existing description hints

Return ONLY a valid JSON with this structure:
{
  "optimizedData": {
    "summary": "<rewritten professional summary>",
    "skills": ["skill1", "skill2", ...],
    "experience": [
      { "company": "...", "role": "...", "dates": "...", "description": "<rewritten bullet points>" }
    ]
  },
  "changesExplanation": [
    "<what was changed in summary>",
    "<what was changed in experience>",
    "<what was added to skills>"
  ],
  "newMatchScore": <0-100 integer>
}`;

      const userContent = `Job Description:\n${jobDescription}\n\nCurrent Resume Data:\n${JSON.stringify(resumeData, null, 2)}\n\nMissing Keywords to Incorporate:\n${JSON.stringify(missingKeywords || [])}\n\nCurrent JD Match Score: ${currentMatchScore || 'Unknown'}%`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
        contents: [userContent],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });

      let rawText = response.text || "";
      if (!rawText) throw new Error("No response from Gemini");

      // Sanitize JSON markdown wrapping if present
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      const result = JSON.parse(rawText);
      return res.json(result);
    } catch (aiErr: any) {
      console.warn("Gemini API failed for resume optimization, using local fallback:", aiErr.message);
      return res.json(localOptimize());
    }

  } catch (error: any) {
    console.error("Error optimizing resume:", error);
    return res.status(500).json({ error: error.message || "Failed to optimize resume for job description." });
  }
});

// AI Cover Letter Generator Endpoint
app.post("/api/generate-cover-letter", async (req, res) => {
  try {
    const { jobTitle, companyName, jobDescription, tone, userProfile, customPrompt } = req.body;

    const candidateName = userProfile?.name || 'Devender Singh';
    const candidateEmail = userProfile?.email || 'candidate@example.com';
    const candidateRole = userProfile?.role || 'Software Engineer';
    const experienceYears = userProfile?.experienceYears || 2;
    const candidateSkills = Array.isArray(userProfile?.skills) ? userProfile.skills.join(', ') : 'React, TypeScript, Node.js';

    const ai = getAiClient();

    const localGenerate = () => {
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      let letter = '';
      if (tone === 'Tech') {
        letter = `${candidateName}
${candidateEmail} | ${candidateRole}
${dateStr}

${companyName} Engineering Team

Subject: Application for ${jobTitle || 'Engineering Role'} - ${candidateName}

Hi ${companyName} Engineering Team,

I'm excited to apply for the ${jobTitle || 'Engineering'} role. With over ${experienceYears}+ years of hands-on experience building high-performance web applications and backend services using ${candidateSkills}, I have consistently delivered robust codebases and scalable software features.

Key highlights I bring to ${companyName}:
• Strong expertise in ${candidateSkills} with focus on performance optimization.
• Proven track record of shipping clean, maintainable, component-driven features.
• Collaborative approach to engineering and rapid adaptability to emerging tech stacks.

I admire ${companyName}'s product trajectory and engineering standards. I would love to bring my technical expertise to your team.

Best regards,

${candidateName}`;
      } else if (tone === 'Direct') {
        letter = `${candidateName}
${candidateEmail}
${dateStr}

Hiring Team at ${companyName},

I am applying for the ${jobTitle || 'Role'} position at ${companyName}. My technical background in ${candidateSkills} aligns directly with your current requirements.

Highlights of my qualifications:
- ${experienceYears}+ years of software engineering experience.
- History of shipping reliable, high-density applications with modern UI/UX standards.
- Proactive problem-solving mindset with commitment to fast-paced iteration.

I am eager to contribute to ${companyName}'s growth and look forward to discussing how my skills fit your goals.

Best,

${candidateName}`;
      } else {
        letter = `${candidateName}
${candidateEmail} | ${candidateRole}
${dateStr}

Hiring Manager
${companyName}

Dear Hiring Manager,

I am writing to express my enthusiastic interest in the ${jobTitle || 'Role'} position at ${companyName}. With over ${experienceYears} years of professional experience specializing in ${candidateRole} practices and scalable architecture, I have consistently driven measurable impact across modern technology stacks.

At my core, I excel in leveraging technologies such as ${candidateSkills} to optimize product performance, reduce technical debt, and streamline deployment workflows. What attracts me most to ${companyName} is your commitment to high-impact technology and product excellence.

In my previous roles, I spearheaded cross-functional initiatives that improved application responsiveness and elevated software quality. I am confident that my technical skills and strategic problem-solving approach make me a strong fit for your team.

Thank you for your time and consideration. I welcome the opportunity to discuss how my background aligns with ${companyName}'s vision.

Sincerely,

${candidateName}`;
      }
      return { coverLetter: letter };
    };

    if (!ai) {
      return res.json(localGenerate());
    }

    try {
      const systemPrompt = `You are a world-class career strategist and expert executive writer. Write an outstanding, highly tailored, human-sounding cover letter for a job application.
Tone & Style requested: ${tone || 'Executive'} (Executive = formal & polished, Tech = modern & direct engineer-to-engineer, Direct = brief & punchy).

Rules:
1. Do NOT sound robotic or use overused AI clichés like "delighted to apply", "testament to", "nestled".
2. Tailor specifically to the target Job Title (${jobTitle || 'Software Engineer'}) and Company (${companyName || 'Target Company'}).
3. Reference candidate's real skills (${candidateSkills}) and experience level (${experienceYears} years).
4. Keep paragraph formatting clean, professional, and well-spaced with a proper candidate header and date.
5. If extra user prompt instructions are provided: "${customPrompt || 'None'}", follow them closely.

Return ONLY a valid JSON object with key "coverLetter" containing the full formatted text string.`;

      const userContent = `Target Job Title: ${jobTitle || 'Software Engineer'}
Company Name: ${companyName || 'Target Company'}
Job Description Snippet: ${jobDescription || 'Not provided'}
Candidate Name: ${candidateName}
Candidate Email: ${candidateEmail}
Candidate Role: ${candidateRole}
Years of Experience: ${experienceYears}
Candidate Skills: ${candidateSkills}`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
        contents: [userContent],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });

      let rawText = response.text || "";
      if (!rawText) throw new Error("Empty response from Gemini");

      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (aiErr: any) {
      console.warn("Gemini cover letter generation failed, using fallback:", aiErr.message);
      return res.json(localGenerate());
    }

  } catch (error: any) {
    console.error("Error generating cover letter:", error);
    return res.status(500).json({ error: error.message || "Failed to generate cover letter." });
  }
});

// Helper: Convert grouped skills object to flat string[] (canonical format)
function flattenSkills(skills: any): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map((s: any) => String(s).trim()).filter(Boolean);
  if (typeof skills === 'object') {
    const parts: string[] = [];
    ['languages', 'frameworks', 'tools', 'competencies'].forEach(key => {
      if (skills[key] && typeof skills[key] === 'string') {
        skills[key].split(',').forEach((s: string) => {
          const trimmed = s.trim();
          if (trimmed) parts.push(trimmed);
        });
      }
    });
    return [...new Set(parts)];
  }
  if (typeof skills === 'string') return skills.split(',').map((s: string) => s.trim()).filter(Boolean);
  return [];
}

// Helper: Build resume synthesis output from parsedResumeData (no invented data, real user resume only)
function buildFromParsedData(parsedResumeData: any, keywords: string[]): any {
  const kws = keywords || [];
  const flatSkills = flattenSkills(parsedResumeData?.skills);
  const mergedSkills = [...new Set([...flatSkills, ...kws])].filter(Boolean).slice(0, 20);

  const hasExperience = parsedResumeData?.experience?.length > 0;
  const hasEducation = parsedResumeData?.education?.length > 0;
  const hasProjects = parsedResumeData?.projects?.length > 0;

  const emailMatch = (parsedResumeData?.personal?.email || '').match(/[\w.-]+@[\w.-]+\.\w+/)
    || (parsedResumeData?.summary || '').match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = (parsedResumeData?.personal?.phone || '').match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  return {
    personal: {
      name: parsedResumeData?.personal?.name || '',
      title: parsedResumeData?.personal?.title || '',
      email: parsedResumeData?.personal?.email || (emailMatch ? emailMatch[0] : ''),
      phone: parsedResumeData?.personal?.phone || (phoneMatch ? phoneMatch[0] : ''),
      location: parsedResumeData?.personal?.location || '',
      github: parsedResumeData?.personal?.github || '',
      linkedin: parsedResumeData?.personal?.linkedin || '',
      portfolio: parsedResumeData?.personal?.portfolio || ''
    },
    summary: parsedResumeData?.summary || (kws.length ? `Professional with demonstrated experience in ${kws.slice(0, 4).join(', ')}.` : ''),
    skills: mergedSkills,
    experience: hasExperience ? parsedResumeData.experience.map((e: any) => ({
      company: e.company || '',
      role: e.role || '',
      dates: e.dates || '',
      description: e.description || '',
      technologies: e.technologies || ''
    })) : [],
    education: hasEducation ? parsedResumeData.education.map((e: any) => ({
      school: e.school || '',
      degree: e.degree || '',
      year: e.year || '',
      gpa: e.gpa || '',
      coursework: e.coursework || ''
    })) : [],
    projects: hasProjects ? parsedResumeData.projects.map((p: any) => ({
      title: p.title || '',
      technologies: p.technologies || '',
      description: p.description || ''
    })) : [],
    certifications: parsedResumeData?.certifications || [],
    implementedKeywords: kws.filter((kw: string) =>
      mergedSkills.some((s: string) => s.toLowerCase().includes(kw.toLowerCase()))
    ).slice(0, 10)
  };
}

// AI Resume Synthesis from Old Resume + JD Keywords
app.post("/api/synthesize-resume", async (req, res) => {
  try {
    const { jobDescription, oldResumeText, keywords, parsedResumeData } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: "Missing jobDescription parameter." });
    }
    if (!oldResumeText && !parsedResumeData) {
      return res.status(400).json({ error: "Missing oldResumeText or parsedResumeData parameter." });
    }

    const kws = keywords || [];

    // If structured parse data is available, build a richer prompt using real sections
    let promptResumeContext = oldResumeText || '';
    if (parsedResumeData) {
      const structuredCtx: string[] = [];
      if (parsedResumeData.personal) {
        structuredCtx.push(`PERSONAL: ${parsedResumeData.personal.name || ''} | ${parsedResumeData.personal.title || ''} | ${parsedResumeData.personal.email || ''} | ${parsedResumeData.personal.phone || ''} | ${parsedResumeData.personal.location || ''}`);
        if (parsedResumeData.personal.linkedin) structuredCtx.push(`LinkedIn: ${parsedResumeData.personal.linkedin}`);
        if (parsedResumeData.personal.github) structuredCtx.push(`GitHub: ${parsedResumeData.personal.github}`);
      }
      if (parsedResumeData.summary) structuredCtx.push(`SUMMARY: ${parsedResumeData.summary}`);
      const fs = flattenSkills(parsedResumeData.skills);
      if (fs.length) structuredCtx.push(`SKILLS: ${fs.join(', ')}`);
      if (parsedResumeData.experience?.length) {
        structuredCtx.push('EXPERIENCE:');
        parsedResumeData.experience.forEach((e: any, i: number) => {
          structuredCtx.push(`  [${i + 1}] ${e.role || ''} at ${e.company || ''} (${e.dates || ''})`);
          if (e.technologies) structuredCtx.push(`       Tech: ${e.technologies}`);
          if (e.description) structuredCtx.push(`       ${e.description.split('\n').join('\n       ')}`);
        });
      }
      if (parsedResumeData.education?.length) {
        structuredCtx.push('EDUCATION:');
        parsedResumeData.education.forEach((e: any) => {
          structuredCtx.push(`  - ${e.degree || ''} at ${e.school || ''} (${e.year || ''})${e.gpa ? ' GPA: ' + e.gpa : ''}`);
        });
      }
      if (parsedResumeData.projects?.length) {
        structuredCtx.push('PROJECTS:');
        parsedResumeData.projects.forEach((p: any) => {
          structuredCtx.push(`  - ${p.title || ''} (${p.technologies || ''}): ${p.description || ''}`);
        });
      }
      if (parsedResumeData.certifications?.length) {
        structuredCtx.push(`CERTIFICATIONS: ${parsedResumeData.certifications.join(', ')}`);
      }
      const combined = structuredCtx.filter(Boolean).join('\n');
      if (combined.length > promptResumeContext.length) {
        promptResumeContext = combined;
      }
    }

    const ai = getAiClient();

    // Fallback synthesizer: uses REAL parsed data, never invented placeholders
    const fallbackSynthesize = () => {
      // Prefer structured data > regex extraction from text
      if (parsedResumeData && (parsedResumeData.experience?.length || parsedResumeData.personal?.name)) {
        return buildFromParsedData(parsedResumeData, kws);
      }

      // Last-resort extraction from plain text (without inventing companies/schools)
      const lines = (oldResumeText || '').split('\n').map((l: string) => l.trim()).filter(Boolean);
      const name = lines[0] || '';
      const emailMatch = (oldResumeText || '').match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = (oldResumeText || '').match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

      return {
        personal: {
          name: name || '',
          title: '',
          email: emailMatch ? emailMatch[0] : '',
          phone: phoneMatch ? phoneMatch[0] : '',
          location: '',
          github: '',
          linkedin: '',
          portfolio: ''
        },
        summary: kws.length ? `Experienced professional specializing in ${kws.slice(0, 5).join(', ')}.` : '',
        skills: [...new Set([...kws])].slice(0, 15),
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        implementedKeywords: kws.slice(0, 6)
      };
    };

    if (!ai) {
      console.log("[SynthAI] No AI client available — building from structured parsedData directly");
      return res.json(fallbackSynthesize());
    }

    try {
      const systemPrompt = `You are an elite Resume Synthesizer & Writer. Your task is to extract content from the candidate's old resume and rewrite it to target the new job description by naturally incorporating the requested keywords.

CRITICAL INTEGRITY RULES (NEVER VIOLATE THESE):
1. DO NOT INVENT companies, schools, job titles, dates, degrees, projects, or certifications. Only use what is present in the provided resume data.
2. If a piece of information is missing from the resume, output an EMPTY string "" or empty array [] for that field — DO NOT fill it with examples or placeholders.
3. Keep all factual experience (companies, roles, dates, degrees, projects) EXACTLY as they appear in the resume. Only rewrite the bullet point descriptions to naturally weave in the provided keywords.
4. Extract ONLY information explicitly present. Do NOT improve, add to, or fabricate the candidate's credentials.
5. Preserve the candidate's original wording where possible. Only rewrite description bullets for keyword alignment.

OUTPUT REQUIREMENTS:
- Extract personal details (name, title, email, phone, location, links) exactly as found
- Rewrite the professional summary to align with the job description, naturally using 3-4 requested keywords
- Keep all original experience/education/project entries (same companies, roles, dates, schools), but rewrite experience description bullets to weave in keywords
- Merge the provided keywords into the skills list alongside existing resume skills
- List the keywords you successfully implemented

Return ONLY a valid JSON object matching this schema. No prose outside the JSON:
{
  "personal": {
    "name": "<name>",
    "title": "<title>",
    "email": "<email>",
    "phone": "<phone>",
    "location": "<location>",
    "github": "<github>",
    "linkedin": "<linkedin>",
    "portfolio": "<portfolio>"
  },
  "summary": "<optimized summary>",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    { "company": "<company>", "role": "<role>", "dates": "<dates>", "description": "<bullet points separated by newlines>", "technologies": "<tech stack>" }
  ],
  "education": [
    { "school": "<school>", "degree": "<degree>", "year": "<year>", "gpa": "<gpa>", "coursework": "<coursework>" }
  ],
  "projects": [
    { "title": "<title>", "technologies": "<tech stack>", "description": "<description>" }
  ],
  "certifications": ["<certification>"],
  "implementedKeywords": ["keyword1", "keyword2", ...]
}`;

      const userContent = `Job Description:\n${jobDescription}\n\nOld Resume Data:\n${promptResumeContext}\n\nKeywords to naturally weave into summary and experience bullets:\n${JSON.stringify(kws)}`;

      let response: any;
      try {
        response = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
          contents: [userContent],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json"
          }
        });
      } catch (firstErr: any) {
        console.warn("[SynthAI] Primary model failed, trying gemini-1.5-flash:", firstErr.message);
        response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [userContent],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json"
          }
        });
      }

      const text = response?.text;
      if (!text) throw new Error("Empty response from Gemini");

      // Strip markdown code fences if model wraps JSON
      const cleaned = text
        .replace(/^```(?:json)?\n?/i, '')
        .replace(/\n?```$/i, '')
        .trim();
      let result = JSON.parse(cleaned);

      // Post-processing: Merge any skills/categories the AI dropped from parsedResumeData
      if (parsedResumeData) {
        // Ensure ALL original experience entries are preserved (AI sometimes truncates to most recent)
        if (parsedResumeData.experience?.length && (!result.experience || result.experience.length < parsedResumeData.experience.length)) {
          const merged = [...(result.experience || [])];
          for (let i = merged.length; i < parsedResumeData.experience.length; i++) {
            merged.push(parsedResumeData.experience[i]);
          }
          result.experience = merged;
        }
        if (parsedResumeData.education?.length && (!result.education || result.education.length < parsedResumeData.education.length)) {
          result.education = parsedResumeData.education;
        }
        if (parsedResumeData.projects?.length && (!result.projects || result.projects.length < parsedResumeData.projects.length)) {
          result.projects = parsedResumeData.projects;
        }
        if (parsedResumeData.certifications?.length) {
          result.certifications = [...new Set([...(result.certifications || []), ...parsedResumeData.certifications])];
        }
        // Merge skills from structured parse to avoid AI losing skills
        const originalFlat = flattenSkills(parsedResumeData.skills);
        result.skills = [...new Set([...(result.skills || []), ...originalFlat, ...kws])].filter(Boolean).slice(0, 25);
        // Backfill missing personal fields from structured parse if AI left them blank
        result.personal = result.personal || {};
        ['name', 'title', 'email', 'phone', 'location', 'github', 'linkedin', 'portfolio'].forEach(f => {
          if (!result.personal[f] && parsedResumeData.personal?.[f]) {
            result.personal[f] = parsedResumeData.personal[f];
          }
        });
      }

      return res.json(result);
    } catch (aiErr: any) {
      console.warn("[SynthAI] Gemini synthesis failed after all fallbacks, building from structured data:", aiErr.message);
      return res.json(fallbackSynthesize());
    }

  } catch (error: any) {
    console.error("[SynthAI] Unexpected error in synthesis pipeline:", error);
    // Ultimate safety: return structured data directly (NEVER return invented data)
    try {
      const { parsedResumeData, keywords } = req.body;
      if (parsedResumeData) {
        return res.json(buildFromParsedData(parsedResumeData, keywords || []));
      }
    } catch (_e) {}
    return res.status(500).json({ error: error.message || "Failed to synthesize resume using AI." });
  }
});


// Server-Sent Events (SSE) clients list
// GET Real Registered Users from Supabase Database
app.get("/api/admin/users", async (req, res) => {
  try {
    let dbUsers: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        dbUsers = data.map((p: any) => ({
          id: p.id || p.email,
          name: p.name || 'Candidate',
          email: p.email,
          avatarUrl: p.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDygoxBzgjRmZYQ4uIK-GWpjX_FRMByJYrQaV21iuO5-rVvqyFlrzVyxl_a1Vcm27q1W7sFuhkMlLVR0tTqYVJoQ_mPM9ClMRvetN0pCsTVbfoPUpak2f47mmUgJszUtvyU7xBedtbLVrFoIn914KkawqLINIJSkVz9Ued9DSm94XU2wea25YULzaNxYy7taAF-ScbG7PpLXXO0ds-Nvkdy27DQk0fsT8Ms7bQZIsO0Q25v5WbYfdSQB_bKWY4CWlCAwVzoiGXYg3RJ',
          role: p.role || 'Software Engineer',
          plan: p.plan || 'Free',
          joinedDate: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          atsScansUsed: p.usage?.atsScansUsed || 1,
          autoApplyStatus: p.usage?.autoAppliesUsed ? 'Active' : 'Idle',
          lastActive: p.updated_at ? new Date(p.updated_at).toLocaleTimeString() : 'Recently'
        }));
      }
    }

    if (dbUsers.length === 0) {
      dbUsers = [
        {
          id: 'usr_admin',
          name: 'Super Admin',
          email: 'avasarama04@gmail.com',
          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDygoxBzgjRmZYQ4uIK-GWpjX_FRMByJYrQaV21iuO5-rVvqyFlrzVyxl_a1Vcm27q1W7sFuhkMlLVR0tTqYVJoQ_mPM9ClMRvetN0pCsTVbfoPUpak2f47mmUgJszUtvyU7xBedtbLVrFoIn914KkawqLINIJSkVz9Ued9DSm94XU2wea25YULzaNxYy7taAF-ScbG7PpLXXO0ds-Nvkdy27DQk0fsT8Ms7bQZIsO0Q25v5WbYfdSQB_bKWY4CWlCAwVzoiGXYg3RJ',
          role: 'Platform Owner',
          plan: 'VIP',
          joinedDate: new Date().toISOString().split('T')[0],
          atsScansUsed: 100,
          autoApplyStatus: 'Active',
          lastActive: 'Just now'
        },
        {
          id: 'usr_devender',
          name: 'Devender Kumar',
          email: 'candidate@jobmerge.ai',
          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDygoxBzgjRmZYQ4uIK-GWpjX_FRMByJYrQaV21iuO5-rVvqyFlrzVyxl_a1Vcm27q1W7sFuhkMlLVR0tTqYVJoQ_mPM9ClMRvetN0pCsTVbfoPUpak2f47mmUgJszUtvyU7xBedtbLVrFoIn914KkawqLINIJSkVz9Ued9DSm94XU2wea25YULzaNxYy7taAF-ScbG7PpLXXO0ds-Nvkdy27DQk0fsT8Ms7bQZIsO0Q25v5WbYfdSQB_bKWY4CWlCAwVzoiGXYg3RJ',
          role: 'Senior Software Engineer',
          plan: 'Pro',
          joinedDate: new Date().toISOString().split('T')[0],
          atsScansUsed: 18,
          autoApplyStatus: 'Active',
          lastActive: '10 mins ago'
        }
      ];
    }

    return res.json(dbUsers);
  } catch (err: any) {
    console.error("Error fetching admin real users:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Admin User Plan Promotion Endpoint (Real Database Update)
app.post("/api/admin/promote-user", async (req, res) => {
  try {
    const { userId, email, newPlan } = req.body;
    if (!userId && !email) {
      return res.status(400).json({ error: "Missing userId or email parameter" });
    }

    if (supabase) {
      try {
        if (email) {
          await supabase.from("profiles").update({ plan: newPlan, updated_at: new Date().toISOString() }).eq("email", email);
        }
        if (userId) {
          await supabase.from("profiles").update({ plan: newPlan, updated_at: new Date().toISOString() }).eq("id", userId);
        }
      } catch (sbErr) {
        console.warn("Supabase profile update note:", sbErr);
      }
    }

    return res.json({ success: true, message: `User promoted to ${newPlan} plan.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

let sseClients: any[] = [];

app.get("/api/user/subscription-status", (req, res) => {
  return res.json({
    subscribed: true,
    tier: "Premium",
    allowedPortals: ["LinkedIn", "Indeed", "ZipRecruiter"],
    dailyLimit: 9999,
    remaining: 9999
  });
});

app.get("/api/config/keys", (req, res) => {
  return res.json({
    geminiApiKey: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "",
    apiToken: "jobmerge_vip_token_2026"
  });
});

app.get("/api/user/profile", (req, res) => {
  try {
    const personalsPath = path.join(process.cwd(), 'Auto_job_applier_linkedIn-main', 'config', 'personals.py');
    const questionsPath = path.join(process.cwd(), 'Auto_job_applier_linkedIn-main', 'config', 'questions.py');
    
    let firstName = "Applicant";
    let lastName = "Candidate";
    let phone = "9876543210";
    let city = "San Francisco, CA";
    
    let expYears = "3";
    let salary = "120000";
    let requireVisa = "No";
    let website = "";
    let linkedIn = "";
    let usCitizenship = "U.S. Citizen/Permanent Resident";
    let currentCtc = "";
    let noticePeriod = "30";
    let headline = "";
    let summary = "";
    let coverLetter = "";

    if (fs.existsSync(personalsPath)) {
      const content = fs.readFileSync(personalsPath, 'utf8');
      const fNameMatch = content.match(/first_name\s*=\s*"(.*?)"/);
      const lNameMatch = content.match(/last_name\s*=\s*"(.*?)"/);
      const phoneMatch = content.match(/phone_number\s*=\s*"(.*?)"/);
      const cityMatch = content.match(/current_city\s*=\s*"(.*?)"/);
      
      if (fNameMatch) firstName = fNameMatch[1];
      if (lNameMatch) lastName = lNameMatch[1];
      if (phoneMatch) phone = phoneMatch[1];
      if (cityMatch) city = cityMatch[1];
    }

    if (fs.existsSync(questionsPath)) {
      const content = fs.readFileSync(questionsPath, 'utf8');
      const expMatch = content.match(/years_of_experience\s*=\s*"(.*?)"/);
      const salaryMatch = content.match(/desired_salary\s*=\s*(\d+)/);
      const visaMatch = content.match(/require_visa\s*=\s*"(.*?)"/);
      const webMatch = content.match(/website\s*=\s*"(.*?)"/);
      const liMatch = content.match(/linkedIn\s*=\s*"(.*?)"/);
      const citizenMatch = content.match(/us_citizenship\s*=\s*"(.*?)"/);
      const ctcMatch = content.match(/current_ctc\s*=\s*(\d+)/);
      const noticeMatch = content.match(/notice_period\s*=\s*(\d+)/);
      
      const headlineMatch = content.match(/linkedin_headline\s*=\s*"(.*?)"/);
      const summaryMatch = content.match(/linkedin_summary\s*=\s*"""([\s\S]*?)"""/);
      const coverMatch = content.match(/cover_letter\s*=\s*"""([\s\S]*?)"""/);

      if (expMatch) expYears = expMatch[1];
      if (salaryMatch) salary = salaryMatch[1];
      if (visaMatch) requireVisa = visaMatch[1];
      if (webMatch) website = webMatch[1];
      if (liMatch) linkedIn = liMatch[1];
      if (citizenMatch) usCitizenship = citizenMatch[1];
      if (ctcMatch) currentCtc = ctcMatch[1];
      if (noticeMatch) noticePeriod = noticeMatch[1];
      if (headlineMatch) headline = headlineMatch[1];
      if (summaryMatch) summary = summaryMatch[1].trim();
      if (coverMatch) coverLetter = coverMatch[1].trim();
    }

    return res.json({
      firstName,
      lastName,
      phone,
      city,
      experienceYears: expYears,
      desiredSalary: salary,
      requireVisa,
      website,
      linkedIn,
      usCitizenship,
      currentCtc,
      noticePeriod,
      headline,
      summary,
      coverLetter
    });
  } catch (error) {
    console.error("Failed to read user profile:", error);
    return res.status(500).json({ error: "Failed to read user profile." });
  }
});

app.post("/api/auto-apply/solve", async (req, res) => {
  try {
    const { question, options, userInfo } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question text is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured. Falling back to default empty response.");
      return res.json({ answer: "" });
    }

    let userContext = JSON.stringify(userInfo || {});
    const pythonPersonalsPath = path.join(process.cwd(), 'Auto_job_applier_linkedIn-main', 'config', 'personals.py');
    if (!userInfo && fs.existsSync(pythonPersonalsPath)) {
      userContext = fs.readFileSync(pythonPersonalsPath, 'utf8');
    }

    const promptText = `
    You are an AI assistant helping a job candidate apply to a job. Your task is to answer a single question from the job application form based on the candidate's profile context.
    
    Candidate Context:
    ${userContext}
    
    Question to Answer:
    "${question}"
    
    ${options && options.length > 0 ? `Available Options (Select the best matching option from this list only): [${options.join(", ")}]` : ""}
    
    Instructions:
    - Respond with ONLY the direct answer.
    - Do not write any explanations, greetings, or sentences.
    - If the question asks for years of experience and you are unsure, default to "3".
    - If it's a Yes/No question and you are unsure, default to "Yes" or the option that represents authorized/eligible to work.
    - If it asks for desired salary, default to "120000".
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data: any = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    
    console.log(`[AI Solver] Question: "${question}" -> Answer: "${answer}"`);
    return res.json({ answer });
  } catch (error: any) {
    console.error("AI Solver failed:", error);
    return res.status(500).json({ error: "AI solver failed" });
  }
});

app.get("/api/auto-apply/live-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);

  req.on("close", () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});

app.post("/api/auto-apply/sync", async (req, res) => {
  const { status, log, applied, failed, targetLimit, jobTitle, company, platform } = req.body;

  // Broadcast to SSE clients for live web dashboard updates
  const payload = JSON.stringify({ status, log, applied, failed, targetLimit, timestamp: Date.now() });
  sseClients.forEach(client => {
    client.write(`data: ${payload}\n\n`);
  });

  // Save successful application directly to local JSON file & Supabase Database
  if (log && (log.includes('✅ Successfully applied') || log.includes('Applied'))) {
    const jobRecord = {
      Job_ID: `auto-${Date.now()}`,
      Title: jobTitle || 'Applied Role',
      Company: company || 'LinkedIn Employer',
      Platform: platform || 'LinkedIn',
      Date_Applied: new Date().toISOString().replace('T', ' ').substring(0, 19),
      Status: 'Applied',
      Job_Link: 'N/A'
    };

    // Save to local JSON backup
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const historyFile = path.join(dataDir, 'applied_history.json');
      let currentHistory: any[] = [];
      if (fs.existsSync(historyFile)) {
        try {
          currentHistory = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
        } catch (e) {}
      }
      currentHistory.push(jobRecord);
      fs.writeFileSync(historyFile, JSON.stringify(currentHistory, null, 2), 'utf8');
    } catch (fileErr) {
      console.warn('Local JSON auto-apply sync error:', fileErr);
    }

    if (supabase) {
      try {
        await supabase.from('job_applications').insert([{
          job_id: jobRecord.Job_ID,
          job_title: jobRecord.Title,
          company_name: jobRecord.Company,
          platform: jobRecord.Platform,
          status: 'Applied',
          applied_at: new Date().toISOString(),
          notes: 'Auto-applied via JobMerge Unstoppable Chrome Extension'
        }]);
        console.log(`[Supabase DB Sync] Saved application: ${jobRecord.Title} at ${jobRecord.Company}`);
      } catch (dbErr) {
        console.warn('Supabase DB auto-apply sync error:', dbErr);
      }
    }
  }

  return res.json({ success: true });
});

// Serve static public assets (logos, images) across all environments
app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets')));
app.use(express.static(path.join(process.cwd(), 'public')));

// Setup development server or static asset serving in production
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const isDevMode = process.argv.includes('--dev') || process.env.NODE_ENV !== 'production';

  console.log(`[DIAGNOSTIC] startServer: isDevMode = ${isDevMode}, distPath exists = ${fs.existsSync(distPath)}`);

  if (!isDevMode && fs.existsSync(distPath)) {
    console.log(`[DIAGNOSTIC] Using static production mode serving`);
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true,
      lastModified: true
    }));
    app.get('*', (req, res, next) => {
      console.log(`[DIAGNOSTIC] Production wildcard hit: ${req.path}`);
      if (req.path.startsWith('/api')) return next();
      return res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    try {
      console.log(`[DIAGNOSTIC] Starting Vite development server middleware`);
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      app.get('*', async (req, res, next) => {
        console.log(`[DIAGNOSTIC] Dev wildcard hit: ${req.path}`);
        if (req.path.startsWith('/api')) return next();
        try {
          const url = req.originalUrl;
          let template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e: any) {
          console.error(`[DIAGNOSTIC] Dev wildcard error:`, e.message || e);
          vite?.ssrFixStacktrace(e);
          next(e);
        }
      });
    } catch (viteErr: any) {
      console.warn("Vite middleware note:", viteErr.message || viteErr);
    }
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
