import React, {createContext, useContext, useRef, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_URL } from '../constants/ApiConstants';


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
            wsRef.current = new WebSocket(`${WS_URL}`, '', {
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
                // Auto-reconnect after 3 seconds if the provider is still mounted
                if (isMountedRef.current) {
                    setTimeout(() => {
                        console.log("Attempting WebSocket reconnect...");
                        setupWebSocket();
                    }, 3000);
                }
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