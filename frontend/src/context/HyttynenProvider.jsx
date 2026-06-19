import { createContext, useContext, useRef, useState } from "react";

const HyttynenContext = createContext();

export const HyttynenProvider = ({ children }) => {
    const [connectedState, setConnectedState] = useState('offline');
    const webSocketConnection = useRef(null);
    const messageHandler = useRef(null);
    const waiting = useRef('hs');

    const listeners = new Set();

    const messageHandler1 = (message) => {
        const msg = message.data;
        for(const listener of listeners) {
            console.log('Notifying listener');
            listener(msg);
        }
        
    }

    const handshake = (message) => {
        const msg = message.data;

        if(msg == waiting.current) {
            console.log('[hs] Received '+msg+' message');
            if(webSocketConnection.current) {
                if(msg == 'hs') {
                    webSocketConnection.current.send('hytcli');
                    waiting.current='hytser';
                } else if (msg == 'hytser') {
                    setConnectedState('live');
                    messageHandler.current=messageHandler1;
                    webSocketConnection.current.onmessage = messageHandler.current;
                }
            }
        }
        else {
            console.log('[hs] Expecting ' + waiting.current + ', received '+msg+', closing');
            
            if(webSocketConnection.current) {
                webSocketConnection.current.close();
            }
        }
    }

    const connectionState = () => {
        return connectedState;
    }

    const openHyttynen = () => {
        console.log('checking connection');
                
        if(!webSocketConnection.current) {
            console.log('connection not open, establishing');
            
            const ws = new WebSocket('ws://localhost:8088');
            ws.onopen = () => {
                console.log('Open connection to Hyttynen');
                // Store socket
                waiting.current = 'hs';
                webSocketConnection.current = ws;

                setConnectedState('handshake');
            }

            ws.onclose = () => {
                console.log('Hyttynen closed');
                setConnectedState('offline');
                webSocketConnection.current = null;
            }

            // Waiting for handshake
            messageHandler.current=handshake;
            ws.onmessage = messageHandler.current;
        }
    }

    const closeHyttynen = () => {
        if(webSocketConnection.current) {
            webSocketConnection.current.close();
            setConnectedState('offline');
        }
    }

    const addListener = (listener) => {
        listeners.add(listener);
    }

    const removeListener = (listener) => {
        listeners.delete(listener);
    }

    return (
        <HyttynenContext.Provider value={{ connectionState, openHyttynen, closeHyttynen, addListener, removeListener }}>
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