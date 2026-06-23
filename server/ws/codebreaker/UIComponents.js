const path = require('path');
const WebSocket = require('ws');
const fs = require('node:fs');
const chokidar = require('chokidar');
const HyttynenServer = require('./HyttynenServer');
const { log } = require('node:console');

const deviceListPath = path.join(__dirname, '..', '..', 'devices.list');

let deviceList = null;

const MESSAGE_TYPE = "uidt";

function reloadDeviceList(path) {
    const device_list = fs.readFileSync(path, 'utf8').split(',').map((device) => {
        if(device.endsWith('\n')) device = device.slice(0, -1);
        return { "name": device, "url": device.trim() };
    });
    const devicesMessage = {
        'messageType' : MESSAGE_TYPE,
        'devicesList' : device_list
    }
    deviceList = JSON.stringify(devicesMessage);
    // Send  to all open sockets and add to initial messages
    HyttynenServer.sendMessage(deviceList, true);
}


module.exports = {
    startServer:function() {
        console.log('[UIComponents::startUiComponents] Invoked');
        
        if (deviceList === null) {
            if (!fs.existsSync(deviceListPath)) {
                console.log('[UIComponents::startUiComponents] ' + deviceListPath + ' not found!!!');
                return;
            }
            else {
                console.log('[UIComponents::startUiComponents] ' + deviceListPath + ' was found');
            }
            const watcher = chokidar.watch(deviceListPath, { });
            // file listeners
            watcher.on('change', path => reloadDeviceList(path));
            console.log('Watching ' + deviceListPath);
            console.log('==== No dvice list, reading devices.list');
            reloadDeviceList(deviceListPath);
        }
       
    },
    addComponent:function(message) {
        if (message instanceof Object) {
            const m = {
                messageType : MESSAGE_TYPE,
                data : message
            };
            const strMessage = JSON.stringify(m);
            HyttynenServer.sendMessage(strMessage, true);
        }
        else {
            throw Error('[UIComponents::sendComponent] message is not Object');
        }
    }
}

