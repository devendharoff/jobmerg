// ziprecruiter-crawler.js

let isCrawling = false;
let jobIndex = 0;
let currentLimit = 30;
let personalInfo = {};
let apiToken = '';
let hostUrl = 'http://localhost:3001';

// Listen for stop command
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'STOP_CRAWLING') {
    isCrawling = false;
    showNotification('JobMerge Auto-Applier Stopped', 'info');
  }
});

// Load saved configuration dynamically
chrome.storage.local.get(['isApplying', 'appLimit', 'searchKeyword', 'apiToken', 'backendUrl'], (data) => {
  if (data.apiToken) apiToken = data.apiToken;
  if (data.backendUrl) hostUrl = data.backendUrl;

  if (data.isApplying) {
    isCrawling = true;
    currentLimit = data.appLimit || 30;
    
    // Fetch profile data from Web Server using Auth Header
    fetch(`${hostUrl}/api/user/profile`, {
      headers: apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {}
    })
      .then(r => r.json())
      .then(profileData => {
        personalInfo = {
          firstName: profileData.firstName || "Applicant",
          lastName: profileData.lastName || "Candidate",
          phone: profileData.phone || "9876543210",
          city: profileData.city || "San Francisco, CA",
          experienceYears: profileData.experienceYears || "3",
          desiredSalary: profileData.desiredSalary || "120000"
        };
        startCrawler();
      })
      .catch(() => {
        personalInfo = {
          firstName: "Applicant",
          lastName: "Candidate",
          phone: "9876543210",
          city: "San Francisco, CA"
        };
        startCrawler();
      });
  }
});

function showNotification(text, type = 'info') {
  let banner = document.getElementById('jobmerge-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'jobmerge-banner';
    banner.style.position = 'fixed';
    banner.style.top = '20px';
    banner.style.right = '20px';
    banner.style.zIndex = '99999';
    banner.style.padding = '12px 20px';
    banner.style.borderRadius = '12px';
    banner.style.fontFamily = 'system-ui, sans-serif';
    banner.style.fontSize = '13px';
    banner.style.fontWeight = 'bold';
    banner.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
    banner.style.transition = 'all 0.3s ease';
    document.body.appendChild(banner);
  }
  
  if (type === 'success') {
    banner.style.background = '#ecfdf5';
    banner.style.color = '#047857';
    banner.style.border = '1px solid #a7f3d0';
  } else if (type === 'warn') {
    banner.style.background = '#fffbeb';
    banner.style.color = '#b45309';
    banner.style.border = '1px solid #fde68a';
  } else {
    banner.style.background = '#eff6ff';
    banner.style.color = '#1d4ed8';
    banner.style.border = '1px solid #bfdbfe';
  }
  
  banner.textContent = `🚀 JobMerge (ZipRecruiter): ${text}`;
  banner.style.display = 'block';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startCrawler() {
  showNotification('Starting ZipRecruiter crawler...', 'info');
  await delay(2000);
  
  while (isCrawling) {
    try {
      const jobCards = document.querySelectorAll('.job_content, .job_result, .job_card');
      if (jobCards.length === 0) {
        showNotification('No ZipRecruiter job listings found.', 'warn');
        await delay(5000);
        continue;
      }

      if (jobIndex >= jobCards.length) {
        showNotification('Reached the end of ZipRecruiter page.', 'info');
        const nextBtn = document.querySelector('a.next_page, a[aria-label="Next Page"]');
        if (nextBtn) {
          nextBtn.click();
          jobIndex = 0;
          await delay(5000);
        } else {
          isCrawling = false;
          chrome.runtime.sendMessage({ action: 'STOP_BOT' });
          break;
        }
        continue;
      }

      const card = jobCards[jobIndex];
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      const title = card.querySelector('.job_title, h2')?.textContent?.trim() || 'Unknown Title';
      const company = card.querySelector('.name, .company')?.textContent?.trim() || 'Unknown Company';
      
      // Look for Quick Apply button inside card
      const quickApplyBtn = card.querySelector('.quick_apply, a.button-quick-apply, button.quick-apply');
      if (quickApplyBtn) {
        showNotification(`Quick Applying to "${title} | ${company}"...`, 'success');
        quickApplyBtn.click();
        
        chrome.runtime.sendMessage({ action: 'JOB_APPLIED', title, company });
        
        fetch(`${hostUrl}/api/auto-apply/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
          },
          body: JSON.stringify({ status: 'Applying', log: `✅ Successfully Quick Applied on ZipRecruiter: "${title} | ${company}"` })
        }).catch(() => {});

        await delay(3000);
      } else {
        showNotification('Skipping (No Quick Apply)', 'info');
      }

      jobIndex++;
      await delay(2500);
    } catch (loopError) {
      console.error('ZipRecruiter crawler error:', loopError);
      jobIndex++;
      await delay(2000);
    }
  }
}
