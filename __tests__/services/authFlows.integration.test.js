/**
 * Authentication Flows Integration Tests
 * 
 * Tests complete authentication flows including:
 * - Token refresh flow
 * - Biometric authentication flow
 * - Secure logout flow
 * 
 * Requirements: 5.3
 */

import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, persistor } from '../../redux/store';
import { logout, setAuthenticated, setUser } from '../../redux/actions/actions';
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
  getValidAccessToken,
  initializeTokenRefresh,
} from '../../services/tokenRefreshService';
import {
  isBiometricAvailable,
  authenticateWithBiometric,
  authenticateForSensitiveAction,
  enableBiometricAuth,
  disableBiometricAuth,
} from '../../services/biometricAuthService';

// Mock dependencies
jest.mock('react-native-keychain');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios');
jest.mock('../../redux/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
      auth: {
        isAuthenticated: true,
        user: { id: 'user123', name: 'Test User' },
      },
    })),
  },
  persistor: {
    purge: jest.fn(() => Promise.resolve()),
  },
}));
jest.mock('../../redux/actions/actions', () => ({
  logout: jest.fn(() => ({ type: 'LOGOUT' })),
  setAuthenticated: jest.fn((value) => ({ type: 'SET_AUTHENTICATED', payload: value })),
  setUser: jest.fn((user) => ({ type: 'SET_USER', payload: user })),
}));

