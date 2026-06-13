const WebSocket = require('ws');

module.exports = {
    machines: function() {
        const wss = new WebSocket.Server({
            noServer: true
        });
        wss.on('connection', (ws) => {
            console.log('WebSocket client connected, total:', wss.clients.size);
            const machines = [
                { "name": "dharma", "url": "dharma" },
                { "name": "garden", "url": "garden" }
            ];
            ws.send(JSON.stringify(machines));
            ws.on('close', () => console.log('WebSocket client disconnected, total:', wss.clients.size));
        });
        return {
            socket: wss,
            path: '/codebreaker/machines'
        };
    }
}