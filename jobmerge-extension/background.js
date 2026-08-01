// background.js - Chrome Extension Service Worker

let isBotRunning = false;
let appliedCount = 0;
let failedCount = 0;
let botLimit = 15;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'START_BOT') {
    isBotRunning = true;
    appliedCount = 0;
    failedCount = 0;
    botLimit = message.limit || 15;
    
    // Save state across sessions
    chrome.storage.local.set({ 
      isApplying: true,
      appliedCount: 0,
      failedCount: 0,
      jobIndex: 0,
      visitedJobIds: [],
      appLimit: botLimit
    });

    // Find active tab and direct to target search URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      const keywordEncoded = encodeURIComponent(message.keyword || 'Software Engineer');
      const locationEncoded = message.location ? encodeURIComponent(message.location) : 'United%20States';
      let targetUrl = '';

      if (message.portal === 'Indeed') {
        targetUrl = `https://www.indeed.com/jobs?q=${keywordEncoded}&l=${locationEncoded}`;
      } else if (message.portal === 'ZipRecruiter') {
        targetUrl = `https://www.ziprecruiter.com/jobs?search=${keywordEncoded}&location=${locationEncoded}`;
      } else {
        // LinkedIn (Default with Easy Apply Filter f_AL=true)
        targetUrl = `https://www.linkedin.com/jobs/search/?keywords=${keywordEncoded}&location=${locationEncoded}&f_AL=true`;
      }
      
      if (activeTab && activeTab.url && (activeTab.url.includes('linkedin.com') || activeTab.url.includes('indeed.com') || activeTab.url.includes('ziprecruiter.com'))) {
        chrome.tabs.update(activeTab.id, { url: targetUrl });
      } else {
        chrome.tabs.create({ url: targetUrl });
      }
    });
  }

  else if (message.action === 'STOP_BOT') {
    isBotRunning = false;
    chrome.storage.local.set({ isApplying: false }, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.url && (tab.url.includes('linkedin.com') || tab.url.includes('indeed.com') || tab.url.includes('ziprecruiter.com'))) {
            chrome.tabs.sendMessage(tab.id, { action: 'STOP_CRAWLING' }).catch(() => {});
          }
        });
      });
      chrome.runtime.sendMessage({ action: 'BOT_STOPPED' });
    });
  }

  else if (message.action === 'JOB_APPLIED') {
    appliedCount = message.appliedCount || (appliedCount + 1);
    chrome.storage.local.set({ appliedCount }, () => {
      chrome.runtime.sendMessage({ 
        action: 'UPDATE_STATS', 
        applied: appliedCount, 
        failed: failedCount,
        status: 'Applying'
      });
      
      if (appliedCount >= botLimit) {
        chrome.storage.local.set({ isApplying: false });
        chrome.runtime.sendMessage({ action: 'STOP_BOT' });
      }
    });
  }

  else if (message.action === 'JOB_FAILED') {
    failedCount = message.failedCount || (failedCount + 1);
    chrome.storage.local.set({ failedCount }, () => {
      chrome.runtime.sendMessage({ 
        action: 'UPDATE_STATS', 
        applied: appliedCount, 
        failed: failedCount,
        status: 'Applying'
      });
    });
  }
});
