import AppError from './AppError';

/**
 * Authentication error class
 * Handles authentication and authorization errors
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', code = 'AUTH_ERROR', statusCode = 401, metadata = {}) {
    super(message, code, statusCode, metadata);
  }

  getUserMessage() {
    const messages = {
      AUTH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
      AUTH_TOKEN_INVALID: 'Invalid authentication token. Please log in again.',
      AUTH_UNAUTHORIZED: 'You are not authorized to perform this action.',
      AUTH_CREDENTIALS_INVALID: 'Invalid username or password.',
      AUTH_ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
      AUTH_ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',
      AUTH_ERROR: 'Authentication failed. Please try again.',
    };

    return messages[this.code] || this.message;
  }

  /**
   * Checks if error requires re-authentication
   * @returns {boolean} Whether user needs to log in again
   */
  requiresReauth() {
    const reauthCodes = [
      'AUTH_TOKEN_EXPIRED',
      'AUTH_TOKEN_INVALID',
      'AUTH_CREDENTIALS_INVALID',
    ];
    return reauthCodes.includes(this.code);
  }
}

/**
 * Token expired error
 */
export class TokenExpiredError extends AuthenticationError {
  constructor(message = 'Token expired', metadata = {}) {
    super(message, 'AUTH_TOKEN_EXPIRED', 401, metadata);
  }
}

/**
 * Unauthorized access error
 */
export class UnauthorizedError extends AuthenticationError {
  constructor(message = 'Unauthorized access', metadata = {}) {
    super(message, 'AUTH_UNAUTHORIZED', 403, metadata);
  }
}

/**
 * Invalid credentials error
 */
export class InvalidCredentialsError extends AuthenticationError {
  constructor(message = 'Invalid credentials', metadata = {}) {
    super(message, 'AUTH_CREDENTIALS_INVALID', 401, metadata);
  }
}

export default AuthenticationError;
