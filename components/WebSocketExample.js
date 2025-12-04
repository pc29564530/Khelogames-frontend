import React, {useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import useWebSocketWithRecovery from '../hooks/useWebSocketWithRecovery';
import WebSocketStatus from './WebSocketStatus';
import WebSocketErrorNotification from './WebSocketErrorNotification';

/**
 * Example component demonstrating enhanced WebSocket usage
 * Shows connection state, quality, and message handling
 */
const WebSocketExample = () => {
  const handleMessage = useCallback((message) => {
    console.log('Received message:', message);
    // Handle the message here
  }, []);

  const handleError = useCallback((error) => {
    console.error('WebSocket error:', error);
    // Handle error here
  }, []);

  const handleReconnect = useCallback(() => {
    console.log('WebSocket reconnected');
    // Handle reconnection here (e.g., refresh data)
  }, []);

  const {
    connectionState,
    connectionQuality,
    error,
    isConnected,
    isConnecting,
    isReconnecting,
    isDisconnected,
    isFailed,
    reconnect,
    clearError,
  } = useWebSocketWithRecovery('match-updates', handleMessage, {
    autoReconnect: true,
    onError: handleError,
    onReconnect: handleReconnect,
  });

  return (
    <View style={styles.container}>
      <WebSocketErrorNotification />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>WebSocket Status</Text>
        
        <View style={styles.statusCard}>
          <Text style={styles.label}>Connection State:</Text>
          <Text style={styles.value}>{connectionState}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.label}>Connection Quality:</Text>
          <Text style={styles.value}>{connectionQuality}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.label}>Status Flags:</Text>
          <Text style={styles.value}>
            Connected: {isConnected ? '✓' : '✗'}{'\n'}
            Connecting: {isConnecting ? '✓' : '✗'}{'\n'}
            Reconnecting: {isReconnecting ? '✓' : '✗'}{'\n'}
            Disconnected: {isDisconnected ? '✓' : '✗'}{'\n'}
            Failed: {isFailed ? '✓' : '✗'}
          </Text>
        </View>

        {error && (
          <View style={[styles.statusCard, styles.errorCard]}>
            <Text style={styles.errorLabel}>Error:</Text>
            <Text style={styles.errorValue}>{error.message}</Text>
          </View>
        )}
      </ScrollView>

      <WebSocketStatus showQuality={true} showReconnect={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#212121',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 4,
  },
  errorValue: {
    fontSize: 14,
    color: '#D32F2F',
  },
});

export default WebSocketExample;
