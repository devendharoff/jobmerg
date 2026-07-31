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

# Google Jobs API Credentials
SCRAPINGDOG_KEY = os.getenv("SCRAPINGDOG_KEY") or "6a4b73dfda12fa772b9df4da"
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

# Targeted search queries for Google Jobs engine
GOOGLE_JOBS_QUERIES = [
    "React Developer Intern India",
    "Python Developer Fresher India",
    "Software Engineer Entry Level India",
    "Frontend Developer India",
    "Full Stack Engineer India",
    "Product Designer UI UX India",
    "Data Analyst Intern India",
    "DevOps Engineer India"
]

# Tech dictionary for tag extraction
TECH_DICTIONARY = [
    "React", "Next.js", "Python", "TypeScript", "JavaScript", "Node.js", 
    "Tailwind CSS", "Go", "PostgreSQL", "AWS", "Docker", "Kubernetes", 
    "SQL", "Figma", "UI/UX", "Java", "C++", "Redux", "GraphQL"
]

# Seniority filter words to exclude high-level management for entry/student target
SENIOR_FILTER_WORDS = ["senior", "sr.", "lead", "manager", "architect", "principal", "director", "head of", "8+", "10+"]

def clean_text(raw: str) -> str:
    """Utility to clean up raw HTML tags and whitespace in Google Jobs descriptions."""
    if not raw:
        return ""
    clean = re.sub(r'<[^>]+>', ' ', raw)
    clean = html.unescape(clean)
    return ' '.join(clean.split())

def generate_job_id(title: str, company: str, location: str) -> str:
    """Generates a deterministic hash ID for deduplication in Supabase."""
    unique_str = f"google_{title}_{company}_{location}".lower().strip()
    return hashlib.sha256(unique_str.encode('utf-8')).hexdigest()[:16]

def determine_category(title: str) -> str:
    """Classifies job category for dashboard tabs."""
    t = title.lower()
    if "intern" in t or "trainee" in t:
        return "Students"
    elif "fresher" in t or "associate" in t or "junior" in t or "entry" in t:
        return "Freshers"
    elif "graduate" in t:
        return "Graduates"
    return "Experienced"

# ==========================================
# GOOGLE JOBS INGESTION ENGINE
# ==========================================

def fetch_google_jobs_scrapingdog(query: str) -> List[Dict[str, Any]]:
    """Fetches real live Google Jobs results using Scrapingdog Google Jobs API."""
    if not SCRAPINGDOG_KEY:
        return []

    print(f"[GOOGLE JOBS] Searching Scrapingdog Google Jobs for query: '{query}'...")
    url = "https://api.scrapingdog.com/google_jobs"
    params = {
        "api_key": SCRAPINGDOG_KEY,
        "query": query
    }
    jobs = []
    try:
        res = requests.get(url, params=params, timeout=18)
        if res.status_code == 200:
            results = res.json().get("jobs_results", [])
            if isinstance(results, list):
                for item in results:
                    if not isinstance(item, dict):
                        continue
                    title = item.get("title", "").strip()
                    company = item.get("company_name", "Tech Company").strip()
                    location = item.get("location", "India").strip()
                    description = clean_text(item.get("description", ""))
                
                    # Senior role exclusion
                    if any(word in f"{title} {description}".lower() for word in SENIOR_FILTER_WORDS):
                        continue

                    # Logo thumbnail resolution
                    logo_url = item.get("thumbnail")
                    if not logo_url or not logo_url.startswith("http"):
                        clean_domain = company.lower().replace(' ', '').replace(',', '').replace('.', '')
                        logo_url = f"https://www.google.com/s2/favicons?sz=128&domain={clean_domain}.com"

                    # Apply URL extraction (Google Jobs direct apply option or share link)
                    apply_options = item.get("apply_options", [])
                    apply_url = None
                    if apply_options and isinstance(apply_options, list):
                        apply_url = apply_options[0].get("link")
                    if not apply_url:
                        apply_url = item.get("source_link") or item.get("share_link") or "https://www.google.com/search?q=jobs"

                    # Posted time and work type extensions
                    extensions = item.get("extensions", [])
                    posted_time = "Recently"
                    work_type = "Remote" if "remote" in f"{location} {description}".lower() else "Hybrid"
                    job_type = "Internship" if "intern" in title.lower() else "Full-time"

                    if isinstance(extensions, list):
                        for ext in extensions:
                            if any(term in str(ext).lower() for term in ["ago", "yesterday", "today"]):
                                posted_time = str(ext)
                            if "full-time" in str(ext).lower():
                                job_type = "Full-time"
                            elif "internship" in str(ext).lower():
                                job_type = "Internship"

                    tags = [t for t in TECH_DICTIONARY if t.lower() in description.lower() or t.lower() in title.lower()]
                    if not tags:
                        tags = ["React", "JavaScript", "Software Engineering"]

                    job_id = generate_job_id(title, company, location)
                    category = determine_category(title)
                    via_source = item.get("via", "via Google Jobs")

                    jobs.append({
                        "id": f"gjob-{job_id}",
                        "title": title,
                        "company": company,
                        "logo_url": logo_url,
                        "location": location,
                        "work_type": work_type,
                        "job_type": job_type,
                        "salary_range": "₹8L – ₹18L PA",
                        "experience_required": "0 – 2 Yrs",
                        "posted_time": posted_time,
                        "original_url": apply_url,
                        "tags": tags[:6],
                        "description": description[:1500],
                        "company_about": f"{company} is hiring software talent ({via_source}).",
                        "requirements": [
                            "Proficiency in core programming fundamentals and modern web stack.",
                            "Ability to collaborate effectively in an agile development team.",
                            "Strong analytical and creative problem-solving mindset."
                        ],
                        "benefits": ["Competitive salary package", "Mentorship program", "Health insurance", "Flexible working environment"],
                        "category": category,
                        "status": "active"
                    })
            print(f"[SUCCESS] Retrieved {len(jobs)} live Google Jobs for '{query}'.")
    except Exception as e:
        print(f"[WARN] Error fetching Scrapingdog Google Jobs for '{query}': {e}")
    return jobs

