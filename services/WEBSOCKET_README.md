# Enhanced WebSocket Implementation

This document describes the enhanced WebSocket implementation with connection handling, automatic reconnection, heartbeat mechanism, and error recovery.

## Features

### 1. Connection State Management
- **States**: `disconnected`, `connecting`, `connected`, `reconnecting`, `failed`
- Automatic state transitions with callbacks
- State change notifications

### 2. Automatic Reconnection
- Exponential backoff strategy (1s, 2s, 4s, 8s, 16s, 32s, 64s, max 60s)
- Configurable max reconnection attempts (default: 10)
- Automatic reconnection on connection loss

### 3. Heartbeat Mechanism
- Periodic ping/pong messages (default: 30s interval)
- Detects stale connections
- Automatic reconnection on heartbeat failure

### 4. Connection Quality Monitoring
- **Excellent**: < 100ms latency
- **Good**: 100-300ms latency
- **Poor**: 300-1000ms latency
- **Offline**: > 1000ms or disconnected
- Based on rolling average of last 10 measurements

### 5. Message Handling
- Pub-sub pattern for channel-based routing
- Message validation
- Error handling for message handlers
- Message queue for offline scenarios

### 6. Error Recovery
- User notifications for connection errors
- Reconnection UI indicators
- Polling fallback when WebSocket unavailable
- Manual reconnection option

## Usage

### Basic Setup

```javascript
import {WebSocketProvider} from './context/WebSocketContext';

function App() {
  return (
    <WebSocketProvider>
      {/* Your app components */}
    </WebSocketProvider>
  );
}
```

### Using the Hook

```javascript
import useWebSocketWithRecovery from './hooks/useWebSocketWithRecovery';

function MyComponent() {
  const handleMessage = useCallback((message) => {
    console.log('Received:', message);
  }, []);

  const {
    connectionState,
    connectionQuality,
    isConnected,
    reconnect,
  } = useWebSocketWithRecovery('my-channel', handleMessage, {
    autoReconnect: true,
    onError: (error) => console.error(error),
    onReconnect: () => console.log('Reconnected!'),
  });

  return (
    <View>
      <Text>State: {connectionState}</Text>
      <Text>Quality: {connectionQuality}</Text>
    </View>
  );
}
```

### Using Status Components

```javascript
import WebSocketStatus from './components/WebSocketStatus';
import WebSocketErrorNotification from './components/WebSocketErrorNotification';

function MyScreen() {
  return (
    <View>
      <WebSocketErrorNotification />
      {/* Your content */}
      <WebSocketStatus showQuality={true} showReconnect={true} />
    </View>
  );
}
```

### Direct WebSocket Manager Usage

```javascript
import {useWebSocket} from './context/WebSocketContext';

function MyComponent() {
  const {wsManager, subscribe, send} = useWebSocket();

  useEffect(() => {
    // Subscribe to a channel
    const unsubscribe = subscribe('match-updates', (message) => {
      console.log('Match update:', message);
    });

    return unsubscribe;
  }, [subscribe]);

  const sendMessage = () => {
    send({
      type: 'update',
      channel: 'match-updates',
      data: {score: 10},
    });
  };

  return (
    <Button onPress={sendMessage} title="Send Update" />
  );
}
```

## Configuration

### WebSocketManager Options

```javascript
const config = {
  url: 'ws://example.com/ws',              // WebSocket URL
  reconnect: true,                          // Enable auto-reconnect
  reconnectInterval: 1000,                  // Initial reconnect delay (ms)
  maxReconnectAttempts: 10,                 // Max reconnection attempts
  heartbeatInterval: 30000,                 // Heartbeat interval (ms)
  connectionTimeout: 10000,                 // Connection timeout (ms)
  enablePollingFallback: true,              // Enable polling fallback
  pollingInterval: 5000,                    // Polling interval (ms)
  pollingUrl: 'http://example.com/poll',   // Polling endpoint
  
  // Callbacks
  onConnect: () => {},
  onDisconnect: () => {},
  onError: (error) => {},
  onMessage: (message) => {},
  onStateChange: (newState, oldState) => {},
  onQualityChange: (newQuality, oldQuality) => {},
  onFallbackToPolling: () => {},
};
```

## Message Format

### Outgoing Messages

```javascript
{
  type: 'message-type',      // Required: message type
  channel: 'channel-name',   // Optional: target channel
  data: {},                  // Optional: message payload
  timestamp: 1234567890      // Optional: timestamp
}
```

### Incoming Messages

```javascript
{
  type: 'message-type',      // Required: message type
  channel: 'channel-name',   // Optional: source channel
  data: {},                  // Optional: message payload
}
```

### Heartbeat Messages

```javascript
// Ping
{
  type: 'ping',
  timestamp: 1234567890
}

// Pong
{
  type: 'pong',
  timestamp: 1234567890
}
```

## API Reference

### WebSocketManager

#### Methods

- `connect(authToken)` - Connect to WebSocket server
- `disconnect()` - Disconnect from server
- `send(message)` - Send message through WebSocket
- `subscribe(channel, handler)` - Subscribe to channel
- `unsubscribeAll(channel)` - Unsubscribe all handlers from channel
- `getConnectionState()` - Get current connection state
- `getConnectionQuality()` - Get current connection quality
- `getAverageLatency()` - Get average latency in ms
- `getActiveChannels()` - Get list of active channels
- `getHandlerCount(channel)` - Get number of handlers for channel
- `isUsingPolling()` - Check if using polling fallback

### useWebSocketWithRecovery Hook

#### Parameters

- `channel` (string) - Channel to subscribe to
- `onMessage` (function) - Message handler callback
- `options` (object) - Configuration options
  - `autoReconnect` (boolean) - Enable auto-reconnect
  - `onError` (function) - Error callback
  - `onReconnect` (function) - Reconnection callback

#### Returns

```javascript
{
  connectionState,      // Current connection state
  connectionQuality,    // Current connection quality
  error,               // Current error (if any)
  isConnected,         // Boolean: is connected
  isConnecting,        // Boolean: is connecting
  isReconnecting,      // Boolean: is reconnecting
  isDisconnected,      // Boolean: is disconnected
  isFailed,            // Boolean: connection failed
  reconnect,           // Function: manual reconnect
  clearError,          // Function: clear error
}
```

## Requirements Validation

This implementation satisfies the following requirements:

### Requirement 6.1
✓ WebSocket connection established for live matches
✓ Connection state management (connecting, connected, disconnected)

### Requirement 6.2
✓ UI updates within 500ms of receiving score updates
✓ Message handling and routing system

### Requirement 6.3
✓ Automatic reconnection with exponential backoff
✓ Connection error handling

### Requirement 6.4
✓ Connection status indicators
✓ Heartbeat mechanism to detect stale connections
✓ Connection quality monitoring

### Requirement 6.5
✓ WebSocket message parsing error handling
✓ Message validation
✓ Error boundaries for message handlers

## Testing

See `__tests__/services/WebSocketManager.test.js` for unit tests.

## Troubleshooting

### Connection keeps failing
- Check WebSocket URL is correct
- Verify authentication token is valid
- Check network connectivity
- Review server logs for connection errors

### Messages not received
- Verify subscription to correct channel
- Check message format matches expected structure
- Review message validation logic
- Check for errors in message handlers

### High latency
- Check network conditions
- Verify server performance
- Consider reducing heartbeat interval
- Review message size and frequency

### Polling fallback not working
- Verify `pollingUrl` is configured
- Check polling endpoint returns correct format
- Verify `enablePollingFallback` is true
- Review polling interval configuration
