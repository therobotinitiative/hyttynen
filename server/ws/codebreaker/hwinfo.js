const WebSocket = require('ws');
const mqtt = require('mqtt');

let lastHwInfo = null;

const MQTT_URL="mqtt://mqtt:1883";
const MQTT_TOPIC="hwinfo";

module.exports = {
    hwinfo: function( ) {
        const webSocketServer = new WebSocket.Server({
            noServer: true
        });

        // Handle web socket connection
        webSocketServer.on('connection', (ws) => {
            if (lastHwInfo != null) {
                console.log('WebSocket client connected, total:', webSocketServer.clients.size);
                ws.send(JSON.stringify(lastHwInfo));
            }
            ws.on('close', () => console.log('WebSocket client disconnected, total:', webSocketServer.clients.size));
        });
        const mqttClient = mqtt.connect(MQTT_URL, { reconnectPeriod: 5000 });

        // Subscribe to MQTT topic
        console.log('Connected to MQTT broker');
        mqttClient.subscribe(MQTT_TOPIC, (err) => {
            if (err) console.error('Subscribe error:', err);
            else console.log('Subscribed to topic:', MQTT_TOPIC);
        });

        mqttClient.on('error', (err) => console.error('MQTT error:', err.message));
        mqttClient.on('reconnect', () => console.log('Reconnecting to MQTT...'));

        // handle MQTT message
        mqttClient.on('message', (topic, message) => {
            console.log('mqtt: message');
            try {
                lastHwInfo = JSON.parse(message.toString());
            } catch (e) {
                console.error('Failed to parse MQTT message:', e.message);
            }
        });

        return {
            socket: webSocketServer,
            path: '/codebreaker/hwinfo'
        };
    }
}