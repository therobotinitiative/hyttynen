import { thresholdColor, Bar } from "../utils/HelperUtils";

const Disks = ({ diskArray }) => {
//style={color: thresholdColor(disk.used_percent)}
 //git diffstyle={thresholdColor(disk.used_percent)}
return (
    <>
        {diskArray.map((disk) => (
            <div className="card span2" key={disk.mount_point}>
                <div className="card-title">Disk {disk.mount_point}</div>
                <div className="disk-row">
                    <div className="big-number">{disk.used_percent}%</div>
                    <div className="disk-bar-col">
                        <Bar percent={disk.used_percent} />
                        <div className="detail-row">
                            <span>Used {disk.used}</span>
                            <span>Total {disk.total}</span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </>
);

}
export default Disks;