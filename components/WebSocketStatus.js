import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useWebSocket, CONNECTION_STATES, CONNECTION_QUALITY} from '../context/WebSocketContext';

/**
 * WebSocket Status Indicator Component
 * Displays connection state and quality with reconnection UI
 */
const WebSocketStatus = ({showQuality = true, showReconnect = true}) => {
  const {connectionState, connectionQuality, wsManager} = useWebSocket();

  const getStateColor = () => {
    switch (connectionState) {
      case CONNECTION_STATES.CONNECTED:
        return '#4CAF50';
      case CONNECTION_STATES.CONNECTING:
      case CONNECTION_STATES.RECONNECTING:
        return '#FF9800';
      case CONNECTION_STATES.DISCONNECTED:
      case CONNECTION_STATES.FAILED:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStateText = () => {
    switch (connectionState) {
      case CONNECTION_STATES.CONNECTED:
        return 'Connected';
      case CONNECTION_STATES.CONNECTING:
        return 'Connecting...';
      case CONNECTION_STATES.RECONNECTING:
        return 'Reconnecting...';
      case CONNECTION_STATES.DISCONNECTED:
        return 'Disconnected';
      case CONNECTION_STATES.FAILED:
        return 'Connection Failed';
      default:
        return 'Unknown';
    }
  };

  const getQualityText = () => {
    switch (connectionQuality) {
      case CONNECTION_QUALITY.EXCELLENT:
        return 'Excellent';
      case CONNECTION_QUALITY.GOOD:
        return 'Good';
      case CONNECTION_QUALITY.POOR:
        return 'Poor';
      case CONNECTION_QUALITY.OFFLINE:
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const handleReconnect = () => {
    if (wsManager && (connectionState === CONNECTION_STATES.DISCONNECTED || 
                      connectionState === CONNECTION_STATES.FAILED)) {
      wsManager.connect();
    }
  };

  // Don't show anything if connected and quality is good
  if (connectionState === CONNECTION_STATES.CONNECTED && 
      connectionQuality === CONNECTION_QUALITY.EXCELLENT) {
    return null;
  }

  return (
    <View style={[styles.container, {backgroundColor: getStateColor()}]}>
      <View style={styles.content}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{getStateText()}</Text>
        
        {showQuality && connectionState === CONNECTION_STATES.CONNECTED && (
          <Text style={styles.qualityText}>({getQualityText()})</Text>
        )}
      </View>
      
      {showReconnect && (connectionState === CONNECTION_STATES.DISCONNECTED || 
                         connectionState === CONNECTION_STATES.FAILED) && (
        <TouchableOpacity 
          style={styles.reconnectButton}
          onPress={handleReconnect}
          accessibilityLabel="Reconnect to server"
          accessibilityRole="button"
        >
          <Text style={styles.reconnectText}>Reconnect</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    opacity: 0.95,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  qualityText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.9,
  },
  reconnectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  reconnectText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WebSocketStatus;
