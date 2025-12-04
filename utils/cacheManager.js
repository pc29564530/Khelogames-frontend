import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cache Manager with TTL support and size management
 * 
 * Features:
 * - Time-to-live (TTL) support for cache entries
 * - Cache size management with LRU eviction
 * - Cache invalidation strategies
 * - Namespace support for organizing cache entries
 */
class CacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB default
    this.defaultTTL = options.defaultTTL || 3600000; // 1 hour default
    this.namespace = options.namespace || 'app_cache';
    this.metadataKey = `${this.namespace}_metadata`;
  }

  /**
   * Generate cache key with namespace
   */
  _getCacheKey(key) {
    return `${this.namespace}:${key}`;
  }

  /**
   * Get cache metadata
   */
  async _getMetadata() {
    try {
      const metadata = await AsyncStorage.getItem(this.metadataKey);
      return metadata ? JSON.parse(metadata) : { entries: {}, totalSize: 0 };
    } catch (error) {
      console.error('Error reading cache metadata:', error);
      return { entries: {}, totalSize: 0 };
    }
  }

  /**
   * Save cache metadata
   */
  async _saveMetadata(metadata) {
    try {
      await AsyncStorage.setItem(this.metadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving cache metadata:', error);
    }
  }

  /**
   * Calculate size of data in bytes
   */
  _calculateSize(data) {
    return new Blob([JSON.stringify(data)]).size;
  }

  /**
   * Check if cache entry is expired
   */
  _isExpired(entry) {
    if (!entry.expiresAt) {
      return false;
    }
    return Date.now() > entry.expiresAt;
  }

  /**
   * Set cache entry
   * 
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   * @returns {Promise<boolean>} Success status
   */
  async set(key, data, ttl = null) {
    try {
      const cacheKey = this._getCacheKey(key);
      const size = this._calculateSize(data);
      const expiresAt = ttl ? Date.now() + ttl : Date.now() + this.defaultTTL;

      const entry = {
        data,
        timestamp: Date.now(),
        expiresAt,
        size,
        accessCount: 0,
        lastAccessed: Date.now(),
      };

      // Get current metadata
      const metadata = await this._getMetadata();

      // Check if we need to make space
      const newTotalSize = metadata.totalSize + size;
      if (newTotalSize > this.maxSize) {
        await this._evictLRU(size, metadata);
      }

      // Save the entry
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));

      // Update metadata
      metadata.entries[key] = {
        size,
        timestamp: entry.timestamp,
        expiresAt: entry.expiresAt,
        lastAccessed: entry.lastAccessed,
        accessCount: 0,
      };
      metadata.totalSize = (metadata.totalSize || 0) + size;

      await this._saveMetadata(metadata);

      if (__DEV__) {
        console.log(`💾 Cached: ${key} (${(size / 1024).toFixed(2)}KB, expires in ${(ttl || this.defaultTTL) / 1000}s)`);
      }

      return true;
    } catch (error) {
      console.error('Error setting cache:', error);
      return false;
    }
  }

  /**
   * Get cache entry
   * 
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached data or null if not found/expired
   */
  async get(key) {
    try {
      const cacheKey = this._getCacheKey(key);
      const entryStr = await AsyncStorage.getItem(cacheKey);

      if (!entryStr) {
        return null;
      }

      const entry = JSON.parse(entryStr);

      // Check if expired
      if (this._isExpired(entry)) {
        await this.delete(key);
        if (__DEV__) {
          console.log(`⏰ Cache expired: ${key}`);
        }
        return null;
      }

      // Update access metadata
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));

      // Update metadata
      const metadata = await this._getMetadata();
      if (metadata.entries[key]) {
        metadata.entries[key].accessCount = entry.accessCount;
        metadata.entries[key].lastAccessed = entry.lastAccessed;
        await this._saveMetadata(metadata);
      }

      if (__DEV__) {
        console.log(`✅ Cache hit: ${key}`);
      }

      return entry.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  /**
   * Delete cache entry
   * 
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async delete(key) {
    try {
      const cacheKey = this._getCacheKey(key);
      const metadata = await this._getMetadata();

      if (metadata.entries[key]) {
        const size = metadata.entries[key].size;
        await AsyncStorage.removeItem(cacheKey);
        
        delete metadata.entries[key];
        metadata.totalSize = Math.max(0, (metadata.totalSize || 0) - size);
        
        await this._saveMetadata(metadata);

        if (__DEV__) {
          console.log(`🗑️ Cache deleted: ${key}`);
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting cache:', error);
      return false;
    }
  }

  /**
   * Check if key exists in cache and is not expired
   * 
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if exists and valid
   */
  async has(key) {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Clear all cache entries
   * 
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    try {
      const metadata = await this._getMetadata();
      const keys = Object.keys(metadata.entries);

      // Delete all cache entries
      const deletePromises = keys.map(key => {
        const cacheKey = this._getCacheKey(key);
        return AsyncStorage.removeItem(cacheKey);
      });

      await Promise.all(deletePromises);

      // Reset metadata
      await this._saveMetadata({ entries: {}, totalSize: 0 });

      if (__DEV__) {
        console.log(`🧹 Cache cleared: ${keys.length} entries removed`);
      }

      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Invalidate cache entries by pattern
   * 
   * @param {string|RegExp} pattern - Pattern to match keys
   * @returns {Promise<number>} Number of entries invalidated
   */
  async invalidateByPattern(pattern) {
    try {
      const metadata = await this._getMetadata();
      const keys = Object.keys(metadata.entries);
      
      const regex = typeof pattern === 'string' 
        ? new RegExp(pattern) 
        : pattern;

      const matchingKeys = keys.filter(key => regex.test(key));

      // Delete matching entries
      await Promise.all(matchingKeys.map(key => this.delete(key)));

      if (__DEV__) {
        console.log(`🔄 Invalidated ${matchingKeys.length} cache entries matching pattern: ${pattern}`);
      }

      return matchingKeys.length;
    } catch (error) {
      console.error('Error invalidating cache by pattern:', error);
      return 0;
    }
  }

  /**
   * Invalidate cache entries by tag
   * 
   * @param {string} tag - Tag to match
   * @returns {Promise<number>} Number of entries invalidated
   */
  async invalidateByTag(tag) {
    return this.invalidateByPattern(`^${tag}:`);
  }

  /**
   * Evict least recently used entries to make space
   * 
   * @param {number} requiredSize - Size needed in bytes
   * @param {object} metadata - Current metadata
   */
  async _evictLRU(requiredSize, metadata) {
    const entries = Object.entries(metadata.entries);
    
    // Sort by last accessed time (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    let freedSpace = 0;
    const keysToDelete = [];

    // Evict entries until we have enough space
    for (const [key, entry] of entries) {
      if (freedSpace >= requiredSize) {
        break;
      }
      keysToDelete.push(key);
      freedSpace += entry.size;
    }

    // Delete the entries
    await Promise.all(keysToDelete.map(key => this.delete(key)));

    if (__DEV__) {
      console.log(`♻️ Evicted ${keysToDelete.length} LRU entries (freed ${(freedSpace / 1024).toFixed(2)}KB)`);
    }
  }

  /**
   * Get cache statistics
   * 
   * @returns {Promise<object>} Cache statistics
   */
  async getStats() {
    try {
      const metadata = await this._getMetadata();
      const entries = Object.entries(metadata.entries);

      const now = Date.now();
      const expiredCount = entries.filter(([_, entry]) => 
        entry.expiresAt && now > entry.expiresAt
      ).length;

      return {
        totalEntries: entries.length,
        totalSize: metadata.totalSize,
        totalSizeMB: (metadata.totalSize / (1024 * 1024)).toFixed(2),
        maxSize: this.maxSize,
        maxSizeMB: (this.maxSize / (1024 * 1024)).toFixed(2),
        utilizationPercent: ((metadata.totalSize / this.maxSize) * 100).toFixed(2),
        expiredCount,
        validCount: entries.length - expiredCount,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }

  /**
   * Clean up expired entries
   * 
   * @returns {Promise<number>} Number of entries cleaned
   */
  async cleanup() {
    try {
      const metadata = await this._getMetadata();
      const entries = Object.entries(metadata.entries);
      const now = Date.now();

      const expiredKeys = entries
        .filter(([_, entry]) => entry.expiresAt && now > entry.expiresAt)
        .map(([key]) => key);

      await Promise.all(expiredKeys.map(key => this.delete(key)));

      if (__DEV__) {
        console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
      }

      return expiredKeys.length;
    } catch (error) {
      console.error('Error cleaning up cache:', error);
      return 0;
    }
  }
}

// Create default instance
const defaultCache = new CacheManager();

// Export both class and default instance
export default defaultCache;
export { CacheManager };
