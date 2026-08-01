// linkedin-crawler.js

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
  
  banner.textContent = `🚀 JobMerge (LinkedIn): ${text}`;
  banner.style.display = 'block';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrollLeftPane() {
  const leftPane = document.querySelector('.jobs-search-results-list, .jobs-search-results-container, div[data-job-id]');
  if (leftPane) {
    showNotification('Loading all listings on page...', 'info');
    for (let scrollY = 0; scrollY <= leftPane.scrollHeight; scrollY += 400) {
      leftPane.scrollTo({ top: scrollY, behavior: 'smooth' });
      await delay(450);
    }
    leftPane.scrollTo({ top: 0, behavior: 'smooth' });
    await delay(1000);
  }
}

async function startCrawler() {
  showNotification('Starting auto-applier crawler...', 'info');
  await delay(2000);
  
  await scrollLeftPane();
  
  while (isCrawling) {
    try {
      const jobCards = document.querySelectorAll('.scaffold-layout__list-item, .job-card-container, .job-card-list__title');
      if (jobCards.length === 0) {
        showNotification('No job listings found. Try scrolling.', 'warn');
        await delay(5000);
        continue;
      }

      if (jobIndex >= jobCards.length) {
        showNotification('Reached the end of current listings page.', 'info');
        const nextBtn = document.querySelector('button[aria-label="Next"]');
        if (nextBtn) {
          nextBtn.click();
          jobIndex = 0;
          await delay(5000);
          await scrollLeftPane();
        } else {
          isCrawling = false;
          chrome.runtime.sendMessage({ action: 'STOP_BOT' });
          break;
        }
        continue;
      }

      const card = jobCards[jobIndex];
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      const title = card.querySelector('.job-card-list__title, .job-card-list__title--link')?.textContent?.trim() || 'Unknown Title';
      const company = card.querySelector('.job-card-container__primary-description, .artdeco-entity-lockup__subtitle')?.textContent?.trim() || 'Unknown Company';
      
      const jobLink = card.querySelector('a.job-card-list__title--link, a.job-card-container__link');
      if (jobLink) {
        jobLink.click();
        showNotification(`Opening "${title} | ${company}"...`, 'info');
        
        fetch(`${hostUrl}/api/auto-apply/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
          },
          body: JSON.stringify({ status: 'Applying', log: `Opening job: "${title} | ${company}"` })
        }).catch(() => {});

        await delay(2500);

        const easyApplyBtn = document.querySelector('button.jobs-apply-button');
        if (easyApplyBtn && easyApplyBtn.textContent.includes('Easy Apply')) {
          showNotification('Easy Apply found! Launching application flow...', 'success');
          easyApplyBtn.click();
          await delay(2000);
          
          const success = await handleApplicationFlow(title, company);
          if (success) {
            chrome.runtime.sendMessage({ action: 'JOB_APPLIED', title, company });
            fetch(`${hostUrl}/api/auto-apply/sync`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
              },
              body: JSON.stringify({ status: 'Applying', log: `✅ Successfully applied to "${title} | ${company}"` })
            }).catch(() => {});
          } else {
            chrome.runtime.sendMessage({ action: 'JOB_FAILED', title, company });
            fetch(`${hostUrl}/api/auto-apply/sync`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
              },
              body: JSON.stringify({ status: 'Applying', log: `❌ Skipped/Failed application for "${title} | ${company}"` })
            }).catch(() => {});
          }
        } else {
          showNotification('Skipping (Not Easy Apply)', 'info');
          fetch(`${hostUrl}/api/auto-apply/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
            },
            body: JSON.stringify({ status: 'Applying', log: `Skipped non-Easy Apply: "${title} | ${company}"` })
          }).catch(() => {});
        }
      }

      jobIndex++;
      await delay(3000);
    } catch (loopError) {
      console.error('LinkedIn loop error, continuing:', loopError);
      jobIndex++;
      await delay(2000);
    }
  }
}

