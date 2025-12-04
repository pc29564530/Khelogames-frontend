import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useOffline } from '../hooks/useOffline';
import { useTheme } from '../hooks/useTheme';

/**
 * Offline Indicator Component
 * 
 * Displays a banner when the device is offline and shows sync queue status
 */
const OfflineIndicator = () => {
  const { syncQueueCount, syncData } = useOffline();
  const theme = useTheme();
  
  // Get network state from Redux
  const { isOnline, connectionQuality, queuedRequestsCount } = useSelector(state => state.network);
  const isOffline = !isOnline;
  
  // Combine sync queue and network queue counts
  const totalQueueCount = syncQueueCount + queuedRequestsCount;

  if (isOnline && totalQueueCount === 0) {
    return null;
  }

  const handleSync = async () => {
    await syncData();
  };
  
  // Determine background color based on connection quality
  const getBackgroundColor = () => {
    if (isOffline) return theme.colors.error;
    if (connectionQuality === 'poor') return theme.colors.warning;
    if (totalQueueCount > 0) return theme.colors.warning;
    return theme.colors.success;
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.content}>
        <Text style={[styles.text, { color: theme.colors.surface }]}>
          {isOffline ? '📵 You are offline' : connectionQuality === 'poor' ? '📶 Poor connection' : '📶 Back online'}
        </Text>
        
        {totalQueueCount > 0 && (
          <Text style={[styles.subtext, { color: theme.colors.surface }]}>
            {totalQueueCount} request{totalQueueCount > 1 ? 's' : ''} pending
          </Text>
        )}
      </View>

      {isOnline && totalQueueCount > 0 && (
        <TouchableOpacity
          style={[styles.syncButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSync}
          accessibilityLabel="Sync pending requests"
          accessibilityRole="button"
        >
          <Text style={[styles.syncButtonText, { color: theme.colors.surface }]}>
            Sync Now
          </Text>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtext: {
    fontSize: 12,
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OfflineIndicator;
