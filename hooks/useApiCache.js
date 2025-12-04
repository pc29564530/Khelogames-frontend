import { useState, useEffect, useCallback } from 'react';
import apiCacheService from '../services/apiCacheService';

/**
 * Hook for making cached API requests
 * 
 * @param {object} config - Axios request config
 * @param {object} options - Cache and request options
 * @returns {object} Request state and methods
 */
export const useApiCache = (config, options = {}) => {
  const {
    strategy = null,
    ttl = null,
    enabled = true,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!config || !enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCacheService.request(config, {
        strategy,
        ttl,
        forceRefresh,
      });

      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setError(err);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [config, strategy, ttl, enabled, onSuccess, onError]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for prefetching data
 * 
 * @returns {object} Prefetch methods
 */
export const usePrefetch = () => {
  const prefetch = useCallback(async (config, options = {}) => {
    return apiCacheService.prefetch(config, options);
  }, []);

  const batchPrefetch = useCallback(async (configs, options = {}) => {
    return apiCacheService.batchPrefetch(configs, options);
  }, []);

  return {
    prefetch,
    batchPrefetch,
  };
};

/**
 * Hook for cache management
 * 
 * @returns {object} Cache management methods
 */
export const useCacheManager = () => {
  const invalidate = useCallback(async (pattern, cacheType = 'all') => {
    return apiCacheService.invalidate(pattern, cacheType);
  }, []);

  const invalidateByTag = useCallback(async (tag, cacheType = 'all') => {
    return apiCacheService.invalidateByTag(tag, cacheType);
  }, []);

  const clearAll = useCallback(async (cacheType = 'all') => {
    return apiCacheService.clearAll(cacheType);
  }, []);

  const getStats = useCallback(async () => {
    return apiCacheService.getStats();
  }, []);

  const cleanup = useCallback(async () => {
    return apiCacheService.cleanup();
  }, []);

  return {
    invalidate,
    invalidateByTag,
    clearAll,
    getStats,
    cleanup,
  };
};

export default useApiCache;
