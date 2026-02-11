import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

// Secure Storage Service
// Uses Android Keystore (and iOS Keychain when available)
// Stores sensitive data like refresh tokens securely

const REFRESH_TOKEN_KEY = 'refresh_token';
const REFRESH_TOKEN_EXPIRES_AT_KEY = 'refresh_token_expires_at';
const ACCESS_TOKEN_KEY = 'access_token';
const ACCESS_TOKEN_EXPIRES_AT_KEY = 'access_token_expires_at';

// Store access token securely in Android Keystore
export const storeAccessToken = async (accessToken) => {
  try {
    if (!accessToken) {
      console.warn('Attempted to store empty access token');
      return false;
    }

    const result = await Keychain.setGenericPassword(
      ACCESS_TOKEN_KEY,
      accessToken,
      {
        service: ACCESS_TOKEN_KEY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        storage: Keychain.STORAGE_TYPE.AES,
      }
    );
    
    if (result) {
      console.log('Access token stored securly in Keystore');
      return true;
    }
    return false;
  } catch (error) {
    console.error(' Error storing access token in Keystore:', error);
    return false;
  }
}

// Store access token expires securely in Android Keystore
export const storeAccessTokenExpiresAt = async (expiresAt) => {
  try {
    if (!expiresAt) {
      console.warn('Attempted to store empty expiration time');
      return false;
    }

    const result = await Keychain.setGenericPassword(
      ACCESS_TOKEN_EXPIRES_AT_KEY,
      expiresAt,
      {
        service: ACCESS_TOKEN_EXPIRES_AT_KEY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        storage: Keychain.STORAGE_TYPE.AES,
      }
    );

    if (result) {
      console.log('Access token expiration stored securely');
      return true;
    }
    return false;
  } catch (error) {
    console.error(' Error storing expiration in Keystore:', error);
    return false;
  }
};

// Store refresh token securely in Android Keystore
export const storeRefreshToken = async (refreshToken) => {
  try {
    console.log("Refresh token: ", refreshToken)
    if (!refreshToken) {
      console.warn('Attempted to store empty refresh token');
      return false;
    }

    const result = await Keychain.setGenericPassword(
      REFRESH_TOKEN_KEY,
      refreshToken,
      {
        service: "refresh_token",
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      }
    );

    if (result) {
      console.log('Refresh token stored securely in Keystore');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error storing refresh token in Keystore:', error);
    return false;
  }
};

// Retrieve refresh token from Android Keystore
export const getRefreshToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: REFRESH_TOKEN_KEY,
    });

    if (credentials && credentials.password) {
      console.log('Refresh token retrieved from Keystore');
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error(' Error retrieving refresh token from Keystore:', error);
    return null;
  }
};

// Store refresh token expiration time securely
export const storeRefreshTokenExpiresAt = async (expiresAt) => {
  try {
    if (!expiresAt) {
      console.warn('Attempted to store empty expiration time');
      return false;
    }

    const result = await Keychain.setGenericPassword(
      REFRESH_TOKEN_EXPIRES_AT_KEY,
      expiresAt,
      {
        service: REFRESH_TOKEN_EXPIRES_AT_KEY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        storage: Keychain.STORAGE_TYPE.AES,
      }
    );

    if (result) {
      console.log('Refresh token expiration stored securely');
      return true;
    }
    return false;
  } catch (error) {
    console.error(' Error storing expiration in Keystore:', error);
    return false;
  }
};


//Retrieve refresh token expiration time from Keystore
export const getRefreshTokenExpiresAt = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: REFRESH_TOKEN_EXPIRES_AT_KEY,
    });

    if (credentials && credentials.password) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error(' Error retrieving expiration from Keystore:', error);
    return null;
  }
};

// Remove refresh token from Keystore
export const removeRefreshToken = async () => {
  try {
    const result = await Keychain.resetGenericPassword({
      service: REFRESH_TOKEN_KEY,
    });
    
    // Also remove expiration
    await Keychain.resetGenericPassword({
      service: REFRESH_TOKEN_EXPIRES_AT_KEY,
    });

    if (result) {
      console.log('Refresh token removed from Keystore');
      return true;
    }
    return false;
  } catch (error) {
    console.error(' Error removing refresh token from Keystore:', error);
    return false;
  }
};

// Check if refresh token exists in Keystore
export const hasRefreshToken = async () => {
  try {
    const token = await getRefreshToken();
    return token !== null && token.length > 0;
  } catch (error) {
    console.error(' Error checking refresh token:', error);
    return false;
  }
};

// Retrieve access token from Android Keystore
export const getAccessToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: ACCESS_TOKEN_KEY,
    });

    if (credentials && credentials.password) {
      console.log('Access token retrieved from Keystore');
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving access token from Keystore:', error);
    return null;
  }
};

// Remove access token and its expiration from Keystore
export const removeAccessToken = async () => {
  try {
    const result = await Keychain.resetGenericPassword({
      service: ACCESS_TOKEN_KEY,
    });

    // Also remove access token expiration
    await Keychain.resetGenericPassword({
      service: ACCESS_TOKEN_EXPIRES_AT_KEY,
    });

    if (result) {
      console.log('Access token removed from Keystore');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing access token from Keystore:', error);
    return false;
  }
};

// Check if access token exists
export const hasAccessToken = async () => {
  try {
    const token = await AsyncStorage.getItem('AccessToken');
    return token !== null && token.length > 0;
  } catch (error) {
    console.error('Error checking access token: ', error);
    return false;
  }
}

// Clear all secure storage (refresh token and expiration)
export const clearSecureStorage = async () => {
  try {
    await removeRefreshToken();
    await AsyncStorage.clear();
    console.log('Secure storage cleared');
    return true;
  } catch (error) {
    console.error(' Error clexaring secure storage:', error);
    return false;
  }
};


