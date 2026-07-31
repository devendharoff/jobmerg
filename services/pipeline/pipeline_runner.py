import os
import sys
import re
import html
import hashlib
import requests
from typing import List, Dict, Any

# Ensure UTF-8 stdout encoding on Windows
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

# Load environment variables from .env file for local testing
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Supabase Initialization
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"[INFO] Connected to Supabase instance at {SUPABASE_URL}")
    except Exception as e:
        print(f"[WARN] Failed to initialize Supabase client: {e}")
else:
    print("[WARN] SUPABASE_URL or SUPABASE_KEY environment variables missing.")

# Tech dictionary for tag extraction
TECH_DICTIONARY = [
    "React", "Next.js", "Python", "TypeScript", "JavaScript", "Node.js", 
    "Tailwind CSS", "Go", "PostgreSQL", "AWS", "Docker", "Kubernetes", 
    "SQL", "Figma", "UI/UX", "Java", "C++", "Redux", "GraphQL"
]

# Seniority filter words to exclude high-level management for entry/student target
SENIOR_FILTER_WORDS = ["senior", "sr.", "lead", "manager", "architect", "principal", "director", "head of", "8+", "10+"]

def clean_html(raw_html: str) -> str:
    """Utility to strip HTML tags and decode entities for clean descriptions."""
    if not raw_html:
        return ""
    clean = re.sub(r'<[^>]+>', ' ', raw_html)
    clean = html.unescape(clean)
    return ' '.join(clean.split())

def generate_job_id(title: str, company: str, location: str) -> str:
    """Generates a deterministic hash ID for deduplication in Supabase."""
    unique_str = f"{title}_{company}_{location}".lower().strip()
    return hashlib.sha256(unique_str.encode('utf-8')).hexdigest()[:16]

def determine_category(title: str, exp_req: str) -> str:
    """Classifies job category for filtering tabs."""
    t = title.lower()
    if "intern" in t or "trainee" in t:
        return "Students"
    elif "fresher" in t or "associate" in t or "junior" in t or "0 -" in exp_req:
        return "Freshers"
    elif "graduate" in t or "entry" in t:
        return "Graduates"
    return "Experienced"

# ==========================================
# FREE PUBLIC API INGESTION PROVIDERS
# ==========================================

def fetch_remotive_jobs() -> List[Dict[str, Any]]:
    """Fetches free remote tech jobs from Remotive API (No API key required)."""
    print("[INFO] Fetching live jobs from Remotive API...")
    url = "https://remotive.com/api/remote-jobs?category=software-dev&limit=40"
    jobs = []
    try:
        res = requests.get(url, timeout=12)
        if res.status_code == 200:
            data = res.json().get("jobs", [])
            for item in data:
                title = item.get("title", "")
                company = item.get("company_name", "Tech Corp")
                description = clean_html(item.get("description", ""))
                
                # Check senior filter
                if any(w in f"{title} {description}".lower() for w in SENIOR_FILTER_WORDS):
                    continue

                location = item.get("candidate_required_location", "Remote")
                job_id = f"remotive-{item.get('id')}"
                logo_url = item.get("company_logo") or f"https://www.google.com/s2/favicons?sz=128&domain={company.lower().replace(' ', '')}.com"
                
                tags = [t for t in TECH_DICTIONARY if t.lower() in description.lower() or t.lower() in title.lower()]
                if not tags:
                    tags = ["React", "TypeScript", "Node.js"]

                category = determine_category(title, "0-2 Yrs")
                position_type = "Internship" if "intern" in title.lower() else "Full-time"

                jobs.append({
                    "id": job_id,
                    "title": title,
                    "company": company,
                    "logo_url": logo_url,
                    "location": location,
                    "work_type": "Remote",
                    "job_type": position_type,
                    "salary_range": "₹12L – ₹22L PA",
                    "experience_required": "0 – 2 Yrs",
                    "posted_time": "Recently",
                    "original_url": item.get("url", "https://remotive.com"),
                    "tags": tags,
                    "description": description[:1200],
                    "company_about": f"{company} is a leading tech organization hiring remote talent worldwide.",
                    "requirements": [
                        "Experience with modern web development frameworks and clean code practices.",
                        "Strong problem-solving abilities and effective team collaboration skills.",
                        "Proficiency in version control (Git) and RESTful API integrations."
                    ],
                    "benefits": ["Remote work allowance", "Health insurance", "Flexible working hours", "Learning stipend"],
                    "category": category,
                    "status": "active"
                })
            print(f"[SUCCESS] Fetched {len(jobs)} jobs from Remotive.")
    except Exception as e:
        print(f"[WARN] Error fetching Remotive jobs: {e}")
    return jobs

