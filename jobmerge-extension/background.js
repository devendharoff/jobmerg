// background.js

let isBotRunning = false;
let appliedCount = 0;
let failedCount = 0;
let botLimit = 30;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'START_BOT') {
    isBotRunning = true;
    appliedCount = 0;
    failedCount = 0;
    botLimit = message.limit || 30;
    
    // Save state
    chrome.storage.local.set({ 
      isApplying: true,
      applied: 0,
      failed: 0
    });

    // Find active tab and direct to search URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      const keywordEncoded = encodeURIComponent(message.keyword);
      const locationEncoded = message.location ? encodeURIComponent(message.location) : '';
      let targetUrl = '';

      if (message.portal === 'Indeed') {
        targetUrl = `https://www.indeed.com/jobs?q=${keywordEncoded}&l=${locationEncoded}`;
      } else if (message.portal === 'ZipRecruiter') {
        targetUrl = `https://www.ziprecruiter.com/jobs?search=${keywordEncoded}&location=${locationEncoded}`;
      } else {
        // LinkedIn (Default)
        targetUrl = `https://www.linkedin.com/jobs/search/?keywords=${keywordEncoded}&location=${locationEncoded ? locationEncoded : 'United%20States'}&f_AL=true`;
        
        // Time Posted
        if (message.datePosted === 'day') targetUrl += '&f_TPR=r86400';
        else if (message.datePosted === 'week') targetUrl += '&f_TPR=r604800';
        else if (message.datePosted === 'month') targetUrl += '&f_TPR=r2592000';
        
        // Work Styles (On-site/Remote/Hybrid)
        const wt = [];
        if (message.workStyles) {
          if (message.workStyles.onSite) wt.push('1');
          if (message.workStyles.remote) wt.push('2');
          if (message.workStyles.hybrid) wt.push('3');
        }
        if (wt.length > 0) {
          targetUrl += `&f_WT=${wt.join('%2C')}`;
        }

        // Job Types (Full-time/Contract/etc.)
        const jt = [];
        if (message.jobTypes) {
          if (message.jobTypes.fullTime) jt.push('F');
          if (message.jobTypes.partTime) jt.push('P');
          if (message.jobTypes.contract) jt.push('C');
          if (message.jobTypes.internship) jt.push('I');
        }
        if (jt.length > 0) {
          targetUrl += `&f_JT=${jt.join('%2C')}`;
        }
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
    appliedCount++;
    chrome.storage.local.set({ applied: appliedCount }, () => {
      chrome.runtime.sendMessage({ 
        action: 'UPDATE_STATS', 
        applied: appliedCount, 
        failed: failedCount,
        status: 'Applying'
      });
      
      if (appliedCount >= botLimit) {
        chrome.runtime.sendMessage({ action: 'STOP_BOT' });
      }
    });
  }

  else if (message.action === 'JOB_FAILED') {
    failedCount++;
    chrome.storage.local.set({ failed: failedCount }, () => {
      chrome.runtime.sendMessage({ 
        action: 'UPDATE_STATS', 
        applied: appliedCount, 
        failed: failedCount,
        status: 'Applying'
      });
    });
  }
});
