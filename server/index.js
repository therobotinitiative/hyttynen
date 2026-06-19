const express = require('express');
const app = express();
const http = require('http');

// Web Sockets
const device = require('./ws/codebreaker/devices');
const hwInfo = require('./ws/codebreaker/hwinfo');
const hyttynen = require('./ws/codebreaker/hyttynen');

console.log('========================-- -- -');
console.log('Hyttynen Server starting');

// Create HTTP server
const server = http.createServer(app);

// List of web socket end points
const webSocketEndPoints = new Array();

// Initialize web sockets
webSocketEndPoints.push(hyttynen.server());

// Starting WebSocket server
device.devices(server);

server.listen(5000, () => {
    console.log('Listening to port 5000');
});