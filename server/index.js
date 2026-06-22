const express = require('express');
const app = express();
const http = require('http');

// Web Sockets
const HyttynenServer = require('./ws/codebreaker/HyttynenServer');
const HWInfoServer = require('./ws/codebreaker/HWInfoServer');
const UIComponents = require('./ws/codebreaker/UIComponents');

console.log('========================-- -- -');
console.log('Hyttynen Server starting');

// Create HTTP server
const server = http.createServer(app);

// Start hyttynen websocket server
HyttynenServer.HyttynenStart();
// Start MQTT dispatcher
HWInfoServer.startServer();
UIComponents.startServer();

// Start http server
server.listen(5000, () => {
    console.log('Listening to port 5000');
});