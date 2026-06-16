const WebSocket = require('ws');

module.exports = {
    devices: function() {
        const webSocketServer = new WebSocket.Server({
            noServer: true
        });
        webSocketServer.on('connection', (webSocket) => {
            console.log('WebSocket client connected, total:', webSocketServer.clients.size);
            const machines = [
                { "name": "dharma", "url": "dharma" },
                { "name": "garden", "url": "garden" }
            ];
            webSocket.send(JSON.stringify(machines));
            webSocket.on('close', () => console.log('WebSocket client disconnected, total:', webSocketServer.clients.size));
        });
        return {
            socket: webSocketServer,
            path: '/codebreaker/devices'
        };
    }
}