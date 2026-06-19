const webSocket  = require("ws");
const webSocketServer  = require("ws");

const sockets = new Map();
const allSockets = new Set();
const waitingForHandshake = new Set();
const firstToSend = new Set();
/**
 * Hytttynen Protocol
 */
module.exports = {
    server: function(server) {
        console.log('=== Starting websocket at port 8088');
        
        const socketServer = new webSocket.Server({port: 8088});

        let pingCounter = 0;

        // Set ServerSocket handlers
        socketServer.on('connection', (socket) => {
            console.log('Handshake with \'hs\'');
            
            socket.send('hs');
            waitingForHandshake.add(socket);

            // Handle incoming messages
            socket.on('message', (message) => {
                // Handshake on going
                if (allSockets.has(socket)) {
                    this.receiveData(socket, message);
                    return;
                }

                if(waitingForHandshake.has(socket)) {
                    if(message == "hytcli") {
                        console.log('Response to handshake with \'hytser\'');
                        socket.send("hytser");
                        // remove from waitingForHandshake and add to allSockets
                        waitingForHandshake.delete(socket);
                        allSockets.add(socket);
                        console.log('Handshake done sending first');
                        
                        // Send first
                        for (const firstData of firstToSend) {
                            console.log('===> Sending first data, '+firstData);
                            
                            socket.send(firstData);
                        }
                    } else {
                        socket.send("not recognised");
                        waitingForHandshake.delete(socket);
                        socket.close();
                    }
                }
            })
            // Handle socket closing
            socket.on('close', () => {
                this.closeSocket(socket);
            })
        });

       return {
            socket: socketServer,
            path: '/codebreaker/hyttynen'
        };
    },
    /**
     * Register socket to listen for message id
     * @param {*} socket 
     * @param {*} messageId 
     */
    register: function(socket, messageId) {
        console.log('Register socket for message id: '+messageId);
        
        let listeners = sockets.get(messageId);
        if(!listeners) {
            listeners = new Set();
        }
        listeners.add(socket);
        sockets.set(messageId, listeners);
    },
    /**
     * Unregister socket from listening for message id.
     * @param {*} socket 
     * @param {*} messageId 
     */
    unregister: function(socket, messageId) {G
        console.log('Unregister socket for message id: '+messageId);
        
        const listeners = sockets.get(messageId);
        if(listeners) {
            listeners.remove(socket);
        }
    },
    /**
     * Send message to all open sockets listening to message id.
     * @param {*} messageId 
     * @param {*} data 
     * @param {*} broadcast Broadcast the message to all sockets, default value false
     */
    sendMessage: function(messageId, data, broadcast = false) {
        console.log('=== Sending message, broadcast: '+broadcast);
        
        sockets.forEach((key, value) => {
            if (broadcast) {
                console.log('Broadcasting message '+value);
                
                for (const socket of allSockets) {
                    if(socket.readyState == WebSocket.OPEN) {
                        console.log('broadcastin: '+data);
                        
                        socket.send(data);
                    }
                }
            } else {
                const listeners = sockets.get(messageId);
                if (listeners) {
                    for(const socket of listeners) {
                        if(socket.readyState == WebSocket.OPEN) {
                            socket.send(data);
                        }
                    }
                }
            }
            if (key === messageId) {
                for (const webSocket of value) {
                    if(webSocket.readyState === WebSocket.OPEN) {
                        webSocket.send(data);
                    }
                }
            }
        });
    },
    /**
     * Received data handler.
     * @param {} socket 
     * @param {*} data 
     */
    receiveData: function(socket, data) {
        console.log('Receiving message from socket');
        
        try {
            jsonData = JSON.parse(data);
            if(jsonData) {
                switch (jsonData?.type) {
                    case 'register':
                        this.register(jsonData?.messageId, socket);
                        break;
                    case 'unregister':
                        this.unregister(jsonData?.messageId, socket);
                        break;
                    default:
                        // Do nothing
                        break;
                }
            }
        } catch (err) {
        }

    },
    /**
     * Remove socket from all listeners.
     * @param {*} socket 
     */
    closeSocket: function(socket) {
        console.log('Closing socket');
        
        sockets.forEach((key, value) => {
            value.remove(socket);
        });
        allSockets.delete(socket);
    },
    /**
     * First messages to send when handshake is complete.
     * @param {*} data 
     */
    addFirstToSend:function(data) {
        console.log('[hyttynen] adding first to send: '+data);
        firstToSend.add(data);
    }
 }