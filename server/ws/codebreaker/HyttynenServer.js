const { WebSocket, OPEN, WebSocketServer } = require("ws")

const initialMessages = new Set();
const openSockets = new Set();

module.exports = {
    HyttynenStart:function() {
        console.log('[HyttynenServer::HyttynenStart] Starting websocket at port 8088');
        const wss = new WebSocket.Server({port: 8088});
        // Connection handler
        wss.on('connection', (ws) => {
            openSockets.add(ws);
            
            ws.on('message', (message) => {
                console.log('[HyttynenServer::HyttynenStart.socket[message] '+message);
                
                // If "hytcli" is received "hytser" is send as response.
                // Initial message are send rigth after.
                if("hytcli" == message) {
                    console.log('hytcli received');
                    
                    ws.send("hytser");
                    console.log('sending '+initialMessages.size+' initial messages');
                    for(const msg of initialMessages) {
                        console.log('[HyttynenServer::serverSocket::send] ' + msg);
                        this.sendMessage(msg);
                    }
                }
            });
        });

    },
    HyttynenStop: function() {
        console.log('[HyttynenServer::HyttynenStop]');
        // Close all oen sockets
        for(const socket of openSockets) {
            if(socket.readyState == WebSocket.OPEN) {
                socket.send("zzz");
                socket.close(4999);
            }
        }
    },
    addInitialMessage:function(initialMessage) {
        console.log('[HyttynenServer::addInitialMessage] Adding initial  message: '+initialMessage);
        initialMessages.add(initialMessage);
    },
    /**
     * Send message to all open sockets. Accepting only String messages.
     * @param {*} message to send; Must be string 
     * @param {*} initialMessage True if the messag  as initial message; default false
     */
    sendMessage:function(message, initialMessage = false) {
        console.log('[HyttynenServer::sendMessage] message: '+message);
        
        if((typeof message) == 'string') {
            console.log('[HyttynenServer::sendMessage] Sending message to all open sockets');
            for(const socket of openSockets) {
                if(socket.readyState == WebSocket.OPEN) {
                    socket.send(message);
                }
            }
            if(initialMessage==true) {
                initialMessages.add(message);
            }
        }
        else {
            throw Error('[HyttynenServer::sendMessage] Message must be string');
        }
    }
}