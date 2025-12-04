/**
 * Secure Storage Service
 * 
 * Provides secure token storage using react-native-keychain
 * Migrates from AsyncStorage to encrypted keychain storage
 * 
 * Requirements: 10.1
 */

import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Service identifiers for keychain
const KEYCHAIN_SERVICE = 'com.khelogames.auth';
const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'user_data';

/**
 * Store authentication tokens securely in keychain
 * @param {Object} tokens - Token data to store
 * @param {string} tokens.accessToken - Access token
 * @param {string} tokens.refreshToken - Refresh token
 * @param {string} tokens.accessTokenExpiresAt - Access token expiration
 * @param {string} tokens.refreshTokenExpiresAt - Refresh token expiration
 * @returns {Promise<boolean>} Success status
 */
export const storeTokens = async (tokens) => {
  try {
    const tokenData = JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      storedAt: new Date().toISOString(),
    });

    await Keychain.setGenericPassword(
      TOKEN_KEY,
      tokenData,
      {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
      }
    );

    return true;
  } catch (error) {
    console.error('Error storing tokens securely:', error);
    throw new Error('Failed to store authentication tokens');
  }
};

/**
 * Retrieve authentication tokens from secure storage
 * @returns {Promise<Object|null>} Token data or null if not found
 */
export const getTokens = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (credentials && credentials.username === TOKEN_KEY) {
      return JSON.parse(credentials.password);
    }

    return null;
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    return null;
  }
};

/**
 * Store user data securely
 * @param {Object} user - User data to store
 * @returns {Promise<boolean>} Success status
 */
export const storeUserData = async (user) => {
  try {
    const userData = JSON.stringify(user);

    await Keychain.setInternetCredentials(
      USER_KEY,
      user.public_id || user.id || 'user',
      userData,
      {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      }
    );

    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    throw new Error('Failed to store user data');
  }
};

/**
 * Retrieve user data from secure storage
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const getUserData = async () => {
  try {
    const credentials = await Keychain.getInternetCredentials(USER_KEY, {
      service: KEYCHAIN_SERVICE,
    });

    if (credentials) {
      return JSON.parse(credentials.password);
    }

    return null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Clear all secure storage data
 * @returns {Promise<boolean>} Success status
 */
export const clearSecureStorage = async () => {
  try {
    // Clear tokens
    await Keychain.resetGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    // Clear user data
    await Keychain.resetInternetCredentials(USER_KEY, {
      service: KEYCHAIN_SERVICE,
    });

    return true;
  } catch (error) {
    console.error('Error clearing secure storage:', error);
    return false;
  }
};

/**
 * Migrate tokens from AsyncStorage to secure keychain storage
 * This should be called once during app initialization
 * @returns {Promise<boolean>} Success status
 */
export const migrateFromAsyncStorage = async () => {
  try {
    // Check if migration already done
    const existingTokens = await getTokens();
    if (existingTokens) {
      console.log('Tokens already migrated to secure storage');
      return true;
    }

    // Get tokens from AsyncStorage
    const accessToken = await AsyncStorage.getItem('AccessToken');
    const refreshToken = await AsyncStorage.getItem('RefreshToken');
    const accessTokenExpiresAt = await AsyncStorage.getItem('AccessTokenExpiresAt');
    const refreshTokenExpiresAt = await AsyncStorage.getItem('RefreshTokenExpiresAt');

    if (accessToken && refreshToken) {
      // Store in secure keychain
      await storeTokens({
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
      });

      // Get user data from AsyncStorage
      const userString = await AsyncStorage.getItem('User');
      const role = await AsyncStorage.getItem('Role');
      const userPublicID = await AsyncStorage.getItem('UserPublicID');

      if (userString) {
        try {
          const user = JSON.parse(userString);
          user.role = role || user.role;
          user.public_id = userPublicID || user.public_id;
          await storeUserData(user);
        } catch (parseError) {
          console.error('Error parsing user data during migration:', parseError);
        }
      }

      // Clear old AsyncStorage data
      await AsyncStorage.multiRemove([
        'AccessToken',
        'RefreshToken',
        'AccessTokenExpiresAt',
        'RefreshTokenExpiresAt',
        'User',
        'Role',
        'UserPublicID',
      ]);

      console.log('Successfully migrated tokens to secure storage');
      return true;
    }

    console.log('No tokens found in AsyncStorage to migrate');
    return false;
  } catch (error) {
    console.error('Error migrating from AsyncStorage:', error);
    return false;
  }
};

/**
 * Check if tokens exist in secure storage
 * @returns {Promise<boolean>} True if tokens exist
 */
export const hasTokens = async () => {
  try {
    const tokens = await getTokens();
    return tokens !== null && tokens.accessToken !== undefined;
  } catch (error) {
    console.error('Error checking for tokens:', error);
    return false;
  }
};

/**
 * Get access token only
 * @returns {Promise<string|null>} Access token or null
 */
export const getAccessToken = async () => {
  try {
    const tokens = await getTokens();
    return tokens ? tokens.accessToken : null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get refresh token only
 * @returns {Promise<string|null>} Refresh token or null
 */
export const getRefreshToken = async () => {
  try {
    const tokens = await getTokens();
    return tokens ? tokens.refreshToken : null;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Update only the access token (used after refresh)
 * @param {string} newAccessToken - New access token
 * @param {string} newExpiresAt - New expiration time
 * @returns {Promise<boolean>} Success status
 */
export const updateAccessToken = async (newAccessToken, newExpiresAt) => {
  try {
    const tokens = await getTokens();
    if (!tokens) {
      throw new Error('No existing tokens found');
    }

    tokens.accessToken = newAccessToken;
    tokens.accessTokenExpiresAt = newExpiresAt;
    tokens.updatedAt = new Date().toISOString();

    await storeTokens(tokens);
    return true;
  } catch (error) {
    console.error('Error updating access token:', error);
    return false;
  }
};
