import { thresholdColor, Bar } from "../utils/HelperUtils";

const Cpu = ( { cpu } ) => {
  const cpuColor = cpu ? thresholdColor(cpu.load_percent, 50, 80) : '#00d084';
  const tempColor = cpu ? thresholdColor((cpu.temp_c / 100) * 100, 60, 80) : '#00d084';
    return (
          <div className="card">
            <div className="card-title">CPU</div>
            <div className="metrics-row">
              <div className="metric">
                <div className="metric-label">Load</div>
                <div className="metric-value" style={{ color: cpuColor }}>
                  {cpu.load_percent}<span className="metric-unit">%</span>
                </div>
                <Bar percent={cpu.load_percent} color={cpuColor} />
              </div>
              <div className="metric">
                <div className="metric-label">Temp</div>
                <div className="metric-value" style={{ color: tempColor }}>
                  {cpu.temp_c}<span className="metric-unit">°C</span>
                </div>
                <Bar percent={(cpu.temp_c / 100) * 100} color={tempColor} />
              </div>
            </div>
          </div>
    );
}
export default Cpu;