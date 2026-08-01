// dashboard-sync.js

// Check if we are on the JobMerge Dashboard for silent auth synchronization (Method C)
const authSyncEl = document.getElementById('jobmerge-sync-auth');
if (authSyncEl) {
  const token = authSyncEl.getAttribute('data-token');
  const apiUrl = authSyncEl.getAttribute('data-api-url');
  
  const saveObj = {};
  if (token) saveObj.apiToken = token;
  if (apiUrl) saveObj.backendUrl = apiUrl;
  
  if (Object.keys(saveObj).length > 0) {
    chrome.storage.local.set(saveObj, () => {
      showDashboardSuccessNotification('JobMerge Chrome Extension Connected Successfully!');
    });
  }
}

function showDashboardSuccessNotification(text) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.left = '20px';
  container.style.zIndex = '999999';
  container.style.padding = '14px 24px';
  container.style.background = '#059669';
  container.style.color = '#ffffff';
  container.style.fontFamily = 'system-ui, sans-serif';
  container.style.fontSize = '12px';
  container.style.fontWeight = 'bold';
  container.style.borderRadius = '14px';
  container.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
  container.style.transition = 'all 0.3s ease';
  container.textContent = `🚀 ${text}`;
  document.body.appendChild(container);
  
  setTimeout(() => {
    container.style.opacity = '0';
    setTimeout(() => container.remove(), 500);
  }, 4000);
}

// Listen for Start event from dashboard
window.addEventListener('JOBMERGE_START_BOT', (e) => {
  const { keyword, location, limit, portal } = e.detail;
  chrome.storage.local.set({
    searchKeyword: keyword,
    searchLocation: location,
    appLimit: limit,
    targetPortal: portal || 'LinkedIn',
    isApplying: true,
    applied: 0,
    failed: 0
  }, () => {
    chrome.runtime.sendMessage({
      action: 'START_BOT',
      keyword: keyword,
      location: location,
      limit: limit,
      portal: portal || 'LinkedIn'
    });
  });
});

// Listen for Stop event from dashboard
window.addEventListener('JOBMERGE_STOP_BOT', () => {
  chrome.storage.local.set({ isApplying: false }, () => {
    chrome.runtime.sendMessage({ action: 'STOP_BOT' });
  });
});
