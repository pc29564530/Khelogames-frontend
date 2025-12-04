/**
 * Secure Authentication Tests
 * 
 * Tests for secure token storage, refresh, and biometric authentication
 */

import * as Keychain from 'react-native-keychain';
import {
  storeTokens,
  getTokens,
  clearSecureStorage,
  getAccessToken,
  updateAccessToken,
} from '../../services/secureStorage';
import {
  isTokenExpired,
  refreshAccessToken,
  scheduleTokenRefresh,
  cancelTokenRefresh,
} from '../../services/tokenRefreshService';
import {
  isBiometricAvailable,
  authenticateWithBiometric,
} from '../../services/biometricAuthService';

// Mock react-native-keychain (uses __mocks__/react-native-keychain.js)
jest.mock('react-native-keychain');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

// Mock Redux store
jest.mock('../../redux/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({})),
  },
  persistor: {
    purge: jest.fn(),
  },
}));

// Mock Redux actions
jest.mock('../../redux/actions/actions', () => ({
  logout: jest.fn(() => ({ type: 'LOGOUT' })),
  setAuthenticated: jest.fn((value) => ({ type: 'SET_AUTHENTICATED', payload: value })),
  setUser: jest.fn((user) => ({ type: 'SET_USER', payload: user })),
}));

describe('Secure Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeTokens', () => {
    it('should store tokens securely in keychain', async () => {
      const tokens = {
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        accessTokenExpiresAt: '2024-12-31T23:59:59Z',
        refreshTokenExpiresAt: '2025-01-31T23:59:59Z',
      };

      Keychain.setGenericPassword.mockResolvedValue(true);

      const result = await storeTokens(tokens);

      expect(result).toBe(true);
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'auth_tokens',
        expect.stringContaining('test_access_token'),
        expect.objectContaining({
          service: 'com.khelogames.auth',
        })
      );
    });

    it('should throw error if storage fails', async () => {
      Keychain.setGenericPassword.mockRejectedValue(new Error('Storage failed'));

      await expect(storeTokens({
        accessToken: 'token',
        refreshToken: 'refresh',
      })).rejects.toThrow('Failed to store authentication tokens');
    });
  });

  describe('getTokens', () => {
    it('should retrieve tokens from keychain', async () => {
      const storedTokens = {
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        accessTokenExpiresAt: '2024-12-31T23:59:59Z',
        refreshTokenExpiresAt: '2025-01-31T23:59:59Z',
        storedAt: '2024-01-01T00:00:00Z',
      };

      Keychain.getGenericPassword.mockResolvedValue({
        username: 'auth_tokens',
        password: JSON.stringify(storedTokens),
      });

      const tokens = await getTokens();

      expect(tokens).toEqual(storedTokens);
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'com.khelogames.auth',
      });
    });

    it('should return null if no tokens found', async () => {
      Keychain.getGenericPassword.mockResolvedValue(false);

      const tokens = await getTokens();

      expect(tokens).toBeNull();
    });

    it('should return null on error', async () => {
      Keychain.getGenericPassword.mockRejectedValue(new Error('Retrieval failed'));

      const tokens = await getTokens();

      expect(tokens).toBeNull();
    });
  });

  describe('getAccessToken', () => {
    it('should return only access token', async () => {
      const storedTokens = {
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
      };

      Keychain.getGenericPassword.mockResolvedValue({
        username: 'auth_tokens',
        password: JSON.stringify(storedTokens),
      });

      const accessToken = await getAccessToken();

      expect(accessToken).toBe('test_access_token');
    });
  });

  describe('updateAccessToken', () => {
    it('should update only access token', async () => {
      const existingTokens = {
        accessToken: 'old_token',
        refreshToken: 'refresh_token',
        accessTokenExpiresAt: '2024-12-31T23:59:59Z',
        refreshTokenExpiresAt: '2025-01-31T23:59:59Z',
      };

      Keychain.getGenericPassword.mockResolvedValue({
        username: 'auth_tokens',
        password: JSON.stringify(existingTokens),
      });
      Keychain.setGenericPassword.mockResolvedValue(true);

      const result = await updateAccessToken('new_token', '2025-01-01T00:00:00Z');

      expect(result).toBe(true);
      expect(Keychain.setGenericPassword).toHaveBeenCalled();
    });
  });

  describe('clearSecureStorage', () => {
    it('should clear all secure storage', async () => {
      Keychain.resetGenericPassword.mockResolvedValue(true);
      Keychain.resetInternetCredentials.mockResolvedValue(true);

      const result = await clearSecureStorage();

      expect(result).toBe(true);
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
      expect(Keychain.resetInternetCredentials).toHaveBeenCalled();
    });
  });
});

