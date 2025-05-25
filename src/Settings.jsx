import React, { useEffect, useState } from 'react';
import './Settings.css'
import './Bulma.css'

function Settings( {setSettings} ) {
    const [historyLimit, setHistoryLimit] = useState(10);

    const homepage = ()=> {
        console.debug("cliced back btn", setSettings)
        setSettings(false)
    }

    const increment = (setState) => {
        setState(prevLimit => prevLimit + 1);
    }

    const decrement = () => {
        setHistoryLimit(prevLimit => Math.max(1, prevLimit - 1));
    }

    const UpdateSettings = () => {
        chrome.storage.local.get(['omnirecall'], (result) => {
            const data = result.omnirecall || {};
            data.settings = data.settings || {};
            data.settings.history_limit = historyLimit;

            chrome.storage.local.set({ omnirecall: data }, () => {
                console.log('Settings updated:', data.settings);
            });
        })
    }

    useEffect(() => {
        console.log('Loading settings...');
        chrome.storage.local.get(['omnirecall'], (result) => {
            const data = result.omnirecall || {};
            const settings = data.settings || {};
            setHistoryLimit(settings.history_limit || 10);
        });
    }, []);

    return (
     <div className='settings'>
        <div className='settings-label'>Settings</div>

        <hr/>
        <div className='settings-item'>
            <div className='settings-name'>History Limit:</div>
            <div className='settings-value-action' onClick={() => decrement(setHistoryLimit)}>-</div>
            <div className='settings-value'>{historyLimit}</div>
            <div className='settings-value-action' onClick={() => increment(setHistoryLimit)}>+</div>
        </div>

        <hr />
        <button className="button is-success" onClick={UpdateSettings}>Update</button>
        <button className='button is-danger' onClick={homepage}>Close</button>
     </div>
    )
}

export default Settings;