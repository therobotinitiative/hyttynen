const WebSocket = require('ws');
const mqtt = require('mqtt');

const MQTT_URL="mqtt://localhost:1883";
const MQTT_TOPIC="hwinfo";

let activeClients = new Set();

module.exports = {
    hwinfo: function( ) {
        const webSocketServer = new WebSocket.Server({
            noServer: true
        });

        // Handle web socket connection
        webSocketServer.on('connection', (webSocket) => {
            console.log('WebSocket client connected');
            activeClients.add(webSocket);

            webSocket.on('close', () => {
                console.log('WebSocket client disconnected');
                activeClients.delete(webSocket);
            });
        });
        const mqttClient = mqtt.connect(MQTT_URL, { reconnectPeriod: 5000 });

        // Subscribe to MQTT topic
        console.log('Subscribing to ' + MQTT_TOPIC + ' on MQTT broker');
        mqttClient.subscribe(MQTT_TOPIC, (err) => {
            if (err) console.error('Subscribe error:', err);
            else console.log('Subscribed to topic:', MQTT_TOPIC);
        });

        mqttClient.on('error', (err) => console.error('===> MQTT error:', err.message));
        mqttClient.on('reconnect', () => console.log('===> Reconnecting to MQTT...'));

        // handle MQTT message and send it to all open web socket
        mqttClient.on('message', (topic, message) => {
            console.log('===> MQTT message received');
            for (let client of activeClients) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            }
        });

        return {
            socket: webSocketServer,
            path: '/codebreaker/hwinfo'
        };
    }
}