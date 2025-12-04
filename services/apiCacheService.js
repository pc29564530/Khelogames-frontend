import cacheManager, { CacheManager } from '../utils/cacheManager';
import { networkService } from './networkService';

/**
 * API Cache Service
 * 
 * Implements caching strategies for API responses:
 * - Cache-first: For static data (tournaments, teams, etc.)
 * - Stale-while-revalidate: For dynamic data (matches, scores, etc.)
 * - Network-only: For real-time data (live scores)
 */
class ApiCacheService {
  constructor() {
    // Create separate cache instances for different data types
    this.staticCache = new CacheManager({
      namespace: 'api_static',
      maxSize: 20 * 1024 * 1024, // 20MB
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
    });

    this.dynamicCache = new CacheManager({
      namespace: 'api_dynamic',
      maxSize: 30 * 1024 * 1024, // 30MB
      defaultTTL: 5 * 60 * 1000, // 5 minutes
    });

    // Cache strategies
    this.strategies = {
      CACHE_FIRST: 'cache-first',
      STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
      NETWORK_ONLY: 'network-only',
    };

    // Default strategy mappings by endpoint pattern
    this.strategyMap = {
      // Static data - cache for long periods
      '/tournaments': this.strategies.CACHE_FIRST,
      '/teams': this.strategies.CACHE_FIRST,
      '/clubs': this.strategies.CACHE_FIRST,
      '/communities': this.strategies.CACHE_FIRST,
      '/players': this.strategies.CACHE_FIRST,
      
      // Dynamic data - stale while revalidate
      '/matches': this.strategies.STALE_WHILE_REVALIDATE,
      '/scores': this.strategies.STALE_WHILE_REVALIDATE,
      '/standings': this.strategies.STALE_WHILE_REVALIDATE,
      '/stats': this.strategies.STALE_WHILE_REVALIDATE,
      '/threads': this.strategies.STALE_WHILE_REVALIDATE,
      '/comments': this.strategies.STALE_WHILE_REVALIDATE,
      
      // Real-time data - never cache
      '/live': this.strategies.NETWORK_ONLY,
      '/websocket': this.strategies.NETWORK_ONLY,
    };
  }

  /**
   * Generate cache key from request config
   */
  _generateCacheKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    const paramString = Object.keys(sortedParams).length > 0
      ? JSON.stringify(sortedParams)
      : '';

