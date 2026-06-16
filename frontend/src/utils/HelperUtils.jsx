export function thresholdColor(percent, warnAt = 60, dangerAt = 85) {
  if (percent >= dangerAt) return '#ff4757';
  if (percent >= warnAt) return '#ffb347';
  return '#00d084';
}

export function Bar({ percent, color }) {
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${Math.min(percent, 100)}%`, background: color }} />
    </div>
  );
}