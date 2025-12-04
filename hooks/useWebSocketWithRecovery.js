import {useEffect, useState, useCallback} from 'react';
import {useWebSocket, CONNECTION_STATES} from '../context/WebSocketContext';

/**
 * Custom hook for WebSocket with automatic error recovery
 * Provides connection state, error handling, and reconnection logic
 */
const useWebSocketWithRecovery = (channel, onMessage, options = {}) => {
  const {
    subscribe,
    connectionState,
    connectionQuality,
    wsManager,
  } = useWebSocket();

  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const {
    autoReconnect = true,
    onError = null,
    onReconnect = null,
  } = options;

  // Subscribe to channel
  useEffect(() => {
    if (!channel || !onMessage) {
      return;
    }

    const handleMessage = (message) => {
      try {
        setError(null);
        onMessage(message);
      } catch (err) {
        console.error('Error handling message:', err);
        setError(err);
        if (onError) {
          onError(err);
        }
      }
    };

    const unsubscribe = subscribe(channel, handleMessage);
    setIsSubscribed(true);

    return () => {
      unsubscribe();
      setIsSubscribed(false);
    };
  }, [channel, onMessage, subscribe, onError]);

  // Handle reconnection
  useEffect(() => {
    if (autoReconnect && 
        connectionState === CONNECTION_STATES.CONNECTED && 
        isSubscribed) {
      if (onReconnect) {
        onReconnect();
      }
    }
  }, [connectionState, autoReconnect, isSubscribed, onReconnect]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (wsManager) {
      wsManager.connect();
    }
  }, [wsManager]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    connectionState,
    connectionQuality,
    error,
    isConnected: connectionState === CONNECTION_STATES.CONNECTED,
    isConnecting: connectionState === CONNECTION_STATES.CONNECTING,
    isReconnecting: connectionState === CONNECTION_STATES.RECONNECTING,
    isDisconnected: connectionState === CONNECTION_STATES.DISCONNECTED,
    isFailed: connectionState === CONNECTION_STATES.FAILED,
    reconnect,
    clearError,
  };
};

export default useWebSocketWithRecovery;
