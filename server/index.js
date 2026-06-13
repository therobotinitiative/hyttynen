const express = require('express');
const app = express();
const http = require('http');

// Web Sockets
const machines = require('./ws/codebreaker/machines');
const hwInfo = require('./ws/codebreaker/hwinfo');

console.log('========================-- -- -');
console.log('Hyttynen Server starting');

// Create HTTP server
const server = http.createServer(app);

// List of web socket end points
const webSocketEndPoints = new Array();

// Initialize web sockets
webSocketEndPoints.push(machines.machines());
webSocketEndPoints.push(hwInfo.hwinfo());

console.log('Handle upgrade event');
// handle 'upgrade' message, multiplex web sockets.
server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url, `http://${request.headers.host}`);
    for (const wse of webSocketEndPoints) {
        if (wse && pathname === wse.path) {
            wse.socket.handleUpgrade(request, socket, head, (ws) => {
                wse.socket.emit('connection', ws, request);
            });
            
            // CRITICAL: Stop iterating immediately once the socket is claimed!
            break; 
        }
    }
})

// GET endpoints
console.log('Register GET end points');
app.get('/', (req, res) => {
      res.send('Hello from Hyttynen server at port 5000');
})

server.listen(5000, () => {
    console.log('Listening to port 5000');
});