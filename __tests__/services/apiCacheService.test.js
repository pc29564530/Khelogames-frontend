import apiCacheService from '../../services/apiCacheService';
import { networkService } from '../../services/networkService';

// Mock dependencies
jest.mock('../../services/networkService', () => ({
  networkService: {
    getAxiosInstance: jest.fn(() => jest.fn()),
  },
}));

jest.mock('../../utils/cacheManager', () => {
  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    invalidateByPattern: jest.fn(),
    invalidateByTag: jest.fn(),
    clear: jest.fn(),
    getStats: jest.fn(),
    cleanup: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockCache,
    CacheManager: jest.fn(() => mockCache),
  };
});

describe('ApiCacheService', () => {
  let mockAxios;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios = jest.fn();
    networkService.getAxiosInstance.mockReturnValue(mockAxios);
  });

  describe('request with cache-first strategy', () => {
    it('should return cached data if available', async () => {
      const cachedData = { id: 1, name: 'Cached' };
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.get.mockResolvedValueOnce(cachedData);

      const result = await apiCacheService.request(
        { url: '/tournaments', method: 'GET' },
        { strategy: 'cache-first' }
      );

      expect(result).toEqual(cachedData);
      expect(mockAxios).not.toHaveBeenCalled();
    });

    it('should fetch from network if cache miss', async () => {
      const networkData = { id: 1, name: 'Network' };
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.get.mockResolvedValueOnce(null);
      mockAxios.mockResolvedValueOnce({ data: networkData });

      const result = await apiCacheService.request(
        { url: '/tournaments', method: 'GET' },
        { strategy: 'cache-first' }
      );

      expect(result).toEqual(networkData);
      expect(mockAxios).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });

  describe('request with stale-while-revalidate strategy', () => {
    it('should return cached data and revalidate in background', async () => {
      const cachedData = { id: 1, name: 'Cached' };
      const networkData = { id: 1, name: 'Fresh' };
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.get.mockResolvedValueOnce(cachedData);
      mockAxios.mockResolvedValueOnce({ data: networkData });

      const result = await apiCacheService.request(
        { url: '/matches', method: 'GET' },
        { strategy: 'stale-while-revalidate' }
      );

      expect(result).toEqual(cachedData);
      
      // Wait for background revalidation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockAxios).toHaveBeenCalled();
    });

    it('should fetch from network if cache miss', async () => {
      const networkData = { id: 1, name: 'Network' };
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.get.mockResolvedValueOnce(null);
      mockAxios.mockResolvedValueOnce({ data: networkData });

      const result = await apiCacheService.request(
        { url: '/matches', method: 'GET' },
        { strategy: 'stale-while-revalidate' }
      );

      expect(result).toEqual(networkData);
      expect(mockAxios).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });

  describe('request with network-only strategy', () => {
    it('should always fetch from network', async () => {
      const networkData = { id: 1, name: 'Network' };
      const cacheManager = require('../../utils/cacheManager').default;
      mockAxios.mockResolvedValueOnce({ data: networkData });

      const result = await apiCacheService.request(
        { url: '/live/match/123', method: 'GET' },
        { strategy: 'network-only' }
      );

      expect(result).toEqual(networkData);
      expect(mockAxios).toHaveBeenCalled();
      expect(cacheManager.get).not.toHaveBeenCalled();
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('invalidate', () => {
    it('should invalidate cache by pattern', async () => {
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.invalidateByPattern.mockResolvedValue(5);

      const count = await apiCacheService.invalidate('/matches');

      expect(count).toBe(10); // 5 from static + 5 from dynamic
    });
  });

  describe('clearAll', () => {
    it('should clear all caches', async () => {
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.clear.mockResolvedValue(true);

      const result = await apiCacheService.clearAll();

      expect(result).toBe(true);
      expect(cacheManager.clear).toHaveBeenCalledTimes(2);
    });
  });

  describe('prefetch', () => {
    it('should prefetch and cache data', async () => {
      const networkData = { id: 1, name: 'Prefetched' };
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.get.mockResolvedValueOnce(null);
      mockAxios.mockResolvedValueOnce({ data: networkData });

      const result = await apiCacheService.prefetch(
        { url: '/tournaments', method: 'GET' },
        { strategy: 'cache-first' }
      );

      expect(result).toBe(true);
      expect(mockAxios).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });

  describe('batchPrefetch', () => {
    it('should prefetch multiple requests', async () => {
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.get.mockResolvedValue(null);
      mockAxios.mockResolvedValue({ data: {} });

      const configs = [
        { url: '/tournaments', method: 'GET' },
        { url: '/matches', method: 'GET' },
        { url: '/teams', method: 'GET' },
      ];

      const results = await apiCacheService.batchPrefetch(configs);

      expect(results.total).toBe(3);
      expect(results.successful).toBe(3);
      expect(results.failed).toBe(0);
    });
  });

  describe('Task 9.4: Cache hit and miss behavior', () => {
    // Note: Cache hit and miss scenarios are already comprehensively tested above
    // in "request with cache-first strategy" and "request with stale-while-revalidate strategy"
    // These tests verify:
    // - Cache hit returns cached data without network call
    // - Cache miss triggers network fetch and caches result
    // - Stale-while-revalidate returns stale data immediately and revalidates in background
  });

  describe('Task 9.4: Cache invalidation behavior', () => {
    // Note: Cache invalidation is already tested above in "invalidate" and "clearAll" tests
    // Additional invalidation scenarios:
    
    it('should invalidate only static cache when specified', async () => {
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.invalidateByPattern.mockResolvedValue(2);

      const count = await apiCacheService.invalidate('/tournaments', 'static');

      expect(count).toBe(2);
    });

    it('should invalidate only dynamic cache when specified', async () => {
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.invalidateByPattern.mockResolvedValue(4);

      const count = await apiCacheService.invalidate('/matches', 'dynamic');

      expect(count).toBe(4);
    });

    it('should invalidate cache by tag', async () => {
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.invalidateByTag.mockResolvedValue(5);

      const count = await apiCacheService.invalidateByTag('tournament');

      expect(count).toBe(10); // 5 from static + 5 from dynamic
    });
  });

  describe('Task 9.4: Cache statistics and monitoring', () => {
    it('should get combined cache statistics', async () => {
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.getStats.mockResolvedValue({
        totalEntries: 10,
        totalSize: 1024000,
        totalSizeMB: '0.98',
        maxSizeMB: '20.00',
      });

      const stats = await apiCacheService.getStats();

      expect(stats).toHaveProperty('static');
      expect(stats).toHaveProperty('dynamic');
      expect(stats).toHaveProperty('total');
      expect(stats.total.entries).toBe(20); // 10 + 10
    });

    it('should cleanup expired entries', async () => {
      const cacheManager = require('../../utils/cacheManager').default;
      cacheManager.cleanup.mockResolvedValue(5);

      const count = await apiCacheService.cleanup();

      expect(count).toBe(10); // 5 from static + 5 from dynamic
    });
  });
});
