import {
  OmniRecall,
  OmniRecallStruct
} from './constants/constants.js';

// before adding a new url to history if history_limit exceeds the url length will trim the array.
// this function will first check for history_limit in settings
// now before adding a new url to history
// if len is less than history_limit and url doees not exist in history it will add the url
// else if history limit exceeds it will remove the oldest url and add the new one
// else if url already exists in history it will remove the url and add it to the end of the history
const addHistory = (url, domain, omnirecallData) => {
  const history = omnirecallData.history || {};
  const settings = omnirecallData.settings || {};
  const historyLimit = settings.history_limit || 10;
  const data = omnirecallData || {};

  if (!url || !domain) {
    console.error("Invalid URL or domain");
    return;
  }

  if (!history[domain]) {
    history[domain] = [];
  }

  while (history[domain].length >= historyLimit) {
    console.log("Deleting because history limit exceed:",historyLimit)
    history[domain].shift(); // Remove the oldest URL
  }

  // If the URL already exists, remove it before adding it to the end
  if (history[domain] && history[domain].includes(url)) {
    history[domain] = history[domain].filter(item => item !== url);
  }

  if (!history[domain].includes(url)) {
    history[domain].push(url);
  }

  chrome.storage.local.set({ 
    [OmniRecall]:  {
      ...data,
      history: history
    }}, () => {
      console.log(`Saved ${tab.url} for domain ${domain}`);
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url);
    const domain = url.hostname;

    // Check if the domain is excluded
    chrome.storage.local.get([OmniRecall], (result) => {
      const data = result[OmniRecall] || {}
      const exclusion_list = data.exclusion_list || {}

      if (exclusion_list[domain]) {
        console.log(`Domain ${domain} is excluded. Skipping...`);
        return;
      }

      const isRoot = (url.pathname === "/" || url.pathname === "")

      if (isRoot) {
        // this is the place if anyone want auto redirect
        return
      }

      addHistory(tab.url, domain, data);
    });
  }
});

// listiner for onpage button click
chrome.runtime.onMessage.addListener((message, sender, _) => {
  if (message.type === "navigate_to_saved_page") {
    const hostname = message.hostname;

    console.log(`Message received for ${hostname}`);

    chrome.storage.local.get([OmniRecall], (result) => {
      const data = result[OmniRecall];
      const savedUrls = data?.history?.[hostname];

      if (savedUrls?.length && sender.tab?.id) {
        // TODO: Navigate to the first saved URL for this domain this will be udpated later
        chrome.tabs.update(sender.tab.id, { url: savedUrls[savedUrls.length - 1] });
      } else {
        console.log(`No saved URLs found for ${hostname}`);
      }
    });
  }
});

// structure initializer
const initializeOmnirecall = () => {
  chrome.storage.local.get('omnirecall', (result) => {
    if (!result.omnirecall) {
      chrome.storage.local.set({ omnirecall: OmniRecallStruct }, () => {
        console.log('Omnirecall initialized in chrome.storage.local');
      });
    } else {
      console.log('Omnirecall already exists in chrome.storage.local');
    }
  });
}

initializeOmnirecall();
