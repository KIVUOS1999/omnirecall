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
        chrome.storage.local.get(domain, function (result) {
            const lastVisited = result[domain];
            document.getElementById('url').textContent = lastVisited ? lastVisited : "We will catch you next time!";
        });
    });
});


const excludeURL = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;

        domain = new URL(tabs[0].url).hostname;

        chrome.storage.local.get('excludedDomains', (result) => {
            let excludedDomains = JSON.parse(result.excludedDomains || '{}');

            if (!excludedDomains[domain]) {
                excludedDomains[domain] = true;
                chrome.storage.local.remove(domain)
                chrome.storage.local.set({'excludedDomains': JSON.stringify(excludedDomains)});
                console.log(`Excluded domain added: ${domain}`);
            } else {
                console.log(`${domain} is already excluded.`);
            }
        });
    })
}

const includeURL = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;

        domain = new URL(tabs[0].url).hostname;

        chrome.storage.local.get('excludedDomains', (result) => {
            let excludedDomains = JSON.parse(result.excludedDomains || '{}');

            if (excludedDomains[domain]) {
                delete excludedDomains[domain];
                chrome.storage.local.set({'excludedDomains': JSON.stringify(excludedDomains)});
                console.log(`Excluded domain removed: ${domain}`);
            } else {
                console.log(`${domain} is not excluded.`);
            }
        });

        chrome.storage.local.set({ [domain]: tabs[0].url }, () => {
            console.log(`Saved ${tabs[0].url} for domain ${domain}`);
        });
    })
}

const isExcluded = (domain, callback) => {
    console.log(`Checking if ${domain} is excluded...`);

    chrome.storage.local.get('excludedDomains', (result) => {
        let excludedDomains = JSON.parse(result.excludedDomains || '{}');
        console.log(`${domain} is excluded ${excludedDomains[domain]}`);
        const isExcluded = excludedDomains[domain] == true;
        callback(isExcluded);
    });
}

const formatExclusion = ()=>{
    document.getElementById('url').textContent = "";
    document.getElementById('exclude').style.display = "none";
    document.getElementById('include').style.display = "block";
}

const formatInclusion = ()=>{
   chrome.storage.local.get(domain, function (result) {
        const lastVisited = result[domain];
        document.getElementById('url').textContent = lastVisited ? lastVisited : "We will catch you next time!";
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

