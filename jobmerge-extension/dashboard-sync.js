// dashboard-sync.js - Bidirectional Dashboard <-> Chrome Extension Data Pipeline

const authSyncEl = document.getElementById('jobmerge-sync-auth');
if (authSyncEl) {
  const token = authSyncEl.getAttribute('data-token');
  const apiUrl = authSyncEl.getAttribute('data-api-url');
  
  const saveObj = {};
  if (token) saveObj.apiToken = token;
  if (apiUrl) saveObj.backendUrl = apiUrl;
  
  if (Object.keys(saveObj).length > 0) {
    chrome.storage.local.set(saveObj, () => {
      showDashboardSuccessNotification('JobMerge Chrome Extension Synced & Ready!');
    });
  }
}

function showDashboardSuccessNotification(text) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.left = '24px';
  container.style.zIndex = '999999';
  container.style.padding = '14px 24px';
  container.style.background = '#059669';
  container.style.color = '#ffffff';
  container.style.fontFamily = 'system-ui, sans-serif';
  container.style.fontSize = '13px';
  container.style.fontWeight = 'bold';
  container.style.borderRadius = '16px';
  container.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
  container.style.transition = 'all 0.3s ease';
  container.textContent = `🚀 ${text}`;
  document.body.appendChild(container);
  
  setTimeout(() => {
    container.style.opacity = '0';
    setTimeout(() => container.remove(), 500);
  }, 4500);
}

// Listen for Start event from web dashboard
window.addEventListener('JOBMERGE_START_BOT', (e) => {
  const { keyword, location, limit, portal } = e.detail || {};
  const targetLimit = parseInt(limit, 10) || 15;
  
  chrome.storage.local.set({
    searchKeyword: keyword || 'Software Engineer',
    searchLocation: location || 'United States',
    appLimit: targetLimit,
    targetPortal: portal || 'LinkedIn',
    isApplying: true,
    appliedCount: 0,
    failedCount: 0,
    jobIndex: 0,
    visitedJobIds: []
  }, () => {
    chrome.runtime.sendMessage({
      action: 'START_BOT',
      keyword: keyword || 'Software Engineer',
      location: location || 'United States',
      limit: targetLimit,
      portal: portal || 'LinkedIn'
    });
  });
});

// Listen for Stop event from web dashboard
window.addEventListener('JOBMERGE_STOP_BOT', () => {
  chrome.storage.local.set({ isApplying: false }, () => {
    chrome.runtime.sendMessage({ action: 'STOP_BOT' });
  });
});
