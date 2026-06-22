import { createContext, useCallback, useContext, useRef, useState } from "react";
import { getWebSocketMessage } from "../utils/HelperUtils";

const HyttynenContext = createContext();

export const HyttynenProvider = ({ children }) => {
    const [connectedState, setConnectedState] = useState('offline');
    const webSocketConnection = useRef(null);
    const messageHandler = useRef(null);
    const established = useRef(null);

    /**
     * Registered listener functions.
     */
    const registeredListeners = new Map();

    const messageHandlerAfterHandshake = (message) => {
        let rawData = getWebSocketMessage(message);

        console.log('[HyttnenProvider:: messageHandler] '+rawData);
        
        // if connection not yet established waiting for 'hytser'
        if(!established.current) {
            if(rawData=="hytser") {
                console.log('[HyttynenProvider::messageHandler] Connection established, hytser');
                established.current=true;
            }
        }
        else {
            // Parse json
            let jsonMessage = "na"
            try { jsonMessage = JSON.parse(rawData); } catch(err) {console.log(err);}
            console.log('[HyttynenProvider::messageHandler] Parsed JSON, messageType: '+jsonMessage.messageType);
            
            // Notify registered listeners
            const rl = registeredListeners.get(jsonMessage.messageType);
            if (rl) {
                console.log('[HyttynenProvider::messageHandler] Notifying registered listeners '+rl.size+' to message['+jsonMessage.messageType+']');
                
                for (const listener of rl) {
                    listener(jsonMessage);
                }
            }
            else {
                console.log('no reg');
                
            }
        }
    };

    const connectionState = () => {
        return connectedState;
    }

    /**
     * Open connection to server.
     */
    const openHyttynen = () => {
        console.log('[HyttynenContext::openHyttynen] checking connection');
                
        if(!webSocketConnection.current) {
            console.log('[HyttynenContext::openHyttynen] connection not open, establishing');
            
            const ws = new WebSocket('ws://localhost:8088');
            // Handle connection opening
            ws.onopen = () => {
                console.log('[HyttynenProvider::openHyttynen] Open connection to Hyttynen');
                // Store socket
                webSocketConnection.current = ws;
                ws.send('hytcli');

                // Waiting for handshake
                console.log('[HyttynenProvider::openHyttynen] hytcli sent, waiting for hytser');
                
                // Set the message handler
                ws.onmessage = messageHandlerAfterHandshake;
                setConnectedState('live');
            };

            ws.onclose = () => {
                console.log('Hyttynen closed');
                setConnectedState('offline');
                webSocketConnection.current = null;
            };
        }
    }

    const closeHyttynen = () => {
        if(webSocketConnection.current) {
            webSocketConnection.current.close();
            setConnectedState('offline');
        }
    }

    const register = (messageType, listener) => {
        console.log('[HyttynenContext::register] register to '+messageType);
        let listeners = registeredListeners.get(messageType);
        if (!listeners) {
            listeners = new Set();
        }
        listeners.add(listener);
        registeredListeners.set(messageType, listeners);
    }

    const unregister = (messageType, listener) => {
        console.log('[HyttynenContext] unregister to '+messageType);
        
        if(webSocketConnection.current) {
            const unreg = {
                messageType: "unregister",
                messageId: messageType
            };
            webSocketConnection.current.send(JSON.stringify(unreg));
        }
    }

    return (
        <HyttynenContext.Provider value={{ connectionState, openHyttynen, closeHyttynen, register, unregister }}>
            {children}
        </HyttynenContext.Provider>
    );
}

/**
 * Returns `{ isConnected, closeHyttynen }`.
 * Must be called inside a ConfirmProvider subtree.
 */
export const useHyttynen = () => {
  const context = useContext(HyttynenContext);
  if (!context) throw new Error('useHyttynen must be used within a HyttynenProvider');
  return context;
};