def fetch_arbeitnow_jobs() -> List[Dict[str, Any]]:
    """Fetches free tech jobs from Arbeitnow API (No API key required)."""
    print("[INFO] Fetching live jobs from Arbeitnow API...")
    url = "https://www.arbeitnow.com/api/job-board-api"
    jobs = []
    try:
        res = requests.get(url, timeout=12)
        if res.status_code == 200:
            data = res.json().get("data", [])
            for item in data:
                title = item.get("title", "")
                company = item.get("company_name", "Global Tech")
                description = clean_html(item.get("description", ""))
                
                if any(w in f"{title} {description}".lower() for w in SENIOR_FILTER_WORDS):
                    continue

                location = item.get("location", "Remote")
                job_id = generate_job_id(title, company, location)
                logo_url = f"https://www.google.com/s2/favicons?sz=128&domain={company.lower().replace(' ', '')}.com"
                
                tags = item.get("tags", [])
                if not tags:
                    tags = [t for t in TECH_DICTIONARY if t.lower() in description.lower()]
                if not tags:
                    tags = ["Python", "JavaScript", "SQL"]

                work_type = "Remote" if item.get("remote") else "Hybrid"
                category = determine_category(title, "1-3 Yrs")

                jobs.append({
                    "id": f"arbeitnow-{job_id}",
                    "title": title,
                    "company": company,
                    "logo_url": logo_url,
                    "location": location,
                    "work_type": work_type,
                    "job_type": "Full-time",
                    "salary_range": "₹10L – ₹18L PA",
                    "experience_required": "1 – 3 Yrs",
                    "posted_time": "1d ago",
                    "original_url": item.get("url", "https://arbeitnow.com"),
                    "tags": tags[:5],
                    "description": description[:1200],
                    "company_about": f"{company} is dedicated to building state-of-the-art digital products and services.",
                    "requirements": [
                        "Demonstrated technical expertise in core software development tools.",
                        "Ability to design, build, and maintain scalable applications.",
                        "Clear written and verbal communication skills."
                    ],
                    "benefits": ["Competitive salary", "Stock options", "Health insurance", "Annual retreat"],
                    "category": category,
                    "status": "active"
                })
            print(f"[SUCCESS] Fetched {len(jobs)} jobs from Arbeitnow.")
    except Exception as e:
        print(f"[WARN] Error fetching Arbeitnow jobs: {e}")
    return jobs

def fetch_jobicy_jobs() -> List[Dict[str, Any]]:
    """Fetches free remote jobs from Jobicy API (No API key required)."""
    print("[INFO] Fetching live jobs from Jobicy API...")
    url = "https://jobicy.com/api/v2/remote-jobs?count=30&industry=engineering"
    jobs = []
    try:
        res = requests.get(url, timeout=12)
        if res.status_code == 200:
            data = res.json().get("jobs", [])
            for item in data:
                title = item.get("jobTitle", "")
                company = item.get("companyName", "Innovative Software")
                description = clean_html(item.get("jobDescription", ""))
                
                if any(w in f"{title} {description}".lower() for w in SENIOR_FILTER_WORDS):
                    continue

                location = item.get("jobGeo", "Global Remote")
                job_id = f"jobicy-{item.get('id', generate_job_id(title, company, location))}"
                logo_url = item.get("companyLogo") or f"https://www.google.com/s2/favicons?sz=128&domain={company.lower().replace(' ', '')}.com"
                
                tags = [t for t in TECH_DICTIONARY if t.lower() in description.lower() or t.lower() in title.lower()]
                if not tags:
                    tags = ["React", "Python", "Docker"]

                category = determine_category(title, "0-2 Yrs")
                job_type = "Full-time"
                if "part" in str(item.get("jobType", "")).lower():
                    job_type = "Part-time"
                elif "intern" in title.lower():
                    job_type = "Internship"

                jobs.append({
                    "id": job_id,
                    "title": title,
                    "company": company,
                    "logo_url": logo_url,
                    "location": location,
                    "work_type": "Remote",
                    "job_type": job_type,
                    "salary_range": "₹14L – ₹24L PA",
                    "experience_required": "0 – 2 Yrs",
                    "posted_time": "Recently",
                    "original_url": item.get("url", "https://jobicy.com"),
                    "tags": tags,
                    "description": description[:1200],
                    "company_about": f"{company} empowers engineers to solve high-impact technological challenges.",
                    "requirements": [
                        "Solid foundation in data structures, algorithms, and web technology.",
                        "Passion for writing clean, testable, and maintainable software.",
                        "Proactive mindset with eagerness to learn new tech stacks."
                    ],
                    "benefits": ["100% Remote flexibility", "Paid time off", "Hardware budget", "Wellness stipend"],
                    "category": category,
                    "status": "active"
                })
            print(f"[SUCCESS] Fetched {len(jobs)} jobs from Jobicy.")
    except Exception as e:
        print(f"[WARN] Error fetching Jobicy jobs: {e}")
    return jobs

