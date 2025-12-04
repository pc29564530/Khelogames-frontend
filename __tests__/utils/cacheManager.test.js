import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheManager } from '../../utils/cacheManager';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

describe('CacheManager', () => {
  let cacheManager;

  beforeEach(() => {
    jest.clearAllMocks();
    cacheManager = new CacheManager({
      namespace: 'test_cache',
      maxSize: 1024 * 1024, // 1MB
      defaultTTL: 3600000, // 1 hour
    });
  });

  describe('set and get', () => {
    it('should cache and retrieve data', async () => {
      const testData = { id: 1, name: 'Test' };
      const key = 'test_key';

      // Mock metadata
      AsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify({ entries: {}, totalSize: 0 })
      );

      await cacheManager.set(key, testData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test_cache:test_key',
        expect.stringContaining('"data":{"id":1,"name":"Test"}')
      );
    });

    it('should return null for non-existent key', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await cacheManager.get('non_existent');

      expect(result).toBeNull();
    });

    it('should return null for expired entry', async () => {
      const expiredEntry = {
        data: { test: 'data' },
        timestamp: Date.now() - 10000,
        expiresAt: Date.now() - 5000, // Expired 5 seconds ago
        size: 100,
        accessCount: 0,
        lastAccessed: Date.now() - 10000,
      };

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(expiredEntry));

      const result = await cacheManager.get('expired_key');

      expect(result).toBeNull();
    });

    it('should update access metadata on get', async () => {
      const entry = {
        data: { test: 'data' },
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
        size: 100,
        accessCount: 0,
        lastAccessed: Date.now(),
      };

      AsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(entry))
        .mockResolvedValueOnce(
          JSON.stringify({ entries: { test_key: { accessCount: 0 } }, totalSize: 100 })
        );

      const result = await cacheManager.get('test_key');

      expect(result).toEqual({ test: 'data' });
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test_cache:test_key',
        expect.stringContaining('"accessCount":1')
      );
    });
  });

  describe('delete', () => {
    it('should delete cache entry', async () => {
      const metadata = {
        entries: {
          test_key: { size: 100, timestamp: Date.now() },
        },
        totalSize: 100,
      };

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(metadata));

      await cacheManager.delete('test_key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test_cache:test_key');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test_cache_metadata',
        expect.stringContaining('"totalSize":0')
      );
    });
  });

  describe('has', () => {
    it('should return true for existing valid entry', async () => {
      const entry = {
        data: { test: 'data' },
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
        size: 100,
        accessCount: 0,
        lastAccessed: Date.now(),
      };

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(entry));

      const result = await cacheManager.has('test_key');

      expect(result).toBe(true);
    });

    it('should return false for non-existent entry', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await cacheManager.has('non_existent');

      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', async () => {
      const metadata = {
        entries: {
          key1: { size: 100 },
          key2: { size: 200 },
        },
        totalSize: 300,
      };

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(metadata));

      await cacheManager.clear();

      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test_cache_metadata',
        JSON.stringify({ entries: {}, totalSize: 0 })
      );
    });
  });

  describe('invalidateByPattern', () => {
    it('should invalidate entries matching pattern', async () => {
      const metadata = {
        entries: {
          'user:1': { size: 100 },
          'user:2': { size: 100 },
          'post:1': { size: 100 },
        },
        totalSize: 300,
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(metadata));

      const count = await cacheManager.invalidateByPattern(/^user:/);

      expect(count).toBe(2);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const metadata = {
        entries: {
          key1: { size: 100, expiresAt: Date.now() + 10000 },
          key2: { size: 200, expiresAt: Date.now() - 1000 }, // Expired
        },
        totalSize: 300,
      };

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(metadata));

      const stats = await cacheManager.getStats();

      expect(stats).toMatchObject({
        totalEntries: 2,
        totalSize: 300,
        expiredCount: 1,
        validCount: 1,
      });
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      const now = Date.now();
      const metadata = {
        entries: {
          valid: { size: 100, expiresAt: now + 10000 },
          expired1: { size: 100, expiresAt: now - 1000 },
          expired2: { size: 100, expiresAt: now - 2000 },
        },
        totalSize: 300,
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(metadata));

      const count = await cacheManager.cleanup();

      expect(count).toBe(2);
    });
  });

  describe('Task 9.4: Cache hit and miss scenarios', () => {
    it('should handle cache hit scenario correctly', async () => {
      const testData = { id: 1, name: 'Test Data', value: 'cached' };
      const key = 'hit_test_key';
      const entry = {
        data: testData,
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
        size: 100,
        accessCount: 0,
        lastAccessed: Date.now(),
      };

      // Mock cache hit
      AsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(entry))
        .mockResolvedValueOnce(
          JSON.stringify({ entries: { [key]: { accessCount: 0 } }, totalSize: 100 })
        );

      const result = await cacheManager.get(key);

      expect(result).toEqual(testData);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(`test_cache:${key}`);
    });

    it('should handle cache miss scenario correctly', async () => {
      const key = 'miss_test_key';

      // Mock cache miss
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await cacheManager.get(key);

      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(`test_cache:${key}`);
    });

    it('should handle cache miss for expired entry', async () => {
      const key = 'expired_test_key';
      const expiredEntry = {
        data: { test: 'data' },
        timestamp: Date.now() - 20000,
        expiresAt: Date.now() - 10000, // Expired 10 seconds ago
        size: 100,
        accessCount: 0,
        lastAccessed: Date.now() - 20000,
      };

      // Mock expired entry
      AsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(expiredEntry))
        .mockResolvedValueOnce(
          JSON.stringify({ entries: { [key]: { size: 100 } }, totalSize: 100 })
        );

      const result = await cacheManager.get(key);

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`test_cache:${key}`);
    });

    it('should track access count on cache hits', async () => {
      const key = 'access_count_key';
      const entry = {
        data: { test: 'data' },
        timestamp: Date.now(),
        expiresAt: Date.now() + 10000,
        size: 100,
        accessCount: 5,
        lastAccessed: Date.now() - 1000,
      };

      AsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(entry))
        .mockResolvedValueOnce(
          JSON.stringify({ entries: { [key]: { accessCount: 5 } }, totalSize: 100 })
        );

      await cacheManager.get(key);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `test_cache:${key}`,
        expect.stringContaining('"accessCount":6')
      );
    });
  });

  describe('Task 9.4: Cache invalidation scenarios', () => {
    it('should invalidate single cache entry', async () => {
      const key = 'invalidate_key';
      const metadata = {
        entries: {
          [key]: { size: 100, timestamp: Date.now() },
        },
        totalSize: 100,
      };

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(metadata));

      await cacheManager.delete(key);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`test_cache:${key}`);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test_cache_metadata',
        expect.stringContaining('"totalSize":0')
      );
    });

    it('should invalidate multiple entries by pattern', async () => {
      const metadata = {
        entries: {
          'user:1:profile': { size: 100 },
          'user:2:profile': { size: 100 },
          'user:3:profile': { size: 100 },
          'post:1': { size: 100 },
          'post:2': { size: 100 },
        },
        totalSize: 500,
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(metadata));

      const count = await cacheManager.invalidateByPattern(/^user:/);

      expect(count).toBe(3);
    });

    it('should invalidate entries by tag', async () => {
      const metadata = {
        entries: {
          'tournament:1': { size: 100 },
          'tournament:2': { size: 100 },
          'match:1': { size: 100 },
        },
        totalSize: 300,
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(metadata));

      const count = await cacheManager.invalidateByTag('tournament');

      expect(count).toBe(2);
    });

    it('should clear all cache entries', async () => {
      const metadata = {
        entries: {
          key1: { size: 100 },
          key2: { size: 200 },
          key3: { size: 300 },
        },
        totalSize: 600,
      };

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(metadata));

      await cacheManager.clear();

      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(3);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test_cache_metadata',
        JSON.stringify({ entries: {}, totalSize: 0 })
      );
    });

    it('should handle invalidation of non-existent entries gracefully', async () => {
      const metadata = {
        entries: {},
        totalSize: 0,
      };

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(metadata));

      const result = await cacheManager.delete('non_existent_key');

      expect(result).toBe(true);
    });
  });
});
