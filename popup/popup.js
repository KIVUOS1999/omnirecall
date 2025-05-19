const OmniRecall = "omnirecall"

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs.length === 0) return;

  const currentTab = tabs[0];
  const domain = new URL(currentTab.url).hostname;

  document.getElementById('domain').textContent = domain;

  isExcluded(domain, (excluded) => {
    console.log(`isExcluded: ${excluded}`);
    if (excluded) {
      console.log(`Domain ${domain} is excluded. Skipping...`);
      formatExclusion();
      return;
    }

    console.log(`Domain ${domain} is not excluded.`);
    formatInclusion()

    const historyCnt = document.getElementById("history-count")

   chrome.storage.local.get([OmniRecall], (result) => {
      const data = result[OmniRecall] || {}
      console.log("Formatted JSON:", JSON.stringify(data, null, 2));

      const history = data.history || {};
      const domainList = history[domain]

      const urlContainer = document.getElementById('url');
      console.log(`popup.js total saved: ${domainList?.length}`)

      if (domainList?.length > 0) {
        historyCnt.textContent = `Visited: ${domainList.length}`

        const ul = document.createElement('div')
        ul.classList.add("url-list")

        domainList.forEach((url, index) => {
            const a = document.createElement('a')
            a.href = `${url}`

            const li = document.createElement('div');
            li.classList.add("url-list-item")
            li.textContent = `${index + 1}: ${url}`;
            
            a.appendChild(li)
            urlContainer.appendChild(a);
        });
        
        return
     }

    });
  });
});


const excludeURL = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;

    const domain = new URL(tabs[0].url).hostname;

    chrome.storage.local.get([OmniRecall], (result) => {
      const data = result[OmniRecall] || {};
      const exclusionList = data.exclusion_list || {};

      if (!exclusionList[domain]) {
        exclusionList[domain] = true;

        // Also remove any history if it exists for that domain
        if (data.history && data.history[domain]) {
          delete data.history[domain];
        }

        // Save updated structure
        chrome.storage.local.set({
          [OmniRecall]: {
            ...data,
            exclusion_list: exclusionList
          }
        }, () => {
          console.log(`Excluded domain added: ${domain}`);
        });
      } else {
        console.log(`${domain} is already excluded.`);
      }
    });
  });
};

const includeURL = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;

    const url = tabs[0].url;
    const domain = new URL(url).hostname;

    chrome.storage.local.get([OmniRecall], (result) => {
      const data = result[OmniRecall] || {};
      const exclusionList = data.exclusion_list || {};
      const history = data.history || {};

      // Remove domain from exclusion list
      if (exclusionList[domain]) {
        delete exclusionList[domain];
        console.log(`Excluded domain removed: ${domain}`);
      } else {
        console.log(`${domain} is not excluded.`);
      }

      // Save current URL under history for the domain
      if (!history[domain]) {
        history[domain] = [];
      }

      if (!history[domain].includes(url)) {
        history[domain].push(url);
      }

      // Save updated structure back to storage
      chrome.storage.local.set({
        [OmniRecall]: {
          ...data,
          exclusion_list: exclusionList,
          history: history
        }
      }, () => {
        console.log(`Saved ${url} for domain ${domain}`);
      });
    });
  });
};

const isExcluded = (domain, callback) => {
  console.log(`Checking if ${domain} is excluded...`);

  chrome.storage.local.get([OmniRecall], (result) => {
    const data = result[OmniRecall] || {};
    const exclusionList = data.exclusion_list || {};
    const excluded = exclusionList[domain] === true;

    console.log(`${domain} is excluded: ${excluded}`);
    callback(excluded);
  });
};


const formatExclusion = ()=>{
    document.getElementById('url').textContent = "";
    document.getElementById('history-count').textContent = ""
    document.getElementById('exclude').style.display = "none";
    document.getElementById('include').style.display = "block";
}

const formatInclusion = ()=>{
   chrome.storage.local.get(domain, function (result) {
        const lastVisited = result[domain];
        document.getElementById('url').textContent = lastVisited ? lastVisited : "";
    });
    document.getElementById('include').style.display = "none";
    document.getElementById('exclude').style.display = "block";
}

document.getElementById('exclude').addEventListener('click', () => {
    excludeURL();
    formatExclusion()
})

document.getElementById('include').addEventListener('click', () => {
    includeURL()
    formatInclusion()
})

