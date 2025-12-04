import { useState, useEffect, useCallback } from 'react';
import offlineManager from '../services/offlineManager';

/**
 * Hook for managing offline state and functionality
 * 
 * @returns {object} Offline state and methods
 */
export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [syncQueueCount, setSyncQueueCount] = useState(0);

  useEffect(() => {
    // Get initial network status
    offlineManager.getNetworkStatus().then(status => {
      setIsOnline(status.isOnline);
      setConnectionType(status.connectionType);
    });

    // Subscribe to network status changes
    const unsubscribe = offlineManager.subscribe(status => {
      setIsOnline(status.isOnline);
      setConnectionType(status.connectionType);
    });

    // Get initial sync queue count
    offlineManager.getSyncQueueStatus().then(status => {
      setSyncQueueCount(status.count);
    });

    return unsubscribe;
  }, []);

  const prefetchCriticalData = useCallback(async () => {
    return offlineManager.prefetchCriticalData();
  }, []);

  const syncData = useCallback(async () => {
    const results = await offlineManager.syncOfflineData();
    const status = await offlineManager.getSyncQueueStatus();
    setSyncQueueCount(status.count);
    return results;
  }, []);

  const queueAction = useCallback(async (action) => {
    const success = await offlineManager.queueAction(action);
    if (success) {
      const status = await offlineManager.getSyncQueueStatus();
      setSyncQueueCount(status.count);
    }
    return success;
  }, []);

  const getStats = useCallback(async () => {
    return offlineManager.getOfflineStats();
  }, []);

  const clearOfflineData = useCallback(async () => {
    const success = await offlineManager.clearOfflineData();
    if (success) {
      setSyncQueueCount(0);
    }
    return success;
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    connectionType,
    syncQueueCount,
    prefetchCriticalData,
    syncData,
    queueAction,
    getStats,
    clearOfflineData,
  };
};

/**
 * Hook for caching data for offline access
 * 
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {object} options - Cache options
 */
export const useOfflineCache = (key, data, options = {}) => {
  const { enabled = true, ttl = null } = options;

  useEffect(() => {
    if (enabled && data) {
      offlineManager.cacheOfflineData(key, data, ttl);
    }
  }, [key, data, enabled, ttl]);
};

/**
 * Hook for retrieving offline cached data
 * 
 * @param {string} key - Cache key
 * @returns {object} Cached data state
 */
export const useOfflineData = (key) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      const cachedData = await offlineManager.getOfflineData(key);
      
      if (mounted) {
        setData(cachedData);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [key]);

  return { data, loading };
};

export default useOffline;
