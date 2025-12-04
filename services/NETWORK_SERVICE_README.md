# Network Service Documentation

## Overview

The Network Service provides comprehensive network resilience features including automatic retry with exponential backoff, offline request queuing, adaptive timeout handling, and real-time connectivity monitoring.

## Features

### 1. Automatic Retry with Exponential Backoff

Requests automatically retry on failure using a full jitter exponential backoff algorithm.

**Algorithm:**
```
delay = random(0, min(maxDelay, baseDelay * 2^retryCount))
```

**Benefits:**
- Prevents thundering herd problem
- Reduces server load during outages
- Increases success rate for transient failures

### 2. Offline Request Queue

Failed requests are queued and automatically retried when connection is restored.

**Features:**
- Persistent storage (survives app restarts)
- Automatic age-based cleanup (24 hours)
- Success/failure tracking
- Manual queue management

### 3. Adaptive Timeout Handling

Different request types get appropriate timeouts automatically.

**Timeout Types:**
- `default`: 30s - Standard requests
- `upload`: 2min - File uploads
- `download`: 1min - File downloads
- `quick`: 10s - Status checks
- `long`: 3min - Exports, reports

### 4. Real-Time Connectivity Monitoring

Network state is monitored and stored in Redux for app-wide access.

**Monitored Properties:**
- Online/offline status
- Connection type (WiFi, cellular, etc.)
- Connection quality (excellent, good, poor, offline)
- Queue status

## Usage

### Basic Usage

```javascript
import axios from './services/networkService';

// Make a request (automatic retry and timeout handling)
const response = await axios.get('/api/data');
```

### Custom Timeout

```javascript
// Use predefined timeout type
axios.get('/api/data', {
  timeoutType: 'quick' // or 'upload', 'download', 'long'
});

// Use custom timeout value
axios.get('/api/data', {
  timeout: 5000 // 5 seconds
});
```

### Configuration

```javascript
import { networkService } from './services/networkService';

// Configure retry
networkService.configureRetry({
  maxRetries: 5,
  baseDelay: 2000,
  maxDelay: 60000,
});

// Configure timeout
networkService.configureTimeout({
  default: 45000,
  upload: 180000,
});

// Get configurations
const retryConfig = networkService.getRetryConfig();
const timeoutConfig = networkService.getTimeoutConfig();

// Reset to defaults
networkService.resetRetryConfig();
networkService.resetTimeoutConfig();
```

### Queue Management

```javascript
// Get queue count
const count = networkService.getQueuedRequestCount();

// Clear queue
await networkService.clearOfflineQueue();

// Process queue manually (usually automatic)
const results = await networkService.processOfflineQueue();
console.log(`Success: ${results.successful}, Failed: ${results.failed}`);
```

### Network State

```javascript
import { useSelector } from 'react-redux';

function MyComponent() {
  const { isOnline, connectionQuality, queuedRequestsCount } = useSelector(
    state => state.network
  );
  
  return (
    <View>
      <Text>Status: {isOnline ? 'Online' : 'Offline'}</Text>
      <Text>Quality: {connectionQuality}</Text>
      <Text>Queued: {queuedRequestsCount}</Text>
    </View>
  );
}
```

## Configuration Options

### Retry Configuration

```javascript
{
  maxRetries: number,           // Maximum retry attempts (default: 3)
  baseDelay: number,            // Base delay in ms (default: 1000)
  maxDelay: number,             // Maximum delay in ms (default: 30000)
  retryableStatusCodes: [],     // HTTP status codes to retry (default: [408, 429, 500, 502, 503, 504])
  retryableMethods: [],         // HTTP methods to retry (default: ['GET', 'PUT', 'DELETE', 'POST'])
}
```

### Timeout Configuration

```javascript
{
  default: number,    // Default timeout (default: 30000)
  upload: number,     // Upload timeout (default: 120000)
  download: number,   // Download timeout (default: 60000)
  quick: number,      // Quick operation timeout (default: 10000)
  long: number,       // Long operation timeout (default: 180000)
}
```