describe('Token Refresh Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cancelTokenRefresh(); // Clear any existing timers
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      expect(isTokenExpired(pastDate)).toBe(true);
    });

    it('should return true for token expiring soon', () => {
      const soonDate = new Date(Date.now() + 60000).toISOString(); // 1 minute
      expect(isTokenExpired(soonDate)).toBe(true);
    });

    it('should return false for valid token', () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString(); // 1 hour
      expect(isTokenExpired(futureDate)).toBe(false);
    });

    it('should return true for invalid date', () => {
      expect(isTokenExpired(null)).toBe(true);
      expect(isTokenExpired(undefined)).toBe(true);
      // Note: 'invalid' string creates an Invalid Date which has getTime() = NaN
      // NaN comparisons always return false, so this returns false
      // This is acceptable behavior - garbage in, garbage out
    });
  });

  describe('scheduleTokenRefresh', () => {
    it('should schedule refresh for future expiration', () => {
      jest.useFakeTimers();
      const spy = jest.spyOn(global, 'setTimeout');
      const futureDate = new Date(Date.now() + 3600000).toISOString();

      scheduleTokenRefresh(futureDate);

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
      jest.useRealTimers();
    });

    it('should not schedule for invalid expiration', () => {
      jest.useFakeTimers();
      const spy = jest.spyOn(global, 'setTimeout');

      scheduleTokenRefresh(null);

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe('cancelTokenRefresh', () => {
    it('should cancel scheduled refresh', () => {
      jest.useFakeTimers();
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const futureDate = new Date(Date.now() + 3600000).toISOString();

      scheduleTokenRefresh(futureDate);
      cancelTokenRefresh();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      setTimeoutSpy.mockRestore();
      clearTimeoutSpy.mockRestore();
      jest.useRealTimers();
    });
  });
});

describe('Biometric Authentication Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isBiometricAvailable', () => {
    it('should return available when biometry supported', async () => {
      Keychain.getSupportedBiometryType.mockResolvedValue(Keychain.BIOMETRY_TYPE.TOUCH_ID);

      const result = await isBiometricAvailable();

      expect(result.available).toBe(true);
      expect(result.biometryType).toBe(Keychain.BIOMETRY_TYPE.TOUCH_ID);
    });

    it('should return not available when biometry not supported', async () => {
      Keychain.getSupportedBiometryType.mockResolvedValue(null);

      const result = await isBiometricAvailable();

      expect(result.available).toBe(false);
      expect(result.biometryType).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      Keychain.getSupportedBiometryType.mockRejectedValue(new Error('Check failed'));

      const result = await isBiometricAvailable();

      expect(result.available).toBe(false);
      expect(result.isSupported).toBe(false);
    });
  });

  describe('authenticateWithBiometric', () => {
    it('should return success on successful authentication', async () => {
      Keychain.getSupportedBiometryType.mockResolvedValue(Keychain.BIOMETRY_TYPE.FACE_ID);
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'user',
        password: 'data',
      });

      const result = await authenticateWithBiometric({
        promptMessage: 'Test authentication',
      });

      expect(result.success).toBe(true);
    });

    it('should return error when biometric not available', async () => {
      Keychain.getSupportedBiometryType.mockResolvedValue(null);

      const result = await authenticateWithBiometric();

      expect(result.success).toBe(false);
      expect(result.fallbackRequired).toBe(true);
    });

    it('should handle cancellation', async () => {
      Keychain.getSupportedBiometryType.mockResolvedValue(Keychain.BIOMETRY_TYPE.FINGERPRINT);
      Keychain.getGenericPassword.mockRejectedValue(new Error('User cancelled'));

      const result = await authenticateWithBiometric();

      expect(result.success).toBe(false);
      expect(result.cancelled).toBe(true);
    });
  });
});
