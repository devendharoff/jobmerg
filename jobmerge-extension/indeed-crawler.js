// indeed-crawler.js

let isCrawling = false;
let jobIndex = 0;
let currentLimit = 30;
let personalInfo = {};
let apiToken = '';
let hostUrl = 'http://localhost:3000';

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
          desiredSalary: profileData.desiredSalary || "120000",
          requireVisa: profileData.requireVisa || "No",
          website: profileData.website || "",
          linkedIn: profileData.linkedIn || "",
          usCitizenship: profileData.usCitizenship || "U.S. Citizen/Permanent Resident",
          currentCtc: profileData.currentCtc || "",
          noticePeriod: profileData.noticePeriod || "30",
          headline: profileData.headline || "",
          summary: profileData.summary || "",
          coverLetter: profileData.coverLetter || ""
        };
        startCrawler();
      })
      .catch(() => {
        personalInfo = {
          firstName: "Applicant",
          lastName: "Candidate",
          phone: "9876543210",
          city: "San Francisco, CA",
          experienceYears: "3",
          desiredSalary: "120000",
          requireVisa: "No",
          website: "",
          linkedIn: "",
          usCitizenship: "U.S. Citizen/Permanent Resident",
          currentCtc: "",
          noticePeriod: "30",
          headline: "",
          summary: "",
          coverLetter: ""
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
  
  banner.textContent = `🚀 JobMerge (Indeed): ${text}`;
  banner.style.display = 'block';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startCrawler() {
  showNotification('Starting Indeed auto-applier...', 'info');
  await delay(2000);

  // If we are inside an indeed application iframe, skip the main crawling script and directly run form-filling
  if (window.location.href.includes('indeedapply') || window.name.includes('indeedapply')) {
    await handleIndeedApplicationFlow('Indeed Job', 'Company');
    return;
  }
  
  while (isCrawling) {
    try {
      const jobCards = document.querySelectorAll('.job_seen_beacon, .cardOutline, td.resultContent');
      if (jobCards.length === 0) {
        showNotification('No Indeed job listings found.', 'warn');
        await delay(5000);
        continue;
      }

      if (jobIndex >= jobCards.length) {
        showNotification('Reached the end of Indeed listings page.', 'info');
        const nextBtn = document.querySelector('a[aria-label="Next Page"], a[data-testid="pagination-page-next"]');
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
      
      const titleEl = card.querySelector('h2.jobTitle, .jcs-JobTitle');
      const title = titleEl?.textContent?.trim() || 'Unknown Title';
      const company = card.querySelector('.companyName, .company_location .name')?.textContent?.trim() || 'Unknown Company';
      
      if (titleEl) {
        titleEl.click();
        showNotification(`Opening Indeed Job: "${title} | ${company}"...`, 'info');
        
        fetch(`${hostUrl}/api/auto-apply/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
          },
          body: JSON.stringify({ status: 'Applying', log: `Opening Indeed job: "${title} | ${company}"` })
        }).catch(() => {});

        await delay(3000);

        // Look for Easily Apply / indeedApply button
        const indeedApplyBtn = document.querySelector('button[id*="indeedApplyButton"], button.indeed-apply-button, .ia-IndeedApplyButton');
        if (indeedApplyBtn) {
          showNotification('Easily Apply found! Launching Indeed application flow...', 'success');
          indeedApplyBtn.click();
          await delay(3000);
          
          // Wait for form completion status in case we did not run inside iframe
          await delay(8000);
        } else {
          showNotification('Skipping (Not Easily Apply on Indeed)', 'info');
        }
      }

      jobIndex++;
      await delay(3000);
    } catch (loopError) {
      console.error('Indeed crawler loop error:', loopError);
      jobIndex++;
      await delay(2000);
    }
  }
}

async function handleIndeedApplicationFlow(title, company) {
  let modalActive = true;
  let attempts = 0;
  
  while (modalActive && attempts < 15) {
    attempts++;
    
    // Auto-fill inputs inside Indeed frame
    const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"]');
    inputs.forEach(input => {
      const label = getLabelText(input);
      if (label.includes('first name') || label.includes('name')) {
        fillInput(input, personalInfo.firstName + ' ' + personalInfo.lastName);
      } else if (label.includes('phone') || label.includes('mobile')) {
        fillInput(input, personalInfo.phone);
      } else if (label.includes('city') || label.includes('location')) {
        fillInput(input, personalInfo.city);
      }
    });

    // Check for custom questions
    const unansweredRequired = getUnansweredRequiredFields();
    if (unansweredRequired.length > 0) {
      for (const field of unansweredRequired) {
        const questionText = getLabelText(field);
        if (questionText) {
          try {
            const options = [];
            const selectOpts = field.querySelectorAll('option');
            selectOpts.forEach(o => {
              if (o.value && o.value !== '') options.push(o.textContent.trim());
            });

            const res = await fetch(`${hostUrl}/api/auto-apply/solve`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
              },
              body: JSON.stringify({ question: questionText, options, userInfo: personalInfo })
            });
            const data = await res.json();
            
            if (data && data.answer) {
              if (field.tagName === 'INPUT') {
                fillInput(field, data.answer);
              } else if (field.tagName === 'SELECT') {
                field.value = selectOptionByText(field, data.answer);
                field.dispatchEvent(new Event('change', { bubbles: true }));
              }
              showNotification(`Indeed AI Answered: "${data.answer}"`, 'success');
            }
          } catch (e) {
            console.error('Failed indeed AI solve:', e);
          }
        }
      }
    }

    // Indeed Next / Continue button
    const continueBtn = document.querySelector('button[class*="Continue"], button[class*="Submit"], button.ia-continue-Button');
    if (continueBtn) {
      continueBtn.click();
      await delay(2500);
    } else {
      modalActive = false;
    }
  }
}

function getLabelText(input) {
  let parent = input.parentElement;
  while (parent && parent !== document.body) {
    const label = parent.querySelector('label, legend, span');
    if (label) return label.textContent.toLowerCase().trim();
    parent = parent.parentElement;
  }
  return '';
}

function fillInput(input, value) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function selectOptionByText(select, text) {
  const options = select.querySelectorAll('option');
  let bestMatch = options[0]?.value || '';
  options.forEach(opt => {
    if (opt.textContent.toLowerCase().includes(text.toLowerCase())) {
      bestMatch = opt.value;
    }
  });
  return bestMatch;
}

function getUnansweredRequiredFields() {
  const list = [];
  const inputs = document.querySelectorAll('input[required], select[required]');
  inputs.forEach(input => {
    if (!input.value) list.push(input);
  });
  return list;
}
