const path = require('path');
const WebSocket = require('ws');
const fs = require('node:fs');
const chokidar = require('chokidar');
const hyttynen = require('./hyttynen');
const { log } = require('node:console');

const deviceListPath = path.join(__dirname, '..', '..', 'devices.list');

let deviceList = null;

function reloadDeviceList(path) {
    const device_list = fs.readFileSync(path, 'utf8').split(',').map((device) => {
        if(device.endsWith('\n')) device = device.slice(0, -1);
        return { "name": device, "url": device };
    });
    deviceList = JSON.stringify({ "type" : "devices", "deviceList" : device_list });
    hyttynen.addFirstToSend(JSON.stringify(deviceList));

    // Broadcast to all clients
    hyttynen.sendMessage(deviceList, true);
}

module.exports = {
    devices: function() {
        console.log('[devices::devices] Invoked');
        
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
        return true;
    }
}