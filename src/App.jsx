import React, { useEffect, useState } from 'react';
import './App.css';
import './Bulma.css';

import Settings from './Settings';
import History from './History';

function App() {
  const [settings, setSettings] = useState(false);

  return (
    <div className="popup-container">
      {settings? (
        <Settings setSettings={setSettings}/>
      ) : (
        <History setSettings={setSettings}/>
      )}
    </div>
  );
}

export default App
