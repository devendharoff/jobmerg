// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const tokenInput = document.getElementById('tokenInput');
  const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
  const portalSelect = document.getElementById('portalSelect');
  const keywordInput = document.getElementById('keywordInput');
  const locationInput = document.getElementById('locationInput');
  const datePostedSelect = document.getElementById('datePostedSelect');
  const workstyleOnSite = document.getElementById('workstyleOnSite');
  const workstyleHybrid = document.getElementById('workstyleHybrid');
  const workstyleRemote = document.getElementById('workstyleRemote');
  const jobtypeFullTime = document.getElementById('jobtypeFullTime');
  const jobtypePartTime = document.getElementById('jobtypePartTime');
  const jobtypeContract = document.getElementById('jobtypeContract');
  const jobtypeInternship = document.getElementById('jobtypeInternship');
  const resumeInput = document.getElementById('resumeInput');
  const limitSelect = document.getElementById('limitSelect');
  
  const appliedCount = document.getElementById('appliedCount');
  const failedCount = document.getElementById('failedCount');
  const statusBadge = document.getElementById('statusBadge');
  const tierBadge = document.getElementById('tierBadge');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');

  // Load saved configurations first to fetch the API Token
  chrome.storage.local.get([
    'apiToken', 'geminiApiKey', 'backendUrl', 'targetPortal', 'searchKeyword', 'searchLocation', 'datePosted',
    'wsOnSite', 'wsHybrid', 'wsRemote',
    'jtFullTime', 'jtPartTime', 'jtContract', 'jtInternship',
    'resumeName', 'appLimit', 'applied', 'failed', 'isApplying'
  ], (data) => {
    const hostUrl = data.backendUrl || 'http://localhost:3000';
    
    tokenInput.value = data.apiToken || 'jobmerge_vip_token_2026';
    geminiApiKeyInput.value = data.geminiApiKey || '';
    if (data.targetPortal) portalSelect.value = data.targetPortal;

    const setupUnlimitedTier = (tierName = 'VIP Unlimited') => {
      tierBadge.textContent = tierName;
      tierBadge.style.background = '#dcfce7';
      tierBadge.style.color = '#15803d';

      const optIndeed = document.getElementById('optIndeed');
      if (optIndeed) {
        optIndeed.disabled = false;
        optIndeed.textContent = 'Indeed (VIP Plan - Unlocked)';
      }
      const optZipRecruiter = document.getElementById('optZipRecruiter');
      if (optZipRecruiter) {
        optZipRecruiter.disabled = false;
        optZipRecruiter.textContent = 'ZipRecruiter (VIP Plan - Unlocked)';
      }

      limitSelect.innerHTML = '';
      const limits = [3, 5, 10, 15, 30, 50, 100, 200];
      limits.forEach(limit => {
        const opt = document.createElement('option');
        opt.value = limit;
        opt.textContent = `Apply to ${limit} jobs`;
        limitSelect.appendChild(opt);
      });
      limitSelect.value = data.appLimit || 30;
    };

    if (data.apiToken) {
      // Fetch Subscription Status using user's authentication token
      fetch(`${hostUrl}/api/user/subscription-status`, {
        headers: { 'Authorization': `Bearer ${data.apiToken}` }
      })
        .then(r => r.json())
        .then(sub => {
          setupUnlimitedTier(sub.tier || 'VIP Unlimited');
        })
        .catch(() => {
          setupUnlimitedTier('VIP Unlimited');
        });
    } else {
      setupUnlimitedTier('VIP Unlimited');
    }

    if (data.searchKeyword) keywordInput.value = data.searchKeyword;
    if (data.searchLocation) locationInput.value = data.searchLocation;
    if (data.datePosted) datePostedSelect.value = data.datePosted;
    
    if (data.wsOnSite !== undefined) workstyleOnSite.checked = data.wsOnSite;
    if (data.wsHybrid !== undefined) workstyleHybrid.checked = data.wsHybrid;
    if (data.wsRemote !== undefined) workstyleRemote.checked = data.wsRemote;
    
    if (data.jtFullTime !== undefined) jobtypeFullTime.checked = data.jtFullTime;
    if (data.jtPartTime !== undefined) jobtypePartTime.checked = data.jtPartTime;
    if (data.jtContract !== undefined) jobtypeContract.checked = data.jtContract;
    if (data.jtInternship !== undefined) jobtypeInternship.checked = data.jtInternship;
    
    if (data.resumeName) resumeInput.value = data.resumeName;
    if (data.appLimit) limitSelect.value = data.appLimit;
    
    if (data.applied !== undefined) appliedCount.textContent = data.applied;
    if (data.failed !== undefined) failedCount.textContent = data.failed;
    
    if (data.isApplying) {
      setApplyingState(true);
    } else {
      setApplyingState(false);
    }
  });

  // Start button action
  startBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim() || 'jobmerge_vip_token_2026';
    const geminiKey = geminiApiKeyInput.value.trim();
    tokenInput.value = token;
    geminiApiKeyInput.value = geminiKey;

    const portal = portalSelect.value;
    const keyword = keywordInput.value.trim();
    const location = locationInput.value.trim();
    const datePosted = datePostedSelect.value;
    
    const wsOnSite = workstyleOnSite.checked;
    const wsHybrid = workstyleHybrid.checked;
    const wsRemote = workstyleRemote.checked;
    
    const jtFullTime = jobtypeFullTime.checked;
    const jtPartTime = jobtypePartTime.checked;
    const jtContract = jobtypeContract.checked;
    const jtInternship = jobtypeInternship.checked;
    
    const resumeName = resumeInput.value.trim();
    const limit = parseInt(limitSelect.value, 10);

    if (!keyword) {
      alert('Please enter a search keyword!');
      return;
    }

    // Save configurations to local storage
    chrome.storage.local.set({
      apiToken: token,
      geminiApiKey: geminiKey,
      targetPortal: portal,
      searchKeyword: keyword,
      searchLocation: location,
      datePosted: datePosted,
      wsOnSite: wsOnSite,
      wsHybrid: wsHybrid,
      wsRemote: wsRemote,
      jtFullTime: jtFullTime,
      jtPartTime: jtPartTime,
      jtContract: jtContract,
      jtInternship: jtInternship,
      resumeName: resumeName,
      appLimit: limit,
      isApplying: true,
      applied: 0,
      failed: 0
    }, () => {
      appliedCount.textContent = '0';
      failedCount.textContent = '0';
      setApplyingState(true);
      
      // Notify background script to start crawler with complete filter payload
      chrome.runtime.sendMessage({
        action: 'START_BOT',
        apiToken: token,
        geminiApiKey: geminiKey,
        portal: portal,
        keyword: keyword,
        location: location,
        datePosted: datePosted,
        workStyles: { onSite: wsOnSite, hybrid: wsHybrid, remote: wsRemote },
        jobTypes: { fullTime: jtFullTime, partTime: jtPartTime, contract: jtContract, internship: jtInternship },
        resumeName: resumeName,
        limit: limit
      });
    });
  });

  // Stop button action
  stopBtn.addEventListener('click', () => {
    chrome.storage.local.set({ isApplying: false }, () => {
      setApplyingState(false);
      chrome.runtime.sendMessage({ action: 'STOP_BOT' });
    });
  });

  // Listen for progress updates from background/content script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'UPDATE_STATS') {
      if (message.applied !== undefined) appliedCount.textContent = message.applied;
      if (message.failed !== undefined) failedCount.textContent = message.failed;
      if (message.status !== undefined) {
        statusBadge.textContent = message.status;
        if (message.status === 'Applying' || message.status === 'Active') {
          statusBadge.classList.add('active');
        } else {
          statusBadge.classList.remove('active');
        }
      }
    } else if (message.action === 'BOT_STOPPED') {
      setApplyingState(false);
    }
  });

  function setApplyingState(active) {
    const inputs = [
      tokenInput, geminiApiKeyInput, portalSelect, keywordInput, locationInput, datePostedSelect,
      workstyleOnSite, workstyleHybrid, workstyleRemote,
      jobtypeFullTime, jobtypePartTime, jobtypeContract, jobtypeInternship,
      resumeInput, limitSelect
    ];
    
    inputs.forEach(el => {
      if (el) el.disabled = active;
    });

    if (active) {
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      statusBadge.textContent = 'Active';
      statusBadge.classList.add('active');
    } else {
      startBtn.style.display = 'block';
      stopBtn.style.display = 'none';
      statusBadge.textContent = 'Idle';
      statusBadge.classList.remove('active');
    }
  }
});
