import React, {createContext, useContext, useRef, useEffect, useCallback, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {WebSocketManager, CONNECTION_STATES, CONNECTION_QUALITY} from '../services/WebSocketManager';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({children}) => {
    const wsManagerRef = useRef(null);
    const [connectionState, setConnectionState] = useState(CONNECTION_STATES.DISCONNECTED);
    const [connectionQuality, setConnectionQuality] = useState(CONNECTION_QUALITY.OFFLINE);
    
    const setupWebSocket = useCallback(async () => {
        try {
            const authToken = await AsyncStorage.getItem("AccessToken");
            if(!authToken) {
                console.log("No token found, skipping websocket connection");
                return;
            }
            
            // Create WebSocket manager with configuration
            wsManagerRef.current = new WebSocketManager({
                url: 'ws://192.168.1.3:8080/api/ws',
                reconnect: true,
                reconnectInterval: 1000,
                maxReconnectAttempts: 10,
                heartbeatInterval: 30000,
                connectionTimeout: 10000,
                onConnect: () => {
                    console.log("WebSocket connected via manager");
                },
                onDisconnect: () => {
                    console.log("WebSocket disconnected via manager");
                },
                onError: (error) => {
                    console.error("WebSocket error via manager:", error);
                },
                onMessage: (message) => {
                    console.log("WebSocket message via manager:", message);
                },
                onStateChange: (newState, oldState) => {
                    console.log(`Connection state: ${oldState} -> ${newState}`);
                    setConnectionState(newState);
                },
                onQualityChange: (newQuality, oldQuality) => {
                    console.log(`Connection quality: ${oldQuality} -> ${newQuality}`);
                    setConnectionQuality(newQuality);
                }
            });
            
            // Connect with auth token
            await wsManagerRef.current.connect(authToken);
            
        } catch (err) {
            console.error("Unable to setup the websocket:", err);
        }
    }, []);
    
    const subscribe = useCallback((channel, handler) => {
        if (!wsManagerRef.current) {
            console.warn("WebSocket manager not initialized");
            return () => {};
        }
        
        return wsManagerRef.current.subscribe(channel, handler);
    }, []);
    
    const send = useCallback((message) => {
        if (!wsManagerRef.current) {
            console.warn("WebSocket manager not initialized");
            return;
        }
        
        wsManagerRef.current.send(message);
    }, []);
    
    const getConnectionState = useCallback(() => {
        return wsManagerRef.current ? wsManagerRef.current.getConnectionState() : CONNECTION_STATES.DISCONNECTED;
    }, []);
    
    const getConnectionQuality = useCallback(() => {
        return wsManagerRef.current ? wsManagerRef.current.getConnectionQuality() : CONNECTION_QUALITY.OFFLINE;
    }, []);
    
    const getAverageLatency = useCallback(() => {
        return wsManagerRef.current ? wsManagerRef.current.getAverageLatency() : null;
    }, []);
    
    useEffect(() => {
        setupWebSocket();
        return () => {
            if (wsManagerRef.current) {
                wsManagerRef.current.disconnect();
            }
        };
    }, [setupWebSocket]);
    
    return (
        <WebSocketContext.Provider value={{
            wsManager: wsManagerRef.current,
            subscribe,
            send,
            connectionState,
            connectionQuality,
            getConnectionState,
            getConnectionQuality,
            getAverageLatency
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
export {CONNECTION_STATES, CONNECTION_QUALITY};