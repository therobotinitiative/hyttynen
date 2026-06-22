import { useState, useEffect, useRef, useCallback } from 'react';
import '../App.css';
import '../MainPage.css';
import { useHyttynen } from '../context/HyttynenProvider';

function StatusDot({ connected: connectionStatus }) {
  return <span className={`status-dot ${connectionStatus}`} />;
}

export default function Home() {
  const [devices, setDevices] = useState(null);
  const { connectionState, register, unregister } = useHyttynen();

  const uiCompoonentsListener = useCallback((message) => {
      const uic = message;
      
      if(uic.messageType=='uidt') {
        console.log('[Home::uiComponentListener.messageType] ', uic.messageType, ' with ', uic.devicesList);
        
        setDevices(uic.devicesList);
      }
  });

  useEffect(() => {
    console.log('[Home::init] Registering UI Component listener');
    register("uidt", uiCompoonentsListener);
    return () => { /* unregister */ }
  }, []);

 return (
      <main>
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
  );
}
