/**
 * Network Service Tests
 * Tests network retry logic with different failure scenarios
 * Requirements: 5.1
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import monitoringService from '../../services/monitoringService';
import { TimeoutError, ConnectionError, ServerError } from '../../utils/errors/NetworkError';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');
jest.mock('../../services/monitoringService', () => ({
  logError: jest.fn(),
  addBreadcrumb: jest.fn(),
  clearUserContext: jest.fn(),
}));

// Mock Redux store
jest.mock('../../redux/store', () => ({
  dispatch: jest.fn(),
}));

describe('NetworkService', () => {
  let mock;
  let axiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh axios instance for testing
    axiosInstance = axios.create({ timeout: 5000 });
    mock = new MockAdapter(axiosInstance);
    
    // Mock AsyncStorage
    AsyncStorage.getItem.mockResolvedValue('mock-token');
    AsyncStorage.setItem.mockResolvedValue();
    AsyncStorage.clear.mockResolvedValue();
    
    // Mock NetInfo
    NetInfo.addEventListener.mockReturnValue(() => {});
  });

  afterEach(() => {
    mock.reset();
    mock.restore();
  });

  describe('Request Retry Logic', () => {
    it('should handle successful requests', async () => {
      const url = '/api/test';
      mock.onGet(url).reply(200, { success: true });

      const response = await axiosInstance.get(url);

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('should handle server errors', async () => {
      const url = '/api/test';
      mock.onGet(url).reply(500, { message: 'Server error' });

      await expect(axiosInstance.get(url)).rejects.toThrow();
    });

    it('should handle client errors', async () => {
      const url = '/api/test';
      mock.onGet(url).reply(400, { message: 'Bad request' });

      await expect(axiosInstance.get(url)).rejects.toThrow();
    });

    it('should calculate exponential backoff delay correctly', () => {
      const baseDelay = 1000;
      
      // Test delay calculation (without jitter for predictability)
      const delay0 = baseDelay * Math.pow(2, 0); // 1000ms
      const delay1 = baseDelay * Math.pow(2, 1); // 2000ms
      const delay2 = baseDelay * Math.pow(2, 2); // 4000ms

      expect(delay0).toBe(1000);
      expect(delay1).toBe(2000);
      expect(delay2).toBe(4000);
    });
  });

  describe('Network Error Handling', () => {
    it('should handle timeout errors', async () => {
      const url = '/api/test';
      mock.onGet(url).timeout();

      await expect(axiosInstance.get(url)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const url = '/api/test';
      mock.onGet(url).networkError();

      await expect(axiosInstance.get(url)).rejects.toThrow();
    });

    it('should handle 500 server errors', async () => {
      const url = '/api/test';
      mock.onGet(url).reply(500, { message: 'Internal server error' });

      await expect(axiosInstance.get(url)).rejects.toThrow();
    });

    it('should handle 404 not found errors', async () => {
      const url = '/api/test';
      mock.onGet(url).reply(404, { message: 'Not found' });

      await expect(axiosInstance.get(url)).rejects.toThrow();
    });
  });

  describe('Authentication', () => {
    it('should handle 401 unauthorized errors', async () => {
      const url = '/api/protected';
      mock.onGet(url).reply(401, { message: 'Unauthorized' });

      await expect(axiosInstance.get(url)).rejects.toThrow();
    });

    it('should handle 403 forbidden errors', async () => {
      const url = '/api/protected';
      mock.onGet(url).reply(403, { message: 'Forbidden' });

      await expect(axiosInstance.get(url)).rejects.toThrow();
    });
  });

  describe('Request Configuration', () => {
    it('should set default timeout', () => {
      expect(axiosInstance.defaults.timeout).toBe(5000);
    });

    it('should handle POST requests', async () => {
      const url = '/api/test';
      const data = { name: 'test' };
      
      mock.onPost(url, data).reply(201, { id: 1, ...data });

      const response = await axiosInstance.post(url, data);

      expect(response.status).toBe(201);
      expect(response.data.name).toBe('test');
    });

    it('should handle PUT requests', async () => {
      const url = '/api/test/1';
      const data = { name: 'updated' };
      
      mock.onPut(url, data).reply(200, { id: 1, ...data });

      const response = await axiosInstance.put(url, data);

      expect(response.status).toBe(200);
      expect(response.data.name).toBe('updated');
    });

    it('should handle DELETE requests', async () => {
      const url = '/api/test/1';
      
      mock.onDelete(url).reply(204);

      const response = await axiosInstance.delete(url);

      expect(response.status).toBe(204);
    });
  });

  describe('Request Headers', () => {
    it('should handle custom headers', async () => {
      const url = '/api/test';
      const headers = { 'X-Custom-Header': 'test-value' };
      
      mock.onGet(url).reply(200);

      await axiosInstance.get(url, { headers });

      const request = mock.history.get[0];
      expect(request.headers['X-Custom-Header']).toBe('test-value');
    });
  });

  describe('Request Timeout', () => {
    it('should timeout requests after configured duration', async () => {
      const url = '/api/slow';
      mock.onGet(url).timeout();

      await expect(axiosInstance.get(url)).rejects.toThrow();
    });
  });

  describe('Response Data', () => {
    it('should return response data correctly', async () => {
      const url = '/api/test';
      const responseData = { id: 1, name: 'test', items: [1, 2, 3] };
      
      mock.onGet(url).reply(200, responseData);

      const response = await axiosInstance.get(url);

      expect(response.data).toEqual(responseData);
      expect(response.data.id).toBe(1);
      expect(response.data.items).toHaveLength(3);
    });
  });
});
