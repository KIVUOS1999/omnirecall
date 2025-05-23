import './Settings.css'

function Settings() {
    return (
     <div className='settings'>
        <div className='settings-item'>
            <div className='settings-name'>History Limit:</div>
            <div className='settings-value-action'>-</div>
            <div className='settings-value'>10</div>
            <div className='settings-value-action'>+</div>
        </div>
     </div>
    )
}

export default Settings;