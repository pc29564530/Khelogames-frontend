/**
 * E2E Test Configuration
 * 
 * This module provides configuration settings for E2E tests,
 * including API endpoints, timeouts, and test environment settings.
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Base URL for API requests
  baseURL: process.env.API_BASE_URL || 'http://192.168.1.3:8080',
  
  // API endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      signup: '/api/auth/signup',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
    },
    matches: {
      list: '/api/matches',
      create: '/api/matches/create',
      details: '/api/matches/:id',
      update: '/api/matches/:id/update',
    },
    tournaments: {
      list: '/api/tournaments',
      create: '/api/tournaments/create',
      details: '/api/tournaments/:id',
    },
    clubs: {
      list: '/api/clubs',
      create: '/api/clubs/create',
      details: '/api/clubs/:id',
    },
    communities: {
      list: '/api/communities',
      create: '/api/communities/create',
      details: '/api/communities/:id',
    },
    threads: {
      list: '/api/threads',
      create: '/api/threads/create',
      details: '/api/threads/:id',
      comment: '/api/threads/:id/comment',
    },
    users: {
      profile: '/api/users/profile',
      update: '/api/users/profile/update',
    },
  },
};

/**
 * Timeout Configuration (in milliseconds)
 */
export const TIMEOUTS = {
  // Short timeout for quick operations
  short: 2000,
  
  // Medium timeout for standard operations
  medium: 5000,
  
  // Long timeout for slow operations (API calls, navigation)
  long: 10000,
  
  // Extra long timeout for very slow operations (file uploads, etc.)
  extraLong: 30000,
  
  // Default timeout for waitFor operations
  default: 5000,
};

/**
 * Test Environment Configuration
 */
export const TEST_ENV = {
  // Whether to run tests in debug mode
  debug: process.env.DEBUG === 'true',
  
  // Whether to take screenshots on failure
  screenshotOnFailure: true,
  
  // Whether to clear app data before tests
  clearAppData: process.env.CLEAR_APP_DATA !== 'false',
  
  // Whether to seed test data
  seedData: process.env.SEED_DATA === 'true',
  
  // Test data API endpoint
  testDataEndpoint: process.env.TEST_DATA_ENDPOINT || 'http://192.168.1.3:8080/api/test',
};

/**
 * Device Configuration
 */
export const DEVICE_CONFIG = {
  // Android emulator name
  androidEmulator: process.env.ANDROID_EMULATOR || 'Pixel_3a_API_30_x86',
  
  // iOS simulator name
  iosSimulator: process.env.IOS_SIMULATOR || 'iPhone 14',
  
  // Device orientation
  orientation: 'portrait',
};

/**
 * App Configuration
 */
export const APP_CONFIG = {
  // App bundle identifier
  bundleId: {
    android: 'com.khelogamesapp',
    ios: 'com.khelogames.app',
  },
  
  // Deep link scheme
  deepLinkScheme: 'khelogames://',
  
  // App launch timeout
  launchTimeout: 60000,
};

/**
 * Test Data Configuration
 */
export const TEST_DATA_CONFIG = {
  // Number of items to generate for list tests
  listItemCount: 10,
  
  // Whether to use faker for random data
  useFaker: true,
  
  // Seed for faker (for reproducible tests)
  fakerSeed: process.env.FAKER_SEED ? parseInt(process.env.FAKER_SEED) : undefined,
};

/**
 * Retry Configuration
 */
export const RETRY_CONFIG = {
  // Number of times to retry failed tests
  maxRetries: process.env.MAX_RETRIES ? parseInt(process.env.MAX_RETRIES) : 2,
  
  // Delay between retries (in milliseconds)
  retryDelay: 1000,
};

/**
 * Logging Configuration
 */
export const LOGGING_CONFIG = {
  // Whether to log API requests
  logRequests: process.env.LOG_REQUESTS === 'true',
  
  // Whether to log test steps
  logSteps: process.env.LOG_STEPS === 'true',
  
  // Log level (error, warn, info, debug)
  logLevel: process.env.LOG_LEVEL || 'info',
};

/**
 * Get full API URL
 * @param {string} endpoint - Endpoint path
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

/**
 * Get endpoint with parameters replaced
 * @param {string} endpoint - Endpoint path with parameters
 * @param {Object} params - Parameters to replace
 * @returns {string} Endpoint with parameters replaced
 */
export const getEndpointWithParams = (endpoint, params = {}) => {
  let result = endpoint;
  Object.keys(params).forEach(key => {
    result = result.replace(`:${key}`, params[key]);
  });
  return result;
};

/**
 * Check if running on Android
 * @returns {boolean}
 */
export const isAndroid = () => {
  return device.getPlatform() === 'android';
};

/**
 * Check if running on iOS
 * @returns {boolean}
 */
export const isIOS = () => {
  return device.getPlatform() === 'ios';
};

/**
 * Get platform-specific configuration
 * @param {Object} config - Configuration object with android and ios keys
 * @returns {*} Platform-specific configuration
 */
export const getPlatformConfig = (config) => {
  return isAndroid() ? config.android : config.ios;
};

export default {
  API_CONFIG,
  TIMEOUTS,
  TEST_ENV,
  DEVICE_CONFIG,
  APP_CONFIG,
  TEST_DATA_CONFIG,
  RETRY_CONFIG,
  LOGGING_CONFIG,
  getApiUrl,
  getEndpointWithParams,
  isAndroid,
  isIOS,
  getPlatformConfig,
};
