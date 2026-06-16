import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Cpu from "../components/Cpu";
import Disks from "../components/Disks";
import Ram from "../components/Ram";
import Loading from "../components/Loading";

let reconnectTime = 3000;

function StatusDot({ connected }) {
  return <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />;
}

function thresholdColor(percent, warnAt = 60, dangerAt = 85) {
  if (percent >= dangerAt) return '#ff4757';
  if (percent >= warnAt) return '#ffb347';
  return '#00d084';
}

const Device = () => {
    const { deviceId } = useParams();
    const [data, setData] = useState(null);
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

  const wsRef = useRef(null);

    useEffect(() => {
    function connect() {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wspath = `ws://localhost:5000/codebreaker/hwinfo`;

      const ws = new WebSocket(wspath);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, reconnectTime);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
    try {
      if (e.data === "na") {
        if(reconnectTime < 5000) {
          reconnectTime += 500;
        }
        console.log('na received, reconnecting in '+reconnectTime+'ms');
      } else {
            const json = JSON.parse(e.data);
            console.log('===> received message: '+json);
//            if(json.device === deviceId) {
                setData(json);
                setLastUpdate(new Date());
//            }
        }
      } catch {}
      };
    }
    connect();
    return () => wsRef.current?.close();
  }, []);

    return (<>
    <header className="header">
        <div className="header-left">
          <h1>HW Monitor</h1>
          {data && <span className="device-tag">{deviceId}</span>}
        </div>
        <div className="header-right">
          <StatusDot connected={connected} />
          <span className="conn-label">{connected ? 'Live' : 'Offline'}</span>
          {lastUpdate && <span className="last-update">{lastUpdate.toLocaleTimeString()}</span>}
        </div>
    </header>
    {!data ? <Loading /> : (
        <main className="grid">
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
        <Cpu cpu={data.cpu} />
        <Ram memory={data.memory_mb} />
        <Disks diskArray={data.disks} />
        </main>
    )}
    </>);
}
export default Device;