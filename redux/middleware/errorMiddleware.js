/**
 * Error Handling Middleware
 * Catches and handles errors in Redux actions
 */

/**
 * Error middleware that catches errors in action creators and reducers
 * Logs errors and dispatches error actions for UI handling
 */
const errorMiddleware = (store) => (next) => (action) => {
  try {
    // Check if action is a promise (async action)
    if (action && typeof action.then === 'function') {
      return action.catch((error) => {
        console.error('Async action error:', error);
        
        // Dispatch error action for UI handling
        store.dispatch({
          type: 'ERROR/GLOBAL',
          payload: {
            message: error.message || 'An unexpected error occurred',
            type: 'async_action',
            timestamp: Date.now(),
            originalAction: action.type,
          },
        });
        
        // Re-throw to allow further error handling
        throw error;
      });
    }
    
    // Process synchronous action
    return next(action);
  } catch (error) {
    console.error('Redux middleware error:', error);
    console.error('Action:', action);
    
    // Dispatch error action
    store.dispatch({
      type: 'ERROR/GLOBAL',
      payload: {
        message: error.message || 'An unexpected error occurred',
        type: 'middleware',
        timestamp: Date.now(),
        originalAction: action.type,
        stack: error.stack,
      },
    });
    
    // Don't break the middleware chain
    return next(action);
  }
};

/**
 * Thunk error wrapper middleware
 * Wraps thunk actions with error handling
 */
export const thunkErrorMiddleware = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    try {
      return action(store.dispatch, store.getState);
    } catch (error) {
      console.error('Thunk error:', error);
      
      store.dispatch({
        type: 'ERROR/GLOBAL',
        payload: {
          message: error.message || 'An error occurred in async operation',
          type: 'thunk',
          timestamp: Date.now(),
        },
      });
      
      throw error;
    }
  }
  
  return next(action);
};

/**
 * Network error middleware
 * Specifically handles network-related errors
 */
export const networkErrorMiddleware = (store) => (next) => (action) => {
  // Check if action has error property (failed API call)
  if (action.error && action.payload) {
    const error = action.payload;
    
    // Check if it's a network error
    if (error.isAxiosError || error.code === 'NETWORK_ERROR') {
      console.error('Network error detected:', error);
      
      store.dispatch({
        type: 'ERROR/NETWORK',
        payload: {
          message: error.message || 'Network request failed',
          type: 'network',
          timestamp: Date.now(),
          statusCode: error.response?.status,
          endpoint: error.config?.url,
        },
      });
    }
  }
  
  return next(action);
};

export default errorMiddleware;