async function handleApplicationFlow(title, company) {
  let modal = null;
  for (let i = 0; i < 10; i++) {
    modal = document.querySelector('.jobs-easy-apply-modal');
    if (modal) break;
    await delay(500);
  }
  
  if (!modal) {
    showNotification('Easy Apply modal failed to load. Skipping.', 'warn');
    return false;
  }

  let modalActive = true;
  let attempts = 0;
  
  while (modalActive && attempts < 20) {
    const currentModal = document.querySelector('.jobs-easy-apply-modal');
    if (!currentModal) {
      modalActive = false;
      return true;
    }

    attempts++;

    // 1. Auto-fill common inputs
    const textInputs = currentModal.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
      const label = getLabelText(input);
      if (label.includes('first name') || label.includes('given name')) {
        fillInput(input, personalInfo.firstName);
      } else if (label.includes('last name') || label.includes('family name')) {
        fillInput(input, personalInfo.lastName);
      } else if (label.includes('phone') || label.includes('mobile')) {
        fillInput(input, personalInfo.phone);
      } else if (label.includes('city') || label.includes('location')) {
        fillInput(input, personalInfo.city);
      }
    });

    // 1.5. Highlight file upload / Resume attachments
    const fileInputs = currentModal.querySelectorAll('input[type="file"]');
    if (fileInputs.length > 0) {
      chrome.storage.local.get(['resumeName'], (data) => {
        const rName = data.resumeName || 'resume.pdf';
        showNotification(`Please verify or upload your resume: "${rName}"`, 'warn');
        fileInputs.forEach(input => {
          input.style.border = '2px dashed #10b981';
          input.style.background = '#ecfdf5';
          input.style.padding = '8px';
        });
      });
      await delay(2000);
    }

    // 2. Solve custom questions
    const unansweredRequired = getUnansweredRequiredFields(currentModal);
    if (unansweredRequired.length > 0) {
      showNotification('Custom Question Found! Asking Gemini AI...', 'warn');
      
      for (const field of unansweredRequired) {
        const questionText = getLabelText(field);
        if (questionText) {
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

            // Call server solver
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
              } else if (field.tagName === 'FIELDSET') {
                selectRadioButtonByText(field, data.answer);
              }
              showNotification(`AI Answered: "${data.answer}"`, 'success');
              
              fetch(`${hostUrl}/api/auto-apply/sync`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
                },
                body: JSON.stringify({ status: 'Applying', log: `🤖 AI answered: "${data.answer}"` })
              }).catch(() => {});

              await delay(1500);
            }
          } catch (e) {
            console.error('Failed to solve question via AI:', e);
          }
        }
      }

      const remainingUnanswered = getUnansweredRequiredFields(currentModal);
      if (remainingUnanswered.length > 0) {
        showNotification('Manual input required! Paused for 30s...', 'warn');
        
        remainingUnanswered.forEach(field => {
          field.style.border = '2px solid #eab308';
          field.style.background = '#fef9c3';
        });

        const nextBtn = currentModal.querySelector('button[aria-label="Submit application"], button[aria-label="Continue to next step"], button[aria-label="Review your application"]');
        if (nextBtn) {
          const userInteracted = await waitForUserSubmit(nextBtn, 30000);
          if (!userInteracted) {
            showNotification('Manual pause timed out. Skipping job.', 'warn');
            const closeBtn = currentModal.querySelector('button[aria-label="Dismiss"]');
            if (closeBtn) {
              closeBtn.click();
              await delay(1000);
              const discardBtn = document.querySelector('button[data-control-name="discard_application_confirm_btn"]');
              if (discardBtn) discardBtn.click();
            }
            return false;
          }
          await delay(2000);
          continue;
        }
      }
    }

    const actionBtn = currentModal.querySelector('button[aria-label="Submit application"], button[aria-label="Continue to next step"], button[aria-label="Review your application"]');
    if (actionBtn) {
      actionBtn.click();
      await delay(2000);
    } else {
      const closeBtn = currentModal.querySelector('button[aria-label="Dismiss"]');
      if (closeBtn) {
        closeBtn.click();
        await delay(1000);
        const discardBtn = document.querySelector('button[data-control-name="discard_application_confirm_btn"]');
        if (discardBtn) discardBtn.click();
      }
      return false;
    }
  }
  
  return true;
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
  
  const inputs = modal.querySelectorAll('input[required], select[required]');
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

function waitForUserSubmit(button, timeoutMs = 30000) {
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
