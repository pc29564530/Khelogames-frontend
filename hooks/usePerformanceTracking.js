/**
 * usePerformanceTracking Hook
 * Automatically tracks screen load time and provides performance utilities
 */

import { useEffect, useRef, useCallback } from 'react';
import performanceMonitor from '../services/performanceMonitor';

/**
 * Hook to track screen performance
 * @param {string} screenName - Name of the screen to track
 * @param {Object} options - Configuration options
 * @returns {Object} Performance tracking utilities
 */
export const usePerformanceTracking = (screenName, options = {}) => {
  const {
    autoTrack = true,
    trackInteractive = true,
  } = options;

  const hasMarkedInteractive = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!autoTrack) return;

    // Mark screen load start
    performanceMonitor.markScreenLoadStart(screenName);
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      hasMarkedInteractive.current = false;
    };
  }, [screenName, autoTrack]);

  useEffect(() => {
    if (!autoTrack || !trackInteractive || hasMarkedInteractive.current) return;

    // Mark screen as interactive after render
    // Using a small delay to ensure the screen is fully interactive
    const timer = setTimeout(() => {
      if (isMounted.current) {
        performanceMonitor.markScreenInteractive(screenName);
        hasMarkedInteractive.current = true;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [screenName, autoTrack, trackInteractive]);

  /**
   * Manually mark screen as interactive
   */
  const markInteractive = useCallback(() => {
    if (!hasMarkedInteractive.current) {
      performanceMonitor.markScreenInteractive(screenName);
      hasMarkedInteractive.current = true;
    }
  }, [screenName]);

  /**
   * Get average load time for this screen
   */
  const getAverageLoadTime = useCallback(() => {
    return performanceMonitor.getAverageScreenLoadTime(screenName);
  }, [screenName]);

  return {
    markInteractive,
    getAverageLoadTime,
  };
};

/**
 * Hook to track API performance
 * @returns {Object} API tracking utilities
 */
export const useApiPerformanceTracking = () => {
  const requestIdCounter = useRef(0);

  /**
   * Track an API request
   * @param {string} endpoint - API endpoint
   * @returns {Object} Request tracking object
   */
  const trackRequest = useCallback((endpoint) => {
    const requestId = `req_${Date.now()}_${requestIdCounter.current++}`;
    performanceMonitor.markApiRequestStart(endpoint, requestId);

    return {
      requestId,
      end: (success = true) => {
        performanceMonitor.markApiRequestEnd(requestId, success);
      },
    };
  }, []);

  /**
   * Get average response time for an endpoint
   */
  const getAverageResponseTime = useCallback((endpoint) => {
    return performanceMonitor.getAverageApiResponseTime(endpoint);
  }, []);

  /**
   * Get slow endpoints
   */
  const getSlowEndpoints = useCallback((threshold = 2000) => {
    return performanceMonitor.getSlowEndpoints(threshold);
  }, []);

  return {
    trackRequest,
    getAverageResponseTime,
    getSlowEndpoints,
  };
};

/**
 * Hook to access performance metrics
 * @returns {Object} Performance metrics and utilities
 */
export const usePerformanceMetrics = () => {
  const getAllMetrics = useCallback(() => {
    return performanceMonitor.getAllMetrics();
  }, []);

  const getPerformanceSummary = useCallback(() => {
    return performanceMonitor.getPerformanceSummary();
  }, []);

  const getMemoryUsage = useCallback(() => {
    return performanceMonitor.getMemoryUsage();
  }, []);

  const resetMetrics = useCallback(() => {
    performanceMonitor.resetMetrics();
  }, []);

  return {
    getAllMetrics,
    getPerformanceSummary,
    getMemoryUsage,
    resetMetrics,
  };
};

export default usePerformanceTracking;
