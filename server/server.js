const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const mqtt = require('mqtt');
const path = require('path');

const MQTT_URL = 'mqtt://mqtt:1883';
const MQTT_TOPIC = 'hwinfo';
const PORT = 80;

const app = express();

app.use('/hyttynen', express.static(path.join(__dirname, 'public', 'hyttynen')));
app.get('/hyttynen/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'hyttynen', 'index.html'));
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/codebreaker/hyttynen/ws' });

let latestData = null;

const mqttClient = mqtt.connect(MQTT_URL, { reconnectPeriod: 5000 });

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (err) console.error('Subscribe error:', err);
    else console.log('Subscribed to topic:', MQTT_TOPIC);
  });
});

mqttClient.on('error', (err) => console.error('MQTT error:', err.message));
mqttClient.on('reconnect', () => console.log('Reconnecting to MQTT...'));

mqttClient.on('message', (topic, message) => {
  try {
    latestData = JSON.parse(message.toString());
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(latestData));
      }
    });
  } catch (e) {
    console.error('Failed to parse MQTT message:', e.message);
  }
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected, total:', wss.clients.size);
  if (latestData) ws.send(JSON.stringify(latestData));
  ws.on('close', () => console.log('WebSocket client disconnected, total:', wss.clients.size));
});

server.listen(PORT, () => console.log(`Hyttynen listening on port ${PORT}`));
