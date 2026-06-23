const HyttynenServer = require("./HyttynenServer");
const mqtt = require('mqtt');

const MQTT_URL=process.env.MQTT_URL || "mqtt://localhost:1883";
const MQTT_TOPIC=process.env.MQTT_TOPIC || "hyttynen";

const MESSAGE_TYPE = "hwinfo";

module.exports = {
    // Start mqtt dispatcher server
    startServer:function() {
        // Connect to MQTT
        console.log('[HWInfoServer::startServer] Connecting to MQTT ');
        const mqttClient = mqtt.connect(MQTT_URL, { reconnectPeriod: 5000 });

        // Subscribe to MQTT topic
        console.log('[HWInfoServer::startServer] Subscribing to ' + MQTT_TOPIC + ' on MQTT broker');
        mqttClient.subscribe(MQTT_TOPIC, (err) => {
            if (err) console.error('[HWInfoServer::startServer] Subscribe error:', err);
            else console.log('[HWInfoServer::startServer] Subscribed to topic:', MQTT_TOPIC);
        });

        mqttClient.on('error', (err) => console.error('[HWInfoServer::startServer.mqttClient] MQTT error:', err.message));
        mqttClient.on('reconnect', () => console.log('[HWInfoServer::startServer,mqttClient] Reconnecting to MQTT'));

        mqttClient.on('message', (topic, message) => {
            console.log('[HWInfoServer::startServer.mqttClient] message received');
            const hwi = {
                messageType : MESSAGE_TYPE,
                data : JSON.parse(message)
            };
            this.dispatchMQTTMessage(hwi);
        });
    },
    dispatchMQTTMessage:function(mqttMessage) {
        if (mqttMessage instanceof Object) {
            const strMessage = JSON.stringify(mqttMessage);
            HyttynenServer.sendMessage(strMessage);
        }
        else {
            throw Error('[HInfo::dispathMQTTMessage] mqttMessage is not object')
        }
    }
}