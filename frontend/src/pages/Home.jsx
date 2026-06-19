import { useState, useEffect, useRef } from 'react';
import '../App.css';
import '../MainPage.css';
import { useHyttynen } from '../context/HyttynenProvider';

function StatusDot({ connected: connectionStatus }) {
  return <span className={`status-dot ${connectionStatus}`} />;
}

export default function Home() {
  const [devices, setDevices]= useState(null);
  const { connectionState, openHyttynen, closeHyttynen, addListener, removeListener } = useHyttynen();

  const uiCompoonentsListener = (message) => {
    console.log('UI Components message');
    const uic = JSON.parse(message);
    if(uic.type=='devices') {
      setDevices(uic.deviceList);
    }
    
  }

  const openConnection = () => {
    openHyttynen();
    addListener(uiCompoonentsListener);
  }

  const closeConnection = () => {
    closeHyttynen();

    setDevices(null);
    removeListener(uiCompoonentsListener);
  }

 return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>Hyttynen</h1>
        </div>
        <div className="header-right">
          <StatusDot connected={connectionState()} />
          <span className="conn-label">{connectionState()}</span>
        </div>
      </header>

      <main>
        <button onClick={ openConnection }>
          Connect
        </button>
        <button onClick={ closeConnection }>
          Close
        </button>
        Devices:<br />
        <ul>
          {devices?.map((device) => (
            <li key={device.name} className='list-row pointer'>
              <a href={`device/${device.url}`}>
                { device.name }
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
