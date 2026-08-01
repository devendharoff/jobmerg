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
    const hostUrl = data.backendUrl || 'http://localhost:3001';
    
    if (data.apiToken) tokenInput.value = data.apiToken;
    if (data.geminiApiKey) geminiApiKeyInput.value = data.geminiApiKey;
    if (data.targetPortal) portalSelect.value = data.targetPortal;

    if (data.apiToken) {
      // Fetch Subscription Status using user's authentication token
      fetch(`${hostUrl}/api/user/subscription-status`, {
        headers: { 'Authorization': `Bearer ${data.apiToken}` }
      })
        .then(r => r.json())
        .then(sub => {
          tierBadge.textContent = sub.tier;
          
          // Reset select elements options
          document.getElementById('optIndeed').disabled = !sub.allowedPortals.includes('Indeed');
          document.getElementById('optIndeed').textContent = sub.allowedPortals.includes('Indeed') 
            ? 'Indeed (Standard Plan)' 
            : 'Indeed (Standard Plan - Locked)';
            
          document.getElementById('optZipRecruiter').disabled = !sub.allowedPortals.includes('ZipRecruiter');
          document.getElementById('optZipRecruiter').textContent = sub.allowedPortals.includes('ZipRecruiter') 
            ? 'ZipRecruiter (Premium Plan)' 
            : 'ZipRecruiter (Premium Plan - Locked)';

          // Limit application options based on subscription daily Limit
          limitSelect.innerHTML = '';
          const maxVal = sub.dailyLimit || 15;
          const limits = [3, 5, 10, 15, 30, 50, 100, 200].filter(l => l <= maxVal);
          limits.forEach(limit => {
            const opt = document.createElement('option');
            opt.value = limit;
            opt.textContent = `Apply to ${limit} jobs`;
            limitSelect.appendChild(opt);
          });
          if (data.appLimit && data.appLimit <= maxVal) {
            limitSelect.value = data.appLimit;
          } else {
            limitSelect.value = limits[limits.length - 1];
          }

          if (sub.tier === 'Premium' || sub.tier === 'Standard') {
            tierBadge.style.background = '#fef3c7';
            tierBadge.style.color = '#d97706';
          } else {
            tierBadge.style.background = '#e2e8f0';
            tierBadge.style.color = '#475569';
          }
        })
        .catch(() => {
          tierBadge.textContent = 'Basic';
          limitSelect.innerHTML = '<option value="3">Apply to 3 jobs (Free Tier limit)</option>';
        });
    } else {
      tierBadge.textContent = 'Basic';
      limitSelect.innerHTML = '<option value="3">Apply to 3 jobs (Free Tier limit)</option>';
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
    const token = tokenInput.value.trim();
    const geminiKey = geminiApiKeyInput.value.trim();
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
    
    if (!token) {
      alert('Please enter your JobMerge Extension API Key from your dashboard Settings!');
      return;
    }
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
