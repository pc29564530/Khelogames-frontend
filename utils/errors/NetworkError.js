import AppError from './AppError';

/**
 * Network-related error class
 * Handles connection issues, timeouts, and server errors
 */
class NetworkError extends AppError {
  constructor(message, code = 'NETWORK_ERROR', statusCode = 503, metadata = {}) {
    super(message, code, statusCode, metadata);
  }

  getUserMessage() {
    const messages = {
      NETWORK_TIMEOUT: 'The request took too long. Please check your connection and try again.',
      NETWORK_CONNECTION_FAILED: 'Unable to connect to the server. Please check your internet connection.',
      NETWORK_SERVER_ERROR: 'The server encountered an error. Please try again later.',
      NETWORK_NOT_FOUND: 'The requested resource was not found.',
      NETWORK_UNAUTHORIZED: 'You are not authorized to access this resource.',
      NETWORK_FORBIDDEN: 'Access to this resource is forbidden.',
      NETWORK_ERROR: 'A network error occurred. Please try again.',
    };

    return messages[this.code] || this.message;
  }

  isRetryable() {
    // Retry on timeout, connection failures, and 5xx server errors
    const retryableCodes = [
      'NETWORK_TIMEOUT',
      'NETWORK_CONNECTION_FAILED',
      'NETWORK_SERVER_ERROR',
    ];
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    
    return retryableCodes.includes(this.code) || 
           retryableStatusCodes.includes(this.statusCode);
  }
}

/**
 * Timeout-specific network error
 */
export class TimeoutError extends NetworkError {
  constructor(message = 'Request timeout', metadata = {}) {
    super(message, 'NETWORK_TIMEOUT', 408, metadata);
  }
}

/**
 * Connection failure error
 */
export class ConnectionError extends NetworkError {
  constructor(message = 'Connection failed', metadata = {}) {
    super(message, 'NETWORK_CONNECTION_FAILED', 503, metadata);
  }
}

/**
 * Server error (5xx responses)
 */
export class ServerError extends NetworkError {
  constructor(message = 'Server error', statusCode = 500, metadata = {}) {
    super(message, 'NETWORK_SERVER_ERROR', statusCode, metadata);
  }
}

export default NetworkError;
