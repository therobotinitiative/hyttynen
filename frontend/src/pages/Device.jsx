import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Cpu from "../components/Cpu";
import Disks from "../components/Disks";
import Ram from "../components/Ram";
import Loading from "../components/Loading";
import { useHyttynen } from "../context/HyttynenProvider";

let reconnectTime = 3000;

function thresholdColor(percent, warnAt = 60, dangerAt = 85) {
  if (percent >= dangerAt) return '#ff4757';
  if (percent >= warnAt) return '#ffb347';
  return '#00d084';
}

const Device = () => {
    const { deviceId } = useParams();

    const [data, setData] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    const { register } = useHyttynen();

    /**
     * Message handler for "hwinfo" message type.
     * @param {*} message 
     */
    const dataListener = (message) => {
      const device = message.data.device.trim();
      console.log(`[Device::dataListener] received data for device ${device}], message device: [${message.data.device}]`);
      
      if (device==deviceId) {
        //console.log('[Device::dataListener]: Received data for ', device);
        setData(message.data);
        setLastUpdate(new Date());
      }
      else {
        console.log(`[Device::dataListener] device data: [${device}], current page device id: [${deviceId}]`);
      }
    }
    register("hwinfo", dataListener);

    if(!data) {
      return <Loading deviceName={deviceId} />;
    }

    return (<main className="grid">
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
      );
}
export default Device;