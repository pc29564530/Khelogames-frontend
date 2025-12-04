/**
 * Performance Monitor Service
 * Tracks screen load times, API response times, and memory usage
 * Provides performance metrics for monitoring and optimization
 */

import monitoringService from './monitoringService';

class PerformanceMonitor {
  constructor() {
    this.screenLoadMarkers = new Map();
    this.apiResponseTimes = new Map();
    this.performanceMetrics = {
      screenLoadTime: {},
      apiResponseTime: {},
      renderTime: {},
      memoryUsage: 0,
      fps: 60,
    };
    this.memoryCheckInterval = null;
    this.isMonitoring = false;
  }

  /**
   * Initialize performance monitoring
   * @param {Object} config - Configuration options
   */
  initialize(config = {}) {
    this.config = {
      enableScreenTracking: true,
      enableApiTracking: true,
      enableMemoryTracking: true,
      memoryCheckInterval: 30000, // 30 seconds
      logToConsole: __DEV__,
      ...config,
    };

    this.isMonitoring = true;

    if (this.config.enableMemoryTracking) {
      this.startMemoryMonitoring();
    }

    if (this.config.logToConsole) {
      console.log('📊 Performance Monitor initialized');
    }
  }

  /**
   * Mark the start of screen load
   * @param {string} screenName - Name of the screen
   */
  markScreenLoadStart(screenName) {
    if (!this.config?.enableScreenTracking) return;

    const startTime = Date.now();
    this.screenLoadMarkers.set(screenName, {
      startTime,
      interactive: false,
    });

    if (this.config.logToConsole) {
      console.log(`⏱️ Screen load started: ${screenName}`);
    }
  }

  /**
   * Mark the screen as interactive (time to interactive)
   * @param {string} screenName - Name of the screen
   */
  markScreenInteractive(screenName) {
    if (!this.config?.enableScreenTracking) return;

    const marker = this.screenLoadMarkers.get(screenName);
    if (!marker) {
      console.warn(`No start marker found for screen: ${screenName}`);
      return;
    }

    const endTime = Date.now();
    const loadTime = endTime - marker.startTime;

    // Update marker
    marker.interactive = true;
    marker.endTime = endTime;
    marker.loadTime = loadTime;

    // Store in metrics
    if (!this.performanceMetrics.screenLoadTime[screenName]) {
      this.performanceMetrics.screenLoadTime[screenName] = [];
    }
    this.performanceMetrics.screenLoadTime[screenName].push(loadTime);

    // Log performance data
    this.logPerformanceMetric('screen_load', {
      screenName,
      loadTime,
      timestamp: new Date().toISOString(),
    });

    if (this.config.logToConsole) {
      console.log(`✅ Screen interactive: ${screenName} (${loadTime}ms)`);
    }

    // Warn if load time is slow
    if (loadTime > 2000) {
      monitoringService.logWarning('Slow screen load detected', {
        screenName,
        loadTime,
        threshold: 2000,
      });
    }
  }

