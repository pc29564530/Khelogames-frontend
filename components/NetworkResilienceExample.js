import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from '../services/networkService';
import { networkService } from '../services/networkService';
import { useTheme } from '../hooks/useTheme';
import NetworkErrorDisplay from './NetworkErrorDisplay';
import OfflineIndicator from './OfflineIndicator';

/**
 * Network Resilience Example Component
 * 
 * Demonstrates all network resilience features:
 * - Network connectivity monitoring
 * - Request retry with exponential backoff
 * - Offline request queue
 * - Timeout handling
 */
const NetworkResilienceExample = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);
  const [retryConfig, setRetryConfig] = useState(null);
  const [timeoutConfig, setTimeoutConfig] = useState(null);
  const [queueCount, setQueueCount] = useState(0);

  // Get network state from Redux
  const networkState = useSelector(state => state.network);

  useEffect(() => {
    // Load configurations
    setRetryConfig(networkService.getRetryConfig());
    setTimeoutConfig(networkService.getTimeoutConfig());
    updateQueueCount();
  }, []);

  const updateQueueCount = () => {
    const count = networkService.getQueuedRequestCount();
    setQueueCount(count);
  };

  // Example 1: Normal request with automatic retry
  const makeNormalRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
      setResponse(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Request that will timeout
  const makeSlowRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // This will timeout after 10 seconds (quick timeout)
      const result = await axios.get('https://httpbin.org/delay/15', {
        timeoutType: 'quick',
      });
      setResponse(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Request that will fail and retry
  const makeFailingRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // This will return 500 and trigger retry
      const result = await axios.get('https://httpbin.org/status/500');
      setResponse(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Example 4: Upload with long timeout
  const makeUploadRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', { uri: 'test.txt', name: 'test.txt', type: 'text/plain' });

      const result = await axios.post('https://httpbin.org/post', formData, {
        timeoutType: 'upload',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Clear offline queue
  const clearQueue = async () => {
    await networkService.clearOfflineQueue();
    updateQueueCount();
  };

  // Configure retry settings
  const configureRetry = () => {
    networkService.configureRetry({
      maxRetries: 5,
      baseDelay: 2000,
    });
    setRetryConfig(networkService.getRetryConfig());
  };

  // Reset retry settings
  const resetRetry = () => {
    networkService.resetRetryConfig();
    setRetryConfig(networkService.getRetryConfig());
  };

  const handleRetry = () => {
    setError(null);
    makeNormalRequest();
  };

  const handleDismiss = () => {
    setError(null);
  };

  const getConnectionQualityColor = (quality) => {
    switch (quality) {
      case 'excellent':
        return theme.colors.success;
      case 'good':
        return theme.colors.primary;
      case 'poor':
        return theme.colors.warning;
      case 'offline':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <OfflineIndicator />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Network Status
        </Text>
        
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
              Status:
            </Text>
            <Text style={[styles.value, { color: networkState.isOnline ? theme.colors.success : theme.colors.error }]}>
              {networkState.isOnline ? '🟢 Online' : '🔴 Offline'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
              Connection Type:
            </Text>
            <Text style={[styles.value, { color: theme.colors.text.primary }]}>
              {networkState.connectionType || 'Unknown'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
              Quality:
            </Text>
            <Text style={[styles.value, { color: getConnectionQualityColor(networkState.connectionQuality) }]}>
              {networkState.connectionQuality}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
              Queued Requests:
            </Text>
            <Text style={[styles.value, { color: theme.colors.text.primary }]}>
              {networkState.queuedRequestsCount + queueCount}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Retry Configuration
        </Text>
        
        {retryConfig && (
          <View style={styles.configCard}>
            <Text style={[styles.configText, { color: theme.colors.text.secondary }]}>
              Max Retries: {retryConfig.maxRetries}
            </Text>
            <Text style={[styles.configText, { color: theme.colors.text.secondary }]}>
              Base Delay: {retryConfig.baseDelay}ms
            </Text>
            <Text style={[styles.configText, { color: theme.colors.text.secondary }]}>
              Max Delay: {retryConfig.maxDelay}ms
            </Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: theme.colors.primary }]}
            onPress={configureRetry}
          >
            <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
              Configure
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, { backgroundColor: theme.colors.secondary }]}
            onPress={resetRetry}
          >
            <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Timeout Configuration
        </Text>
        
        {timeoutConfig && (
          <View style={styles.configCard}>
            <Text style={[styles.configText, { color: theme.colors.text.secondary }]}>
              Default: {(timeoutConfig.default / 1000).toFixed(0)}s
            </Text>
            <Text style={[styles.configText, { color: theme.colors.text.secondary }]}>
              Upload: {(timeoutConfig.upload / 1000).toFixed(0)}s
            </Text>
            <Text style={[styles.configText, { color: theme.colors.text.secondary }]}>
              Quick: {(timeoutConfig.quick / 1000).toFixed(0)}s
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Test Requests
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={makeNormalRequest}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
            Normal Request (with retry)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.warning }]}
          onPress={makeSlowRequest}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
            Slow Request (will timeout)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.error }]}
          onPress={makeFailingRequest}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
            Failing Request (will retry)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={makeUploadRequest}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
            Upload Request (long timeout)
          </Text>
        </TouchableOpacity>

        {queueCount > 0 && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.text.disabled }]}
            onPress={clearQueue}
          >
            <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
              Clear Queue ({queueCount})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Making request...
          </Text>
        </View>
      )}

      {error && (
        <NetworkErrorDisplay
          error={error}
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}

      {response && (
        <View style={[styles.responseCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.responseTitle, { color: theme.colors.success }]}>
            ✅ Success
          </Text>
          <Text style={[styles.responseText, { color: theme.colors.text.secondary }]}>
            {JSON.stringify(response, null, 2).substring(0, 200)}...
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  configCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  configText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  smallButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  responseCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default NetworkResilienceExample;
