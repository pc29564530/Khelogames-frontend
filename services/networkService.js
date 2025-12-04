import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AUTH_URL } from '../constants/ApiConstants';
import { setAuthenticated, logout } from '../redux/actions/actions';
import store from '../redux/store';
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
    this.maxRetries = 3;
    this.baseDelay = 1000; // 1 second
    
    this.setupNetworkListener();
    this.axiosInstance = this.createAxiosInstance();
  }

  /**
   * Setup network connectivity listener
   */
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;
      
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
   * Create axios instance with interceptors
   */
  createAxiosInstance() {
    const instance = axios.create({
      timeout: 30000, // 30 seconds default timeout
    });

    // Request interceptor
    instance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('AccessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
    if (networkError.isRetryable() && this.shouldRetry(originalRequest)) {
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
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new TimeoutError('Request timeout', {
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    if (!error.response) {
      return new ConnectionError('Connection failed', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message,
      });
    }

    const status = error.response.status;
    if (status >= 500) {
      return new ServerError(
        error.response.data?.message || 'Server error',
        status,
        {
          url: error.config?.url,
          method: error.config?.method,
          data: error.response.data,
        }
      );
    }

    return new NetworkError(
      error.response.data?.message || error.message,
      `NETWORK_${status}`,
      status,
      {
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
      }
    );
  }

  /**
   * Check if request should be retried
   */
  shouldRetry(config) {
    const retryCount = config.metadata?.retryCount || 0;
    return retryCount < this.maxRetries;
  }

  /**
   * Retry request with exponential backoff
   */
  async retryRequest(config, instance, error) {
    const retryCount = config.metadata.retryCount;
    const delay = this.calculateBackoffDelay(retryCount);

    console.log(`🔄 Retrying request (attempt ${retryCount + 1}/${this.maxRetries}) after ${delay}ms`);
    
    monitoringService.addBreadcrumb('Retrying request', {
      url: config.url,
      attempt: retryCount + 1,
      delay,
    });

    // Wait for backoff delay
    await this.sleep(delay);

    // Increment retry count
    config.metadata.retryCount = retryCount + 1;

    // Retry the request
    return instance(config);
  }

  /**
   * Calculate exponential backoff delay
   */
  calculateBackoffDelay(retryCount) {
    // Exponential backoff: baseDelay * 2^retryCount + random jitter
    const exponentialDelay = this.baseDelay * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
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
      this.offlineQueue.push({
        config,
        resolve,
        reject,
        instance,
      });
    });
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

    for (const item of queue) {
      try {
        const response = await item.instance(item.config);
        item.resolve(response);
      } catch (error) {
        item.reject(error);
      }
    }
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
}

// Export singleton instance
const networkService = new NetworkService();

export default networkService.getAxiosInstance();
export { networkService };
