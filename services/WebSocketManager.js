/**
 * Enhanced WebSocket Manager with connection handling, automatic reconnection,
 * heartbeat mechanism, and connection quality monitoring
 */

const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed',
};

const CONNECTION_QUALITY = {
  EXCELLENT: 'excellent', // < 100ms latency
  GOOD: 'good',          // 100-300ms latency
  POOR: 'poor',          // 300-1000ms latency
  OFFLINE: 'offline',    // > 1000ms or disconnected
};

class WebSocketManager {
  constructor(config = {}) {
    this.url = config.url || '';
    this.reconnect = config.reconnect !== false;
    this.reconnectInterval = config.reconnectInterval || 1000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
    this.heartbeatInterval = config.heartbeatInterval || 30000;
    this.connectionTimeout = config.connectionTimeout || 10000;
    this.enablePollingFallback = config.enablePollingFallback !== false;
    this.pollingInterval = config.pollingInterval || 5000;
    this.pollingUrl = config.pollingUrl || null;
    
    // Callbacks
    this.onConnect = config.onConnect || (() => {});
    this.onDisconnect = config.onDisconnect || (() => {});
    this.onError = config.onError || (() => {});
    this.onMessage = config.onMessage || (() => {});
    this.onStateChange = config.onStateChange || (() => {});
    this.onQualityChange = config.onQualityChange || (() => {});
    this.onFallbackToPolling = config.onFallbackToPolling || (() => {});
    
    // State
    this.ws = null;
    this.connectionState = CONNECTION_STATES.DISCONNECTED;
    this.connectionQuality = CONNECTION_QUALITY.OFFLINE;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.connectionTimer = null;
    this.pollingTimer = null;
    this.lastPingTime = null;
    this.latencyHistory = [];
    this.isManualClose = false;
    this.isPollingMode = false;
    
    // Message subscriptions
    this.subscriptions = new Map();
    this.messageQueue = [];
  }

  /**
   * Connect to WebSocket server
   */
  async connect(authToken = null) {
    if (this.connectionState === CONNECTION_STATES.CONNECTING || 
        this.connectionState === CONNECTION_STATES.CONNECTED) {
      console.log('WebSocket already connecting or connected');
      return;
    }

    this.isManualClose = false;
    this.updateConnectionState(CONNECTION_STATES.CONNECTING);

    try {
      const wsUrl = authToken ? `${this.url}?token=${authToken}` : this.url;
      
      this.ws = new WebSocket(wsUrl);
      
      // Set connection timeout
      this.connectionTimer = setTimeout(() => {
        if (this.connectionState === CONNECTION_STATES.CONNECTING) {
          console.error('WebSocket connection timeout');
          this.handleConnectionError(new Error('Connection timeout'));
        }
      }, this.connectionTimeout);

      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onerror = (error) => this.handleError(error);
      this.ws.onclose = (event) => this.handleClose(event);
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleConnectionError(error);
    }
  }