## Error Handling

### Error Types

- `TIMEOUT_ERROR` - Request timeout
- `CONNECTION_ERROR` - Connection failed
- `NETWORK_5xx` - Server error
- `NETWORK_429` - Too many requests
- `NETWORK_401` - Unauthorized (triggers automatic token refresh)

### Error Context

Errors include context information:

```javascript
{
  code: 'TIMEOUT_ERROR',
  message: 'Request timeout',
  context: {
    url: '/api/data',
    method: 'GET',
    timeout: 30000,
    duration: 30123,
  }
}
```

### Handling Errors

```javascript
try {
  const response = await axios.get('/api/data');
} catch (error) {
  if (error.code === 'TIMEOUT_ERROR') {
    // Handle timeout
  } else if (error.code === 'CONNECTION_ERROR') {
    // Handle connection error
  } else {
    // Handle other errors
  }
}
```

## Components

### OfflineIndicator

Displays a banner when offline or when requests are queued.

```javascript
import OfflineIndicator from './components/OfflineIndicator';

<OfflineIndicator />
```

### NetworkErrorDisplay

Displays user-friendly error messages with retry option.

```javascript
import NetworkErrorDisplay from './components/NetworkErrorDisplay';

<NetworkErrorDisplay
  error={error}
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>
```

## Best Practices

1. **Always handle errors**: Provide user feedback for network errors
2. **Use appropriate timeouts**: Choose the right timeout type for your operation
3. **Monitor queue status**: Show users when requests are queued
4. **Test offline scenarios**: Ensure your app works offline
5. **Configure for your needs**: Adjust retry and timeout settings based on your API

## Testing

### Simulate Offline

```javascript
import NetInfo from '@react-native-community/netinfo';

// Check current state
const state = await NetInfo.fetch();
console.log('Is connected?', state.isConnected);
```

### Test Retry Logic

```javascript
// Mock a failing endpoint
import MockAdapter from 'axios-mock-adapter';
const mock = new MockAdapter(axios);

mock.onGet('/api/data').reply(500);
```

### Test Timeout

```javascript
// Mock a slow endpoint
mock.onGet('/api/slow').reply(() => {
  return new Promise(resolve => {
    setTimeout(() => resolve([200, { data: 'success' }]), 35000);
  });
});
```

## Performance Considerations

- **Exponential backoff** prevents overwhelming the server
- **Queue persistence** uses AsyncStorage efficiently
- **Age-based cleanup** prevents unbounded queue growth
- **Full jitter** distributes retry attempts over time

## Security

- **Token refresh**: Automatic on 401 errors
- **Secure storage**: Queue uses AsyncStorage
- **Request validation**: All queued requests validated before retry
- **Error logging**: Errors logged to monitoring service

## Troubleshooting

### Requests not retrying

1. Check if error is retryable (status code and method)
2. Verify max retries not exceeded
3. Check console logs for retry attempts

### Queue not processing

1. Verify device is online
2. Check AsyncStorage for persisted queue
3. Verify queue items not older than 24 hours

### Timeout issues

1. Check timeout configuration
2. Verify request type detection
3. Consider increasing timeout for specific operations

## Related Files

- `services/networkService.js` - Main service implementation
- `redux/reducers/networkReducers.js` - Network state reducer
- `components/OfflineIndicator.js` - Offline indicator component
- `components/NetworkErrorDisplay.js` - Error display component
- `docs/NETWORK_RESILIENCE_GUIDE.md` - Comprehensive guide
- `docs/NETWORK_RESILIENCE_QUICK_REFERENCE.md` - Quick reference

## Support

For issues or questions, refer to:
- [Network Resilience Guide](../docs/NETWORK_RESILIENCE_GUIDE.md)
- [Quick Reference](../docs/NETWORK_RESILIENCE_QUICK_REFERENCE.md)
- [Task 16 Summary](../docs/TASK_16_NETWORK_RESILIENCE_SUMMARY.md)
