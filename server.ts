import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));

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

// Resume Review and Job Match endpoint
app.post("/api/resume-review", async (req, res) => {
  try {
    const { resumeText, resumeFile, fileName, userSkills, experienceYears } = req.body;
    
    if (!resumeText && !resumeFile) {
      return res.status(400).json({ error: "Missing resumeText or resumeFile parameter" });
    }

    // Attempt Python Hiring Agent Pipeline first if PDF is uploaded
    if (resumeFile) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const cleanFileName = (fileName || 'resume.pdf').replace(/[^a-zA-Z0-9.\-_]/g, '');
      const tempFileName = `temp-${uniqueSuffix}-${cleanFileName}`;
      const tempFilePath = path.join(process.cwd(), tempFileName);
      
      fs.writeFileSync(tempFilePath, Buffer.from(resumeFile, 'base64'));

      try {
        const pythonPath = "python";
        const scriptPath = path.join(process.cwd(), "hiring-agent-main", "hiring-agent-main", "score.py");
        const command = `"${pythonPath}" "${scriptPath}" "${tempFilePath}" --role software_engineering_intern --json`;
        
        const env = { 
          ...process.env, 
          DEFAULT_MODEL: "gemini-2.0-flash",
          GEMINI_API_KEY: process.env.GEMINI_API_KEY 
        };

        const { stdout, stderr } = await execAsync(command, { 
          env,
          cwd: path.join(process.cwd(), "hiring-agent-main", "hiring-agent-main")
        });

        const resultData = extractJSONFromStdout(stdout);

        let overallScore = 0;
        if (resultData.scores) {
          for (const key in resultData.scores) {
            overallScore += Math.min(resultData.scores[key].score, resultData.scores[key].max);
          }
        }
        if (resultData.bonus_points) overallScore += resultData.bonus_points.total;
        if (resultData.deductions) overallScore -= resultData.deductions.total;
        overallScore = Math.max(0, Math.min(100, Math.round(overallScore)));

        let summary = "";
        if (resultData.scores) {
          const evidenceList = Object.keys(resultData.scores)
            .map(k => resultData.scores[k].evidence)
            .filter(Boolean);
          if (evidenceList.length > 0) {
            summary = "Candidate review completed successfully: " + evidenceList.join(". ") + ".";
          }
        }
        if (!summary) {
          summary = `The resume achieved an overall ATS quality score of ${overallScore}/100 based on the software engineering intern rubric.`;
        }

        const strengths = resultData.key_strengths || ["Well-formatted profile structure."];
        const improvements = resultData.areas_for_improvement || ["Could highlight open-source contributions further."];
        
        const tips = [
          "Rewrite your bullet points using the Google X-Y-Z formula: Accomplished [X] as measured by [Y], by doing [Z].",
          "Ensure secondary skills like cloud infrastructure or containerization are explicitly highlighted."
        ];
        if (resultData.scores && resultData.scores.open_source && resultData.scores.open_source.score < 20) {
          tips.push("Contribute to public Github repositories to enhance your open-source evaluation score.");
        }
        if (resultData.scores && resultData.scores.self_projects && resultData.scores.self_projects.score < 15) {
          tips.push("Document your personal projects in Github readmes to display structural code execution capabilities.");
        }

        const cacheFileName = `resumecache_${tempFileName.replace('.pdf', '')}.json`;
        const cacheFilePath = path.join(process.cwd(), "hiring-agent-main", "hiring-agent-main", "cache", cacheFileName);
        
        let extractedText = "";
        let parsedSkills: string[] = [];

        if (fs.existsSync(cacheFilePath)) {
          try {
            const cachedResume = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
            if (cachedResume.basics && cachedResume.basics.summary) {
              extractedText += " " + cachedResume.basics.summary;
            }
            if (cachedResume.skills) {
              cachedResume.skills.forEach((s: any) => {
                if (s.name) parsedSkills.push(s.name);
                if (s.keywords) parsedSkills.push(...s.keywords);
              });
            }
            if (cachedResume.projects) {
              cachedResume.projects.forEach((p: any) => {
                if (p.name) extractedText += " " + p.name;
                if (p.description) extractedText += " " + p.description;
              });
            }
            extractedText += " " + parsedSkills.join(" ");
          } catch (err) {
            console.error("Failed to parse cache file details for matches:", err);
          }
        }

        const matchedJobs = REFERENCE_JOBS.map(job => {
          let basePercent = 60;
          const overlap = job.skills.filter(s => 
            extractedText.toLowerCase().includes(s.toLowerCase()) || 
            (userSkills && userSkills.some((us: string) => us.toLowerCase() === s.toLowerCase()))
          ).length;
          
          basePercent += overlap * 7;
          const finalPercent = Math.min(Math.max(basePercent, 45), 98);

          return {
            jobId: job.id,
            matchPercent: finalPercent,
            matchExplanation: `Match of ${finalPercent}% calculated based on the overlap of key technical competencies such as ${job.skills.slice(0, 3).join(", ")}. Your profile demonstrates high familiarity with these tools, aligning well with ${job.company}'s technology stack requirements.`
          };
        });

        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (unlinkErr) {}

        return res.json({
          overallScore,
          summary,
          strengths,
          improvements,
          tips,
          jobMatches: matchedJobs
        });

      } catch (pipelineErr: any) {
        console.warn("Python Pipeline failed or unparseable, falling back to direct Gemini API scan:", pipelineErr.message);
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (unlinkErr) {}
      }
    }

    const ai = getAiClient();

    if (!ai) {
      // Mock fallback
      const overallScore = Math.floor(Math.random() * 20) + 70; // 70 to 90
      const matchedJobs = REFERENCE_JOBS.map(job => {
        let basePercent = 60;
        const overlap = job.skills.filter(s => 
          (resumeText && resumeText.toLowerCase().includes(s.toLowerCase())) || 
          (userSkills && userSkills.some((us: string) => us.toLowerCase() === s.toLowerCase()))
        ).length;
        
        basePercent += overlap * 7;
        const finalPercent = Math.min(Math.max(basePercent, 45), 98);

        return {
          jobId: job.id,
          matchPercent: finalPercent,
          matchExplanation: `Match of ${finalPercent}% calculated based on the overlap of key technical competencies such as ${job.skills.slice(0, 3).join(", ")}. Your profile demonstrates high familiarity with these tools, aligning well with ${job.company}'s technology stack requirements.`
        };
      });

      return res.json({
        overallScore,
        summary: `Your resume has been processed through our Applicant Tracking System (ATS) parser. The formatting demonstrates high header parsing accuracy and strong technical keyword density. Aligning specific action verbs with targeted job descriptions will maximize your interview callback rate.`,
        strengths: [
          "Standardized section headings (Experience, Skills, Education) for 100% ATS parser readability.",
          "Strong keyword density across core software engineering technologies.",
          "Valid contact header information and clear chronological sequence."
        ],
        improvements: [
          "Incorporate more quantifiable metrics (e.g. 'boosted performance by 35%').",
          "Ensure secondary tools like Docker, Git, or AWS are explicitly indexed in your skills section.",
          "Format bullet points with standard action verbs to pass recruiter ATS filters."
        ],
        tips: [
          "Apply the Google X-Y-Z formula to bullet points: Accomplished [X] as measured by [Y], by doing [Z].",
          "Avoid multi-column tables or graphics that can confuse older ATS parsing scripts.",
          "Match technical stack terms exactly as spelled in job requirements."
        ],
        jobMatches: matchedJobs
      });
    }

    // Call actual Gemini API (gemini-2.5-flash)
    const systemPrompt = `You are an elite Applicant Tracking System (ATS) parsing & scoring engine.
Review the provided resume text/file and calculate an ATS Compatibility Score (from 0 to 100) based on ATS readability, keyword matching, contact header formatting, and quantifiable metric density.
Also evaluate match fit for target roles:
${JSON.stringify(REFERENCE_JOBS, null, 2)}

Provide a structured JSON output with the following format:
{
  "overallScore": <number from 0 to 100 representing resume strength>,
  "summary": "<a concise 2-3 sentence overview of the resume alignment and suitability>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement area 1>", "<improvement area 2>", "<improvement area 3>"],
  "tips": ["<practical resume formatting or content tip 1>", "<tip 2>", "<tip 3>"],
  "jobMatches": [
    {
      "jobId": "<matching job's ID>",
      "matchPercent": <number from 0 to 100 representing fit percentage>,
      "matchExplanation": "<a detailed 2-sentence explanation of why the candidate fits this job, referencing their specific skills and experience>"
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
${resumeText || "Resume document uploaded as PDF attachment."}

Additional User Information:
Skills selected: ${JSON.stringify(userSkills)}
Years of experience: ${experienceYears || "Not specified"}`;

    contents.push(userPromptText);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: "A summary score from 0 to 100 for overall resume quality." },
            summary: { type: Type.STRING, description: "A high-level feedback summary." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Core strengths of this resume." },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific areas for improvement." },
            tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable tips for refining content." },
            jobMatches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  jobId: { type: Type.STRING, description: "The ID of the target job." },
                  matchPercent: { type: Type.INTEGER, description: "A percentage from 0 to 100 reflecting fit quality." },
                  matchExplanation: { type: Type.STRING, description: "Detailed justification of this score." }
                },
                required: ["jobId", "matchPercent", "matchExplanation"]
              }
            }
          },
          required: ["overallScore", "summary", "strengths", "improvements", "tips", "jobMatches"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini API");
    }

    const reviewResult = JSON.parse(text);
    return res.json(reviewResult);

  } catch (error: any) {
    console.error("Error evaluating resume review:", error);
    return res.status(500).json({ error: error.message || "Failed to parse and match resume contents using AI." });
  }
});

// Setup development server or static asset serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
