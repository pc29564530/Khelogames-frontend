/**
 * Redux Middleware Index
 * Central export for all Redux middleware
 */

import errorMiddleware, { 
  thunkErrorMiddleware, 
  networkErrorMiddleware 
} from './errorMiddleware';

import loggerMiddleware, { 
  createLoggerMiddleware,
  performanceMiddleware,
  createActionHistoryMiddleware 
} from './loggingMiddleware';

import analyticsMiddleware, { 
  screenViewMiddleware,
  ANALYTICS_EVENTS,
  AnalyticsService 
} from './analyticsMiddleware';

import { 
  batchActionsMiddleware 
} from '../utils/actionBatching';

/**
 * Get middleware array based on environment
 * @returns {Array} Array of middleware functions
 */
export const getMiddleware = () => {
  const middleware = [
    // Error handling (always enabled)
    errorMiddleware,
    thunkErrorMiddleware,
    networkErrorMiddleware,
    
    // Action batching (always enabled)
    batchActionsMiddleware,
    
    // Analytics (always enabled, but can be configured to only track in production)
    analyticsMiddleware,
    screenViewMiddleware,
  ];
  
  // Development-only middleware
  if (__DEV__) {
    middleware.push(
      loggerMiddleware,
      performanceMiddleware(100), // Log actions taking > 100ms
      createActionHistoryMiddleware(50) // Keep last 50 actions
    );
  }
  
  return middleware;
};

// Export individual middleware for custom configurations
export {
  // Error middleware
  errorMiddleware,
  thunkErrorMiddleware,
  networkErrorMiddleware,
  
  // Logging middleware
  loggerMiddleware,
  createLoggerMiddleware,
  performanceMiddleware,
  createActionHistoryMiddleware,
  
  // Analytics middleware
  analyticsMiddleware,
  screenViewMiddleware,
  ANALYTICS_EVENTS,
  AnalyticsService,
  
  // Batching middleware
  batchActionsMiddleware,
};

export default getMiddleware;
