import { useState, useEffect, useRef } from 'react';
import '../App.css';
import '../MainPage.css';

function StatusDot({ connected }) {
  return <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />;
}

export default function Home() {
  const [devices, setDevices]= useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

   useEffect(() => {
    function connect() {
      const webSocketPath = `ws://localhost:5000/codebreaker/devices`;
      const webSocket = new WebSocket(webSocketPath);
      wsRef.current = webSocket;

      webSocket.onopen = () => setConnected(true);
      webSocket.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };
      webSocket.onerror = () => webSocket.close();
      webSocket.onmessage = (e) => {
        try {
            setDevices(JSON.parse(e.data));
        } catch {}
      };
    }
    connect();
    return () => wsRef.current?.close();
  }, []);

 return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>Hyttynen</h1>
        </div>
        <div className="header-right">
          <StatusDot connected={connected} />
          <span className="conn-label">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </header>

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
    </div>
  );
}
