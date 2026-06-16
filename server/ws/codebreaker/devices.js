const path = require('path');
const WebSocket = require('ws');
const fs = require('node:fs');
const chokidar = require('chokidar');

const deviceListPath = path.join(__dirname, '..', '..', 'devices.list');

let deviceList = null;
const wss = new Set();

function reloadDeviceList(path) {
            const device_list = fs.readFileSync(path, 'utf8').split(',').map((device) => {
                if(device.endsWith('\n')) device = device.slice(0, -1);
                return { "name": device, "url": device };
            });
            deviceList = device_list;
            // Stream new list to all open web sockets
            for (let client of wss) {
                if(client && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(device_list));
                }
            }
}

module.exports = {
    devices: function() {
        if (deviceList === null) {
            if (!fs.existsSync(deviceListPath)) {
                console.log(deviceListPath + ' not found!!!');
                return;
            }
            else {
                console.log(deviceListPath + ' was found');
            }
            const watcher = chokidar.watch(deviceListPath, { });
            // file listeners
            watcher.on('change', path => reloadDeviceList(path));
            console.log('Watching ' + deviceListPath);
            console.log('==== No dvice list, reading devices.list');
            reloadDeviceList(deviceListPath);
        }
        const webSocketServer = new WebSocket.Server({
            noServer: true
        });
        webSocketServer.on('connection', (webSocket) => {
            wss.add(webSocket);
            webSocket.on('close', () => {
                console.log('WebSocket client disconnected, total:', webSocketServer.clients.size) 
                wss.delete(webSocket);
            });
        });
        return {
            socket: webSocketServer,
            path: '/codebreaker/devices'
        };
    }
}