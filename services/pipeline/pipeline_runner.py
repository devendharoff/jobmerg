import os
import hashlib
import requests
from supabase import create_client

# Load environment variables from .env file for local development
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# 1. Environment Configurations
SUPABASE_URL = os.getenv("SUPABASE_URL")
# CRITICAL: Use the secret service role key to write to the database automatically.
# Fallback to anon key is included for local testing environments where service role key isn't provided.
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Stacked free API providers to keep operational budgets at $0
API_PROVIDERS = [
    {"name": "serpapi", "url": "https://serpapi.com/search.json", "key": os.getenv("SERPAPI_KEY")},
    {"name": "scrapingdog", "url": "https://api.scrapingdog.com/google_jobs", "key": os.getenv("SCRAPINGDOG_KEY")}
]

# Strict filters tailored for student/fresher target demographics
TECH_DICTIONARY = ["React", "Next.js", "Python", "Supabase", "Tailwind", "Node.js", "MongoDB", "TypeScript"]
SENIOR_FILTER_WORDS = ["senior", "sr.", "lead", "manager", "architect", "principal", "director", "8+", "10+"]

def fetch_raw_jobs(query, provider_index=0):
    """Fetches job indices while handling API key exhaustion gracefully."""
    if provider_index >= len(API_PROVIDERS):
        print("[ERROR] All free tier API keys exhausted for today.")
        return []
        
    current_provider = API_PROVIDERS[provider_index]
    
    # Skip if key is empty/not configured
    if not current_provider["key"]:
        print(f"[WARN] Provider {current_provider['name']} has no key configured. Rotating...")
        return fetch_raw_jobs(query, provider_index + 1)
        
    print(f"[INFO] Fetching data using proxy provider: {current_provider['name']}")
    
    params = {
        "engine": "google_jobs",
        "q": query,
        "hl": "en",
        "gl": "in", # Standardized region target: India
        "api_key": current_provider["key"]
    }
    
    try:
        response = requests.get(current_provider["url"], params=params, timeout=15)
        if response.status_code in [429, 402]: # Rate limit or Quota empty errors
            print(f"[WARN] Provider {current_provider['name']} limit reached. Rotating key...")
            return fetch_raw_jobs(query, provider_index + 1)
        return response.json().get("jobs_results", [])
    except Exception as e:
        print(f"[WARN] Connection error with {current_provider['name']}: {e}. Rotating...")
        return fetch_raw_jobs(query, provider_index + 1)

def run_automation_cycle():
    # Targeted keywords targeting student pools
    target_queries = ["React Developer Intern India", "Python Developer Fresher"]
    all_processed_jobs = []
    
    for query in target_queries:
        raw_jobs = fetch_raw_jobs(query)
        
        for job in raw_jobs:
            title = job.get("title", "")
            description = job.get("description", "")
            company = job.get("company_name", "")
            location = job.get("location", "Remote")
            
            # 1. Senior Role Exclusions
            combined_text = f"{title} {description}".lower()
            if any(word in combined_text for word in SENIOR_FILTER_WORDS):
                continue
                
            # 2. Extract Valid Links Only
            apply_options = job.get("apply_options", [])
            original_url = apply_options[0].get("link") if apply_options else None
            if not original_url:
                continue
                
            # 3. Clean & Extract Framework Tags
            matched_tags = [tech for tech in TECH_DICTIONARY if tech.lower() in description.lower()]
            
            # 4. Generate Deterministic ID Signature (Deduplication Layer)
            unique_str = f"{title}_{company}_{location}".lower().strip()
            deterministic_id = hashlib.sha256(unique_str.encode('utf-8')).hexdigest()
            
            # 5. Classify Position Type
            position_type = "internship" if "intern" in combined_text else "full-time"
            
            all_processed_jobs.append({
                "id": deterministic_id,
                "title": title,
                "company": company,
                "description": description,
                "source": "unstop" if "unstop" in job.get("via", "").lower() else "linkedin", # Fallback default mapping
                "original_url": original_url,
                "location": location,
                "type": position_type,
                "tags": matched_tags,
                "posted_at_text": job.get("detected_extensions", {}).get("posted_at", "Recently")
            })

    # 6. Push Bulk Transactions to Supabase
    if all_processed_jobs:
        try:
            # Overwrites older records automatically matching conflicting hash IDs
            supabase.table("job_posts").upsert(all_processed_jobs, on_conflict="id").execute()
            print(f"[SUCCESS] Successfully processed and added {len(all_processed_jobs)} clean listings.")
        except Exception as e:
            print(f"[ERROR] Failed to insert data into Supabase instance: {e}")
            
    # 7. Retention Hard Cleanup (Keeps Database Under 500MB Free Cap Forever)
    try:
        supabase.table("job_posts").delete().lt("created_at", "NOW() - INTERVAL '30 days'").execute()
        print("[INFO] Automated retention sweep completed. Stale historical logs dropped.")
    except Exception as e:
        print(f"[WARN] Retention sweep warning: {e}")

if __name__ == "__main__":
    run_automation_cycle()