def fetch_google_jobs_serpapi(query: str) -> List[Dict[str, Any]]:
    """Fetches Google Jobs using SerpAPI if SERPAPI_KEY is configured."""
    if not SERPAPI_KEY:
        return []

    print(f"[GOOGLE JOBS] Searching SerpAPI Google Jobs for query: '{query}'...")
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_jobs",
        "q": query,
        "hl": "en",
        "gl": "in",
        "api_key": SERPAPI_KEY
    }
    jobs = []
    try:
        res = requests.get(url, params=params, timeout=18)
        if res.status_code == 200:
            results = res.json().get("jobs_results", [])
            for item in results:
                title = item.get("title", "").strip()
                company = item.get("company_name", "Company").strip()
                location = item.get("location", "India").strip()
                description = clean_text(item.get("description", ""))
                
                if any(w in f"{title} {description}".lower() for w in SENIOR_FILTER_WORDS):
                    continue

                logo_url = item.get("thumbnail") or f"https://www.google.com/s2/favicons?sz=128&domain={company.lower().replace(' ', '')}.com"
                
                apply_options = item.get("apply_options", [])
                apply_url = apply_options[0].get("link") if apply_options else "https://www.google.com/search?q=jobs"

                tags = [t for t in TECH_DICTIONARY if t.lower() in description.lower()]
                if not tags:
                    tags = ["Python", "Java", "SQL"]

                job_id = generate_job_id(title, company, location)
                category = determine_category(title)

                jobs.append({
                    "id": f"gserp-{job_id}",
                    "title": title,
                    "company": company,
                    "logo_url": logo_url,
                    "location": location,
                    "work_type": "Remote" if "remote" in location.lower() else "Hybrid",
                    "job_type": "Internship" if "intern" in title.lower() else "Full-time",
                    "salary_range": "₹10L – ₹20L PA",
                    "experience_required": "0 – 2 Yrs",
                    "posted_time": "Recently",
                    "original_url": apply_url,
                    "tags": tags[:6],
                    "description": description[:1500],
                    "company_about": f"{company} is hiring talent directly via Google Jobs Search.",
                    "requirements": ["Relevant computer science degree or equivalent practical project experience."],
                    "benefits": ["Competitive pay", "Health insurance", "Skill development"],
                    "category": category,
                    "status": "active"
                })
            print(f"[SUCCESS] Retrieved {len(jobs)} Google Jobs via SerpAPI for '{query}'.")
    except Exception as e:
        print(f"[WARN] Error fetching SerpAPI Google Jobs for '{query}': {e}")
    return jobs

# ==========================================
# MAIN AUTOMATION PIPELINE
# ==========================================

def run_automation_cycle():
    print("============================================")
    print("[INFO] STARTING LIVE GOOGLE JOBS INGESTION PIPELINE")
    print("============================================")
    
    all_google_jobs: List[Dict[str, Any]] = []

    for query in GOOGLE_JOBS_QUERIES:
        # 1. Primary: Scrapingdog Google Jobs API
        jobs = fetch_google_jobs_scrapingdog(query)
        if not jobs and SERPAPI_KEY:
            # 2. Secondary: SerpAPI Google Jobs Engine
            jobs = fetch_google_jobs_serpapi(query)
        
        all_google_jobs.extend(jobs)

    # Deduplicate Google Jobs by unique Job ID
    seen_ids = set()
    unique_google_jobs = []
    for j in all_google_jobs:
        if j["id"] not in seen_ids:
            seen_ids.add(j["id"])
            unique_google_jobs.append(j)

    print(f"\n[SUMMARY] Total deduplicated Google Jobs fetched: {len(unique_google_jobs)}")

    if not supabase:
        print("[WARN] Supabase client not initialized. Printing top Google Jobs results:")
        for j in unique_google_jobs[:5]:
            print(f" -> {j['title']} at {j['company']} ({j['location']})")
        return

    if unique_google_jobs:
        try:
            print(f"[DATABASE] Upserting {len(unique_google_jobs)} live Google Jobs into Supabase 'job_posts' table...")
            res = supabase.table("job_posts").upsert(unique_google_jobs, on_conflict="id").execute()
            print(f"[SUCCESS] Successfully ingested {len(unique_google_jobs)} live Google Jobs into Supabase database!")
        except Exception as e:
            print(f"[ERROR] Failed to upsert Google Jobs into Supabase: {e}")

    # Retention Cleanup (Keeps database under free cap)
    try:
        import datetime
        thirty_days_ago = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)).isoformat()
        supabase.table("job_posts").delete().lt("created_at", thirty_days_ago).execute()
        print("[INFO] Retention sweep completed successfully.")
    except Exception as e:
        print(f"[WARN] Retention sweep note: {e}")

if __name__ == "__main__":
    run_automation_cycle()
