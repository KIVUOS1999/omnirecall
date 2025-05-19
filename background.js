import {
  OmniRecall,
  OmniRecallStruct
} from './constants/constants.js';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url);
    const domain = url.hostname;

    // Check if the domain is excluded
    chrome.storage.local.get([OmniRecall], (result) => {
      const data = result[OmniRecall] || {}
      const exclusion_list = data.exclusion_list || {}
      const history = data.history || {};

      if (exclusion_list[domain]) {
        console.log(`Domain ${domain} is excluded. Skipping...`);
        return;
      }

      const isRoot = (url.pathname === "/" || url.pathname === "")

      if (isRoot) {
        // this is the place if anyone want auto redirect
        return
      }

      if (!history[domain]) {
        history[domain] = [];
      }

      if (!history[domain].includes(tab.url)) {
        history[domain].push(tab.url);
      }

      chrome.storage.local.set({ 
        [OmniRecall]:  {
          ...data,
          history: history
        }}, () => {
          console.log(`Saved ${tab.url} for domain ${domain}`);
      });
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
