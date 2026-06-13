import { useState, useEffect, useRef } from 'react';
import './App.css';
import './MainPage.css';

function StatusDot({ connected }) {
  return <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />;
}

export default function App() {
  const [machines, setMachines]= useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

   useEffect(() => {
    function connect() {
      const wspath = `ws://localhost:5000/codebreaker/machines`;
      const ws = new WebSocket(wspath);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        try {
            setMachines(JSON.parse(e.data));
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
        Machines:<br />
        <ul>
          {machines?.map((m) => (
            <li key={m.name} className='list-row pointer'>
              <a href={m.url}>
                { m.name }
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
