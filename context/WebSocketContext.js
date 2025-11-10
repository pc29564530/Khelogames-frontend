import React, {createContext, useContext, useRef, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({children}) => {
    const wsRef = useRef(null);
    const messageHandlersRef = useRef(new Set());
    const isMountedRef = useRef(true);
    
    const setupWebSocket = useCallback(async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            if(!authToken) {
                console.log("No token found, skipping websocket connection");
                return;
            }
            
            console.log("Connecting to WebSocket...");
            wsRef.current = new WebSocket('ws://192.168.1.3:8080/api/ws', '', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            wsRef.current.onopen = () => {
                console.log("WebSocket connection open");
                console.log("WebSocket Ready State:", wsRef.current.readyState);
            };

            // Central message dispatcher - broadcasts to all handlers
            wsRef.current.onmessage = (event) => {
                console.log("WebSocket message received:", event.data);
                messageHandlersRef.current.forEach(handler => {
                    try {
                        handler(event);
                    } catch (error) {
                        console.error("Error in message handler:", error);
                    }
                });
            };

            wsRef.current.onerror = (error) => {
                console.log("WebSocket Error:", error);
            };
            
            wsRef.current.onclose = (event) => {
                console.log("WebSocket connection closed:", event.reason);
            };
        } catch (err) {
            console.error("Unable to setup the websocket:", err);
        }
    }, []);
    
    const subscribe = useCallback((handler) => {
        console.log("Adding message handler, total:", messageHandlersRef.current.size + 1);
        messageHandlersRef.current.add(handler);
        
        return () => {
            console.log("Removing message handler, remaining:", messageHandlersRef.current.size - 1);
            messageHandlersRef.current.delete(handler);
        };
    }, []);
    
    useEffect(() => {
        setupWebSocket();
        return () => {
            isMountedRef.current = false;
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
        };
    }, [setupWebSocket]);
    
    return (
        <WebSocketContext.Provider value={{wsRef, subscribe}}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);