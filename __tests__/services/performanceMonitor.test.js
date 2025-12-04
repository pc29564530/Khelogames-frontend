/**
 * Performance Monitor Tests
 * Tests for performance monitoring service
 */

import performanceMonitor from '../../services/performanceMonitor';
import monitoringService from '../../services/monitoringService';

// Mock the monitoring service
jest.mock('../../services/monitoringService', () => ({
  logInfo: jest.fn(),
  logWarning: jest.fn(),
}));

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    // Initialize first to set up config
    performanceMonitor.initialize({
      enableScreenTracking: true,
      enableApiTracking: true,
      enableMemoryTracking: false, // Disable to avoid interval issues in tests
      logToConsole: false,
    });
    // Then reset metrics
    performanceMonitor.resetMetrics();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    performanceMonitor.stop();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      performanceMonitor.resetMetrics();
      performanceMonitor.initialize();
      
      expect(performanceMonitor.isMonitoring).toBe(true);
      expect(performanceMonitor.config).toBeDefined();
      expect(performanceMonitor.config.enableScreenTracking).toBe(true);
      expect(performanceMonitor.config.enableApiTracking).toBe(true);
    });

    it('should initialize with custom config', () => {
      performanceMonitor.resetMetrics();
      performanceMonitor.initialize({
        enableScreenTracking: false,
        enableApiTracking: true,
        memoryCheckInterval: 60000,
      });
      
      expect(performanceMonitor.config.enableScreenTracking).toBe(false);
      expect(performanceMonitor.config.enableApiTracking).toBe(true);
      expect(performanceMonitor.config.memoryCheckInterval).toBe(60000);
    });
  });

  describe('Screen Load Tracking', () => {
    it('should track screen load time', () => {
      const screenName = 'HomeScreen';
      
      performanceMonitor.markScreenLoadStart(screenName);
      
      // Simulate some loading time
      jest.advanceTimersByTime(500);
      
      performanceMonitor.markScreenInteractive(screenName);
      
      const avgLoadTime = performanceMonitor.getAverageScreenLoadTime(screenName);
      expect(avgLoadTime).toBeGreaterThan(0);
      expect(avgLoadTime).toBeLessThanOrEqual(500);
    });

    it('should track multiple screen loads', () => {
      const screenName = 'ProfileScreen';
      
      // First load
      performanceMonitor.markScreenLoadStart(screenName);
      jest.advanceTimersByTime(300);
      performanceMonitor.markScreenInteractive(screenName);
      
      // Second load
      performanceMonitor.markScreenLoadStart(screenName);
      jest.advanceTimersByTime(400);
      performanceMonitor.markScreenInteractive(screenName);
      
      const avgLoadTime = performanceMonitor.getAverageScreenLoadTime(screenName);
      expect(avgLoadTime).toBeGreaterThan(0);
      
      const metrics = performanceMonitor.getAllMetrics();
      expect(metrics.screenLoadTime[screenName].count).toBe(2);
    });

    it('should log warning for slow screen loads', () => {
      const screenName = 'SlowScreen';
      
      performanceMonitor.markScreenLoadStart(screenName);
      jest.advanceTimersByTime(2500); // Exceed 2000ms threshold
      performanceMonitor.markScreenInteractive(screenName);
      
      expect(monitoringService.logWarning).toHaveBeenCalledWith(
        'Slow screen load detected',
        expect.objectContaining({
          screenName,
          threshold: 2000,
        })
      );
    });

    it('should handle marking interactive without start marker', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      performanceMonitor.markScreenInteractive('NonExistentScreen');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No start marker found')
      );
      
      consoleSpy.mockRestore();
    });

    it('should not track when screen tracking is disabled', () => {
      performanceMonitor.initialize({
        enableScreenTracking: false,
      });
      
      performanceMonitor.markScreenLoadStart('TestScreen');
      performanceMonitor.markScreenInteractive('TestScreen');
      
      const avgLoadTime = performanceMonitor.getAverageScreenLoadTime('TestScreen');
      expect(avgLoadTime).toBe(0);
    });
  });

  describe('API Request Tracking', () => {
    it('should track API response time', () => {
      const endpoint = '/api/users';
      const requestId = 'req_123';
      
      performanceMonitor.markApiRequestStart(endpoint, requestId);
      jest.advanceTimersByTime(200);
      performanceMonitor.markApiRequestEnd(requestId, true);
      
      const avgResponseTime = performanceMonitor.getAverageApiResponseTime(endpoint);
      expect(avgResponseTime).toBeGreaterThan(0);
      expect(avgResponseTime).toBeLessThanOrEqual(200);
    });

    it('should track multiple API requests to same endpoint', () => {
      const endpoint = '/api/matches';
      
      // First request
      performanceMonitor.markApiRequestStart(endpoint, 'req_1');
      jest.advanceTimersByTime(150);
      performanceMonitor.markApiRequestEnd('req_1', true);
      
      // Second request
      performanceMonitor.markApiRequestStart(endpoint, 'req_2');
      jest.advanceTimersByTime(250);
      performanceMonitor.markApiRequestEnd('req_2', true);
      
      const avgResponseTime = performanceMonitor.getAverageApiResponseTime(endpoint);
      expect(avgResponseTime).toBeGreaterThan(0);
      
      const metrics = performanceMonitor.getAllMetrics();
      expect(metrics.apiResponseTime[endpoint].count).toBe(2);
    });

    it('should track failed API requests', () => {
      const endpoint = '/api/error';
      const requestId = 'req_error';
      
      performanceMonitor.markApiRequestStart(endpoint, requestId);
      jest.advanceTimersByTime(100);
      performanceMonitor.markApiRequestEnd(requestId, false);
      
      expect(monitoringService.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Performance metric'),
        expect.objectContaining({
          type: 'api_response',
          success: false,
        })
      );
    });

    it('should log warning for slow API responses', () => {
      const endpoint = '/api/slow';
      const requestId = 'req_slow';
      
      performanceMonitor.markApiRequestStart(endpoint, requestId);
      jest.advanceTimersByTime(3500); // Exceed 3000ms threshold
      performanceMonitor.markApiRequestEnd(requestId, true);
      
      expect(monitoringService.logWarning).toHaveBeenCalledWith(
        'Slow API response detected',
        expect.objectContaining({
          endpoint,
          threshold: 3000,
        })
      );
    });

    it('should handle marking end without start marker', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      performanceMonitor.markApiRequestEnd('nonexistent_request');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No start marker found')
      );
      
      consoleSpy.mockRestore();
    });

    it('should identify slow endpoints', () => {
      // Fast endpoint
      performanceMonitor.markApiRequestStart('/api/fast', 'req_fast');
      jest.advanceTimersByTime(500);
      performanceMonitor.markApiRequestEnd('req_fast', true);
      
      // Slow endpoint
      performanceMonitor.markApiRequestStart('/api/slow', 'req_slow');
      jest.advanceTimersByTime(2500);
      performanceMonitor.markApiRequestEnd('req_slow', true);
      
      const slowEndpoints = performanceMonitor.getSlowEndpoints(2000);
      
      expect(slowEndpoints).toHaveLength(1);
      expect(slowEndpoints[0].endpoint).toBe('/api/slow');
      expect(slowEndpoints[0].averageResponseTime).toBeGreaterThan(2000);
    });

    it('should not track when API tracking is disabled', () => {
      performanceMonitor.initialize({
        enableApiTracking: false,
      });
      
      performanceMonitor.markApiRequestStart('/api/test', 'req_test');
      performanceMonitor.markApiRequestEnd('req_test', true);
      
      const avgResponseTime = performanceMonitor.getAverageApiResponseTime('/api/test');
      expect(avgResponseTime).toBe(0);
    });
  });

  describe('Memory Monitoring', () => {
    it('should track memory usage', () => {
      performanceMonitor.checkMemoryUsage();
      
      const memoryUsage = performanceMonitor.getMemoryUsage();
      expect(memoryUsage).toBeGreaterThan(0);
    });

    it('should log memory usage metrics', () => {
      performanceMonitor.checkMemoryUsage();
      
      expect(monitoringService.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Performance metric'),
        expect.objectContaining({
          type: 'memory_usage',
        })
      );
    });

    it('should start and stop memory monitoring', () => {
      performanceMonitor.startMemoryMonitoring();
      expect(performanceMonitor.memoryCheckInterval).toBeDefined();
      
      performanceMonitor.stopMemoryMonitoring();
      expect(performanceMonitor.memoryCheckInterval).toBeNull();
    });
  });

  describe('Performance Metrics', () => {
    it('should return all metrics', () => {
      // Add some screen metrics
      performanceMonitor.markScreenLoadStart('Screen1');
      jest.advanceTimersByTime(300);
      performanceMonitor.markScreenInteractive('Screen1');
      
      // Add some API metrics
      performanceMonitor.markApiRequestStart('/api/test', 'req_1');
      jest.advanceTimersByTime(200);
      performanceMonitor.markApiRequestEnd('req_1', true);
      
      const metrics = performanceMonitor.getAllMetrics();
      
      expect(metrics).toHaveProperty('screenLoadTime');
      expect(metrics).toHaveProperty('apiResponseTime');
      expect(metrics.screenLoadTime.Screen1).toBeDefined();
      expect(metrics.screenLoadTime.Screen1.average).toBeGreaterThan(0);
      expect(metrics.apiResponseTime['/api/test']).toBeDefined();
      expect(metrics.apiResponseTime['/api/test'].average).toBeGreaterThan(0);
    });

    it('should return performance summary', () => {
      // Add slow screen
      performanceMonitor.markScreenLoadStart('SlowScreen');
      jest.advanceTimersByTime(2500);
      performanceMonitor.markScreenInteractive('SlowScreen');
      
      // Add fast screen
      performanceMonitor.markScreenLoadStart('FastScreen');
      jest.advanceTimersByTime(500);
      performanceMonitor.markScreenInteractive('FastScreen');
      
      // Add slow endpoint
      performanceMonitor.markApiRequestStart('/api/slow', 'req_slow');
      jest.advanceTimersByTime(2500);
      performanceMonitor.markApiRequestEnd('req_slow', true);
      
      const summary = performanceMonitor.getPerformanceSummary();
      
      expect(summary.totalScreensTracked).toBe(2);
      expect(summary.totalEndpointsTracked).toBe(1);
      expect(summary.slowScreens).toHaveLength(1);
      expect(summary.slowScreens[0].screen).toBe('SlowScreen');
      expect(summary.slowEndpoints).toHaveLength(1);
      expect(summary.slowEndpoints[0].endpoint).toBe('/api/slow');
    });

    it('should reset all metrics', () => {
      // Add some metrics
      performanceMonitor.markScreenLoadStart('TestScreen');
      performanceMonitor.markScreenInteractive('TestScreen');
      performanceMonitor.markApiRequestStart('/api/test', 'req_1');
      performanceMonitor.markApiRequestEnd('req_1', true);
      
      // Reset
      performanceMonitor.resetMetrics();
      
      const metrics = performanceMonitor.getAllMetrics();
      expect(Object.keys(metrics.screenLoadTime)).toHaveLength(0);
      expect(Object.keys(metrics.apiResponseTime)).toHaveLength(0);
    });
  });

  describe('Performance Logging', () => {
    it('should log screen load metrics', () => {
      performanceMonitor.markScreenLoadStart('TestScreen');
      jest.advanceTimersByTime(500);
      performanceMonitor.markScreenInteractive('TestScreen');
      
      expect(monitoringService.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Performance metric: screen_load'),
        expect.objectContaining({
          type: 'screen_load',
          screenName: 'TestScreen',
          loadTime: expect.any(Number),
        })
      );
    });

    it('should log API response metrics', () => {
      performanceMonitor.markApiRequestStart('/api/test', 'req_1');
      jest.advanceTimersByTime(200);
      performanceMonitor.markApiRequestEnd('req_1', true);
      
      expect(monitoringService.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Performance metric: api_response'),
        expect.objectContaining({
          type: 'api_response',
          endpoint: '/api/test',
          responseTime: expect.any(Number),
          success: true,
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero load times', () => {
      performanceMonitor.markScreenLoadStart('InstantScreen');
      performanceMonitor.markScreenInteractive('InstantScreen');
      
      const avgLoadTime = performanceMonitor.getAverageScreenLoadTime('InstantScreen');
      expect(avgLoadTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle non-existent screen metrics', () => {
      const avgLoadTime = performanceMonitor.getAverageScreenLoadTime('NonExistent');
      expect(avgLoadTime).toBe(0);
    });

    it('should handle non-existent endpoint metrics', () => {
      const avgResponseTime = performanceMonitor.getAverageApiResponseTime('/api/nonexistent');
      expect(avgResponseTime).toBe(0);
    });

    it('should handle empty slow endpoints query', () => {
      const slowEndpoints = performanceMonitor.getSlowEndpoints(2000);
      expect(slowEndpoints).toEqual([]);
    });

    it('should sort slow endpoints by response time', () => {
      // Add multiple slow endpoints
      performanceMonitor.markApiRequestStart('/api/slow1', 'req_1');
      jest.advanceTimersByTime(2500);
      performanceMonitor.markApiRequestEnd('req_1', true);
      
      performanceMonitor.markApiRequestStart('/api/slow2', 'req_2');
      jest.advanceTimersByTime(3500);
      performanceMonitor.markApiRequestEnd('req_2', true);
      
      performanceMonitor.markApiRequestStart('/api/slow3', 'req_3');
      jest.advanceTimersByTime(2200);
      performanceMonitor.markApiRequestEnd('req_3', true);
      
      const slowEndpoints = performanceMonitor.getSlowEndpoints(2000);
      
      expect(slowEndpoints).toHaveLength(3);
      expect(slowEndpoints[0].endpoint).toBe('/api/slow2');
      expect(slowEndpoints[1].endpoint).toBe('/api/slow1');
      expect(slowEndpoints[2].endpoint).toBe('/api/slow3');
    });
  });
});
