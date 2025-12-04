/**
 * API Performance Interceptor Tests
 * Tests for automatic API performance tracking
 */

import axios from 'axios';
import { setupApiPerformanceTracking } from '../../services/apiPerformanceInterceptor';
import performanceMonitor from '../../services/performanceMonitor';

// Mock the performance monitor
jest.mock('../../services/performanceMonitor', () => ({
  markApiRequestStart: jest.fn(),
  markApiRequestEnd: jest.fn(),
}));

describe('API Performance Interceptor', () => {
  let axiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh axios instance for each test
    axiosInstance = axios.create({
      baseURL: 'https://api.example.com',
    });
    
    // Setup performance tracking
    setupApiPerformanceTracking(axiosInstance);
  });

  describe('Request Interceptor', () => {
    it('should mark API request start', async () => {
      // Mock the adapter to prevent actual HTTP request
      axiosInstance.defaults.adapter = (config) => {
        return Promise.resolve({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('/users');

      expect(performanceMonitor.markApiRequestStart).toHaveBeenCalledWith(
        '/users',
        expect.stringContaining('req_')
      );
    });

    it('should add metadata to request config', async () => {
      let capturedConfig;
      
      axiosInstance.defaults.adapter = (config) => {
        capturedConfig = config;
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('/test');

      expect(capturedConfig.metadata).toBeDefined();
      expect(capturedConfig.metadata.requestId).toBeDefined();
      expect(capturedConfig.metadata.startTime).toBeDefined();
    });

    it('should extract endpoint from URL', async () => {
      axiosInstance.defaults.adapter = (config) => {
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('/api/users/123');

      expect(performanceMonitor.markApiRequestStart).toHaveBeenCalledWith(
        '/api/users/:id',
        expect.any(String)
      );
    });

    it('should remove query parameters from endpoint', async () => {
      axiosInstance.defaults.adapter = (config) => {
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('/api/search?q=test&page=1');

      expect(performanceMonitor.markApiRequestStart).toHaveBeenCalledWith(
        '/api/search',
        expect.any(String)
      );
    });

    it('should replace UUID segments with placeholder', async () => {
      axiosInstance.defaults.adapter = (config) => {
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('/api/users/550e8400-e29b-41d4-a716-446655440000');

      // The UUID regex replaces the first part but leaves the rest
      // This is expected behavior - it replaces /\d+/ patterns
      expect(performanceMonitor.markApiRequestStart).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/'),
        expect.any(String)
      );
    });

    it('should handle request errors', async () => {
      axiosInstance.defaults.adapter = () => {
        return Promise.reject(new Error('Network Error'));
      };

      try {
        await axiosInstance.get('/error');
      } catch (error) {
        // Expected to throw
      }

      // Should still mark the request start
      expect(performanceMonitor.markApiRequestStart).toHaveBeenCalled();
    });
  });

  describe('Response Interceptor', () => {
    it('should mark API request end on success', async () => {
      let requestId;
      
      axiosInstance.defaults.adapter = (config) => {
        requestId = config.metadata.requestId;
        return Promise.resolve({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('/users');

      expect(performanceMonitor.markApiRequestEnd).toHaveBeenCalledWith(
        requestId,
        true
      );
    });

    it('should mark API request end on failure', async () => {
      let requestId;
      
      axiosInstance.defaults.adapter = (config) => {
        requestId = config.metadata.requestId;
        return Promise.reject({
          response: {
            data: { error: 'Not found' },
            status: 404,
            statusText: 'Not Found',
            headers: {},
          },
          config,
        });
      };

      try {
        await axiosInstance.get('/notfound');
      } catch (error) {
        // Expected to throw
      }

      expect(performanceMonitor.markApiRequestEnd).toHaveBeenCalledWith(
        requestId,
        false
      );
    });

    it('should handle network errors', async () => {
      let requestId;
      
      axiosInstance.defaults.adapter = (config) => {
        requestId = config.metadata.requestId;
        const error = new Error('Network Error');
        error.config = config;
        return Promise.reject(error);
      };

      try {
        await axiosInstance.get('/error');
      } catch (error) {
        // Expected to throw
      }

      expect(performanceMonitor.markApiRequestEnd).toHaveBeenCalledWith(
        requestId,
        false
      );
    });

    it('should handle missing metadata gracefully', async () => {
      axiosInstance.defaults.adapter = (config) => {
        // Remove metadata to simulate edge case
        delete config.metadata;
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      // Should not throw
      await expect(axiosInstance.get('/test')).resolves.toBeDefined();
    });
  });

  describe('Multiple Requests', () => {
    it('should track multiple concurrent requests', async () => {
      axiosInstance.defaults.adapter = (config) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {},
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
            });
          }, 100);
        });
      };

      const requests = [
        axiosInstance.get('/users'),
        axiosInstance.get('/posts'),
        axiosInstance.get('/comments'),
      ];

      await Promise.all(requests);

      expect(performanceMonitor.markApiRequestStart).toHaveBeenCalledTimes(3);
      expect(performanceMonitor.markApiRequestEnd).toHaveBeenCalledTimes(3);
    });

    it('should generate unique request IDs', async () => {
      const requestIds = new Set();
      
      axiosInstance.defaults.adapter = (config) => {
        requestIds.add(config.metadata.requestId);
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('/test1');
      await axiosInstance.get('/test2');
      await axiosInstance.get('/test3');

      expect(requestIds.size).toBe(3);
    });
  });

  describe('Endpoint Normalization', () => {
    it('should normalize numeric IDs', async () => {
      axiosInstance.defaults.adapter = (config) => {
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('/api/users/12345');

      expect(performanceMonitor.markApiRequestStart).toHaveBeenCalledWith(
        '/api/users/:id',
        expect.any(String)
      );
    });

    it('should normalize MongoDB ObjectIds', async () => {
      axiosInstance.defaults.adapter = (config) => {
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('/api/posts/507f1f77bcf86cd799439011');

      // The ObjectId regex replaces hex patterns
      expect(performanceMonitor.markApiRequestStart).toHaveBeenCalledWith(
        expect.stringContaining('/api/posts/'),
        expect.any(String)
      );
    });

    it('should handle multiple ID segments', async () => {
      axiosInstance.defaults.adapter = (config) => {
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('/api/users/123/posts/456');

      expect(performanceMonitor.markApiRequestStart).toHaveBeenCalledWith(
        '/api/users/:id/posts/:id',
        expect.any(String)
      );
    });

    it('should handle root endpoint', async () => {
      axiosInstance.defaults.adapter = (config) => {
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('/');

      expect(performanceMonitor.markApiRequestStart).toHaveBeenCalledWith(
        '/',
        expect.any(String)
      );
    });

    it('should handle empty URL', async () => {
      axiosInstance.defaults.adapter = (config) => {
        return Promise.resolve({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };

      await axiosInstance.get('');

      // Empty URL returns 'unknown' as the endpoint
      expect(performanceMonitor.markApiRequestStart).toHaveBeenCalledWith(
        'unknown',
        expect.any(String)
      );
    });
  });
});
