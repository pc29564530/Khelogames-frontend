/**
 * Token Refresh Service
 * 
 * Handles automatic token refresh before expiration
 * Implements refresh token flow with re-authentication on failure
 * 
 * Requirements: 10.2
 */

import axios from 'axios';
import { AUTH_URL } from '../constants/ApiConstants';
import { getTokens, updateAccessToken, clearSecureStorage } from './secureStorage';
import { store } from '../redux/store';
import { logout } from '../redux/actions/actions';

// Refresh token 5 minutes before expiration
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

let refreshTimer = null;
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Subscribe to token refresh completion
 * @param {Function} callback - Callback to execute when refresh completes
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers that token refresh is complete
 * @param {string} token - New access token
 */
const onRefreshComplete = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Check if access token is expired or about to expire
 * @param {string} expiresAt - ISO timestamp of token expiration
 * @returns {boolean} True if token needs refresh
 */
export const isTokenExpired = (expiresAt) => {
  if (!expiresAt) return true;

  try {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;

    // Return true if expired or will expire within buffer time
    return timeUntilExpiry <= REFRESH_BUFFER_MS;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Refresh the access token using refresh token
 * @returns {Promise<Object>} New token data
 */
export const refreshAccessToken = async () => {
  // Prevent multiple simultaneous refresh attempts
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        resolve({ accessToken: token });
      });
    });
  }

  isRefreshing = true;

  try {
    const tokens = await getTokens();
    
    if (!tokens || !tokens.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Check if refresh token is expired
    if (isTokenExpired(tokens.refreshTokenExpiresAt)) {
      throw new Error('Refresh token expired');
    }

    // Call refresh endpoint
    const response = await axios.post(
      `${AUTH_URL}/refresh`,
      {
        refresh_token: tokens.refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { access_token, access_token_expires_at } = response.data;

    if (!access_token) {
      throw new Error('No access token in refresh response');
    }

    // Update stored token
    await updateAccessToken(access_token, access_token_expires_at);

    // Notify subscribers
    onRefreshComplete(access_token);

    // Schedule next refresh
    scheduleTokenRefresh(access_token_expires_at);

    isRefreshing = false;

    return {
      accessToken: access_token,
      expiresAt: access_token_expires_at,
    };
  } catch (error) {
    isRefreshing = false;
    console.error('Token refresh failed:', error);

    // Handle refresh failure
    await handleRefreshFailure(error);

    throw error;
  }
};

/**
 * Handle token refresh failure
 * @param {Error} error - Refresh error
 */
const handleRefreshFailure = async (error) => {
  // Check if it's an authentication error
  const isAuthError = 
    error.response?.status === 401 || 
    error.response?.status === 403 ||
    error.message === 'Refresh token expired' ||
    error.message === 'No refresh token available';

  if (isAuthError) {
    console.log('Authentication failed, logging out user');
    
    // Clear secure storage
    await clearSecureStorage();
    
    // Dispatch logout action
    store.dispatch(logout());
    
    // Note: Navigation to login screen should be handled by the app's
    // authentication state listener
  }
};

/**
 * Schedule automatic token refresh
 * @param {string} expiresAt - ISO timestamp of token expiration
 */
export const scheduleTokenRefresh = (expiresAt) => {
  // Clear existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (!expiresAt) {
    console.warn('No expiration time provided for token refresh scheduling');
    return;
  }

  try {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const timeUntilRefresh = expirationTime - currentTime - REFRESH_BUFFER_MS;

    if (timeUntilRefresh <= 0) {
      // Token already expired or about to expire, refresh immediately
      console.log('Token expired or expiring soon, refreshing immediately');
      refreshAccessToken().catch((error) => {
        console.error('Immediate token refresh failed:', error);
      });
      return;
    }

    console.log(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);

    // Schedule refresh
    refreshTimer = setTimeout(() => {
      console.log('Executing scheduled token refresh');
      refreshAccessToken().catch((error) => {
        console.error('Scheduled token refresh failed:', error);
      });
    }, timeUntilRefresh);
  } catch (error) {
    console.error('Error scheduling token refresh:', error);
  }
};

/**
 * Cancel scheduled token refresh
 */
export const cancelTokenRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
    console.log('Token refresh cancelled');
  }
};

/**
 * Initialize token refresh on app start
 * Checks current token and schedules refresh if needed
 */
export const initializeTokenRefresh = async () => {
  try {
    const tokens = await getTokens();
    
    if (!tokens || !tokens.accessToken) {
      console.log('No tokens found, skipping refresh initialization');
      return;
    }

    // Check if access token needs immediate refresh
    if (isTokenExpired(tokens.accessTokenExpiresAt)) {
      console.log('Access token expired, refreshing immediately');
      await refreshAccessToken();
    } else {
      // Schedule refresh for later
      scheduleTokenRefresh(tokens.accessTokenExpiresAt);
    }
  } catch (error) {
    console.error('Error initializing token refresh:', error);
  }
};

/**
 * Get valid access token, refreshing if necessary
 * This is the main function to use when you need an access token
 * @returns {Promise<string|null>} Valid access token or null
 */
export const getValidAccessToken = async () => {
  try {
    const tokens = await getTokens();
    
    if (!tokens || !tokens.accessToken) {
      return null;
    }

    // Check if token needs refresh
    if (isTokenExpired(tokens.accessTokenExpiresAt)) {
      console.log('Token expired, refreshing...');
      const refreshed = await refreshAccessToken();
      return refreshed.accessToken;
    }

    return tokens.accessToken;
  } catch (error) {
    console.error('Error getting valid access token:', error);
    return null;
  }
};

/**
 * Axios interceptor to automatically refresh tokens
 * Add this to your axios instance
 */
export const setupAxiosInterceptor = () => {
  // Request interceptor - add token to requests
  axios.interceptors.request.use(
    async (config) => {
      // Skip token for auth endpoints
      if (config.url?.includes('/login') || config.url?.includes('/signup') || config.url?.includes('/refresh')) {
        return config;
      }

      const token = await getValidAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle 401 errors
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshed = await refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};
