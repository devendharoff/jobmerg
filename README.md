# JobMerge 💼🚀

JobMerge is a modern, high-performance web application designed for job seekers—specifically tailored to students, freshers, and experienced professionals. It aggregates job listings from major websites, filters out irrelevant positions, and uses Gemini AI to review candidates' resumes, calculating dynamic matching scores against target job descriptions.

---

## 🌟 Key Features

### 1. **AI-Powered Resume Review**
- Integrates with the **Gemini API** (`gemini-3.5-flash`) via the `@google/genai` SDK.
- Provides a candidate resume parse that analyzes skills, experience, and target roles.
- Returns overall resume scores, strengths, improvement areas, and actionable tips (such as aligning with the Google X-Y-Z formula).
- Computes matching percentages and detailed fit explanations against all reference jobs.

### 2. **Interactive Resume Builder**
- Features a clean, interactive resume creation and refinement editor.
- Syncs resume content, personal details, professional experience, and key skills directly to the user profile database.

### 3. **Application Tracker**
- A robust system to track job applications through different hiring stages: `Applied`, `Interviewing`, `Offered`, and `Rejected`.
- Supports personal notes and status updates for each tracked role.

### 4. **Smart Job Search & Filters**
- Multi-dimensional filtering by job category (`Students`, `Freshers`, `Graduates`, `Experienced`), work type (`Remote`, `On-site`, `Hybrid`), and job type (`Full-time`, `Internship`).
- Real-time full-text search across titles, companies, locations, and skills.

### 5. **Salary Insights**
- Visualizes compensation bands, industry benchmarks, and trends across software engineering, product design, and analyst roles.

### 6. **Automated Job Ingestion Pipeline**
- Runs a daily Python automation script (`services/pipeline/pipeline_runner.py`) using GitHub Actions.
- Pulls from external job source APIs (SerpAPI / Scrapingdog).
- Applies strict filtering rules to exclude senior positions for junior-focused searches.
- Uses a deterministic hash signature (SHA-256) based on title, company, and location to deduplicate listings.
- Performs an automated database retention sweep, pruning listings older than 30 days to optimize storage limits.

### 7. **Optimized Local Logo System**
- Organizes and serves high-quality brand assets for major software companies (Google, Microsoft, Meta, Oracle, IBM, etc.) and job sources locally to ensure instant rendering speeds and reliable offline support.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS v4, Framer Motion, Lucide Icons, Supabase JS Client.
- **Backend / API proxy**: Express, Vite (middleware mode in development), `tsx` (Node.js TypeScript execution).
- **Database & Auth**: Supabase (PostgreSQL tables: `profiles`, `job_posts`, `saved_jobs`, `applications`).
- **AI Engine**: Google Gemini API (`gemini-3.5-flash`).
- **Data Scraping & Ingestion**: Python 3.10+, `requests`, `supabase-py`, SerpAPI, Scrapingdog.
- **CI / CD**: GitHub Actions.

---

## 📁 Repository Structure

```
jobmerge/
├── .github/
│   └── workflows/
│       └── ingest_cron.yml       # Daily cron workflow for job ingestion
├── assets/
│   └── logos/
│       ├── job_websites/         # Platform logos (LinkedIn, Glassdoor, etc.)
│       └── software_companies/   # Corporate logos (Google, Microsoft, etc.)
├── services/
│   └── pipeline/
│       ├── pipeline_runner.py    # Python job scraper and ingestion engine
│       └── requirements.txt      # Python dependencies for the pipeline
├── src/
│   ├── components/
│   │   ├── AIResumeReview.tsx    # Resume scoring & matching component
│   │   ├── ApplicationTracker.tsx# Job applications tracker
│   │   ├── LandingPage.tsx       # Interactive landing page
│   │   ├── ResumeBuilder.tsx     # Resume creation tool
│   │   ├── SalaryInsights.tsx    # Salary trends viewer
│   │   ├── SignIn.tsx            # Login portal
│   │   └── SignUp.tsx            # Account registration portal
│   ├── App.tsx                   # Main layout and screen router
│   ├── data.ts                   # Static data and lookup helpers
│   ├── supabaseClient.ts         # Supabase client initializer
│   └── types.ts                  # Shared TypeScript interfaces
├── .env.example                  # Environment template
├── index.html                    # Single Page App wrapper
├── package.json                  # Node scripts and dependencies
├── seed-jobs.ts                  # Supabase database seeder
├── server.ts                     # Express production server & API proxy
└── vite.config.ts                # Vite configurations
```

---

## ⚙️ Setting Up the Environment

Copy the `.env.example` file and create a `.env` in the root directory:

```env
# Gemini API Key (Required for resume scoring)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Frontend Supabase configuration (Vite prefix required)
VITE_SUPABASE_URL="https://YOUR_SUPABASE_PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# Backend & Ingestion Pipeline configurations
SUPABASE_URL="https://YOUR_SUPABASE_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# Job Ingestion API Keys (Optional: for running pipeline_runner.py)
SERPAPI_KEY="YOUR_SERPAPI_KEY"
SCRAPINGDOG_KEY="YOUR_SCRAPINGDOG_KEY"
```

---

## 🚀 Running the App Locally

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Seed Initial Jobs (Optional)
Populate your Supabase instance with mock seed job listings:
```bash
npx tsx seed-jobs.ts
```

### 3. Start Development Server
Starts the Express proxy backend and Vite frontend dev server concurrently:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3001` (or whichever port is shown in the terminal).

### 4. Build for Production
Bundle the client assets and compile the server script:
```bash
npm run build
npm start
```

---

## 🐍 Running the Ingestion Pipeline

To manually run the job scraping pipeline:

1. Install Python dependencies:
   ```bash
   pip install -r services/pipeline/requirements.txt
   ```

2. Run the pipeline:
   ```bash
   python services/pipeline/pipeline_runner.py
   ```

*Note: In production, the daily ingestion cycle runs automatically every 24 hours via GitHub Actions (`.github/workflows/ingest_cron.yml`).*