def fetch_serpapi_jobs() -> List[Dict[str, Any]]:
    """Fetches jobs via SerpAPI if SERPAPI_KEY is configured."""
    serp_key = os.getenv("SERPAPI_KEY")
    if not serp_key:
        return []
    
    print("[INFO] Fetching Google Jobs via SerpAPI...")
    jobs = []
    try:
        url = "https://serpapi.com/search.json"
        params = {
            "engine": "google_jobs",
            "q": "Software Developer Intern India",
            "hl": "en",
            "gl": "in",
            "api_key": serp_key
        }
        res = requests.get(url, params=params, timeout=15)
        if res.status_code == 200:
            results = res.json().get("jobs_results", [])
            for item in results:
                title = item.get("title", "")
                company = item.get("company_name", "")
                location = item.get("location", "India")
                description = clean_html(item.get("description", ""))
                
                job_id = f"serp-{generate_job_id(title, company, location)}"
                logo_url = item.get("thumbnail") or f"https://www.google.com/s2/favicons?sz=128&domain={company.lower().replace(' ', '')}.com"
                
                apply_options = item.get("apply_options", [])
                apply_url = apply_options[0].get("link") if apply_options else "https://google.com/search"

                tags = [t for t in TECH_DICTIONARY if t.lower() in description.lower()]
                if not tags:
                    tags = ["Software Engineering", "Java", "Python"]

                jobs.append({
                    "id": job_id,
                    "title": title,
                    "company": company,
                    "logo_url": logo_url,
                    "location": location,
                    "work_type": "On-site" if "onsite" in location.lower() else "Hybrid",
                    "job_type": "Full-time",
                    "salary_range": "₹10L – ₹18L PA",
                    "experience_required": "0 – 2 Yrs",
                    "posted_time": "Recently",
                    "original_url": apply_url,
                    "tags": tags,
                    "description": description[:1200],
                    "company_about": f"{company} is hiring talent across India.",
                    "requirements": ["Relevant educational background or software engineering skills."],
                    "benefits": ["Competitive compensation", "Mentorship", "Health coverage"],
                    "category": determine_category(title, "0-2 Yrs"),
                    "status": "active"
                })
            print(f"[SUCCESS] Fetched {len(jobs)} jobs from SerpAPI.")
    except Exception as e:
        print(f"[WARN] SerpAPI fetch failed: {e}")
    return jobs

# ==========================================
# MAIN AUTOMATION CYCLE PIPELINE
# ==========================================

def run_automation_cycle():
    print("============================================")
    print("[INFO] STARTING AUTOMATED JOB INGESTION PIPELINE")
    print("============================================")
    
    all_jobs: List[Dict[str, Any]] = []

    # Aggregate from all providers
    all_jobs.extend(fetch_remotive_jobs())
    all_jobs.extend(fetch_arbeitnow_jobs())
    all_jobs.extend(fetch_jobicy_jobs())
    all_jobs.extend(fetch_serpapi_jobs())

    # Deduplicate by job ID
    seen_ids = set()
    unique_jobs = []
    for j in all_jobs:
        if j["id"] not in seen_ids:
            seen_ids.add(j["id"])
            unique_jobs.append(j)

    print(f"[SUMMARY] Total deduplicated job postings prepared: {len(unique_jobs)}")

    if not supabase:
        print("[WARN] Supabase client not active. Ingested records printed to log.")
        for j in unique_jobs[:3]:
            print(f" -> {j['title']} at {j['company']} ({j['location']})")
        return

    if unique_jobs:
        try:
            print(f"[DATABASE] Upserting {len(unique_jobs)} job records into Supabase 'job_posts' table...")
            res = supabase.table("job_posts").upsert(unique_jobs, on_conflict="id").execute()
            print(f"[SUCCESS] Successfully ingested {len(unique_jobs)} clean job postings into Supabase!")
        except Exception as e:
            print(f"[ERROR] Failed to upsert records into Supabase: {e}")

    # Retention Cleanup (Removes records older than 30 days)
    try:
        import datetime
        thirty_days_ago = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)).isoformat()
        supabase.table("job_posts").delete().lt("created_at", thirty_days_ago).execute()
        print("[INFO] Retention sweep completed successfully.")
    except Exception as e:
        print(f"[WARN] Retention sweep note: {e}")

if __name__ == "__main__":
    run_automation_cycle()
