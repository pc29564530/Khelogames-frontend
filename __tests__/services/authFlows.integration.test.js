/**
 * Authentication Flows Integration Tests
 * 
 * Tests complete authentication flows including:
 * - Login flow from input to authenticated state
 * - Signup flow with validation
 * - Logout flow
 * - Token refresh flow
 * - Biometric authentication flow
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
import {
  loginWithEmail,
  loginWithGoogle,
  signupWithEmail,
  secureLogout,
  initializeAuth,
} from '../../services/enhancedAuthService';

// Mock dependencies
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(),
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  setInternetCredentials: jest.fn(),
  getInternetCredentials: jest.fn(),
  resetInternetCredentials: jest.fn(),
  getSupportedBiometryType: jest.fn(),
  BIOMETRY_TYPE: {
    FINGERPRINT: 'Fingerprint',
    FACE_ID: 'FaceID',
    TOUCH_ID: 'TouchID',
  },
  AUTHENTICATION_TYPE: {
    BIOMETRICS: 'AuthenticationWithBiometrics',
  },
  ACCESS_CONTROL: {
    BIOMETRY_ANY: 'BiometryAny',
  },
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'WhenUnlocked',
  },
  SECURITY_LEVEL: {
    SECURE_HARDWARE: 'SECURE_HARDWARE',
  },
}));
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
    
    // Reset store mock
    store.dispatch.mockClear();
    store.getState.mockReturnValue({
      auth: {
        isAuthenticated: false,
        user: null,
      },
    });
  });

  afterEach(() => {
    cancelTokenRefresh();
  });

  describe('Login Flow - From Input to Authenticated State', () => {
    it('should complete full email login flow with valid credentials', async () => {
      // Setup: Mock successful login API response
      const mockLoginResponse = {
        data: {
          Success: true,
          AccessToken: 'test_access_token',
          RefreshToken: 'test_refresh_token',
          AccessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          RefreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          User: {
            id: 'user123',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'user',
            public_id: 'pub123',
          },
        },
      };

      axios.post.mockResolvedValue(mockLoginResponse);
      Keychain.setGenericPassword.mockResolvedValue(true);
      AsyncStorage.setItem.mockResolvedValue();

      // Execute: Login with email and password
      const result = await loginWithEmail({
        email: 'test@example.com',
        password: 'Password123',
        dispatch: store.dispatch,
      });

      // Verify: API called with correct credentials
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/google/createEmailSignIn'),
        expect.objectContaining({
          email: 'test@example.com',
          password: 'Password123',
        })
      );

      // Verify: Tokens stored securely
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'auth_tokens',
        expect.stringContaining('test_access_token'),
        expect.any(Object)
      );

      // Verify: User data stored (uses setInternetCredentials, not setGenericPassword)
      expect(Keychain.setInternetCredentials).toHaveBeenCalledWith(
        'user_data',
        expect.any(String), // user public_id or id
        expect.stringContaining('test@example.com'),
        expect.any(Object)
      );

      // Verify: Non-sensitive data in AsyncStorage
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('Role', 'user');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('UserPublicID', 'pub123');

      // Verify: Redux state updated
      expect(store.dispatch).toHaveBeenCalledWith(setAuthenticated(true));
      expect(store.dispatch).toHaveBeenCalledWith(
        setUser(mockLoginResponse.data.User)
      );

      // Verify: Result indicates success
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockLoginResponse.data.User);
    });

    it('should handle login failure with invalid credentials', async () => {
      // Setup: Mock failed login API response (Success: false in response data)
      const mockFailedResponse = {
        data: {
          Success: false,
          message: 'Invalid email or password',
        },
      };

      axios.post.mockResolvedValue(mockFailedResponse);

      // Execute & Verify: Login fails with error
      await expect(
        loginWithEmail({
          email: 'wrong@example.com',
          password: 'WrongPassword',
          dispatch: store.dispatch,
        })
      ).rejects.toThrow('Invalid email or password');

      // Verify: No tokens stored
      expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
      expect(Keychain.setInternetCredentials).not.toHaveBeenCalled();

      // Verify: Redux state not updated
      expect(store.dispatch).not.toHaveBeenCalledWith(setAuthenticated(true));
    });

    it('should handle network errors during login', async () => {
      // Setup: Mock network error
      const networkError = new Error('Network request failed');
      networkError.request = {};
      axios.post.mockRejectedValue(networkError);

      // Execute & Verify: Login fails with network error
      await expect(
        loginWithEmail({
          email: 'test@example.com',
          password: 'Password123',
          dispatch: store.dispatch,
        })
      ).rejects.toThrow('Network request failed');

      // Verify: No state changes
      expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalledWith(setAuthenticated(true));
    });

    it('should complete Google login flow', async () => {
      // Setup: Mock successful Google login
      const mockGoogleResponse = {
        data: {
          Success: true,
          AccessToken: 'google_access_token',
          RefreshToken: 'google_refresh_token',
          AccessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          RefreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          User: {
            id: 'google_user123',
            email: 'google@example.com',
            full_name: 'Google User',
            role: 'user',
            public_id: 'google_pub123',
          },
        },
      };

      axios.post.mockResolvedValue(mockGoogleResponse);
      Keychain.setGenericPassword.mockResolvedValue(true);
      AsyncStorage.setItem.mockResolvedValue();

      // Execute: Login with Google ID token
      const result = await loginWithGoogle('google_id_token', store.dispatch);

      // Verify: API called with Google token
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/google/createGoogleSignIn'),
        expect.objectContaining({
          code: 'google_id_token',
        })
      );

      // Verify: Tokens and user data stored
      expect(Keychain.setGenericPassword).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(setAuthenticated(true));
      expect(result.success).toBe(true);
    });

    it('should trim and lowercase email during login', async () => {
      // Setup: Mock successful login
      const mockResponse = {
        data: {
          Success: true,
          AccessToken: 'token',
          RefreshToken: 'refresh',
          AccessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          RefreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          User: { id: 'user123', email: 'test@example.com' },
        },
      };

      axios.post.mockResolvedValue(mockResponse);
      Keychain.setGenericPassword.mockResolvedValue(true);
      AsyncStorage.setItem.mockResolvedValue();

      // Execute: Login with email that needs normalization
      await loginWithEmail({
        email: '  TEST@EXAMPLE.COM  ',
        password: 'Password123',
        dispatch: store.dispatch,
      });

      // Verify: Email normalized before API call
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          email: 'test@example.com',
        })
      );
    });
  });

  describe('Signup Flow - With Validation', () => {
    it('should complete full email signup flow with valid data', async () => {
      // Setup: Mock successful signup API response
      const mockSignupResponse = {
        data: {
          Success: true,
          Session: {
            AccessToken: 'new_access_token',
            RefreshToken: 'new_refresh_token',
            AccessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
            RefreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
          User: {
            id: 'newuser123',
            email: 'newuser@example.com',
            full_name: 'New User',
            role: 'user',
            public_id: 'newpub123',
          },
        },
      };

      axios.post.mockResolvedValue(mockSignupResponse);
      Keychain.setGenericPassword.mockResolvedValue(true);
      AsyncStorage.setItem.mockResolvedValue();

      // Execute: Signup with email, password, and full name
      const result = await signupWithEmail({
        fullName: 'New User',
        email: 'newuser@example.com',
        password: 'SecurePass123',
        dispatch: store.dispatch,
      });

      // Verify: API called with correct signup data
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/google/createEmailSignUp'),
        expect.objectContaining({
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'SecurePass123',
        })
      );

      // Verify: Tokens stored securely
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'auth_tokens',
        expect.stringContaining('new_access_token'),
        expect.any(Object)
      );

      // Verify: User data stored (uses setInternetCredentials, not setGenericPassword)
      expect(Keychain.setInternetCredentials).toHaveBeenCalledWith(
        'user_data',
        expect.any(String), // user public_id or id
        expect.stringContaining('newuser@example.com'),
        expect.any(Object)
      );

      // Verify: Redux state updated
      expect(store.dispatch).toHaveBeenCalledWith(setAuthenticated(true));
      expect(store.dispatch).toHaveBeenCalledWith(
        setUser(mockSignupResponse.data.User)
      );

      // Verify: Result indicates success
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockSignupResponse.data.User);
    });

    it('should handle signup failure with existing email', async () => {
      // Setup: Mock failed signup - email already exists (Success: false in response data)
      const mockFailedResponse = {
        data: {
          Success: false,
          message: 'Email already registered',
        },
      };

      axios.post.mockResolvedValue(mockFailedResponse);

      // Execute & Verify: Signup fails with error
      await expect(
        signupWithEmail({
          fullName: 'Test User',
          email: 'existing@example.com',
          password: 'Password123',
          dispatch: store.dispatch,
        })
      ).rejects.toThrow('Email already registered');

      // Verify: No tokens stored
      expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
      expect(Keychain.setInternetCredentials).not.toHaveBeenCalled();

      // Verify: Redux state not updated
      expect(store.dispatch).not.toHaveBeenCalledWith(setAuthenticated(true));
    });

    it('should trim and normalize signup data', async () => {
      // Setup: Mock successful signup
      const mockResponse = {
        data: {
          Success: true,
          Session: {
            AccessToken: 'token',
            RefreshToken: 'refresh',
            AccessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
            RefreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
          User: { id: 'user123', email: 'test@example.com', full_name: 'Test User' },
        },
      };

      axios.post.mockResolvedValue(mockResponse);
      Keychain.setGenericPassword.mockResolvedValue(true);
      AsyncStorage.setItem.mockResolvedValue();

      // Execute: Signup with data that needs normalization
      await signupWithEmail({
        fullName: '  Test User  ',
        email: '  TEST@EXAMPLE.COM  ',
        password: 'Password123',
        dispatch: store.dispatch,
      });

      // Verify: Data normalized before API call
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          full_name: 'Test User',
          email: 'test@example.com',
        })
      );
    });

    it('should handle network errors during signup', async () => {
      // Setup: Mock network error
      const networkError = new Error('Network request failed');
      networkError.request = {};
      axios.post.mockRejectedValue(networkError);

      // Execute & Verify: Signup fails with network error
      await expect(
        signupWithEmail({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
          dispatch: store.dispatch,
        })
      ).rejects.toThrow('Network request failed');

      // Verify: No state changes
      expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalledWith(setAuthenticated(true));
    });

    it('should schedule token refresh after successful signup', async () => {
      jest.useFakeTimers();

      // Setup: Mock successful signup
      const expiresAt = new Date(Date.now() + 600000).toISOString(); // 10 minutes
      const mockResponse = {
        data: {
          Success: true,
          Session: {
            AccessToken: 'token',
            RefreshToken: 'refresh',
            AccessTokenExpiresAt: expiresAt,
            RefreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
          User: { id: 'user123', email: 'test@example.com' },
        },
      };

      axios.post.mockResolvedValue(mockResponse);
      Keychain.setGenericPassword.mockResolvedValue(true);
      AsyncStorage.setItem.mockResolvedValue();

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      // Execute: Signup
      await signupWithEmail({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        dispatch: store.dispatch,
      });

      // Verify: Token refresh scheduled
      expect(setTimeoutSpy).toHaveBeenCalled();

      setTimeoutSpy.mockRestore();
      jest.useRealTimers();
    });
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

  describe('Logout Flow - Complete Cleanup', () => {
    it('should complete full secure logout flow from authenticated state', async () => {
      // Setup: User is authenticated with stored tokens and data
      const mockNavigation = {
        reset: jest.fn(),
      };

      store.getState.mockReturnValue({
        auth: {
          isAuthenticated: true,
          user: { id: 'user123', email: 'test@example.com' },
        },
      });

      AsyncStorage.getItem.mockResolvedValue('pub123');
      AsyncStorage.multiRemove.mockResolvedValue();
      Keychain.resetGenericPassword.mockResolvedValue(true);
      Keychain.resetInternetCredentials.mockResolvedValue(true);
      axios.delete.mockResolvedValue({ data: { success: true } });
      persistor.purge.mockResolvedValue();

      // Execute: Perform secure logout
      await secureLogout({
        dispatch: store.dispatch,
        navigation: mockNavigation,
      });

      // Verify: Backend logout called
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/removeSession/pub123')
      );

      // Verify: All secure storage cleared
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
      expect(Keychain.resetInternetCredentials).toHaveBeenCalled();

      // Verify: AsyncStorage cleared
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(
        expect.arrayContaining([
          'AccessToken',
          'RefreshToken',
          'User',
          'Role',
          'UserPublicID',
        ])
      );

      // Verify: Redux state cleared
      expect(store.dispatch).toHaveBeenCalledWith(logout());
      expect(persistor.purge).toHaveBeenCalled();

      // Verify: Navigation reset to login
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    });

    it('should handle logout when backend call fails', async () => {
      // Setup: Backend logout fails but local cleanup should continue
      const mockNavigation = { reset: jest.fn() };

      AsyncStorage.getItem.mockResolvedValue('pub123');
      AsyncStorage.multiRemove.mockResolvedValue();
      Keychain.resetGenericPassword.mockResolvedValue(true);
      Keychain.resetInternetCredentials.mockResolvedValue(true);
      axios.delete.mockRejectedValue(new Error('Network error'));
      persistor.purge.mockResolvedValue();

      // Execute: Logout should complete despite backend error
      await secureLogout({
        dispatch: store.dispatch,
        navigation: mockNavigation,
      });

      // Verify: Local cleanup still performed
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(logout());
      expect(persistor.purge).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalled();
    });

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

    it('should disable biometric authentication on logout', async () => {
      // Setup: Biometric enabled
      const mockNavigation = { reset: jest.fn() };

      AsyncStorage.getItem.mockResolvedValue('pub123');
      AsyncStorage.multiRemove.mockResolvedValue();
      Keychain.resetGenericPassword.mockResolvedValue(true);
      Keychain.resetInternetCredentials.mockResolvedValue(true);
      axios.delete.mockResolvedValue({ data: { success: true } });
      persistor.purge.mockResolvedValue();

      // Execute: Logout
      await secureLogout({
        dispatch: store.dispatch,
        navigation: mockNavigation,
      });

      // Verify: Biometric disabled (resetGenericPassword called for biometric_enabled)
      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
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
    it('should handle complete signup -> login -> token refresh -> logout lifecycle', async () => {
      jest.useFakeTimers();

      // Step 1: Signup
      const mockSignupResponse = {
        data: {
          Success: true,
          Session: {
            AccessToken: 'signup_token',
            RefreshToken: 'signup_refresh',
            AccessTokenExpiresAt: new Date(Date.now() + 600000).toISOString(),
            RefreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
          User: {
            id: 'newuser123',
            email: 'newuser@example.com',
            full_name: 'New User',
          },
        },
      };

      axios.post.mockResolvedValue(mockSignupResponse);
      Keychain.setGenericPassword.mockResolvedValue(true);
      AsyncStorage.setItem.mockResolvedValue();

      const signupResult = await signupWithEmail({
        fullName: 'New User',
        email: 'newuser@example.com',
        password: 'Password123',
        dispatch: store.dispatch,
      });

      expect(signupResult.success).toBe(true);
      expect(store.dispatch).toHaveBeenCalledWith(setAuthenticated(true));

      // Step 2: Logout after signup
      const mockNavigation = { reset: jest.fn() };
      AsyncStorage.getItem.mockResolvedValue('newuser123');
      AsyncStorage.multiRemove.mockResolvedValue();
      Keychain.resetGenericPassword.mockResolvedValue(true);
      Keychain.resetInternetCredentials.mockResolvedValue(true);
      axios.delete.mockResolvedValue({ data: { success: true } });
      persistor.purge.mockResolvedValue();

      await secureLogout({
        dispatch: store.dispatch,
        navigation: mockNavigation,
      });

      expect(store.dispatch).toHaveBeenCalledWith(logout());

      // Step 3: Login again
      store.dispatch.mockClear();
      const mockLoginResponse = {
        data: {
          Success: true,
          AccessToken: 'login_token',
          RefreshToken: 'login_refresh',
          AccessTokenExpiresAt: new Date(Date.now() + 600000).toISOString(),
          RefreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          User: mockSignupResponse.data.User,
        },
      };

      axios.post.mockResolvedValue(mockLoginResponse);
      Keychain.setGenericPassword.mockResolvedValue(true);

      const loginResult = await loginWithEmail({
        email: 'newuser@example.com',
        password: 'Password123',
        dispatch: store.dispatch,
      });

      expect(loginResult.success).toBe(true);
      expect(store.dispatch).toHaveBeenCalledWith(setAuthenticated(true));

      // Step 4: Token refresh
      Keychain.getGenericPassword.mockResolvedValue({
        username: 'auth_tokens',
        password: JSON.stringify({
          accessToken: 'login_token',
          refreshToken: 'login_refresh',
          accessTokenExpiresAt: new Date(Date.now() + 600000).toISOString(),
          refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        }),
      });

      const refreshedTokens = {
        access_token: 'refreshed_token',
        access_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
      };
      axios.post.mockResolvedValue({ data: refreshedTokens });

      scheduleTokenRefresh(mockLoginResponse.data.AccessTokenExpiresAt);
      jest.advanceTimersByTime(300000); // 5 minutes
      await jest.runAllTimersAsync();

      expect(axios.post).toHaveBeenCalled();

      // Step 5: Final logout
      await secureLogout({
        dispatch: store.dispatch,
        navigation: mockNavigation,
      });

      expect(Keychain.resetGenericPassword).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalled();

      jest.useRealTimers();
    });

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
