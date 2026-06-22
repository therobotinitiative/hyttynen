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

export function getWebSocketMessage(message) {
  console.log('[getWebSocketMessage] invoked');

  let rawData = message.data;
  // "Decode" data
  if(message.data instanceof Blob) {
      rawData = async () => { await message.data.text(); }
  } else if (message.data instanceof ArrayBuffer) {
      rawData = new TextDecoder('utf-8').decode(message.data);
  }
  
  return rawData;
}