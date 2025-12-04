import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import {useWebSocket, CONNECTION_STATES} from '../context/WebSocketContext';

/**
 * WebSocket Error Notification Component
 * Displays error notifications with retry options
 */
const WebSocketErrorNotification = () => {
  const {connectionState, wsManager} = useWebSocket();
  const [visible, setVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    const shouldShow = connectionState === CONNECTION_STATES.FAILED || 
                       connectionState === CONNECTION_STATES.RECONNECTING;
    
    if (shouldShow && !visible) {
      setVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else if (!shouldShow && visible) {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [connectionState, visible, slideAnim]);

  const handleRetry = () => {
    if (wsManager) {
      wsManager.connect();
    }
  };

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  if (!visible) {
    return null;
  }

  const getMessage = () => {
    if (connectionState === CONNECTION_STATES.RECONNECTING) {
      return 'Attempting to reconnect...';
    }
    return 'Connection lost. Real-time updates unavailable.';
  };

  const showRetry = connectionState === CONNECTION_STATES.FAILED;

  return (
    <Animated.View 
      style={[
        styles.container,
        {transform: [{translateY: slideAnim}]}
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
        
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Connection Issue</Text>
          <Text style={styles.message}>{getMessage()}</Text>
        </View>

        <View style={styles.actions}>
          {showRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              accessibilityLabel="Retry connection"
              accessibilityRole="button"
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            accessibilityLabel="Dismiss notification"
            accessibilityRole="button"
          >
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF5722',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  messageContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default WebSocketErrorNotification;
