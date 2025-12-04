import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AUTH_URL } from '../constants/ApiConstants';
import { 
  setAuthenticated, 
  logout,
  setOnlineStatus,
  setConnectionType,
  setConnectionQuality,
  setQueuedRequestsCount,
} from '../redux/actions/actions';
import { store } from '../redux/store';
import NetworkError, { TimeoutError, ConnectionError, ServerError } from '../utils/errors/NetworkError';
import monitoringService from './monitoringService';

/**
 * Network Service with retry logic and offline support
 */
class NetworkService {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
    this.offlineQueue = [];
    this.isOnline = true;
    this.queueStorageKey = '@network_offline_queue';
    
    // Retry configuration
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      retryableMethods: ['GET', 'PUT', 'DELETE', 'POST'],
    };
    
    // Timeout configuration for different request types
    this.timeoutConfig = {
      default: 30000, // 30 seconds
      upload: 120000, // 2 minutes for file uploads
      download: 60000, // 1 minute for downloads
      quick: 10000, // 10 seconds for quick operations
      long: 180000, // 3 minutes for long operations
    };
    
    this.setupNetworkListener();
    this.axiosInstance = this.createAxiosInstance();
    this.loadPersistedQueue();
  }

  /**
   * Configure retry settings
   */
  configureRetry(config) {
    this.retryConfig = {
      ...this.retryConfig,
      ...config,
    };
  }

  /**
   * Configure timeout settings
   */
  configureTimeout(config) {
    this.timeoutConfig = {
      ...this.timeoutConfig,
      ...config,
    };
  }

  /**
   * Determine appropriate timeout for request
   */
  determineTimeout(config) {
    // Check for custom timeout type in config
    if (config.timeoutType) {
      return this.timeoutConfig[config.timeoutType] || this.timeoutConfig.default;
    }

    // Determine based on content type and method
    const contentType = config.headers?.['Content-Type'] || '';
    const method = config.method?.toUpperCase();

    // File upload detection
    if (contentType.includes('multipart/form-data') || 
        contentType.includes('application/octet-stream')) {
      return this.timeoutConfig.upload;
    }

    // Download detection (Accept header or specific endpoints)
    if (config.headers?.Accept?.includes('application/octet-stream') ||
        config.url?.includes('/download')) {
      return this.timeoutConfig.download;
    }

    // Quick operations (GET requests to specific endpoints)
    if (method === 'GET' && (
      config.url?.includes('/status') ||
      config.url?.includes('/health') ||
      config.url?.includes('/ping')
    )) {
      return this.timeoutConfig.quick;
    }

    // Long operations (specific endpoints that are known to be slow)
    if (config.url?.includes('/export') ||
        config.url?.includes('/report') ||
        config.url?.includes('/batch')) {
      return this.timeoutConfig.long;
    }

    return this.timeoutConfig.default;
  }

  /**
   * Setup network connectivity listener
   */
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;
      
      // Dispatch Redux actions for network state
      store.dispatch(setOnlineStatus(state.isConnected));
      store.dispatch(setConnectionType(state.type));
      
      // Determine connection quality
      const quality = this.determineConnectionQuality(state);
      store.dispatch(setConnectionQuality(quality));
      
      if (wasOffline && this.isOnline) {
        console.log('📶 Network connection restored');
        monitoringService.addBreadcrumb('Network connection restored');
        this.processOfflineQueue();
      } else if (!this.isOnline) {
        console.log('📵 Network connection lost');
        monitoringService.addBreadcrumb('Network connection lost');
      }
    });
  }

  /**
   * Determine connection quality based on network state
   */
  determineConnectionQuality(state) {
    if (!state.isConnected) {
      return 'offline';
    }

    // Check connection details if available
    if (state.details) {
      const { cellularGeneration, strength } = state.details;
      
      // For cellular connections
      if (cellularGeneration) {
        if (cellularGeneration === '5g') return 'excellent';
        if (cellularGeneration === '4g') return 'good';
        if (cellularGeneration === '3g') return 'poor';
        return 'poor';
      }

      // For WiFi connections, use signal strength if available
      if (strength !== undefined && strength !== null) {
        if (strength >= 75) return 'excellent';
        if (strength >= 50) return 'good';
        return 'poor';
      }
    }

    // Default based on connection type
    if (state.type === 'wifi' || state.type === 'ethernet') {
      return 'excellent';
    }
    
    if (state.type === 'cellular') {
      return 'good';
    }

    return 'good'; // Default to good if we can't determine
  }

  /**
   * Create axios instance with interceptors
   */
  createAxiosInstance() {
    const instance = axios.create({
      timeout: this.timeoutConfig.default,
    });

    // Request interceptor
    instance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('AccessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Set appropriate timeout based on request type
        if (!config.timeout) {
          config.timeout = this.determineTimeout(config);
        }
        
        // Add retry metadata
        config.metadata = {
          retryCount: config.metadata?.retryCount || 0,
          startTime: Date.now(),
        };
        
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => {
        // Log successful request duration
        const duration = Date.now() - response.config.metadata.startTime;
        if (__DEV__) {
          console.log(`✅ Request completed in ${duration}ms: ${response.config.url}`);
        }
        return response;
      },
      async (error) => {
        return this.handleResponseError(error, instance);
      }
    );

    return instance;
  }

  /**
   * Handle response errors with retry logic
   */
  async handleResponseError(error, instance) {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized) - Token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      return this.handleTokenRefresh(error, instance);
    }

    // Convert to NetworkError
    const networkError = this.convertToNetworkError(error);
    
    // Log error
    monitoringService.logError(networkError, {
      url: originalRequest?.url,
      method: originalRequest?.method,
      retryCount: originalRequest?.metadata?.retryCount,
    });

    // Check if error is retryable
    if (networkError.isRetryable() && this.shouldRetry(originalRequest, error)) {
      return this.retryRequest(originalRequest, instance, networkError);
    }

    // If offline, queue the request
    if (!this.isOnline && originalRequest) {
      return this.queueOfflineRequest(originalRequest, instance);
    }

    return Promise.reject(networkError);
  }

  /**
   * Handle token refresh for 401 errors
   */
  async handleTokenRefresh(error, instance) {
    const originalRequest = error.config;
    originalRequest._retry = true;

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem('RefreshToken');
      if (!refreshToken) {
        await this.logoutUser();
        return Promise.reject(new NetworkError('No refresh token available', 'NETWORK_UNAUTHORIZED', 401));
      }

      const response = await axios.post(`${AUTH_URL}/tokens/renew_access`, {
        refresh_token: refreshToken,
      });

      const newAccessToken = response.data.access_token;
      const expiresAt = response.data.access_token_expires_at;

      await AsyncStorage.setItem('AccessToken', newAccessToken);
      await AsyncStorage.setItem('AccessTokenExpiresAt', expiresAt);

      store.dispatch(setAuthenticated(true));

      instance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      this.processFailedQueue(null, newAccessToken);
      return instance(originalRequest);
    } catch (err) {
      this.processFailedQueue(err, null);
      await this.logoutUser();
      return Promise.reject(err);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Process failed queue after token refresh
   */
  processFailedQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      error ? prom.reject(error) : prom.resolve(token);
    });
    this.failedQueue = [];
  }

  /**
   * Logout user
   */
  async logoutUser() {
    try {
      await AsyncStorage.clear();
      store.dispatch(logout());
      store.dispatch(setAuthenticated(false));
      monitoringService.clearUserContext();
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }

  /**
   * Convert axios error to NetworkError
   */
  convertToNetworkError(error) {
    const config = error.config || {};
    const timeout = config.timeout || this.timeoutConfig.default;
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new TimeoutError('Request timeout', {
        url: config.url,
        method: config.method,
        timeout,
        duration: config.metadata?.startTime ? Date.now() - config.metadata.startTime : null,
      });
    }

    if (!error.response) {
      return new ConnectionError('Connection failed', {
        url: config.url,
        method: config.method,
        message: error.message,
        code: error.code,
      });
    }

    const status = error.response.status;
    if (status >= 500) {
      return new ServerError(
        error.response.data?.message || 'Server error',
        status,
        {
          url: config.url,
          method: config.method,
          data: error.response.data,
        }
      );
    }

    return new NetworkError(
      error.response.data?.message || error.message,
      `NETWORK_${status}`,
      status,
      {
        url: config.url,
        method: config.method,
        data: error.response.data,
      }
    );
  }

  /**
   * Check if request should be retried
   */
  shouldRetry(config, error) {
    const retryCount = config.metadata?.retryCount || 0;
    
    // Check if max retries exceeded
    if (retryCount >= this.retryConfig.maxRetries) {
      return false;
    }

    // Check if method is retryable
    const method = config.method?.toUpperCase();
    if (!this.retryConfig.retryableMethods.includes(method)) {
      return false;
    }

    // Check if status code is retryable
    if (error.response) {
      const status = error.response.status;
      if (!this.retryConfig.retryableStatusCodes.includes(status)) {
        return false;
      }
    }

    // Always retry network errors (no response)
    if (!error.response) {
      return true;
    }

    return true;
  }

  /**
   * Retry request with exponential backoff
   */
  async retryRequest(config, instance, error) {
    const retryCount = config.metadata.retryCount;
    const delay = this.calculateBackoffDelay(retryCount);

    console.log(`🔄 Retrying request (attempt ${retryCount + 1}/${this.retryConfig.maxRetries}) after ${delay}ms`);
    
    monitoringService.addBreadcrumb('Retrying request', {
      url: config.url,
      method: config.method,
      attempt: retryCount + 1,
      delay,
      errorType: error.code,
    });

    // Wait for backoff delay
    await this.sleep(delay);

    // Increment retry count
    config.metadata.retryCount = retryCount + 1;

    // Retry the request
    return instance(config);
  }

  /**
   * Calculate exponential backoff delay with jitter
   * 
   * Uses full jitter algorithm:
   * delay = random(0, min(maxDelay, baseDelay * 2^retryCount))
   * 
   * This prevents thundering herd problem when many clients retry simultaneously
   */
  calculateBackoffDelay(retryCount) {
    // Calculate exponential delay
    const exponentialDelay = this.retryConfig.baseDelay * Math.pow(2, retryCount);
    
    // Cap at max delay
    const cappedDelay = Math.min(exponentialDelay, this.retryConfig.maxDelay);
    
    // Apply full jitter: random value between 0 and cappedDelay
    const jitteredDelay = Math.random() * cappedDelay;
    
    return Math.floor(jitteredDelay);
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Queue request for offline retry
   */
  queueOfflineRequest(config, instance) {
    console.log('📥 Queueing request for offline retry:', config.url);
    
    return new Promise((resolve, reject) => {
      const queueItem = {
        config: this.serializeConfig(config),
        timestamp: Date.now(),
        resolve,
        reject,
        instance,
      };
      
      this.offlineQueue.push(queueItem);
      
      // Persist queue to storage
      this.persistQueue();
      
      // Update Redux with queue count
      store.dispatch(setQueuedRequestsCount(this.offlineQueue.length));
    });
  }

  /**
   * Serialize axios config for storage
   * Remove non-serializable properties
   */
  serializeConfig(config) {
    return {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      params: config.params,
      timeout: config.timeout,
      metadata: config.metadata,
    };
  }

  /**
   * Persist offline queue to AsyncStorage
   */
  async persistQueue() {
    try {
      // Only persist serializable parts
      const serializableQueue = this.offlineQueue.map(item => ({
        config: item.config,
        timestamp: item.timestamp,
      }));
      
      await AsyncStorage.setItem(
        this.queueStorageKey,
        JSON.stringify(serializableQueue)
      );
    } catch (error) {
      console.error('Failed to persist offline queue:', error);
      monitoringService.logError(error, { context: 'persistQueue' });
    }
  }

  /**
   * Load persisted queue from AsyncStorage
   */
  async loadPersistedQueue() {
    try {
      const queueData = await AsyncStorage.getItem(this.queueStorageKey);
      
      if (queueData) {
        const persistedQueue = JSON.parse(queueData);
        
        // Filter out old requests (older than 24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        const now = Date.now();
        
        const validRequests = persistedQueue.filter(item => {
          return (now - item.timestamp) < maxAge;
        });
        
        if (validRequests.length > 0) {
          console.log(`📦 Loaded ${validRequests.length} persisted requests from storage`);
          
          // Convert to queue items with promises
          validRequests.forEach(item => {
            this.offlineQueue.push({
              config: item.config,
              timestamp: item.timestamp,
              resolve: () => {}, // Placeholder - will be handled on retry
              reject: () => {},
              instance: this.axiosInstance,
            });
          });
          
          // Update Redux with queue count
          store.dispatch(setQueuedRequestsCount(this.offlineQueue.length));
          
          // If online, process the queue
          if (this.isOnline) {
            this.processOfflineQueue();
          }
        } else {
          // Clear old data
          await AsyncStorage.removeItem(this.queueStorageKey);
        }
      }
    } catch (error) {
      console.error('Failed to load persisted queue:', error);
      monitoringService.logError(error, { context: 'loadPersistedQueue' });
    }
  }

  /**
   * Process offline queue when connection is restored
   */
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) {
      return;
    }

    console.log(`📤 Processing ${this.offlineQueue.length} queued requests`);
    
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    
    // Update Redux with queue count
    store.dispatch(setQueuedRequestsCount(0));
    
    // Clear persisted queue
    await AsyncStorage.removeItem(this.queueStorageKey);

    const results = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    for (const item of queue) {
      try {
        const response = await item.instance(item.config);
        item.resolve(response);
        results.successful++;
      } catch (error) {
        console.error('Failed to process queued request:', error);
        item.reject(error);
        results.failed++;
        results.errors.push({
          url: item.config.url,
          error: error.message,
        });
      }
    }

    console.log(`✅ Processed queue: ${results.successful} successful, ${results.failed} failed`);
    
    monitoringService.addBreadcrumb('Processed offline queue', {
      successful: results.successful,
      failed: results.failed,
    });

    return results;
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue() {
    this.offlineQueue = [];
    await AsyncStorage.removeItem(this.queueStorageKey);
    store.dispatch(setQueuedRequestsCount(0));
    console.log('🗑️ Offline queue cleared');
  }

  /**
   * Get axios instance
   */
  getAxiosInstance() {
    return this.axiosInstance;
  }

  /**
   * Check if online
   */
  getIsOnline() {
    return this.isOnline;
  }

  /**
   * Get queued request count
   */
  getQueuedRequestCount() {
    return this.offlineQueue.length;
  }

  /**
   * Get retry configuration
   */
  getRetryConfig() {
    return { ...this.retryConfig };
  }

  /**
   * Reset retry configuration to defaults
   */
  resetRetryConfig() {
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      retryableMethods: ['GET', 'PUT', 'DELETE', 'POST'],
    };
  }

  /**
   * Get timeout configuration
   */
  getTimeoutConfig() {
    return { ...this.timeoutConfig };
  }

  /**
   * Reset timeout configuration to defaults
   */
  resetTimeoutConfig() {
    this.timeoutConfig = {
      default: 30000,
      upload: 120000,
      download: 60000,
      quick: 10000,
      long: 180000,
    };
  }
}

// Export singleton instance
const networkService = new NetworkService();

export default networkService.getAxiosInstance();
export { networkService };