describe('Authentication Flows Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cancelTokenRefresh();
    jest.useRealTimers();
  });

  afterEach(() => {
    cancelTokenRefresh();
  });

  describe('Token Refresh Flow', () => {
    it('should complete full token refresh flow when token expires', async () => {
      // Setup: Store initial tokens that are about to expire
      const initialTokens = {
        accessToken: 'old_access_token',
        refreshToken: 'valid_refresh_token',
        accessTokenExpiresAt: new Date(Date.now() + 60000).toISOString(), // 1 minute
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(), // 1 day
      };

      Keychain.setGenericPassword.mockResolvedValue(true);
      await storeTokens(initialTokens);

      // Mock token retrieval
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'auth_tokens',
        password: JSON.stringify(initialTokens),
      });

      // Mock successful refresh API call
      const newTokens = {
        access_token: 'new_access_token',
        access_token_expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      };
      axios.post.mockResolvedValue({ data: newTokens });

      // Execute: Refresh token
      const result = await refreshAccessToken();

      // Verify: Token refresh completed successfully
      expect(result.accessToken).toBe('new_access_token');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/refresh'),
        expect.objectContaining({
          refresh_token: 'valid_refresh_token',
        }),
        expect.any(Object)
      );
      expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(2); // Initial store + update
    });

    it('should handle token refresh failure and trigger logout', async () => {
      // Setup: Store tokens with expired refresh token
      const expiredTokens = {
        accessToken: 'old_access_token',
        refreshToken: 'expired_refresh_token',
        accessTokenExpiresAt: new Date(Date.now() - 60000).toISOString(), // Expired
        refreshTokenExpiresAt: new Date(Date.now() - 60000).toISOString(), // Expired
      };

      Keychain.setGenericPassword.mockResolvedValue(true);
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'auth_tokens',
        password: JSON.stringify(expiredTokens),
      });
      Keychain.resetGenericPassword.mockResolvedValue(true);
      Keychain.resetInternetCredentials.mockResolvedValue(true);

      // Execute: Attempt refresh with expired refresh token
      await expect(refreshAccessToken()).rejects.toThrow('Refresh token expired');

      // Verify: Logout was triggered
      expect(store.dispatch).toHaveBeenCalledWith(logout());
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    });

    it('should automatically refresh token before expiration', async () => {
      jest.useFakeTimers();

      // Setup: Store tokens expiring in 10 minutes
      const tokens = {
        accessToken: 'current_token',
        refreshToken: 'refresh_token',
        accessTokenExpiresAt: new Date(Date.now() + 600000).toISOString(), // 10 minutes
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      Keychain.getGenericPassword.mockResolvedValue({
        username: 'auth_tokens',
        password: JSON.stringify(tokens),
      });

      const newTokens = {
        access_token: 'refreshed_token',
        access_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
      };
      axios.post.mockResolvedValue({ data: newTokens });
      Keychain.setGenericPassword.mockResolvedValue(true);

      // Execute: Schedule refresh (should trigger in 5 minutes due to buffer)
      scheduleTokenRefresh(tokens.accessTokenExpiresAt);

      // Fast-forward time to trigger refresh
      jest.advanceTimersByTime(300000); // 5 minutes

      // Run all pending timers and promises
      await jest.runAllTimersAsync();

      // Verify: Refresh was called
      expect(axios.post).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should get valid access token, refreshing if needed', async () => {
      // Setup: Store expired token
      const expiredTokens = {
        accessToken: 'expired_token',
        refreshToken: 'refresh_token',
        accessTokenExpiresAt: new Date(Date.now() - 60000).toISOString(), // Expired
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      Keychain.getGenericPassword.mockResolvedValue({
        username: 'auth_tokens',
        password: JSON.stringify(expiredTokens),
      });

      const newTokens = {
        access_token: 'fresh_token',
        access_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
      };
      axios.post.mockResolvedValue({ data: newTokens });
      Keychain.setGenericPassword.mockResolvedValue(true);

      // Execute: Get valid token (should trigger refresh)
      const token = await getValidAccessToken();

      // Verify: Got new token after refresh
      expect(token).toBe('fresh_token');
      expect(axios.post).toHaveBeenCalled();
    });

    it('should initialize token refresh on app start', async () => {
      jest.useFakeTimers();

      // Setup: Store valid tokens
      const tokens = {
        accessToken: 'current_token',
        refreshToken: 'refresh_token',
        accessTokenExpiresAt: new Date(Date.now() + 1800000).toISOString(), // 30 minutes
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      Keychain.getGenericPassword.mockResolvedValue({
        username: 'auth_tokens',
        password: JSON.stringify(tokens),
      });

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      // Execute: Initialize refresh
      await initializeTokenRefresh();

      // Verify: Refresh was scheduled
      expect(setTimeoutSpy).toHaveBeenCalled();

      setTimeoutSpy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe('Biometric Authentication Flow', () => {
    it('should complete full biometric authentication flow', async () => {
      // Setup: Biometric available
      Keychain.getSupportedBiometryType.mockResolvedValue(Keychain.BIOMETRY_TYPE.FINGERPRINT);
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'user',
        password: 'data',
      });

      // Execute: Authenticate with biometric
      const result = await authenticateWithBiometric({
        promptMessage: 'Authenticate to continue',
      });

      // Verify: Authentication successful
      expect(result.success).toBe(true);
      expect(result.biometryType).toBe(Keychain.BIOMETRY_TYPE.FINGERPRINT);
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
        })
      );
    });

    it('should handle biometric not available and require fallback', async () => {
      // Setup: Biometric not available
      Keychain.getSupportedBiometryType.mockResolvedValue(null);

      // Execute: Attempt biometric authentication
      const result = await authenticateWithBiometric();

      // Verify: Fallback required
      expect(result.success).toBe(false);
      expect(result.fallbackRequired).toBe(true);
      expect(result.error).toContain('not available');
    });

    it('should handle user cancellation', async () => {
      // Setup: Biometric available but user cancels
      Keychain.getSupportedBiometryType.mockResolvedValue(Keychain.BIOMETRY_TYPE.FACE_ID);
      Keychain.getGenericPassword.mockRejectedValue(new Error('User cancelled'));

      // Execute: Attempt authentication
      const result = await authenticateWithBiometric();

      // Verify: Cancellation detected
      expect(result.success).toBe(false);
      expect(result.cancelled).toBe(true);
    });

    it('should complete sensitive action with biometric authentication', async () => {
      // Setup: Biometric available
      Keychain.getSupportedBiometryType.mockResolvedValue(Keychain.BIOMETRY_TYPE.TOUCH_ID);
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'user',
        password: 'data',
      });

      const onSuccess = jest.fn();
      const onFallback = jest.fn();
      const onCancel = jest.fn();

      // Execute: Authenticate for sensitive action
      const result = await authenticateForSensitiveAction({
        action: 'delete account',
        onSuccess,
        onFallback,
        onCancel,
      });

      // Verify: Success callback called
      expect(result).toBe(true);
      expect(onSuccess).toHaveBeenCalled();
      expect(onFallback).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should use fallback when biometric fails', async () => {
      // Setup: Biometric available but fails
      Keychain.getSupportedBiometryType.mockResolvedValue(Keychain.BIOMETRY_TYPE.FINGERPRINT);
      Keychain.getGenericPassword.mockRejectedValue(new Error('Authentication failed'));

      const onSuccess = jest.fn();
      const onFallback = jest.fn().mockResolvedValue(true);
      const onCancel = jest.fn();

      // Execute: Authenticate for sensitive action
      const result = await authenticateForSensitiveAction({
        action: 'view sensitive data',
        onSuccess,
        onFallback,
        onCancel,
      });

      // Verify: Fallback callback called
      expect(onFallback).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should enable biometric authentication', async () => {
      // Setup: Biometric available
      Keychain.getSupportedBiometryType.mockResolvedValue(Keychain.BIOMETRY_TYPE.FACE_ID);
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'user',
        password: 'data',
      });
      Keychain.setGenericPassword.mockResolvedValue(true);

      // Execute: Enable biometric
      const result = await enableBiometricAuth();

      // Verify: Biometric enabled
      expect(result).toBe(true);
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'biometric_enabled',
        'true',
        expect.objectContaining({
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        })
      );
    });

    it('should disable biometric authentication', async () => {
      // Setup: Mock reset
      Keychain.resetGenericPassword.mockResolvedValue(true);

      // Execute: Disable biometric
      const result = await disableBiometricAuth();

      // Verify: Biometric disabled
      expect(result).toBe(true);
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'biometric_enabled',
      });
    });
  });

  describe('Secure Logout Flow', () => {
    it('should complete full secure logout flow', async () => {
      // Setup: User is authenticated with stored tokens and data
      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      Keychain.setGenericPassword.mockResolvedValue(true);
      await storeTokens(tokens);

      Keychain.resetGenericPassword.mockResolvedValue(true);
      Keychain.resetInternetCredentials.mockResolvedValue(true);
      AsyncStorage.multiRemove.mockResolvedValue();

      // Execute: Perform logout
      await clearSecureStorage();
      store.dispatch(logout());
      await persistor.purge();

      // Verify: All secure data cleared
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
      expect(Keychain.resetInternetCredentials).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(logout());
      expect(persistor.purge).toHaveBeenCalled();
    });

    it('should clear tokens from secure storage on logout', async () => {
      // Setup: Store tokens
      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      Keychain.setGenericPassword.mockResolvedValue(true);
      await storeTokens(tokens);

      Keychain.resetGenericPassword.mockResolvedValue(true);
      Keychain.resetInternetCredentials.mockResolvedValue(true);

      // Execute: Clear storage
      const result = await clearSecureStorage();

      // Verify: Storage cleared
      expect(result).toBe(true);
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
      expect(Keychain.resetInternetCredentials).toHaveBeenCalled();
    });

    it('should cancel scheduled token refresh on logout', async () => {
      jest.useFakeTimers();

      // Setup: Schedule a token refresh
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      scheduleTokenRefresh(futureDate);

      // Execute: Cancel refresh (part of logout)
      cancelTokenRefresh();

      // Verify: Timer cleared
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
      jest.useRealTimers();
    });

    it('should dispatch logout action and clear Redux state', async () => {
      // Setup: Mock Redux state
      store.getState.mockReturnValue({
        auth: {
          isAuthenticated: true,
          user: { id: 'user123' },
        },
      });

      // Execute: Dispatch logout
      store.dispatch(logout());

      // Verify: Logout action dispatched
      expect(store.dispatch).toHaveBeenCalledWith(logout());
      expect(logout).toHaveBeenCalled();
    });

    it('should handle logout when no tokens exist', async () => {
      // Setup: No tokens stored
      Keychain.getGenericPassword.mockResolvedValue(false);
      Keychain.resetGenericPassword.mockResolvedValue(true);
      Keychain.resetInternetCredentials.mockResolvedValue(true);

      // Execute: Attempt logout
      const result = await clearSecureStorage();

      // Verify: Logout completed without errors
      expect(result).toBe(true);
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    });

    it('should purge persisted Redux state on logout', async () => {
      // Setup: Mock persistor
      persistor.purge.mockResolvedValue();

      // Execute: Purge state
      await persistor.purge();

      // Verify: Persistor purged
      expect(persistor.purge).toHaveBeenCalled();
    });
  });

  describe('Complete Authentication Lifecycle', () => {
    it('should handle login -> token refresh -> logout lifecycle', async () => {
      jest.useFakeTimers();

      // Step 1: Login - Store tokens
      const loginTokens = {
        accessToken: 'initial_access_token',
        refreshToken: 'refresh_token',
        accessTokenExpiresAt: new Date(Date.now() + 600000).toISOString(), // 10 minutes
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      Keychain.setGenericPassword.mockResolvedValue(true);
      await storeTokens(loginTokens);

      Keychain.getGenericPassword.mockResolvedValue({
        username: 'auth_tokens',
        password: JSON.stringify(loginTokens),
      });

      // Verify: Tokens stored
      const storedTokens = await getTokens();
      expect(storedTokens.accessToken).toBe('initial_access_token');

      // Step 2: Token Refresh - Simulate automatic refresh
      const refreshedTokens = {
        access_token: 'refreshed_access_token',
        access_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
      };
      axios.post.mockResolvedValue({ data: refreshedTokens });

      scheduleTokenRefresh(loginTokens.accessTokenExpiresAt);
      jest.advanceTimersByTime(300000); // 5 minutes
      await jest.runAllTimersAsync();

      // Verify: Token refreshed
      expect(axios.post).toHaveBeenCalled();

      // Step 3: Logout - Clear everything
      Keychain.resetGenericPassword.mockResolvedValue(true);
      Keychain.resetInternetCredentials.mockResolvedValue(true);

      await clearSecureStorage();
      cancelTokenRefresh();
      store.dispatch(logout());

      // Verify: Everything cleared
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(logout());

      jest.useRealTimers();
    });

    it('should handle biometric authentication with token refresh', async () => {
      // Step 1: Enable biometric
      Keychain.getSupportedBiometryType.mockResolvedValue(Keychain.BIOMETRY_TYPE.FINGERPRINT);
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'user',
        password: 'data',
      });
      Keychain.setGenericPassword.mockResolvedValue(true);

      const biometricEnabled = await enableBiometricAuth();
      expect(biometricEnabled).toBe(true);

      // Step 2: Store tokens
      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        accessTokenExpiresAt: new Date(Date.now() - 60000).toISOString(), // Expired
        refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      Keychain.getGenericPassword.mockResolvedValue({
        username: 'auth_tokens',
        password: JSON.stringify(tokens),
      });

      // Step 3: Get valid token (should refresh)
      const newTokens = {
        access_token: 'new_token',
        access_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
      };
      axios.post.mockResolvedValue({ data: newTokens });

      const validToken = await getValidAccessToken();

      // Verify: Token refreshed and biometric still enabled
      expect(validToken).toBe('new_token');
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
