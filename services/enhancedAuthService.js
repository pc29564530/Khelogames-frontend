/**
 * Enhanced Authentication Service
 * 
 * Provides secure authentication with token storage, refresh, and biometric support
 * Replaces the old authServies.js with secure implementations
 * 
 * Requirements: 10.1, 10.2, 10.3
 */

import axios from 'axios';
import { AUTH_URL } from '../constants/ApiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthenticated, setUser, logout as logoutAction } from '../redux/actions/actions';
import { persistor } from '../redux/store';
import { 
  storeTokens, 
  storeUserData, 
  clearSecureStorage,
  migrateFromAsyncStorage 
} from './secureStorage';
import { 
  scheduleTokenRefresh, 
  cancelTokenRefresh,
  initializeTokenRefresh 
} from './tokenRefreshService';
import { disableBiometricAuth } from './biometricAuthService';

/**
 * Initialize authentication system
 * Call this on app startup
 */
export const initializeAuth = async () => {
  try {
    // Migrate from AsyncStorage if needed
    await migrateFromAsyncStorage();
    
    // Initialize token refresh
    await initializeTokenRefresh();
    
    console.log('Authentication system initialized');
  } catch (error) {
    console.error('Error initializing auth system:', error);
  }
};

/**
 * Login with email and password
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<Object>} Login result
 */
export const loginWithEmail = async ({ email, password, dispatch }) => {
  try {
    const response = await axios.post(`${AUTH_URL}/google/createEmailSignIn`, {
      email: email.toLowerCase().trim(),
      password,
    });

    const item = response.data;

    if (!item.Success) {
      throw new Error(item.message || 'Login failed');
    }

    // Store tokens securely
    await storeTokens({
      accessToken: item.AccessToken,
      refreshToken: item.RefreshToken,
      accessTokenExpiresAt: item.AccessTokenExpiresAt,
      refreshTokenExpiresAt: item.RefreshTokenExpiresAt,
    });

    // Store user data securely
    await storeUserData(item.User);

    // Store additional data in AsyncStorage (non-sensitive)
    await AsyncStorage.setItem('Role', item.User?.role || '');
    await AsyncStorage.setItem('UserPublicID', item.User?.public_id || '');

    // Update Redux state
    dispatch(setAuthenticated(true));
    dispatch(setUser(item.User));

    // Schedule token refresh
    scheduleTokenRefresh(item.AccessTokenExpiresAt);

    return {
      success: true,
      user: item.User,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Login with Google
 * @param {string} idToken - Google ID token
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<Object>} Login result
 */
export const loginWithGoogle = async (idToken, dispatch) => {
  try {
    const response = await axios.post(`${AUTH_URL}/google/createGoogleSignIn`, {
      code: idToken,
    });

    const item = response.data;

    if (!item.Success) {
      throw new Error(item.message || 'Google login failed');
    }

    // Store tokens securely
    await storeTokens({
      accessToken: item.AccessToken,
      refreshToken: item.RefreshToken,
      accessTokenExpiresAt: item.AccessTokenExpiresAt,
      refreshTokenExpiresAt: item.RefreshTokenExpiresAt,
    });

    // Store user data securely
    await storeUserData(item.User);

    // Store additional data in AsyncStorage (non-sensitive)
    await AsyncStorage.setItem('Role', item.User?.role || '');
    await AsyncStorage.setItem('UserPublicID', item.User?.public_id || '');

    // Update Redux state
    dispatch(setAuthenticated(true));
    dispatch(setUser(item.User));

    // Schedule token refresh
    scheduleTokenRefresh(item.AccessTokenExpiresAt);

    return {
      success: true,
      user: item.User,
    };
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

/**
 * Signup with email and password
 * @param {Object} userData - Signup data
 * @param {string} userData.fullName - User's full name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<Object>} Signup result
 */
export const signupWithEmail = async ({ fullName, email, password, dispatch }) => {
  try {
    const response = await axios.post(`${AUTH_URL}/google/createEmailSignUp`, {
      full_name: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const item = response.data;

    if (!item.Success) {
      throw new Error(item.message || 'Signup failed');
    }

    // Store tokens securely
    await storeTokens({
      accessToken: item.Session.AccessToken,
      refreshToken: item.Session.RefreshToken,
      accessTokenExpiresAt: item.Session.AccessTokenExpiresAt,
      refreshTokenExpiresAt: item.Session.RefreshTokenExpiresAt,
    });

    // Store user data securely
    await storeUserData(item.User);

    // Store additional data in AsyncStorage (non-sensitive)
    await AsyncStorage.setItem('Role', item.User?.role || '');
    await AsyncStorage.setItem('UserPublicID', item.User?.public_id || '');

    // Update Redux state
    dispatch(setAuthenticated(true));
    dispatch(setUser(item.User));

    // Schedule token refresh
    scheduleTokenRefresh(item.Session.AccessTokenExpiresAt);

    return {
      success: true,
      user: item.User,
    };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

/**
 * Secure logout - clears all tokens, cache, and Redux state
 * @param {Object} params - Logout parameters
 * @param {Function} params.dispatch - Redux dispatch function
 * @param {Object} params.navigation - Navigation object
 * @returns {Promise<void>}
 * 
 * Requirements: 10.3
 */
export const secureLogout = async ({ dispatch, navigation }) => {
  try {
    // Get user public ID for backend logout
    const userPublicID = await AsyncStorage.getItem('UserPublicID');

    // Call backend logout endpoint (optional - may fail if offline)
    if (userPublicID) {
      try {
        await axios.delete(`${AUTH_URL}/removeSession/${userPublicID}`);
      } catch (backendError) {
        console.warn('Backend logout failed, continuing with local cleanup:', backendError);
      }
    }

    // Cancel any scheduled token refresh
    cancelTokenRefresh();

    // Clear secure storage (tokens and user data)
    await clearSecureStorage();

    // Disable biometric authentication
    await disableBiometricAuth();

    // Clear AsyncStorage
    await AsyncStorage.multiRemove([
      'AccessToken',
      'RefreshToken',
      'AccessTokenExpiresAt',
      'RefreshTokenExpiresAt',
      'User',
      'Role',
      'UserPublicID',
    ]);

    // Clear Redux state
    dispatch(logoutAction());

    // Purge Redux persist
    await persistor.purge();

    // Clear any cached data (if you have a cache service)
    // await clearAllCaches();

    console.log('Secure logout completed');

    // Navigate to login screen
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    }
  } catch (error) {
    console.error('Error during secure logout:', error);
    
    // Even if there's an error, try to clear what we can
    try {
      await clearSecureStorage();
      dispatch(logoutAction());
      await persistor.purge();
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }

    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if authenticated
 */
export const isAuthenticated = async () => {
  try {
    const tokens = await getTokens();
    return tokens !== null && tokens.accessToken !== undefined;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Legacy login function for backward compatibility
 * @deprecated Use loginWithEmail instead
 */
export const loginServies = async ({ username, password, dispatch, isAuthenticated }) => {
  console.warn('loginServies is deprecated, use loginWithEmail instead');
  return loginWithEmail({ email: username, password, dispatch });
};

/**
 * Legacy logout function for backward compatibility
 * @deprecated Use secureLogout instead
 */
export const logoutServies = async ({ dispatch, navigation }) => {
  console.warn('logoutServies is deprecated, use secureLogout instead');
  return secureLogout({ dispatch, navigation });
};
