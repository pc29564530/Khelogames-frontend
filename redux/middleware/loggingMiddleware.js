/**
 * Logging Middleware
 * Logs Redux actions and state changes for development
 */

/**
 * Creates a logger middleware with configurable options
 * @param {Object} options - Configuration options
 * @param {boolean} options.collapsed - Whether to collapse log groups
 * @param {boolean} options.diff - Whether to show state diff
 * @param {Array} options.actionFilter - Array of action types to filter out
 * @returns {Function} Middleware function
 */
export const createLoggerMiddleware = (options = {}) => {
  const {
    collapsed = true,
    diff = false,
    actionFilter = [],
  } = options;

  return (store) => (next) => (action) => {
    // Skip logging for filtered actions
    if (actionFilter.includes(action.type)) {
      return next(action);
    }

    // Only log in development
    if (__DEV__) {
      const prevState = store.getState();
      const startTime = performance.now();
      
      // Create log group
      const logGroup = collapsed ? console.groupCollapsed : console.group;
      logGroup(
        `%c action %c${action.type} %c@ ${new Date().toLocaleTimeString()}`,
        'color: gray; font-weight: lighter;',
        'color: inherit; font-weight: bold;',
        'color: gray; font-weight: lighter;'
      );
      
      // Log action
      console.log('%c prev state', 'color: #9E9E9E; font-weight: bold;', prevState);
      console.log('%c action', 'color: #03A9F4; font-weight: bold;', action);
      
      // Execute action
      const result = next(action);
      
      // Log next state
      const nextState = store.getState();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log('%c next state', 'color: #4CAF50; font-weight: bold;', nextState);
      
      // Log state diff if enabled
      if (diff) {
        const stateDiff = getStateDiff(prevState, nextState);
        if (Object.keys(stateDiff).length > 0) {
          console.log('%c diff', 'color: #FF9800; font-weight: bold;', stateDiff);
        }
      }
      
      console.log(
        `%c duration %c${duration.toFixed(2)}ms`,
        'color: gray; font-weight: lighter;',
        'color: inherit; font-weight: bold;'
      );
      
      console.groupEnd();
      
      return result;
    }
    
    return next(action);
  };
};

/**
 * Simple state diff calculator
 * @param {Object} prevState - Previous state
 * @param {Object} nextState - Next state
 * @returns {Object} Object containing changed keys
 */
const getStateDiff = (prevState, nextState) => {
  const diff = {};
  
  // Check for changed keys
  Object.keys(nextState).forEach((key) => {
    if (prevState[key] !== nextState[key]) {
      diff[key] = {
        prev: prevState[key],
        next: nextState[key],
      };
    }
  });
  
  return diff;
};

/**
 * Performance monitoring middleware
 * Logs slow actions that take longer than threshold
 */
export const performanceMiddleware = (thresholdMs = 100) => {
  return (store) => (next) => (action) => {
    const startTime = performance.now();
    const result = next(action);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > thresholdMs) {
      console.warn(
        `⚠️ Slow action detected: ${action.type} took ${duration.toFixed(2)}ms`
      );
    }
    
    return result;
  };
};

/**
 * Action history middleware
 * Keeps track of recent actions for debugging
 */
export const createActionHistoryMiddleware = (maxHistory = 50) => {
  const actionHistory = [];
  
  return (store) => (next) => (action) => {
    // Add to history
    actionHistory.push({
      type: action.type,
      payload: action.payload,
      timestamp: Date.now(),
    });
    
    // Trim history if needed
    if (actionHistory.length > maxHistory) {
      actionHistory.shift();
    }
    
    // Expose history on window for debugging
    if (__DEV__ && typeof window !== 'undefined') {
      window.__REDUX_ACTION_HISTORY__ = actionHistory;
    }
    
    return next(action);
  };
};

// Default logger middleware for development
export const loggerMiddleware = createLoggerMiddleware({
  collapsed: true,
  diff: false,
  actionFilter: [
    // Filter out noisy actions
    'persist/PERSIST',
    'persist/REHYDRATE',
  ],
});

export default loggerMiddleware;
