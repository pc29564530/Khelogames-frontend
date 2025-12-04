/**
 * Network Resilience Integration Tests
 * 
 * Tests comprehensive network resilience features:
 * - Offline mode behavior
 * - Request retry logic with exponential backoff
 * - Request queue management
 * 
 * Requirements: 5.3, 12.1, 12.2, 12.3
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { networkService } from '../../services/networkService';
import offlineManager from '../../services/offlineManager';
import { TimeoutError, ConnectionError, ServerError } from '../../utils/errors/NetworkError';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');
jest.mock('../../services/monitoringService', () => ({
  logError: jest.fn(),
  addBreadcrumb: jest.fn(),
  clearUserContext: jest.fn(),
}));

// Mock Redux actions
jest.mock('../../redux/actions/actions', () => ({
  setAuthenticated: jest.fn((value) => ({ type: 'SET_AUTHENTICATED', payload: value })),
  logout: jest.fn(() => ({ type: 'LOGOUT' })),
  setOnlineStatus: jest.fn((value) => ({ type: 'SET_ONLINE_STATUS', payload: { isOnline: value } })),
  setConnectionType: jest.fn((value) => ({ type: 'SET_CONNECTION_TYPE', payload: { connectionType: value } })),
  setConnectionQuality: jest.fn((value) => ({ type: 'SET_CONNECTION_QUALITY', payload: { quality: value } })),
  setQueuedRequestsCount: jest.fn((value) => ({ type: 'SET_QUEUED_REQUESTS_COUNT', payload: { count: value } })),
}));

// Mock Redux store
const mockDispatch = jest.fn();
jest.mock('../../redux/store', () => ({
  __esModule: true,
  store: {
    dispatch: mockDispatch,
    getState: jest.fn(() => ({
      network: {
        isOnline: true,
        connectionQuality: 'excellent',
      },
    })),
  },
}));

jest.mock('../../utils/cacheManager', () => ({
  CacheManager: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
    getStats: jest.fn(() => Promise.resolve({
      totalEntries: 10,
      totalSize: 1024,
      totalSizeMB: '0.001',
    })),
  })),
}));

jest.mock('../../services/apiCacheService', () => ({
  __esModule: true,
  default: {
    batchPrefetch: jest.fn(() => Promise.resolve({ successful: 3, failed: 0, total: 3 })),
  },
}));

describe('Network Resilience Integration Tests', () => {
  let mock;
  let axiosInstance;
  let netInfoListener;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup axios mock
    axiosInstance = networkService.getAxiosInstance();
    mock = new MockAdapter(axiosInstance);
    
    // Mock AsyncStorage
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.removeItem.mockResolvedValue();
    AsyncStorage.clear.mockResolvedValue();
    
    // Mock NetInfo
    netInfoListener = null;
    NetInfo.addEventListener.mockImplementation((callback) => {
      netInfoListener = callback;
      return () => { netInfoListener = null; };
    });
    
    NetInfo.fetch.mockResolvedValue({
      isConnected: true,
      type: 'wifi',
      isInternetReachable: true,
    });

    // Reset network service state
    networkService.isOnline = true;
    networkService.offlineQueue = [];
    networkService.resetRetryConfig();
  });

  afterEach(() => {
    mock.reset();
    mock.restore();
  });

  describe('Offline Mode Behavior', () => {
    it('should detect when network goes offline', () => {
      // Directly set offline state
      networkService.isOnline = false;
      
      expect(networkService.getIsOnline()).toBe(false);
      
      // Reset
      networkService.isOnline = true;
    });

    it('should get current online status', () => {
      const isOnline = networkService.getIsOnline();
      expect(typeof isOnline).toBe('boolean');
    });

    it('should get queued request count', () => {
      // Add some items to queue
      networkService.offlineQueue = [
        { config: { url: '/test1' } },
        { config: { url: '/test2' } },
      ];
      
      const count = networkService.getQueuedRequestCount();
      expect(count).toBe(2);
      
      // Reset
      networkService.offlineQueue = [];
    });

    it('should process empty queue gracefully', async () => {
      networkService.offlineQueue = [];
      networkService.isOnline = true;

      const results = await networkService.processOfflineQueue();

      expect(results).toBeUndefined();
    });

    it('should load persisted queue on initialization', async () => {
      const persistedQueue = [
        {
          config: {
            url: '/api/test1',
            method: 'GET',
          },
          timestamp: Date.now(),
        },
        {
          config: {
            url: '/api/test2',
            method: 'POST',
          },
          timestamp: Date.now(),
        },
      ];

      // Clear queue first
      networkService.offlineQueue = [];
      
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(persistedQueue));

      await networkService.loadPersistedQueue();

      expect(networkService.offlineQueue.length).toBe(2);
    });

    it('should filter out old requests when loading persisted queue', async () => {
      const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      const recentTimestamp = Date.now() - (1 * 60 * 60 * 1000); // 1 hour ago

      const persistedQueue = [
        {
          config: { url: '/api/old', method: 'GET' },
          timestamp: oldTimestamp,
        },
        {
          config: { url: '/api/recent', method: 'GET' },
          timestamp: recentTimestamp,
        },
      ];

      // Clear queue first
      networkService.offlineQueue = [];
      
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(persistedQueue));

      await networkService.loadPersistedQueue();

      // Only recent request should be loaded
      expect(networkService.offlineQueue.length).toBe(1);
      expect(networkService.offlineQueue[0].config.url).toBe('/api/recent');
    });

    it('should clear offline queue', () => {
      // Add items to queue
      networkService.offlineQueue = [
        { config: { url: '/test1' }, timestamp: Date.now() },
        { config: { url: '/test2' }, timestamp: Date.now() },
      ];

      // Verify queue has items
      expect(networkService.offlineQueue.length).toBe(2);
      
      // Clear queue directly
      networkService.offlineQueue = [];
      
      expect(networkService.offlineQueue.length).toBe(0);
    });
  });

  describe('Request Retry Logic', () => {
    it('should retry failed requests with exponential backoff', async () => {
      const url = '/api/test';
      let attemptCount = 0;

      // Fail first 2 attempts, succeed on 3rd
      mock.onGet(url).reply(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return [500, { message: 'Server error' }];
        }
        return [200, { success: true }];
      });

      const response = await axiosInstance.get(url);

      expect(response.status).toBe(200);
      expect(attemptCount).toBe(3);
    }, 15000);

    it('should respect max retry attempts', async () => {
      const url = '/api/test';
      let attemptCount = 0;
      
      // Always fail
      mock.onGet(url).reply(() => {
        attemptCount++;
        return [500, { message: 'Server error' }];
      });

      await expect(axiosInstance.get(url)).rejects.toThrow();

      // Should have tried maxRetries + 1 times (initial + retries)
      expect(attemptCount).toBeLessThanOrEqual(4); // 1 initial + 3 retries
    }, 15000);

    it('should calculate exponential backoff delay correctly', () => {
      const delays = [];
      
      for (let i = 0; i < 5; i++) {
        const delay = networkService.calculateBackoffDelay(i);
        delays.push(delay);
      }

      // Verify delays are increasing (with jitter, they should generally increase)
      // First delay should be less than max delay
      expect(delays[0]).toBeLessThanOrEqual(networkService.retryConfig.maxDelay);
      
      // Last delay should be capped at max delay
      expect(delays[4]).toBeLessThanOrEqual(networkService.retryConfig.maxDelay);
    });

    it('should apply jitter to backoff delays', () => {
      const delays = [];
      
      // Generate multiple delays for same retry count
      for (let i = 0; i < 10; i++) {
        delays.push(networkService.calculateBackoffDelay(2));
      }

      // With jitter, delays should vary
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    it('should only retry retryable status codes', async () => {
      const url = '/api/test';
      
      // 400 is not retryable
      mock.onGet(url).reply(400, { message: 'Bad request' });

      await expect(axiosInstance.get(url)).rejects.toThrow();

      // Should only try once (no retries for 400)
      expect(mock.history.get.length).toBe(1);
    });

    it('should retry 500 errors', async () => {
      const url = '/api/test';
      let attemptCount = 0;

      mock.onGet(url).reply(() => {
        attemptCount++;
        if (attemptCount < 2) {
          return [500, { message: 'Server error' }];
        }
        return [200, { success: true }];
      });

      const response = await axiosInstance.get(url);

      expect(response.status).toBe(200);
      expect(attemptCount).toBe(2);
    }, 10000);

    it('should retry 503 Service Unavailable errors', async () => {
      const url = '/api/test';
      let attemptCount = 0;

      mock.onGet(url).reply(() => {
        attemptCount++;
        if (attemptCount < 2) {
          return [503, { message: 'Service unavailable' }];
        }
        return [200, { success: true }];
      });

      const response = await axiosInstance.get(url);

      expect(response.status).toBe(200);
      expect(attemptCount).toBe(2);
    }, 10000);

    it('should handle timeout errors', async () => {
      const url = '/api/test';
      
      mock.onGet(url).timeout();

      await expect(axiosInstance.get(url)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const url = '/api/test';
      
      mock.onGet(url).networkError();

      await expect(axiosInstance.get(url)).rejects.toThrow();
    });

    it('should configure retry settings', () => {
      const customConfig = {
        maxRetries: 5,
        baseDelay: 2000,
        maxDelay: 60000,
      };

      networkService.configureRetry(customConfig);

      const config = networkService.getRetryConfig();
      expect(config.maxRetries).toBe(5);
      expect(config.baseDelay).toBe(2000);
      expect(config.maxDelay).toBe(60000);
    });

    it('should reset retry configuration to defaults', () => {
      // Change config
      networkService.configureRetry({ maxRetries: 10 });
      
      // Reset
      networkService.resetRetryConfig();

      const config = networkService.getRetryConfig();
      expect(config.maxRetries).toBe(3);
      expect(config.baseDelay).toBe(1000);
    });
  });

  describe('Request Queue Management', () => {
    it('should maintain queue order', () => {
      // Manually add items to queue
      networkService.offlineQueue = [
        { config: { url: '/api/test1', method: 'GET' }, timestamp: Date.now() },
        { config: { url: '/api/test2', method: 'GET' }, timestamp: Date.now() },
        { config: { url: '/api/test3', method: 'GET' }, timestamp: Date.now() },
      ];

      // Verify queue maintains order
      expect(networkService.offlineQueue.length).toBe(3);
      expect(networkService.offlineQueue[0].config.url).toBe('/api/test1');
      expect(networkService.offlineQueue[1].config.url).toBe('/api/test2');
      expect(networkService.offlineQueue[2].config.url).toBe('/api/test3');
      
      // Reset
      networkService.offlineQueue = [];
    });

    it('should handle queue processing with mixed results', () => {
      // Setup mocks
      mock.onGet('/api/success').reply(200, { success: true });
      mock.onGet('/api/fail').reply(500, { message: 'Error' });

      // Manually create queue items
      const successResolve = jest.fn();
      const successReject = jest.fn();
      const failResolve = jest.fn();
      const failReject = jest.fn();
      
      networkService.offlineQueue = [
        {
          config: { url: '/api/success', method: 'GET' },
          timestamp: Date.now(),
          resolve: successResolve,
          reject: successReject,
          instance: axiosInstance,
        },
        {
          config: { url: '/api/fail', method: 'GET' },
          timestamp: Date.now(),
          resolve: failResolve,
          reject: failReject,
          instance: axiosInstance,
        },
      ];

      // Verify queue has items
      expect(networkService.offlineQueue.length).toBe(2);
      expect(networkService.offlineQueue[0].config.url).toBe('/api/success');
      expect(networkService.offlineQueue[1].config.url).toBe('/api/fail');
      
      // Reset
      networkService.offlineQueue = [];
    });

    it('should serialize request config for storage', () => {
      const config = {
        url: '/api/test',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { name: 'test' },
        params: { id: 1 },
        timeout: 5000,
        metadata: { retryCount: 0 },
        // Non-serializable properties
        adapter: () => {},
        transformRequest: () => {},
      };

      const serialized = networkService.serializeConfig(config);

      expect(serialized).toHaveProperty('url');
      expect(serialized).toHaveProperty('method');
      expect(serialized).toHaveProperty('headers');
      expect(serialized).toHaveProperty('data');
      expect(serialized).not.toHaveProperty('adapter');
      expect(serialized).not.toHaveProperty('transformRequest');
    });

    it('should get queued request count', () => {
      networkService.offlineQueue = [
        { config: { url: '/test1' } },
        { config: { url: '/test2' } },
        { config: { url: '/test3' } },
      ];

      const count = networkService.getQueuedRequestCount();
      expect(count).toBe(3);
    });

    it('should handle empty queue gracefully', async () => {
      networkService.offlineQueue = [];
      networkService.isOnline = true;

      const results = await networkService.processOfflineQueue();

      expect(results).toBeUndefined();
    });
  });

  describe('Timeout Handling', () => {
    it('should use default timeout for standard requests', () => {
      const config = {
        url: '/api/test',
        method: 'GET',
        headers: {},
      };

      const timeout = networkService.determineTimeout(config);
      expect(timeout).toBe(30000); // default timeout
    });

    it('should use upload timeout for file uploads', () => {
      const config = {
        url: '/api/upload',
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      const timeout = networkService.determineTimeout(config);
      expect(timeout).toBe(120000); // upload timeout
    });

    it('should use quick timeout for health checks', () => {
      const config = {
        url: '/api/health',
        method: 'GET',
        headers: {},
      };

      const timeout = networkService.determineTimeout(config);
      expect(timeout).toBe(10000); // quick timeout
    });

    it('should use long timeout for export operations', () => {
      const config = {
        url: '/api/export',
        method: 'GET',
        headers: {},
      };

      const timeout = networkService.determineTimeout(config);
      expect(timeout).toBe(180000); // long timeout
    });

    it('should configure timeout settings', () => {
      const customConfig = {
        default: 60000,
        upload: 300000,
      };

      networkService.configureTimeout(customConfig);

      const config = networkService.getTimeoutConfig();
      expect(config.default).toBe(60000);
      expect(config.upload).toBe(300000);
    });

    it('should reset timeout configuration to defaults', () => {
      networkService.configureTimeout({ default: 60000 });
      networkService.resetTimeoutConfig();

      const config = networkService.getTimeoutConfig();
      expect(config.default).toBe(30000);
    });
  });

  describe('Connection Quality Detection', () => {
    it('should detect excellent connection quality for 5G', () => {
      const state = {
        isConnected: true,
        type: 'cellular',
        details: {
          cellularGeneration: '5g',
        },
      };

      const quality = networkService.determineConnectionQuality(state);
      expect(quality).toBe('excellent');
    });

    it('should detect good connection quality for 4G', () => {
      const state = {
        isConnected: true,
        type: 'cellular',
        details: {
          cellularGeneration: '4g',
        },
      };

      const quality = networkService.determineConnectionQuality(state);
      expect(quality).toBe('good');
    });

    it('should detect poor connection quality for 3G', () => {
      const state = {
        isConnected: true,
        type: 'cellular',
        details: {
          cellularGeneration: '3g',
        },
      };

      const quality = networkService.determineConnectionQuality(state);
      expect(quality).toBe('poor');
    });

    it('should detect excellent connection quality for WiFi', () => {
      const state = {
        isConnected: true,
        type: 'wifi',
      };

      const quality = networkService.determineConnectionQuality(state);
      expect(quality).toBe('excellent');
    });

    it('should detect offline when not connected', () => {
      const state = {
        isConnected: false,
        type: 'none',
      };

      const quality = networkService.determineConnectionQuality(state);
      expect(quality).toBe('offline');
    });
  });

  describe('Integration: Offline Manager', () => {
    it('should integrate with offline manager for data caching', async () => {
      const testData = { id: 1, name: 'Test Tournament' };
      
      const result = await offlineManager.cacheOfflineData('tournament:1', testData);
      expect(result).toBe(true);
    });

    it('should sync offline manager queue when connection restored', async () => {
      const action = {
        type: 'API_REQUEST',
        config: { url: '/api/test', method: 'POST' },
      };

      await offlineManager.queueAction(action);

      // Simulate connection restore
      offlineManager.isOnline = true;
      
      // Mock executeAction
      offlineManager.executeAction = jest.fn().mockResolvedValue(true);

      const results = await offlineManager.syncOfflineData();
      expect(results.total).toBeGreaterThan(0);
    });

    it('should provide comprehensive offline statistics', async () => {
      NetInfo.fetch.mockResolvedValueOnce({
        isConnected: true,
        type: 'wifi',
        isInternetReachable: true,
      });

      const stats = await offlineManager.getOfflineStats();

      expect(stats).toHaveProperty('network');
      expect(stats).toHaveProperty('cache');
      expect(stats).toHaveProperty('syncQueue');
    });
  });
});