    return `${url}${paramString}`;
  }

  /**
   * Determine cache strategy for a URL
   */
  _getStrategy(url) {
    // Check if URL matches any pattern in strategy map
    for (const [pattern, strategy] of Object.entries(this.strategyMap)) {
      if (url.includes(pattern)) {
        return strategy;
      }
    }
    
    // Default to stale-while-revalidate
    return this.strategies.STALE_WHILE_REVALIDATE;
  }

  /**
   * Get appropriate cache instance for strategy
   */
  _getCacheInstance(strategy) {
    return strategy === this.strategies.CACHE_FIRST
      ? this.staticCache
      : this.dynamicCache;
  }

  /**
   * Make cached API request
   * 
   * @param {object} config - Axios request config
   * @param {object} options - Cache options
   * @returns {Promise<any>} Response data
   */
  async request(config, options = {}) {
    const {
      strategy = this._getStrategy(config.url),
      ttl = null,
      forceRefresh = false,
      tag = null,
    } = options;

    // Network-only strategy - bypass cache
    if (strategy === this.strategies.NETWORK_ONLY) {
      return this._networkRequest(config);
    }

    const cacheKey = this._generateCacheKey(config.url, config.params);
    const cache = this._getCacheInstance(strategy);

    // Force refresh - skip cache read
    if (forceRefresh) {
      const data = await this._networkRequest(config);
      await cache.set(cacheKey, data, ttl);
      return data;
    }

    // Try to get from cache
    const cachedData = await cache.get(cacheKey);

    if (strategy === this.strategies.CACHE_FIRST) {
      // Cache-first: Return cached data if available, otherwise fetch
      if (cachedData !== null) {
        if (__DEV__) {
          console.log(`📦 Cache-first hit: ${config.url}`);
        }
        return cachedData;
      }

      const data = await this._networkRequest(config);
      await cache.set(cacheKey, data, ttl);
      return data;
    }

    if (strategy === this.strategies.STALE_WHILE_REVALIDATE) {
      // Stale-while-revalidate: Return cached data immediately, fetch in background
      if (cachedData !== null) {
        if (__DEV__) {
          console.log(`📦 Stale-while-revalidate: serving stale data for ${config.url}`);
        }

        // Revalidate in background
        this._networkRequest(config)
          .then(data => cache.set(cacheKey, data, ttl))
          .catch(error => {
            console.warn('Background revalidation failed:', error.message);
          });

        return cachedData;
      }

      // No cached data - fetch normally
      const data = await this._networkRequest(config);
      await cache.set(cacheKey, data, ttl);
      return data;
    }

    // Fallback to network request
    return this._networkRequest(config);
  }

  /**
   * Make network request using axios instance
   */
  async _networkRequest(config) {
    const axios = networkService.getAxiosInstance();
    const response = await axios(config);
    return response.data;
  }

  /**
   * Invalidate cache by URL pattern
   * 
   * @param {string|RegExp} pattern - Pattern to match URLs
   * @param {string} cacheType - 'static', 'dynamic', or 'all'
   * @returns {Promise<number>} Number of entries invalidated
   */
  async invalidate(pattern, cacheType = 'all') {
    let count = 0;

    if (cacheType === 'static' || cacheType === 'all') {
      count += await this.staticCache.invalidateByPattern(pattern);
    }

    if (cacheType === 'dynamic' || cacheType === 'all') {
      count += await this.dynamicCache.invalidateByPattern(pattern);
    }

    if (__DEV__) {
      console.log(`🔄 Invalidated ${count} cache entries for pattern: ${pattern}`);
    }

    return count;
  }

  /**
   * Invalidate cache by tag
   * 
   * @param {string} tag - Tag to invalidate
   * @param {string} cacheType - 'static', 'dynamic', or 'all'
   * @returns {Promise<number>} Number of entries invalidated
   */
  async invalidateByTag(tag, cacheType = 'all') {
    let count = 0;

    if (cacheType === 'static' || cacheType === 'all') {
      count += await this.staticCache.invalidateByTag(tag);
    }

    if (cacheType === 'dynamic' || cacheType === 'all') {
      count += await this.dynamicCache.invalidateByTag(tag);
    }

    if (__DEV__) {
      console.log(`🔄 Invalidated ${count} cache entries for tag: ${tag}`);
    }

    return count;
  }

  /**
   * Clear all API caches
   * 
   * @param {string} cacheType - 'static', 'dynamic', or 'all'
   * @returns {Promise<boolean>} Success status
   */
  async clearAll(cacheType = 'all') {
    try {
      if (cacheType === 'static' || cacheType === 'all') {
        await this.staticCache.clear();
      }

      if (cacheType === 'dynamic' || cacheType === 'all') {
        await this.dynamicCache.clear();
      }

      if (__DEV__) {
        console.log(`🧹 Cleared ${cacheType} API cache`);
      }

      return true;
    } catch (error) {
      console.error('Error clearing API cache:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   * 
   * @returns {Promise<object>} Combined cache statistics
   */
  async getStats() {
    const staticStats = await this.staticCache.getStats();
    const dynamicStats = await this.dynamicCache.getStats();

    return {
      static: staticStats,
      dynamic: dynamicStats,
      total: {
        entries: staticStats.totalEntries + dynamicStats.totalEntries,
        sizeMB: (parseFloat(staticStats.totalSizeMB) + parseFloat(dynamicStats.totalSizeMB)).toFixed(2),
        maxSizeMB: (parseFloat(staticStats.maxSizeMB) + parseFloat(dynamicStats.maxSizeMB)).toFixed(2),
      },
    };
  }

  /**
   * Cleanup expired entries in all caches
   * 
   * @returns {Promise<number>} Total entries cleaned
   */
  async cleanup() {
    const staticCleaned = await this.staticCache.cleanup();
    const dynamicCleaned = await this.dynamicCache.cleanup();
    
    const total = staticCleaned + dynamicCleaned;
    
    if (__DEV__) {
      console.log(`🧹 Cleaned up ${total} expired API cache entries`);
    }

    return total;
  }

  /**
   * Prefetch data and cache it
   * 
   * @param {object} config - Axios request config
   * @param {object} options - Cache options
   * @returns {Promise<boolean>} Success status
   */
  async prefetch(config, options = {}) {
    try {
      await this.request(config, { ...options, forceRefresh: true });
      return true;
    } catch (error) {
      console.error('Prefetch failed:', error);
      return false;
    }
  }

  /**
   * Batch prefetch multiple requests
   * 
   * @param {Array<object>} configs - Array of request configs
   * @param {object} options - Cache options
   * @returns {Promise<object>} Results with success/failure counts
   */
  async batchPrefetch(configs, options = {}) {
    const results = await Promise.allSettled(
      configs.map(config => this.prefetch(config, options))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - successful;

    if (__DEV__) {
      console.log(`📦 Batch prefetch: ${successful} successful, ${failed} failed`);
    }

    return { successful, failed, total: results.length };
  }
}

// Export singleton instance
const apiCacheService = new ApiCacheService();

export default apiCacheService;
export { ApiCacheService };
