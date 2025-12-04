/**
 * API Performance Interceptor
 * Automatically tracks API request/response times using Axios interceptors
 */

import performanceMonitor from './performanceMonitor';

/**
 * Setup API performance tracking interceptors
 * @param {Object} axiosInstance - Axios instance to attach interceptors to
 */
export const setupApiPerformanceTracking = (axiosInstance) => {
  // Request interceptor - mark start time
  axiosInstance.interceptors.request.use(
    (config) => {
      // Generate unique request ID
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store request ID in config for later retrieval
      config.metadata = {
        requestId,
        startTime: Date.now(),
      };

      // Extract endpoint from URL
      const endpoint = extractEndpoint(config.url, config.baseURL);
      
      // Mark API request start
      performanceMonitor.markApiRequestStart(endpoint, requestId);

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - mark end time
  axiosInstance.interceptors.response.use(
    (response) => {
      // Mark API request end (success)
      if (response.config.metadata) {
        performanceMonitor.markApiRequestEnd(response.config.metadata.requestId, true);
      }

      return response;
    },
    (error) => {
      // Mark API request end (failure)
      if (error.config?.metadata) {
        performanceMonitor.markApiRequestEnd(error.config.metadata.requestId, false);
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Extract clean endpoint from URL
 * @param {string} url - Request URL
 * @param {string} baseURL - Base URL
 * @returns {string} Clean endpoint
 */
const extractEndpoint = (url, baseURL) => {
  if (!url) return 'unknown';

  // Remove base URL if present
  let endpoint = url;
  if (baseURL && url.startsWith(baseURL)) {
    endpoint = url.substring(baseURL.length);
  }

  // Remove query parameters
  const queryIndex = endpoint.indexOf('?');
  if (queryIndex !== -1) {
    endpoint = endpoint.substring(0, queryIndex);
  }

  // Replace dynamic segments (IDs) with placeholders
  endpoint = endpoint.replace(/\/\d+/g, '/:id');
  endpoint = endpoint.replace(/\/[a-f0-9-]{36}/g, '/:uuid');
  endpoint = endpoint.replace(/\/[a-f0-9]{24}/g, '/:objectId');

  return endpoint || '/';
};

export default setupApiPerformanceTracking;
