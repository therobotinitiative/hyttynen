import { useState, useEffect, useRef } from 'react';
import './App.css';

function StatusDot({ connected }) {
  return <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />;
}

function Bar({ percent, color }) {
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${Math.min(percent, 100)}%`, background: color }} />
    </div>
  );
}

function thresholdColor(percent, warnAt = 60, dangerAt = 85) {
  if (percent >= dangerAt) return '#ff4757';
  if (percent >= warnAt) return '#ffb347';
  return '#00d084';
}

export default function App() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    function connect() {
      const wspath = `ws://hyttynen/codebreaker/hyttynen/ws`;
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
          setData(JSON.parse(e.data));
          setLastUpdate(new Date());
        } catch {}
      };
    }
    connect();
    return () => wsRef.current?.close();
  }, []);

  const cpuColor = data ? thresholdColor(data.cpu.load_percent, 50, 80) : '#00d084';
  const tempColor = data ? thresholdColor((data.cpu.temp_c / 100) * 100, 60, 80) : '#00d084';
  const memPercent = data ? Math.round((data.memory_mb.used / data.memory_mb.total) * 100) : 0;
  const memColor = thresholdColor(memPercent);
  const diskColor = data ? thresholdColor(data.disk_root.used_percent) : '#00d084';

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>HW Monitor</h1>
          {data && <span className="device-tag">{data.device}</span>}
        </div>
        <div className="header-right">
          <StatusDot connected={connected} />
          <span className="conn-label">{connected ? 'Live' : 'Offline'}</span>
          {lastUpdate && <span className="last-update">{lastUpdate.toLocaleTimeString()}</span>}
        </div>
      </header>

      {!data ? (
        <div className="waiting">
          <div className="spinner" />
          <p>Waiting for data from MQTT...</p>
        </div>
      ) : (
        <main className="grid">

          {/* System */}
          <div className="card span2">
            <div className="card-title">System</div>
            <div className="info-row">
              <div className="info-cell">
                <div className="info-label">Device</div>
                <div className="info-value">{data.device}</div>
              </div>
              <div className="info-cell">
                <div className="info-label">OS</div>
                <div className="info-value">{data.os}</div>
              </div>
              <div className="info-cell wide">
                <div className="info-label">Uptime</div>
                <div className="info-value">{data.uptime}</div>
              </div>
            </div>
          </div>

          {/* CPU */}
          <div className="card">
            <div className="card-title">CPU</div>
            <div className="metrics-row">
              <div className="metric">
                <div className="metric-label">Load</div>
                <div className="metric-value" style={{ color: cpuColor }}>
                  {data.cpu.load_percent}<span className="metric-unit">%</span>
                </div>
                <Bar percent={data.cpu.load_percent} color={cpuColor} />
              </div>
              <div className="metric">
                <div className="metric-label">Temp</div>
                <div className="metric-value" style={{ color: tempColor }}>
                  {data.cpu.temp_c}<span className="metric-unit">°C</span>
                </div>
                <Bar percent={(data.cpu.temp_c / 100) * 100} color={tempColor} />
              </div>
            </div>
          </div>

          {/* Memory */}
          <div className="card">
            <div className="card-title">Memory</div>
            <div className="big-number" style={{ color: memColor }}>{memPercent}%</div>
            <Bar percent={memPercent} color={memColor} />
            <div className="detail-row">
              <span>Used {(data.memory_mb.used / 1024).toFixed(1)} GB</span>
              <span>Free {(data.memory_mb.free / 1024).toFixed(1)} GB</span>
              <span>Total {(data.memory_mb.total / 1024).toFixed(1)} GB</span>
            </div>
          </div>

          {/* Disk */}
          <div className="card span2">
            <div className="card-title">Disk /</div>
            <div className="disk-row">
              <div className="big-number" style={{ color: diskColor }}>{data.disk_root.used_percent}%</div>
              <div className="disk-bar-col">
                <Bar percent={data.disk_root.used_percent} color={diskColor} />
                <div className="detail-row">
                  <span>Used {data.disk_root.used}</span>
                  <span>Total {data.disk_root.total}</span>
                </div>
              </div>
            </div>
          </div>

        </main>
      )}
    </div>
  );
}
