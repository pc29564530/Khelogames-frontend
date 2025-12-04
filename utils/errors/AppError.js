/**
 * Base error class for all application errors
 * Provides error codes, messages, and serialization for logging
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {string} code - Error code for categorization
   * @param {number} statusCode - HTTP status code (if applicable)
   * @param {Object} metadata - Additional error context
   */
  constructor(message, code = 'APP_ERROR', statusCode = 500, metadata = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes error for logging and monitoring services
   * @returns {Object} Serialized error object
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Returns user-friendly error message
   * @returns {string} User-facing error message
   */
  getUserMessage() {
    return this.message;
  }

  /**
   * Checks if error is retryable
   * @returns {boolean} Whether the operation can be retried
   */
  isRetryable() {
    return false;
  }
}

export default AppError;
