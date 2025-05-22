import React, { useEffect, useState } from 'react';
import './App.css';
import './Bulma.css';

function App() {
  const OmniRecall = "omnirecall";
  const [domain, setDomain] = useState('');
  const [isExcluded, setIsExcluded] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;
      const currentTab = tabs[0];
      const url = new URL(currentTab.url);
      const domainName = url.hostname;
      setDomain(domainName);

      chrome.storage.local.get([OmniRecall], (result) => {
        const data = result[OmniRecall] || {};
        const excluded = data.exclusion_list?.[domainName] === true;
        setIsExcluded(excluded);

        if (!excluded) {
          const domainHistory = data.history?.[domainName] || [];
          setHistoryList(domainHistory);
        }
      });
    });
  }, []);

  const excludeURL = () => {
    chrome.storage.local.get([OmniRecall], (result) => {
      const data = result[OmniRecall] || {};
      const exclusionList = { ...data.exclusion_list, [domain]: true };

      // Remove history if exists
      if (data.history?.[domain]) {
        delete data.history[domain];
      }

      chrome.storage.local.set({
        [OmniRecall]: { ...data, exclusion_list: exclusionList }
      }, () => setIsExcluded(true));
    });
  };

  const includeURL = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;
      const currentURL = tabs[0].url;

      chrome.storage.local.get([OmniRecall], (result) => {
        const data = result[OmniRecall] || {};
        const exclusionList = { ...data.exclusion_list };
        delete exclusionList[domain];

        const history = data.history || {};
        if (!history[domain]) history[domain] = [];
        if (!history[domain].includes(currentURL)) history[domain].push(currentURL);

        chrome.storage.local.set({
          [OmniRecall]: { ...data, exclusion_list: exclusionList, history }
        }, () => {
          setIsExcluded(false);
          setHistoryList(history[domain]);
        });
      });
    });
  };

  return (
    <div className="popup-container">
      <h3>Domain: {domain}</h3>
      {!isExcluded ? (
        <>
          <h3>History: {historyList.length}</h3>
          <hr/>

          <div className="url-list">
            {historyList.map((url, index) => (
              <div className='url-list-item'>
                <a href={url} target="_blank" key={index} className="url-list-item">{index + 1}: {url}</a>
              </div>
            ))}
          </div>

          <hr/>
          <button onClick={excludeURL} className='button is-danger'>Exclude</button>
        </>
      ) : (
        <div>
          <hr/>

          <p>This domain is excluded.</p>

          <hr/>
          <button onClick={includeURL} className="button is-success">Include</button>
        </div>
      )}
    </div>
  );
}

export default App
