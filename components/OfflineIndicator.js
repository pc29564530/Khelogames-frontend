import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOffline } from '../hooks/useOffline';
import { useTheme } from '../hooks/useTheme';

/**
 * Offline Indicator Component
 * 
 * Displays a banner when the device is offline and shows sync queue status
 */
const OfflineIndicator = () => {
  const { isOffline, syncQueueCount, syncData } = useOffline();
  const theme = useTheme();

  if (!isOffline && syncQueueCount === 0) {
    return null;
  }

  const handleSync = async () => {
    await syncData();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.warning }]}>
      <View style={styles.content}>
        <Text style={[styles.text, { color: theme.colors.text.primary }]}>
          {isOffline ? '📵 You are offline' : '📶 Back online'}
        </Text>
        
        {syncQueueCount > 0 && (
          <Text style={[styles.subtext, { color: theme.colors.text.secondary }]}>
            {syncQueueCount} action{syncQueueCount > 1 ? 's' : ''} pending sync
          </Text>
        )}
      </View>

      {!isOffline && syncQueueCount > 0 && (
        <TouchableOpacity
          style={[styles.syncButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSync}
          accessibilityLabel="Sync pending actions"
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