  /**
   * Get average load time for a screen
   * @param {string} screenName - Name of the screen
   * @returns {number} Average load time in milliseconds
   */
  getAverageScreenLoadTime(screenName) {
    const loadTimes = this.performanceMetrics.screenLoadTime[screenName];
    if (!loadTimes || loadTimes.length === 0) return 0;

    const sum = loadTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / loadTimes.length);
  }

  /**
   * Mark the start of an API request
   * @param {string} endpoint - API endpoint
   * @param {string} requestId - Unique request identifier
   */
  markApiRequestStart(endpoint, requestId) {
    if (!this.config?.enableApiTracking) return;

    const startTime = Date.now();
    this.apiResponseTimes.set(requestId, {
      endpoint,
      startTime,
    });

    if (this.config.logToConsole) {
      console.log(`🌐 API request started: ${endpoint} [${requestId}]`);
    }
  }

  /**
   * Mark the end of an API request
   * @param {string} requestId - Unique request identifier
   * @param {boolean} success - Whether the request was successful
   */
  markApiRequestEnd(requestId, success = true) {
    if (!this.config?.enableApiTracking) return;

    const marker = this.apiResponseTimes.get(requestId);
    if (!marker) {
      console.warn(`No start marker found for request: ${requestId}`);
      return;
    }

    const endTime = Date.now();
    const responseTime = endTime - marker.startTime;

    // Store in metrics
    if (!this.performanceMetrics.apiResponseTime[marker.endpoint]) {
      this.performanceMetrics.apiResponseTime[marker.endpoint] = [];
    }
    this.performanceMetrics.apiResponseTime[marker.endpoint].push(responseTime);

    // Log performance data
    this.logPerformanceMetric('api_response', {
      endpoint: marker.endpoint,
      responseTime,
      success,
      timestamp: new Date().toISOString(),
    });

    if (this.config.logToConsole) {
      console.log(
        `✅ API response: ${marker.endpoint} (${responseTime}ms) [${requestId}]`
      );
    }

    // Warn if response time is slow
    if (responseTime > 3000) {
      monitoringService.logWarning('Slow API response detected', {
        endpoint: marker.endpoint,
        responseTime,
        threshold: 3000,
      });
    }

    // Clean up
    this.apiResponseTimes.delete(requestId);
  }

  /**
   * Get average response time for an endpoint
   * @param {string} endpoint - API endpoint
   * @returns {number} Average response time in milliseconds
   */
  getAverageApiResponseTime(endpoint) {
    const responseTimes = this.performanceMetrics.apiResponseTime[endpoint];
    if (!responseTimes || responseTimes.length === 0) return 0;

    const sum = responseTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / responseTimes.length);
  }

  /**
   * Get slow endpoints (response time > threshold)
   * @param {number} threshold - Threshold in milliseconds (default: 2000)
   * @returns {Array} Array of slow endpoints with their average response times
   */
  getSlowEndpoints(threshold = 2000) {
    const slowEndpoints = [];

    Object.keys(this.performanceMetrics.apiResponseTime).forEach(endpoint => {
      const avgTime = this.getAverageApiResponseTime(endpoint);
      if (avgTime > threshold) {
        slowEndpoints.push({
          endpoint,
          averageResponseTime: avgTime,
          requestCount: this.performanceMetrics.apiResponseTime[endpoint].length,
        });
      }
    });

    return slowEndpoints.sort((a, b) => b.averageResponseTime - a.averageResponseTime);
  }

  /**
   * Start memory usage monitoring
   */
  startMemoryMonitoring() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }

    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, this.config.memoryCheckInterval);

    if (this.config.logToConsole) {
      console.log('🧠 Memory monitoring started');
    }
  }

  /**
   * Stop memory usage monitoring
   */
  stopMemoryMonitoring() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;

      if (this.config.logToConsole) {
        console.log('🧠 Memory monitoring stopped');
      }
    }
  }

  /**
   * Check current memory usage
   * Note: React Native doesn't provide direct memory access
   * This is a placeholder for native module integration
   */
  checkMemoryUsage() {
    // In a real implementation, you would use a native module to get memory usage
    // For now, we'll simulate it for demonstration purposes
    
    // Example with a native module:
    // const memoryUsage = await NativeModules.PerformanceModule.getMemoryUsage();
    
    // Simulated memory usage (in MB)
    const simulatedMemoryUsage = Math.random() * 100 + 50;
    
    this.performanceMetrics.memoryUsage = simulatedMemoryUsage;

    // Log memory data
    this.logPerformanceMetric('memory_usage', {
      memoryUsage: simulatedMemoryUsage,
      timestamp: new Date().toISOString(),
    });

    if (this.config.logToConsole) {
      console.log(`🧠 Memory usage: ${simulatedMemoryUsage.toFixed(2)} MB`);
    }

    // Warn if memory usage is high
    if (simulatedMemoryUsage > 200) {
      monitoringService.logWarning('High memory usage detected', {
        memoryUsage: simulatedMemoryUsage,
        threshold: 200,
      });
    }
  }

  /**
   * Get current memory usage
   * @returns {number} Memory usage in MB
   */
  getMemoryUsage() {
    return this.performanceMetrics.memoryUsage;
  }

  /**
   * Log performance metric
   * @param {string} metricType - Type of metric
   * @param {Object} data - Metric data
   */
  logPerformanceMetric(metricType, data) {
    monitoringService.logInfo(`Performance metric: ${metricType}`, {
      type: metricType,
      ...data,
    });
  }

  /**
   * Get all performance metrics
   * @returns {Object} All performance metrics
   */
  getAllMetrics() {
    return {
      ...this.performanceMetrics,
      screenLoadTime: Object.keys(this.performanceMetrics.screenLoadTime).reduce(
        (acc, screen) => {
          acc[screen] = {
            average: this.getAverageScreenLoadTime(screen),
            count: this.performanceMetrics.screenLoadTime[screen].length,
            samples: this.performanceMetrics.screenLoadTime[screen],
          };
          return acc;
        },
        {}
      ),
      apiResponseTime: Object.keys(this.performanceMetrics.apiResponseTime).reduce(
        (acc, endpoint) => {
          acc[endpoint] = {
            average: this.getAverageApiResponseTime(endpoint),
            count: this.performanceMetrics.apiResponseTime[endpoint].length,
            samples: this.performanceMetrics.apiResponseTime[endpoint],
          };
          return acc;
        },
        {}
      ),
    };
  }

  /**
   * Get performance summary
   * @returns {Object} Performance summary
   */
  getPerformanceSummary() {
    const slowScreens = Object.keys(this.performanceMetrics.screenLoadTime)
      .map(screen => ({
        screen,
        averageLoadTime: this.getAverageScreenLoadTime(screen),
      }))
      .filter(item => item.averageLoadTime > 2000)
      .sort((a, b) => b.averageLoadTime - a.averageLoadTime);

    const slowEndpoints = this.getSlowEndpoints(2000);

    return {
      totalScreensTracked: Object.keys(this.performanceMetrics.screenLoadTime).length,
      totalEndpointsTracked: Object.keys(this.performanceMetrics.apiResponseTime).length,
      slowScreens,
      slowEndpoints,
      currentMemoryUsage: this.performanceMetrics.memoryUsage,
    };
  }

  /**
   * Reset all metrics
   */
  resetMetrics() {
    this.screenLoadMarkers.clear();
    this.apiResponseTimes.clear();
    this.performanceMetrics = {
      screenLoadTime: {},
      apiResponseTime: {},
      renderTime: {},
      memoryUsage: 0,
      fps: 60,
    };

    if (this.config.logToConsole) {
      console.log('🔄 Performance metrics reset');
    }
  }

  /**
   * Stop all monitoring
   */
  stop() {
    this.stopMemoryMonitoring();
    this.isMonitoring = false;

    if (this.config.logToConsole) {
      console.log('🛑 Performance monitoring stopped');
    }
  }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