  /**
   * Handle WebSocket open event
   */
  handleOpen() {
    console.log('WebSocket connection established');
    
    clearTimeout(this.connectionTimer);
    this.reconnectAttempts = 0;
    this.updateConnectionState(CONNECTION_STATES.CONNECTED);
    this.updateConnectionQuality(CONNECTION_QUALITY.GOOD);
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Process queued messages
    this.processMessageQueue();
    
    this.onConnect();
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      
      // Validate message structure
      if (!this.validateMessage(message)) {
        console.error('Invalid message structure:', message);
        this.onError(new Error('Invalid message structure'));
        return;
      }
      
      // Handle pong response for heartbeat
      if (message.type === 'pong') {
        this.handlePong();
        return;
      }
      
      // Broadcast to all subscribers
      this.onMessage(message);
      
      // Route to specific channel subscribers
      if (message.channel) {
        const handlers = this.subscriptions.get(message.channel);
        if (handlers) {
          handlers.forEach(handler => {
            try {
              handler(message);
            } catch (error) {
              console.error('Error in message handler:', error);
              this.onError(error);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      this.onError(error);
    }
  }

  /**
   * Validate message structure
   */
  validateMessage(message) {
    if (!message || typeof message !== 'object') {
      return false;
    }
    
    // Message must have a type
    if (!message.type || typeof message.type !== 'string') {
      return false;
    }
    
    // If message has a channel, it must be a string
    if (message.channel !== undefined && typeof message.channel !== 'string') {
      return false;
    }
    
    return true;
  }

  /**
   * Handle WebSocket error
   */
  handleError(error) {
    console.error('WebSocket error:', error);
    this.onError(error);
  }

  /**
   * Handle WebSocket close event
   */
  handleClose(event) {
    console.log('WebSocket connection closed:', event.code, event.reason);
    
    clearTimeout(this.connectionTimer);
    this.stopHeartbeat();
    
    this.updateConnectionState(CONNECTION_STATES.DISCONNECTED);
    this.updateConnectionQuality(CONNECTION_QUALITY.OFFLINE);
    
    this.onDisconnect();
    
    // Attempt reconnection if not manually closed
    if (!this.isManualClose && this.reconnect) {
      this.attemptReconnect();
    }
  }

  /**
   * Handle connection errors
   */
  handleConnectionError(error) {
    clearTimeout(this.connectionTimer);
    this.stopHeartbeat();
    
    this.updateConnectionState(CONNECTION_STATES.FAILED);
    this.updateConnectionQuality(CONNECTION_QUALITY.OFFLINE);
    
    this.onError(error);
    
    if (this.reconnect) {
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.updateConnectionState(CONNECTION_STATES.FAILED);
      
      // Fallback to polling if enabled
      if (this.enablePollingFallback && this.pollingUrl) {
        this.startPolling();
      }
      return;
    }

    this.reconnectAttempts++;
    this.updateConnectionState(CONNECTION_STATES.RECONNECTING);
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 64s...
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      60000 // Max 60 seconds
    );
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start polling fallback when WebSocket is unavailable
   */
  startPolling() {
    if (!this.pollingUrl) {
      console.warn('Polling URL not configured');
      return;
    }

    console.log('Starting polling fallback');
    this.isPollingMode = true;
    this.onFallbackToPolling();
    
    this.pollingTimer = setInterval(async () => {
      try {
        const response = await fetch(this.pollingUrl);
        if (response.ok) {
          const data = await response.json();
          if (data.messages && Array.isArray(data.messages)) {
            data.messages.forEach(message => {
              this.handleMessage({data: JSON.stringify(message)});
            });
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, this.pollingInterval);
  }

  /**
   * Stop polling fallback
   */
  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
      this.isPollingMode = false;
      console.log('Stopped polling fallback');
    }
  }

  /**
   * Start heartbeat mechanism
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.connectionState === CONNECTION_STATES.CONNECTED) {
        this.sendPing();
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat mechanism
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Send ping message for heartbeat
   */
  sendPing() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.lastPingTime = Date.now();
      this.send({ type: 'ping', timestamp: this.lastPingTime });
    } else {
      console.warn('Cannot send ping: WebSocket not open');
      this.handleConnectionError(new Error('Connection lost'));
    }
  }

  /**
   * Handle pong response
   */
  handlePong() {
    if (this.lastPingTime) {
      const latency = Date.now() - this.lastPingTime;
      this.updateLatency(latency);
      this.lastPingTime = null;
    }
  }

  /**
   * Update latency and connection quality
   */
  updateLatency(latency) {
    this.latencyHistory.push(latency);
    
    // Keep only last 10 measurements
    if (this.latencyHistory.length > 10) {
      this.latencyHistory.shift();
    }
    
    // Calculate average latency
    const avgLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
    
    // Update connection quality based on average latency
    let quality;
    if (avgLatency < 100) {
      quality = CONNECTION_QUALITY.EXCELLENT;
    } else if (avgLatency < 300) {
      quality = CONNECTION_QUALITY.GOOD;
    } else if (avgLatency < 1000) {
      quality = CONNECTION_QUALITY.POOR;
    } else {
      quality = CONNECTION_QUALITY.OFFLINE;
    }
    
    if (quality !== this.connectionQuality) {
      this.updateConnectionQuality(quality);
    }
  }

  /**
   * Send message through WebSocket
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const data = typeof message === 'string' ? message : JSON.stringify(message);
        this.ws.send(data);
      } catch (error) {
        console.error('Failed to send message:', error);
        this.onError(error);
      }
    } else {
      console.warn('WebSocket not connected, queueing message');
      this.messageQueue.push(message);
    }
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  /**
   * Subscribe to a specific channel
   */
  subscribe(channel, handler) {
    if (typeof channel !== 'string' || !channel) {
      throw new Error('Channel must be a non-empty string');
    }
    
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    
    this.subscriptions.get(channel).add(handler);
    console.log(`Subscribed to channel: ${channel}, total handlers: ${this.subscriptions.get(channel).size}`);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(channel);
      if (handlers) {
        handlers.delete(handler);
        console.log(`Unsubscribed from channel: ${channel}, remaining handlers: ${handlers.size}`);
        if (handlers.size === 0) {
          this.subscriptions.delete(channel);
        }
      }
    };
  }

  /**
   * Unsubscribe all handlers from a channel
   */
  unsubscribeAll(channel) {
    if (this.subscriptions.has(channel)) {
      this.subscriptions.delete(channel);
      console.log(`Unsubscribed all handlers from channel: ${channel}`);
    }
  }

  /**
   * Get all active channels
   */
  getActiveChannels() {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Get number of handlers for a channel
   */
  getHandlerCount(channel) {
    const handlers = this.subscriptions.get(channel);
    return handlers ? handlers.size : 0;
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.isManualClose = true;
    
    clearTimeout(this.reconnectTimer);
    clearTimeout(this.connectionTimer);
    this.stopHeartbeat();
    this.stopPolling();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.updateConnectionState(CONNECTION_STATES.DISCONNECTED);
    this.updateConnectionQuality(CONNECTION_QUALITY.OFFLINE);
  }

  /**
   * Check if currently in polling mode
   */
  isUsingPolling() {
    return this.isPollingMode;
  }

  /**
   * Get current connection state
   */
  getConnectionState() {
    return this.connectionState;
  }

  /**
   * Get current connection quality
   */
  getConnectionQuality() {
    return this.connectionQuality;
  }

  /**
   * Get average latency
   */
  getAverageLatency() {
    if (this.latencyHistory.length === 0) return null;
    return this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
  }

  /**
   * Update connection state and notify listeners
   */
  updateConnectionState(newState) {
    if (this.connectionState !== newState) {
      const oldState = this.connectionState;
      this.connectionState = newState;
      console.log(`WebSocket state changed: ${oldState} -> ${newState}`);
      this.onStateChange(newState, oldState);
    }
  }

  /**
   * Update connection quality and notify listeners
   */
  updateConnectionQuality(newQuality) {
    if (this.connectionQuality !== newQuality) {
      const oldQuality = this.connectionQuality;
      this.connectionQuality = newQuality;
      console.log(`Connection quality changed: ${oldQuality} -> ${newQuality}`);
      this.onQualityChange(newQuality, oldQuality);
    }
  }

  /**
   * Clear message queue
   */
  clearMessageQueue() {
    this.messageQueue = [];
  }
}

export { WebSocketManager, CONNECTION_STATES, CONNECTION_QUALITY };
