chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        const url = new URL(tab.url);
        const domain = url.hostname;

        // Check if the domain is excluded
        chrome.storage.local.get('excludedDomains', (result) => {
            const excludedDomains = JSON.parse(result.excludedDomains || '{}');
            if (excludedDomains[domain]) {
                console.log(`Domain ${domain} is excluded. Skipping...`);
                return;
            }

            const isRoot = (url.pathname === "/" || url.pathname === "")

            if (isRoot) {
                chrome.storage.local.get(domain, (result) => {
                const lastVisited = result[domain];

                console.log(`Last visited for ${domain}: ${lastVisited}`);
                if (lastVisited && lastVisited !== tab.url) { 
                    chrome.tabs.update(tabId, { url: lastVisited });
                }
                });
            }

            chrome.storage.local.set({ [domain]: tab.url }, () => {
                console.log(`Saved ${tab.url} for domain ${domain}`);
            });
        });
    }
});

