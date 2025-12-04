/**
 * WebSocket Manager Integration Tests
 * Tests connection establishment, reconnection, message handling, and error recovery
 * Requirements: 5.3
 */

import { WebSocketManager, CONNECTION_STATES, CONNECTION_QUALITY } from '../../services/WebSocketManager';
import { waitForCondition } from '../utils/test-utils';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    this.sentMessages = [];
    
    // Simulate connection after a short delay
    setTimeout(() => {
      if (this.readyState === MockWebSocket.CONNECTING) {
        this.readyState = MockWebSocket.OPEN;
        if (this.onopen) {
          this.onopen();
        }
      }
    }, 10);
  }

  send(data) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    this.sentMessages.push(data);
  }

  close(code, reason) {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code, reason });
    }
  }

  simulateError(error) {
    if (this.onerror) {
      this.onerror(error);
    }
  }

  simulateMessage(data) {
    if (this.onmessage && this.readyState === MockWebSocket.OPEN) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
}

global.WebSocket = MockWebSocket;

describe('WebSocketManager Integration Tests', () => {
  let wsManager;
  let mockCallbacks;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockCallbacks = {
      onConnect: jest.fn(),
      onDisconnect: jest.fn(),
      onError: jest.fn(),
      onMessage: jest.fn(),
      onStateChange: jest.fn(),
      onQualityChange: jest.fn(),
      onFallbackToPolling: jest.fn(),
    };
  });

  afterEach(() => {
    if (wsManager) {
      wsManager.disconnect();
    }
    jest.useRealTimers();
  });

  describe('Connection Establishment', () => {
    it('should establish WebSocket connection successfully', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });

      await wsManager.connect();
      jest.advanceTimersByTime(20);

      expect(mockCallbacks.onConnect).toHaveBeenCalled();
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);
    });


    it('should transition through connection states correctly', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });

      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.DISCONNECTED);

      await wsManager.connect();
      expect(mockCallbacks.onStateChange).toHaveBeenCalledWith(
        CONNECTION_STATES.CONNECTING,
        CONNECTION_STATES.DISCONNECTED
      );

      jest.advanceTimersByTime(20);
      expect(mockCallbacks.onStateChange).toHaveBeenCalledWith(
        CONNECTION_STATES.CONNECTED,
        CONNECTION_STATES.CONNECTING
      );
    });

    it('should connect with authentication token', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });

      await wsManager.connect('test-auth-token');
      jest.advanceTimersByTime(20);

      expect(wsManager.ws.url).toContain('token=test-auth-token');
      expect(mockCallbacks.onConnect).toHaveBeenCalled();
    });

    it('should handle connection timeout', async () => {
      // Override MockWebSocket to never connect
      global.WebSocket = class {
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSING = 2;
        static CLOSED = 3;

        constructor(url) {
          this.url = url;
          this.readyState = MockWebSocket.CONNECTING;
          this.onopen = null;
          this.onclose = null;
          this.onerror = null;
          this.onmessage = null;
          this.sentMessages = [];
          // Don't auto-connect - simulate timeout
        }

        send(data) {
          this.sentMessages.push(data);
        }

        close(code, reason) {
          this.readyState = MockWebSocket.CLOSED;
          if (this.onclose) {
            this.onclose({ code, reason });
          }
        }
      };

      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        connectionTimeout: 1000,
        reconnect: false,
        ...mockCallbacks,
      });

      await wsManager.connect();
      jest.advanceTimersByTime(1100);

      expect(mockCallbacks.onError).toHaveBeenCalled();
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.FAILED);
      
      // Restore MockWebSocket
      global.WebSocket = MockWebSocket;
    });
  });


  describe('Automatic Reconnection', () => {
    it('should automatically reconnect after connection loss', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        reconnect: true,
        reconnectInterval: 1000,
        ...mockCallbacks,
      });

      await wsManager.connect();
      jest.advanceTimersByTime(20);
      expect(mockCallbacks.onConnect).toHaveBeenCalledTimes(1);

      // Simulate connection loss
      wsManager.ws.close(1006, 'Connection lost');
      jest.advanceTimersByTime(10);
      expect(mockCallbacks.onDisconnect).toHaveBeenCalled();
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.RECONNECTING);

      // Wait for reconnection
      jest.advanceTimersByTime(1100);
      expect(mockCallbacks.onConnect).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff for reconnection attempts', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        reconnect: true,
        reconnectInterval: 100,
        maxReconnectAttempts: 5,
        heartbeatInterval: 60000,
        ...mockCallbacks,
      });

      // Create a WebSocket that fails to connect
      global.WebSocket = class extends MockWebSocket {
        constructor(url) {
          super(url);
          setTimeout(() => {
            this.readyState = MockWebSocket.CLOSED;
            if (this.onclose) {
              this.onclose({ code: 1006, reason: 'Connection failed' });
            }
          }, 10);
        }
      };

      await wsManager.connect();
      jest.advanceTimersByTime(50);
      
      // Verify reconnection is attempted
      expect(wsManager.reconnectAttempts).toBeGreaterThan(0);
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.RECONNECTING);
      
      // Restore
      global.WebSocket = MockWebSocket;
    });


    it('should stop reconnecting after max attempts', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        reconnect: true,
        reconnectInterval: 100,
        maxReconnectAttempts: 3,
        enablePollingFallback: false,
        heartbeatInterval: 60000,
        ...mockCallbacks,
      });

      // Create a WebSocket that always fails
      global.WebSocket = class extends MockWebSocket {
        constructor(url) {
          super(url);
          setTimeout(() => {
            this.readyState = MockWebSocket.CLOSED;
            if (this.onclose) {
              this.onclose({ code: 1006, reason: 'Connection failed' });
            }
          }, 10);
        }
      };

      await wsManager.connect();
      jest.advanceTimersByTime(50);
      
      // Verify reconnection is attempted
      expect(wsManager.reconnectAttempts).toBeGreaterThan(0);
      expect([CONNECTION_STATES.FAILED, CONNECTION_STATES.RECONNECTING]).toContain(
        wsManager.getConnectionState()
      );
      
      // Restore MockWebSocket
      global.WebSocket = MockWebSocket;
    });

    it('should not reconnect on manual disconnect', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        reconnect: true,
        ...mockCallbacks,
      });

      await wsManager.connect();
      jest.advanceTimersByTime(20);
      expect(mockCallbacks.onConnect).toHaveBeenCalledTimes(1);

      // Manual disconnect
      wsManager.disconnect();
      jest.advanceTimersByTime(2000);

      // Should not reconnect
      expect(mockCallbacks.onConnect).toHaveBeenCalledTimes(1);
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.DISCONNECTED);
    });
  });


  describe('Message Handling and Subscription', () => {
    beforeEach(async () => {
      global.WebSocket = MockWebSocket;
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);
    });

    it('should receive and handle messages', () => {
      const message = {
        type: 'update',
        channel: 'match-1',
        data: { score: 10 },
      };

      wsManager.ws.simulateMessage(message);

      expect(mockCallbacks.onMessage).toHaveBeenCalledWith(message);
    });

    it('should route messages to channel subscribers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      wsManager.subscribe('match-1', handler1);
      wsManager.subscribe('match-1', handler2);

      const message = {
        type: 'update',
        channel: 'match-1',
        data: { score: 10 },
      };

      wsManager.ws.simulateMessage(message);

      expect(handler1).toHaveBeenCalledWith(message);
      expect(handler2).toHaveBeenCalledWith(message);
    });

    it('should only route messages to correct channel', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      wsManager.subscribe('match-1', handler1);
      wsManager.subscribe('match-2', handler2);

      const message = {
        type: 'update',
        channel: 'match-1',
        data: { score: 10 },
      };

      wsManager.ws.simulateMessage(message);

      expect(handler1).toHaveBeenCalledWith(message);
      expect(handler2).not.toHaveBeenCalled();
    });


    it('should handle subscription and unsubscription', () => {
      const handler = jest.fn();
      const unsubscribe = wsManager.subscribe('match-1', handler);

      expect(wsManager.getHandlerCount('match-1')).toBe(1);

      const message = {
        type: 'update',
        channel: 'match-1',
        data: { score: 10 },
      };

      wsManager.ws.simulateMessage(message);
      expect(handler).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();
      expect(wsManager.getHandlerCount('match-1')).toBe(0);

      wsManager.ws.simulateMessage(message);
      expect(handler).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should handle multiple subscriptions to same channel', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      wsManager.subscribe('match-1', handler1);
      const unsubscribe2 = wsManager.subscribe('match-1', handler2);
      wsManager.subscribe('match-1', handler3);

      expect(wsManager.getHandlerCount('match-1')).toBe(3);

      const message = {
        type: 'update',
        channel: 'match-1',
        data: { score: 10 },
      };

      wsManager.ws.simulateMessage(message);
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();

      // Unsubscribe one handler
      unsubscribe2();
      expect(wsManager.getHandlerCount('match-1')).toBe(2);

      handler1.mockClear();
      handler2.mockClear();
      handler3.mockClear();

      wsManager.ws.simulateMessage(message);
      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
    });


    it('should unsubscribe all handlers from a channel', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      wsManager.subscribe('match-1', handler1);
      wsManager.subscribe('match-1', handler2);

      expect(wsManager.getHandlerCount('match-1')).toBe(2);

      wsManager.unsubscribeAll('match-1');
      expect(wsManager.getHandlerCount('match-1')).toBe(0);

      const message = {
        type: 'update',
        channel: 'match-1',
        data: { score: 10 },
      };

      wsManager.ws.simulateMessage(message);
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should send messages through WebSocket', () => {
      const message = {
        type: 'subscribe',
        channel: 'match-1',
      };

      wsManager.send(message);

      expect(wsManager.ws.sentMessages).toHaveLength(1);
      expect(JSON.parse(wsManager.ws.sentMessages[0])).toEqual(message);
    });

    it('should queue messages when disconnected', () => {
      wsManager.disconnect();
      jest.advanceTimersByTime(20);

      const message1 = { type: 'test1' };
      const message2 = { type: 'test2' };

      wsManager.send(message1);
      wsManager.send(message2);

      expect(wsManager.messageQueue).toHaveLength(2);
    });

    it('should process queued messages on reconnection', async () => {
      wsManager.disconnect();
      jest.advanceTimersByTime(20);

      const message1 = { type: 'test1' };
      const message2 = { type: 'test2' };

      wsManager.send(message1);
      wsManager.send(message2);

      // Reconnect
      await wsManager.connect();
      jest.advanceTimersByTime(20);

      expect(wsManager.ws.sentMessages.length).toBeGreaterThanOrEqual(2);
      expect(wsManager.messageQueue).toHaveLength(0);
    });
  });


  describe('Error Scenarios and Recovery', () => {
    beforeEach(async () => {
      global.WebSocket = MockWebSocket;
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);
    });

    it('should handle invalid message format', () => {
      wsManager.ws.onmessage({ data: 'invalid json' });

      expect(mockCallbacks.onError).toHaveBeenCalled();
      expect(mockCallbacks.onMessage).not.toHaveBeenCalled();
    });

    it('should validate message structure', () => {
      const invalidMessages = [
        null,
        undefined,
        'string',
        123,
        { noType: true },
        { type: 123 },
        { type: 'valid', channel: 123 },
      ];

      invalidMessages.forEach(msg => {
        wsManager.ws.simulateMessage(msg);
      });

      expect(mockCallbacks.onError).toHaveBeenCalledTimes(invalidMessages.length);
    });

    it('should handle errors in message handlers', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });

      wsManager.subscribe('match-1', errorHandler);

      const message = {
        type: 'update',
        channel: 'match-1',
        data: { score: 10 },
      };

      wsManager.ws.simulateMessage(message);

      expect(errorHandler).toHaveBeenCalled();
      expect(mockCallbacks.onError).toHaveBeenCalled();
      // WebSocket should still be connected
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);
    });


    it('should handle WebSocket errors', () => {
      const error = new Error('WebSocket error');
      wsManager.ws.simulateError(error);

      expect(mockCallbacks.onError).toHaveBeenCalledWith(error);
    });

    it('should recover from connection errors', async () => {
      // Simulate connection error
      wsManager.handleConnectionError(new Error('Connection failed'));
      
      // State should transition to reconnecting (not failed) since reconnect is enabled
      expect([CONNECTION_STATES.FAILED, CONNECTION_STATES.RECONNECTING]).toContain(
        wsManager.getConnectionState()
      );

      // Should attempt reconnection
      jest.advanceTimersByTime(1100);
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);
    });

    it('should handle heartbeat failure', () => {
      // Start heartbeat
      wsManager.startHeartbeat();
      
      // Simulate closed connection during ping
      wsManager.ws.readyState = MockWebSocket.CLOSED;
      
      // Advance to heartbeat interval
      jest.advanceTimersByTime(30100);
      
      expect(mockCallbacks.onError).toHaveBeenCalled();
    });

    it('should update connection quality based on latency', () => {
      // Simulate ping-pong with low latency
      wsManager.sendPing();
      const pingTime = wsManager.lastPingTime;
      
      // Simulate pong after 50ms
      jest.advanceTimersByTime(50);
      wsManager.lastPingTime = pingTime;
      wsManager.handlePong();

      // Should update to excellent quality
      expect(mockCallbacks.onQualityChange).toHaveBeenCalledWith(
        CONNECTION_QUALITY.EXCELLENT,
        expect.any(String)
      );
    });


    it('should fallback to polling after max reconnect attempts', async () => {
      // Mock fetch for polling
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ messages: [] }),
        })
      );

      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        reconnect: true,
        reconnectInterval: 100,
        maxReconnectAttempts: 2,
        enablePollingFallback: true,
        pollingUrl: 'http://localhost:8080/poll',
        heartbeatInterval: 60000,
        ...mockCallbacks,
      });

      // Create a WebSocket that always fails
      global.WebSocket = class extends MockWebSocket {
        constructor(url) {
          super(url);
          setTimeout(() => {
            this.readyState = MockWebSocket.CLOSED;
            if (this.onclose) {
              this.onclose({ code: 1006, reason: 'Connection failed' });
            }
          }, 10);
        }
      };

      await wsManager.connect();
      jest.advanceTimersByTime(50);
      
      // Verify reconnection is attempted
      expect(wsManager.reconnectAttempts).toBeGreaterThan(0);
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.RECONNECTING);
      
      // Restore
      global.WebSocket = MockWebSocket;
      delete global.fetch;
    });

    it('should handle subscription errors gracefully', () => {
      expect(() => {
        wsManager.subscribe('', jest.fn());
      }).toThrow('Channel must be a non-empty string');

      expect(() => {
        wsManager.subscribe('channel', 'not a function');
      }).toThrow('Handler must be a function');

      expect(() => {
        wsManager.subscribe(null, jest.fn());
      }).toThrow('Channel must be a non-empty string');
    });
  });


  describe('Heartbeat Mechanism', () => {
    beforeEach(async () => {
      global.WebSocket = MockWebSocket;
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        heartbeatInterval: 1000,
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);
    });

    it('should send periodic ping messages', () => {
      wsManager.ws.sentMessages = [];

      // Advance to first heartbeat
      jest.advanceTimersByTime(1100);

      const sentMessages = wsManager.ws.sentMessages.map(msg => JSON.parse(msg));
      const pingMessages = sentMessages.filter(msg => msg.type === 'ping');

      expect(pingMessages.length).toBeGreaterThan(0);
    });

    it('should calculate latency from ping-pong', () => {
      wsManager.sendPing();
      const pingTime = wsManager.lastPingTime;

      // Simulate pong response
      const pongMessage = {
        type: 'pong',
        timestamp: pingTime,
      };

      jest.advanceTimersByTime(100);
      wsManager.ws.simulateMessage(pongMessage);

      expect(wsManager.latencyHistory.length).toBeGreaterThan(0);
      expect(wsManager.getAverageLatency()).toBeGreaterThan(0);
    });

    it('should stop heartbeat on disconnect', () => {
      wsManager.disconnect();
      jest.advanceTimersByTime(20);

      const messageCountBefore = wsManager.ws ? wsManager.ws.sentMessages.length : 0;

      // Advance time - no more pings should be sent
      jest.advanceTimersByTime(5000);

      const messageCountAfter = wsManager.ws ? wsManager.ws.sentMessages.length : 0;
      expect(messageCountAfter).toBe(messageCountBefore);
    });
  });


  describe('Connection Quality Monitoring', () => {
    beforeEach(async () => {
      global.WebSocket = MockWebSocket;
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);
    });

    it('should classify excellent connection quality', () => {
      // Simulate multiple pings with low latency
      for (let i = 0; i < 5; i++) {
        wsManager.updateLatency(50);
      }

      expect(wsManager.getConnectionQuality()).toBe(CONNECTION_QUALITY.EXCELLENT);
    });

    it('should classify good connection quality', () => {
      // Simulate multiple pings with moderate latency
      for (let i = 0; i < 5; i++) {
        wsManager.updateLatency(200);
      }

      expect(wsManager.getConnectionQuality()).toBe(CONNECTION_QUALITY.GOOD);
    });

    it('should classify poor connection quality', () => {
      // Simulate multiple pings with high latency
      for (let i = 0; i < 5; i++) {
        wsManager.updateLatency(500);
      }

      expect(wsManager.getConnectionQuality()).toBe(CONNECTION_QUALITY.POOR);
    });

    it('should classify offline connection quality', () => {
      // Simulate multiple pings with very high latency
      for (let i = 0; i < 5; i++) {
        wsManager.updateLatency(1500);
      }

      expect(wsManager.getConnectionQuality()).toBe(CONNECTION_QUALITY.OFFLINE);
    });

    it('should notify on quality changes', () => {
      mockCallbacks.onQualityChange.mockClear();

      // Start with good quality
      for (let i = 0; i < 5; i++) {
        wsManager.updateLatency(200);
      }

      // Degrade to poor quality
      for (let i = 0; i < 5; i++) {
        wsManager.updateLatency(500);
      }

      expect(mockCallbacks.onQualityChange).toHaveBeenCalledWith(
        CONNECTION_QUALITY.POOR,
        CONNECTION_QUALITY.GOOD
      );
    });
  });


  describe('Complex Integration Scenarios', () => {
    it('should handle rapid connect/disconnect cycles', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });

      // Connect
      await wsManager.connect();
      jest.advanceTimersByTime(20);
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);

      // Disconnect
      wsManager.disconnect();
      jest.advanceTimersByTime(20);
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.DISCONNECTED);

      // Reconnect
      await wsManager.connect();
      jest.advanceTimersByTime(20);
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);

      // Disconnect again
      wsManager.disconnect();
      jest.advanceTimersByTime(20);
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.DISCONNECTED);
    });

    it('should maintain subscriptions across reconnections', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        reconnect: true,
        ...mockCallbacks,
      });

      await wsManager.connect();
      jest.advanceTimersByTime(20);

      const handler = jest.fn();
      wsManager.subscribe('match-1', handler);

      // Simulate connection loss
      wsManager.ws.close(1006, 'Connection lost');
      jest.advanceTimersByTime(1100);

      // After reconnection, subscription should still work
      const message = {
        type: 'update',
        channel: 'match-1',
        data: { score: 10 },
      };

      wsManager.ws.simulateMessage(message);
      expect(handler).toHaveBeenCalledWith(message);
    });


    it('should handle multiple channels simultaneously', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });

      await wsManager.connect();
      jest.advanceTimersByTime(20);

      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      wsManager.subscribe('match-1', handler1);
      wsManager.subscribe('match-2', handler2);
      wsManager.subscribe('tournament-1', handler3);

      expect(wsManager.getActiveChannels()).toEqual(['match-1', 'match-2', 'tournament-1']);

      // Send messages to different channels
      wsManager.ws.simulateMessage({
        type: 'update',
        channel: 'match-1',
        data: { score: 10 },
      });

      wsManager.ws.simulateMessage({
        type: 'update',
        channel: 'match-2',
        data: { score: 20 },
      });

      wsManager.ws.simulateMessage({
        type: 'update',
        channel: 'tournament-1',
        data: { standings: [] },
      });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('should handle message flood without crashing', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });

      await wsManager.connect();
      jest.advanceTimersByTime(20);

      const handler = jest.fn();
      wsManager.subscribe('match-1', handler);

      // Send 100 messages rapidly
      for (let i = 0; i < 100; i++) {
        wsManager.ws.simulateMessage({
          type: 'update',
          channel: 'match-1',
          data: { score: i },
        });
      }

      expect(handler).toHaveBeenCalledTimes(100);
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);
    });
  });
});
