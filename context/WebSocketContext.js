import React, {createContext, useContext, useRef, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_URL } from '../constants/ApiConstants';


const WebSocketContext = createContext(null);

export const WebSocketProvider = ({children}) => {
    const wsRef = useRef(null);
    const messageHandlersRef = useRef(new Set());
    const isMountedRef = useRef(true);
    const reconnectAttemptRef = useRef(0);
    const reconnectTimeoutRef = useRef(null);
    const MAX_RECONNECT_ATTEMPTS = 10;

    const setupWebSocket = useCallback(async () => {
        try {
            // Close existing connection before creating new one
            if (wsRef.current) {
                wsRef.current.onclose = null;
                if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
                    wsRef.current.close();
                }
            }

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
                reconnectAttemptRef.current = 0;
            };

            // Central message dispatcher - broadcasts to all handlers
            wsRef.current.onmessage = (event) => {
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
                if (isMountedRef.current && reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(3000 * Math.pow(2, reconnectAttemptRef.current), 30000);
                    reconnectAttemptRef.current += 1;
                    console.log(`WebSocket reconnect attempt ${reconnectAttemptRef.current} in ${delay}ms`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        setupWebSocket();
                    }, delay);
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
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (wsRef.current) {
                wsRef.current.onclose = null;
                if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
                    wsRef.current.close();
                }
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