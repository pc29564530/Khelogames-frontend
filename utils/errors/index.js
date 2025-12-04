/**
 * Error classes for the application
 * Provides a hierarchy of custom errors for better error handling
 */

export { default as AppError } from './AppError';
export { 
  default as NetworkError,
  TimeoutError,
  ConnectionError,
  ServerError,
} from './NetworkError';
export { 
  default as ValidationError,
  FormValidationError,
  DataValidationError,
} from './ValidationError';
export { 
  default as AuthenticationError,
  TokenExpiredError,
  UnauthorizedError,
  InvalidCredentialsError,
} from './AuthenticationError';

/**
 * Error factory function to create appropriate error instances
 * @param {Error|Object} error - Original error or error object
 * @returns {AppError} Appropriate error instance
 */
export function createError(error) {
  // If already an AppError, return as is
  if (error instanceof AppError) {
    return error;
  }

  // Handle Axios errors
  if (error.isAxiosError) {
    const { response, request, message } = error;
    
    if (!response && !request) {
      // Network error (no response received)
      return new ConnectionError(message, { originalError: error });
    }
    
    if (!response) {
      // Request timeout
      return new TimeoutError(message, { originalError: error });
    }
    
    const { status, data } = response;
    
    // Authentication errors
    if (status === 401) {
      return new TokenExpiredError(data?.message || 'Unauthorized', { 
        originalError: error,
        response: data,
      });
    }
    
    if (status === 403) {
      return new UnauthorizedError(data?.message || 'Forbidden', { 
        originalError: error,
        response: data,
      });
    }
    
    // Validation errors
    if (status === 400 || status === 422) {
      return new ValidationError(
        data?.message || 'Validation failed',
        data?.errors || {},
        { originalError: error, response: data }
      );
    }
    
    // Server errors
    if (status >= 500) {
      return new ServerError(
        data?.message || 'Server error',
        status,
        { originalError: error, response: data }
      );
    }
    
    // Other network errors
    return new NetworkError(
      data?.message || message,
      'NETWORK_ERROR',
      status,
      { originalError: error, response: data }
    );
  }

  // Generic error
  return new AppError(
    error.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500,
    { originalError: error }
  );
}
