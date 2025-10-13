import React, {createContext, useContext, useRef, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({children}) => {
    const wsRef = useRef(null);
    const isMountedRef = useRef(true);
    const setupWebSocket = useCallback( async () => {
                try {
                const authToken = await AsyncStorage.getItem("AccessToken");
                if(!authToken) {
                    console.log("No token found, skipping websocket connection")
                    return
                }
                console.log("Connecting to WebSocket...");
                wsRef.current = new WebSocket('ws://192.168.1.3:8080/api/ws', '', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                wsRef.current.onopen = () => {
                    console.log("WebSocket connection open");
                    console.log("WebSocket Ready: ", wsRef.current.readyState);
                }

                wsRef.current.onerror = (error) => {
                    console.log("Error: ", error);
                }
                
                wsRef.current.onclose = (event) => {
                    console.log("WebScoket connection closed: ", event.reason)
                }
            } catch (err) {
                console.error("unable to setup the websocket: ", err)
            }
        });
    useEffect(() => {
        setupWebSocket();
        return () => {
            isMountedRef.current = false;
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
        }
    }, [setupWebSocket]);
    return (
        <WebSocketContext.Provider value={wsRef}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocket = () => useContext(WebSocketContext)