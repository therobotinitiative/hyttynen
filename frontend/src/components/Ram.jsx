import { thresholdColor, Bar } from "../utils/HelperUtils";

const Ram = ({ memory }) => {
    const memPercent = memory ? Math.round((memory.used / memory.total) * 100) : 0;
    const memColor = thresholdColor(memPercent);
    
    return (<div className="card">
            <div className="card-title">Memory</div>
            <div className="big-number" style={{ color: memColor }}>{memPercent}%</div>
            <Bar percent={memPercent} color={memColor} />
            <div className="detail-row">
                <span>Used {(memory.used / 1024).toFixed(1)} GB</span>
                <span>Free {(memory.free / 1024).toFixed(1)} GB</span>
                <span>Total {(memory.total / 1024).toFixed(1)} GB</span>
            </div>
        </div>);
}
export default Ram;