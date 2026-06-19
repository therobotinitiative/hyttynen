import { useRef, useState } from "react";

const listeners = new Set();

let reconnectTime = 3000;
let hs = false;

const useConnection = () => {
    const [socketConnection, setSocketConnection] = useState(false);
    const socket = useRef(null);

    function connect() {
        console.log('Connction hook::connect');

        //Check if already connected
        if(socketConnection == true) {
            console.log('Already connected');
            return;
        }

        // Establish WebSocket connection
        const ws = new WebSocket('ws://localhost:8088');
        ws.onopen = () => {
            // handshake
            setSocketConnection(true);
            socket.current = ws;
            socket.current.send("hytcli");
            ws.onclose = (socket) => {
                setSocketConnection(false);
                hs = false;
                listeners.delete(socket);
                socket.current = null;
                setTimeout(reconnect, reconnectTime);
            };
            ws.onmessage = (message) => {
                // Notify all listeners
                if(hs) {
                    console.log('Handshake done, notifying ' + listeners.size + ' listeners');
                    console.log('message:  '+message.data);
                    
                    listeners.forEach(listener => {
                        listener(message.data);
                    });
                }
                // Listen for replies
                else {
                    console.log('Message '+message.data+' received, waiting for hs reply');
                    
                    if(message.data=="hytser") {
                        console.log('===> handshake reply received');
                        
                        hs = true;
                    }
                }
            };
        };
    }

    function reconnect() {
        // backaway reconnect time
        if(reconnectTime <= 30000) {
            reconnectTime *= 2;
        }
        connect();
    }

    function addMessageListener(listener) {
        listeners.add(listener);
    }

    function removeMessageListener(listener) {
        listeners.delete(listener);
    }

    function register(messageId) {

    }

    function unregister(messageId) {

    }

    function isConnected() {
        return socketConnection;
    }

    return {
        connect,
        reconnect,
        isConnected,
        register,
        unregister,
        addMessageListener,
        removeMessageListener
    }
}
export default useConnection;