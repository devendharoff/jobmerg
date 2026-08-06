// linkedin-crawler.js - Unstoppable Auto-Applier Engine with Real-Time Persistence & Supabase Sync

let isCrawling = false;
let jobIndex = 0;
let appliedCount = 0;
let failedCount = 0;
let targetLimit = 15;
let personalInfo = {};
let apiToken = '';
let hostUrl = 'http://localhost:3000';
let visitedJobIds = new Set();

// Listen for stop command from background or extension popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'STOP_CRAWLING' || message.action === 'STOP_BOT') {
    isCrawling = false;
    chrome.storage.local.set({ isApplying: false });
    showNotification('JobMerge Auto-Applier Engine Stopped', 'info');
  }
});

// Load persistent crawling session from chrome.storage.local
chrome.storage.local.get([
  'isApplying', 'appLimit', 'appliedCount', 'failedCount', 'jobIndex', 
  'visitedJobIds', 'apiToken', 'backendUrl'
], (data) => {
  if (data.apiToken) apiToken = data.apiToken;
  if (data.backendUrl) hostUrl = data.backendUrl;
  if (data.appLimit) targetLimit = data.appLimit;
  if (typeof data.appliedCount === 'number') appliedCount = data.appliedCount;
  if (typeof data.failedCount === 'number') failedCount = data.failedCount;
  if (typeof data.jobIndex === 'number') jobIndex = data.jobIndex;
  if (Array.isArray(data.visitedJobIds)) visitedJobIds = new Set(data.visitedJobIds);

  if (data.isApplying) {
    if (appliedCount >= targetLimit) {
      showNotification(`Target reached! Applied to ${appliedCount}/${targetLimit} jobs.`, 'success');
      chrome.storage.local.set({ isApplying: false });
      return;
    }

    isCrawling = true;
    
    // Fetch latest user profile from Web Server
    fetch(`${hostUrl}/api/user/profile`, {
      headers: apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {}
    })
      .then(r => r.json())
      .then(profileData => {
        personalInfo = {
          firstName: profileData.firstName || profileData.name?.split(' ')[0] || "Applicant",
          lastName: profileData.lastName || profileData.name?.split(' ').slice(1).join(' ') || "Candidate",
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
    banner.style.zIndex = '999999';
    banner.style.padding = '12px 20px';
    banner.style.borderRadius = '14px';
    banner.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    banner.style.fontSize = '13px';
    banner.style.fontWeight = 'bold';
    banner.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
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
  
  banner.textContent = `🚀 JobMerge Auto-Applier (${appliedCount}/${targetLimit}): ${text}`;
  banner.style.display = 'block';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrollLeftPane() {
  const leftPane = document.querySelector('.jobs-search-results-list, .jobs-search-results-container, div[data-job-id]');
  if (leftPane) {
    showNotification('Scanning page job listings...', 'info');
    for (let scrollY = 0; scrollY <= leftPane.scrollHeight; scrollY += 400) {
      leftPane.scrollTo({ top: scrollY, behavior: 'smooth' });
      await delay(350);
    }
    leftPane.scrollTo({ top: 0, behavior: 'smooth' });
    await delay(800);
  }
}

async function syncStateToDashboardAndStorage(statusText, logText) {
  // Persist counts across navigations
  chrome.storage.local.set({
    appliedCount,
    failedCount,
    jobIndex,
    visitedJobIds: Array.from(visitedJobIds)
  });

  // Post sync update to web server (which broadcasts via SSE & saves to Supabase)
  try {
    await fetch(`${hostUrl}/api/auto-apply/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
      },
      body: JSON.stringify({
        status: statusText,
        log: logText,
        applied: appliedCount,
        failed: failedCount,
        targetLimit: targetLimit,
        platform: 'LinkedIn'
      })
    });
  } catch (err) {
    console.warn('Sync server call error:', err);
  }
}

async function startCrawler() {
  showNotification(`Starting engine loop (${appliedCount}/${targetLimit} applied)...`, 'info');
  await delay(1500);
  await scrollLeftPane();
  
  while (isCrawling && appliedCount < targetLimit) {
    try {
      const jobCards = document.querySelectorAll('.scaffold-layout__list-item, .job-card-container, .job-card-list__title');
      
      if (jobCards.length === 0) {
        showNotification('No job listings detected. Refreshing list scan...', 'warn');
        await delay(4000);
        await scrollLeftPane();
        continue;
      }

      if (jobIndex >= jobCards.length) {
        showNotification('Reached end of listings page. Transitioning to next page...', 'info');
        const nextBtn = document.querySelector('button[aria-label="Next"], button.artdeco-pagination__button--next');
        if (nextBtn && !nextBtn.disabled) {
          nextBtn.click();
          jobIndex = 0;
          await syncStateToDashboardAndStorage('Crawling', 'Navigating to next LinkedIn search results page...');
          await delay(4000);
          await scrollLeftPane();
        } else {
          showNotification(`Scan complete! Reached end of available results. Applied: ${appliedCount}/${targetLimit}`, 'success');
          isCrawling = false;
          chrome.storage.local.set({ isApplying: false });
          chrome.runtime.sendMessage({ action: 'STOP_BOT' });
          break;
        }
        continue;
      }

      const card = jobCards[jobIndex];
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      const title = card.querySelector('.job-card-list__title, .job-card-list__title--link')?.textContent?.trim() || 'Software Engineer';
      const company = card.querySelector('.job-card-container__primary-description, .artdeco-entity-lockup__subtitle')?.textContent?.trim() || 'Featured Company';
      const cardJobId = card.getAttribute('data-job-id') || `${title}-${company}`;

      if (visitedJobIds.has(cardJobId)) {
        jobIndex++;
        continue;
      }

      visitedJobIds.add(cardJobId);

      const jobLink = card.querySelector('a.job-card-list__title--link, a.job-card-container__link');
      if (jobLink) {
        jobLink.click();
        showNotification(`Opening [${jobIndex + 1}/${jobCards.length}]: "${title} | ${company}"...`, 'info');
        await syncStateToDashboardAndStorage('Applying', `Evaluating job [${appliedCount + 1}/${targetLimit}]: "${title} | ${company}"`);
        
        await delay(2000);

        const easyApplyBtn = document.querySelector('button.jobs-apply-button');
        if (easyApplyBtn && easyApplyBtn.textContent.includes('Easy Apply')) {
          showNotification('Easy Apply found! Initiating auto-fill modal...', 'success');
          easyApplyBtn.click();
          await delay(1800);
          
          const success = await handleApplicationFlow(title, company);
          if (success) {
            appliedCount++;
            chrome.runtime.sendMessage({ action: 'JOB_APPLIED', title, company, appliedCount });
            await syncStateToDashboardAndStorage('Applying', `✅ Successfully applied to "${title} | ${company}" (${appliedCount}/${targetLimit})`);
          } else {
            failedCount++;
            chrome.runtime.sendMessage({ action: 'JOB_FAILED', title, company, failedCount });
            await syncStateToDashboardAndStorage('Applying', `⚠️ Skipped/unhandled form step for "${title} | ${company}"`);
          }
        } else {
          showNotification(`Skipping external job: "${title}"`, 'info');
          await syncStateToDashboardAndStorage('Applying', `Skipped non-Easy Apply role: "${title} | ${company}"`);
        }
      }

      jobIndex++;
      await syncStateToDashboardAndStorage('Applying', `Progress: ${appliedCount}/${targetLimit} applied.`);
      await delay(2000);

    } catch (loopError) {
      console.error('LinkedIn unstoppable loop error, continuing to next card:', loopError);
      jobIndex++;
      await delay(1500);
    }
  }

  if (appliedCount >= targetLimit) {
    showNotification(`🎯 Goal achieved! Successfully submitted ${appliedCount} applications out of ${targetLimit}!`, 'success');
    isCrawling = false;
    chrome.storage.local.set({ isApplying: false });
    await syncStateToDashboardAndStorage('Completed', `🎯 Goal achieved! Successfully completed ${appliedCount} applications!`);
  }
}

async function handleApplicationFlow(title, company) {
  let modal = null;
  for (let i = 0; i < 8; i++) {
    modal = document.querySelector('.jobs-easy-apply-modal');
    if (modal) break;
    await delay(400);
  }
  
  if (!modal) {
    showNotification('Easy Apply modal failed to load. Moving to next job.', 'warn');
    return false;
  }

  let attempts = 0;
  
  while (attempts < 15) {
    const currentModal = document.querySelector('.jobs-easy-apply-modal');
    if (!currentModal) {
      // Modal closed = application submitted!
      return true;
    }

    attempts++;

    // 1. Auto-fill common inputs
    const textInputs = currentModal.querySelectorAll('input[type="text"], input[type="number"], textarea');
    textInputs.forEach(input => {
      if (input.value && input.value.trim() !== '') return;
      const label = getLabelText(input);
      if (label.includes('first name') || label.includes('given name')) {
        fillInput(input, personalInfo.firstName);
      } else if (label.includes('last name') || label.includes('family name')) {
        fillInput(input, personalInfo.lastName);
      } else if (label.includes('phone') || label.includes('mobile')) {
        fillInput(input, personalInfo.phone);
      } else if (label.includes('city') || label.includes('location')) {
        fillInput(input, personalInfo.city);
      } else if (label.includes('experience') || label.includes('years')) {
        fillInput(input, personalInfo.experienceYears || "3");
      } else if (label.includes('salary') || label.includes('compensation') || label.includes('ctc')) {
        fillInput(input, personalInfo.desiredSalary || "120000");
      }
    });

    // 2. Solve custom required fields via AI & Local Heuristics
    const unansweredRequired = getUnansweredRequiredFields(currentModal);
    if (unansweredRequired.length > 0) {
      showNotification('Custom question found! Querying Gemini AI solver...', 'warn');
      
      for (const field of unansweredRequired) {
        const questionText = getLabelText(field);
        if (questionText) {
          let answered = false;

          // Attempt Gemini AI Server Solver
          try {
            const options = [];
            if (field.tagName === 'SELECT') {
              const optElements = field.querySelectorAll('option');
              optElements.forEach(o => {
                if (o.value && o.value !== 'Select an option') options.push(o.textContent.trim());
              });
            } else if (field.tagName === 'FIELDSET') {
              const labelElements = field.querySelectorAll('label');
              labelElements.forEach(l => options.push(l.textContent.trim()));
            }

            const res = await fetch(`${hostUrl}/api/auto-apply/solve`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
              },
              body: JSON.stringify({ question: questionText, options, userInfo: personalInfo })
            });
            
            if (res.ok) {
              const data = await res.json();
              if (data && data.answer) {
                applyFieldValue(field, data.answer);
                answered = true;
                showNotification(`AI Solved: "${data.answer}"`, 'success');
              }
            }
          } catch (e) {
            console.warn('AI Server solver call failed, trying local heuristic solver...', e);
          }

          // Fallback Local Heuristic Solver if AI call returned empty
          if (!answered) {
            const smartFallback = getSmartLocalFallback(field, questionText);
            if (smartFallback) {
              applyFieldValue(field, smartFallback);
              showNotification(`Auto-Filled Smart Answer: "${smartFallback}"`, 'info');
            }
          }
        }
      }

      await delay(1000);
    }

    // 3. Check if any unanswerable required field remains
    const remainingUnanswered = getUnansweredRequiredFields(currentModal);
    if (remainingUnanswered.length > 0) {
      showNotification('Manual input required. Allowing 10s before auto-skip...', 'warn');
      
      remainingUnanswered.forEach(field => {
        field.style.border = '2px solid #f59e0b';
        field.style.background = '#fffbeb';
      });

      const nextBtn = currentModal.querySelector('button[aria-label="Submit application"], button[aria-label="Continue to next step"], button[aria-label="Review your application"]');
      if (nextBtn) {
        const userInteracted = await waitForUserSubmit(nextBtn, 10000);
        if (!userInteracted) {
          showNotification('Unanswered field timeout. Dismissing modal to continue loop...', 'warn');
          dismissModal(currentModal);
          return false;
        }
        await delay(1500);
        continue;
      }
    }

    // 4. Click Submit / Next / Review Button
    const actionBtn = currentModal.querySelector('button[aria-label="Submit application"], button[aria-label="Continue to next step"], button[aria-label="Review your application"]');
    if (actionBtn) {
      actionBtn.click();
      await delay(1800);
      dismissPostApplyUpgradePrompts();
    } else {
      dismissModal(currentModal);
      return false;
    }
  }
  
  return true;
}

function applyFieldValue(field, answerValue) {
  if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
    fillInput(field, answerValue);
  } else if (field.tagName === 'SELECT') {
    field.value = selectOptionByText(field, answerValue);
    field.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (field.tagName === 'FIELDSET') {
    selectRadioButtonByText(field, answerValue);
  }
}

function getSmartLocalFallback(field, questionText) {
  const q = questionText.toLowerCase();
  
  if (q.includes('experience') || q.includes('years')) return personalInfo.experienceYears || "3";
  if (q.includes('salary') || q.includes('compensation') || q.includes('ctc')) return personalInfo.desiredSalary || "120000";
  if (q.includes('notice') || q.includes('days')) return personalInfo.noticePeriod || "30";
  if (q.includes('sponsor') || q.includes('visa')) return "No";
  if (q.includes('authorized') || q.includes('eligible') || q.includes('legally')) return "Yes";
  if (q.includes('education') || q.includes('degree')) return "Bachelor's Degree";

  if (field.tagName === 'SELECT') {
    const options = field.querySelectorAll('option');
    for (const opt of options) {
      const txt = opt.textContent.toLowerCase();
      if (txt.includes('yes') || txt.includes('authorized') || txt.includes('bachelor')) {
        return opt.textContent.trim();
      }
    }
    if (options[1] && options[1].textContent) return options[1].textContent.trim();
  }

  if (field.tagName === 'FIELDSET') {
    const labels = field.querySelectorAll('label');
    for (const l of labels) {
      if (l.textContent.toLowerCase().includes('yes')) return 'Yes';
    }
    if (labels[0]) return labels[0].textContent.trim();
  }

  return "Yes";
}

function dismissPostApplyUpgradePrompts() {
  try {
    const dismissTexts = [
      "not now", "no thanks", "no, thanks", "maybe later", "dismiss", 
      "skip", "cancel", "done", "got it", "close", "no thank you"
    ];

    const clickableElements = document.querySelectorAll('button, a, span, div[role="button"], button[type="button"]');
    for (const el of clickableElements) {
      if (!el || !el.offsetWidth || !el.offsetHeight) continue;
      
      const txt = el.textContent.trim().toLowerCase();
      if (dismissTexts.includes(txt)) {
        const isDialogChild = el.closest('[role="dialog"], [role="alertdialog"], .artdeco-modal, .artdeco-toast-item, .modal, .popup, .overlay, [aria-modal="true"]');
        if (isDialogChild || txt === 'not now' || txt === 'no thanks' || txt === 'maybe later') {
          console.log(`[JobMerge Auto-Dismiss] Clicking '${el.textContent.trim()}' to dismiss post-apply / plan upgrade prompt.`);
          el.click();
          return true;
        }
      }
    }

    const closeSelectors = [
      'button[aria-label="Dismiss"]',
      'button[aria-label="Close"]',
      'button[aria-label="close"]',
      'button.artdeco-modal__dismiss',
      'button.artdeco-toast-item__dismiss',
      'button[data-test-modal-close-btn]',
      'button[data-test-icon="close-small"]',
      'button.modal__close',
      'button.close-button',
      '.icl-CloseButton',
      '[data-testid="close-button"]'
    ];

    for (const selector of closeSelectors) {
      const closeBtns = document.querySelectorAll(selector);
      for (const closeBtn of closeBtns) {
        if (closeBtn && closeBtn.offsetWidth && closeBtn.offsetHeight) {
          console.log(`[JobMerge Auto-Dismiss] Clicking Close ('X') icon button to dismiss popup.`);
          closeBtn.click();
          return true;
        }
      }
    }
  } catch (e) {}
  return false;
}

// Continuous watcher to automatically dismiss upgrade plan popups and 'X' icons
setInterval(() => {
  if (isCrawling) {
    dismissPostApplyUpgradePrompts();
  }
}, 1500);

function dismissModal(modal) {
  dismissPostApplyUpgradePrompts();
  const closeBtn = modal ? modal.querySelector('button[aria-label="Dismiss"], button.artdeco-modal__dismiss') : null;
  if (closeBtn) {
    closeBtn.click();
    setTimeout(() => {
      const discardBtn = document.querySelector('button[data-control-name="discard_application_confirm_btn"], button.artdeco-modal__confirm-dialog-btn');
      if (discardBtn) discardBtn.click();
    }, 500);
  }
}

function getLabelText(input) {
  let parent = input.parentElement;
  while (parent && parent !== document.body) {
    const label = parent.querySelector('label, legend');
    if (label) return label.textContent.toLowerCase().replace('*', '').trim();
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
    const optText = opt.textContent.toLowerCase();
    const targetText = text.toLowerCase();
    if (optText.includes(targetText) || targetText.includes(optText)) {
      bestMatch = opt.value;
    }
  });
  return bestMatch;
}

function selectRadioButtonByText(fieldset, text) {
  const labels = fieldset.querySelectorAll('label');
  labels.forEach(label => {
    if (label.textContent.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(label.textContent.toLowerCase())) {
      const radio = label.parentElement.querySelector('input[type="radio"]');
      if (radio) {
        radio.click();
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
}

function getUnansweredRequiredFields(modal) {
  const list = [];
  
  const inputs = modal.querySelectorAll('input[required], select[required], textarea[required]');
  inputs.forEach(input => {
    if (!input.value || input.value === 'Select an option') {
      list.push(input);
    }
  });

  const radioContainers = modal.querySelectorAll('fieldset[required], fieldset');
  radioContainers.forEach(container => {
    const legend = container.querySelector('legend');
    const isRequired = legend && legend.textContent.includes('*');
    if (isRequired) {
      const checked = container.querySelector('input[type="radio"]:checked');
      if (!checked) {
        list.push(container);
      }
    }
  });

  return list;
}

function waitForUserSubmit(button, timeoutMs = 10000) {
  return new Promise(resolve => {
    let timeout = setTimeout(() => {
      button.removeEventListener('click', handler);
      resolve(false);
    }, timeoutMs);

    const handler = () => {
      clearTimeout(timeout);
      button.removeEventListener('click', handler);
      resolve(true);
    };
    button.addEventListener('click', handler);
  });
}
