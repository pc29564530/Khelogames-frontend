import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheManager } from '../utils/cacheManager';
import apiCacheService from './apiCacheService';

/**
 * Offline Manager
 * 
 * Manages offline data access and synchronization:
 * - Caches critical data for offline access
 * - Tracks network connectivity
 * - Syncs data when connection is restored
 * - Provides offline indicators
 */
class OfflineManager {
  constructor() {
    this.isOnline = true;
    this.listeners = [];
    this.syncQueue = [];
    this.offlineDataKey = 'offline_data';
    
    // Create dedicated cache for offline data
    this.offlineCache = new CacheManager({
      namespace: 'offline',
      maxSize: 50 * 1024 * 1024, // 50MB
      defaultTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Critical data endpoints to cache for offline access
    this.criticalEndpoints = [
      '/user/profile',
      '/user/preferences',
      '/tournaments/active',
      '/matches/upcoming',
      '/teams/user',
      '/clubs/user',
    ];

    this.setupNetworkListener();
  }

  /**
   * Setup network connectivity listener
   */
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;

      if (__DEV__) {
        console.log(`📶 Network status: ${this.isOnline ? 'Online' : 'Offline'}`);
      }

      // Notify listeners
      this.notifyListeners({
        isOnline: this.isOnline,
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
      });

      // Sync when coming back online
      if (wasOffline && this.isOnline) {
        this.syncOfflineData();
      }
    });
  }

  /**
   * Subscribe to network status changes
   * 
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners of network status change
   */
  notifyListeners(status) {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  /**
   * Get current network status
   * 
   * @returns {Promise<object>} Network status
   */
  async getNetworkStatus() {
    const state = await NetInfo.fetch();
    return {
      isOnline: state.isConnected,
      connectionType: state.type,
      isInternetReachable: state.isInternetReachable,
    };
  }

  /**
   * Cache critical data for offline access
   * 
   * @param {string} key - Data key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live (optional)
   * @returns {Promise<boolean>} Success status
   */
  async cacheOfflineData(key, data, ttl = null) {
    try {
      await this.offlineCache.set(key, data, ttl);
      
      if (__DEV__) {
        console.log(`💾 Cached offline data: ${key}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error caching offline data:', error);
      return false;
    }
  }

  /**
   * Get cached offline data
   * 
   * @param {string} key - Data key
   * @returns {Promise<any|null>} Cached data or null
   */
  async getOfflineData(key) {
    try {
      const data = await this.offlineCache.get(key);
      
      if (data && __DEV__) {
        console.log(`📦 Retrieved offline data: ${key}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }

  /**
   * Prefetch critical data for offline access
   * 
   * @returns {Promise<object>} Prefetch results
   */
  async prefetchCriticalData() {
    if (!this.isOnline) {
      console.warn('Cannot prefetch data while offline');
      return { successful: 0, failed: 0, total: 0 };
    }

    const configs = this.criticalEndpoints.map(endpoint => ({
      url: endpoint,
      method: 'GET',
    }));

    const results = await apiCacheService.batchPrefetch(configs, {
      strategy: 'cache-first',
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    if (__DEV__) {
      console.log(`📦 Prefetched critical data: ${results.successful}/${results.total} successful`);
    }

    return results;
  }

  /**
   * Add action to sync queue
   * 
   * @param {object} action - Action to queue
   * @returns {Promise<boolean>} Success status
   */
  async queueAction(action) {
    try {
      this.syncQueue.push({
        ...action,
        timestamp: Date.now(),
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      await this.saveSyncQueue();

      if (__DEV__) {
        console.log(`📥 Queued action for sync: ${action.type}`);
      }

      return true;
    } catch (error) {
      console.error('Error queueing action:', error);
      return false;
    }
  }

  /**
   * Save sync queue to storage
   */
  async saveSyncQueue() {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  /**
   * Load sync queue from storage
   */
  async loadSyncQueue() {
    try {
      const queueStr = await AsyncStorage.getItem('sync_queue');
      if (queueStr) {
        this.syncQueue = JSON.parse(queueStr);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  /**
   * Sync offline data when connection is restored
   * 
   * @returns {Promise<object>} Sync results
   */
  async syncOfflineData() {
    if (!this.isOnline) {
      console.warn('Cannot sync while offline');
      return { successful: 0, failed: 0, total: 0 };
    }

    await this.loadSyncQueue();

    if (this.syncQueue.length === 0) {
      if (__DEV__) {
        console.log('📤 No actions to sync');
      }
      return { successful: 0, failed: 0, total: 0 };
    }

    if (__DEV__) {
      console.log(`📤 Syncing ${this.syncQueue.length} queued actions`);
    }

    const results = {
      successful: 0,
      failed: 0,
      total: this.syncQueue.length,
    };

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const action of queue) {
      try {
        await this.executeAction(action);
        results.successful++;
      } catch (error) {
        console.error('Error syncing action:', error);
        results.failed++;
        // Re-queue failed action
        this.syncQueue.push(action);
      }
    }

    await this.saveSyncQueue();

    if (__DEV__) {
      console.log(`✅ Sync complete: ${results.successful}/${results.total} successful`);
    }

    return results;
  }

  /**
   * Execute a queued action
   * 
   * @param {object} action - Action to execute
   */
  async executeAction(action) {
    // This is a placeholder - implement based on your action types
    // Example: POST, PUT, DELETE requests that were queued while offline
    
    const { type, config } = action;

    switch (type) {
      case 'API_REQUEST':
        const axios = require('./networkService').default;
        await axios(config);
        break;
      
      default:
        console.warn('Unknown action type:', type);
    }
  }

  /**
   * Get sync queue status
   * 
   * @returns {Promise<object>} Queue status
   */
  async getSyncQueueStatus() {
    await this.loadSyncQueue();
    
    return {
      count: this.syncQueue.length,
      actions: this.syncQueue.map(action => ({
        id: action.id,
        type: action.type,
        timestamp: action.timestamp,
      })),
    };
  }

  /**
   * Clear sync queue
   * 
   * @returns {Promise<boolean>} Success status
   */
  async clearSyncQueue() {
    try {
      this.syncQueue = [];
      await AsyncStorage.removeItem('sync_queue');
      
      if (__DEV__) {
        console.log('🧹 Sync queue cleared');
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing sync queue:', error);
      return false;
    }
  }

  /**
   * Get offline cache statistics
   * 
   * @returns {Promise<object>} Cache statistics
   */
  async getOfflineStats() {
    const cacheStats = await this.offlineCache.getStats();
    const queueStatus = await this.getSyncQueueStatus();
    const networkStatus = await this.getNetworkStatus();

    return {
      network: networkStatus,
      cache: cacheStats,
      syncQueue: queueStatus,
    };
  }

  /**
   * Clear all offline data
   * 
   * @returns {Promise<boolean>} Success status
   */
  async clearOfflineData() {
    try {
      await this.offlineCache.clear();
      await this.clearSyncQueue();
      
      if (__DEV__) {
        console.log('🧹 All offline data cleared');
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  }
}

// Export singleton instance
const offlineManager = new OfflineManager();

export default offlineManager;
export { OfflineManager };
