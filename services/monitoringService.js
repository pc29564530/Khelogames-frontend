/**
 * Monitoring Service
 * Centralized error logging and monitoring
 * Can be integrated with services like Sentry, Bugsnag, Firebase Crashlytics, etc.
 */

class MonitoringService {
  constructor() {
    this.isInitialized = false;
    this.errorQueue = [];
  }

  /**
   * Initialize monitoring service
   * @param {Object} config - Configuration for monitoring service
   */
  initialize(config = {}) {
    this.config = config;
    this.isInitialized = true;
    
    if (__DEV__) {
      console.log('📊 Monitoring Service initialized');
    }
  }

  /**
   * Log error to monitoring service
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  logError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      timestamp: new Date().toISOString(),
      ...context,
    };

    // Log to console in development
    if (__DEV__) {
      console.error('🔴 Error logged to monitoring service:', errorData);
    }

    // Queue error if service not initialized
    if (!this.isInitialized) {
      this.errorQueue.push(errorData);
      return;
    }

    // TODO: Send to actual monitoring service in production
    // Example integrations:
    // - Sentry.captureException(error, { extra: context });
    // - Bugsnag.notify(error, context);
    // - Firebase.crashlytics().recordError(error);
    
    this._sendToService(errorData);
  }

  /**
   * Log warning to monitoring service
   * @param {string} message - Warning message
   * @param {Object} context - Additional context
   */
  logWarning(message, context = {}) {
    const warningData = {
      level: 'warning',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };

    if (__DEV__) {
      console.warn('⚠️ Warning logged to monitoring service:', warningData);
    }

    if (this.isInitialized) {
      this._sendToService(warningData);
    }
  }

  /**
   * Log info to monitoring service
   * @param {string} message - Info message
   * @param {Object} context - Additional context
   */
  logInfo(message, context = {}) {
    const infoData = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };

    if (__DEV__) {
      console.log('ℹ️ Info logged to monitoring service:', infoData);
    }

    if (this.isInitialized) {
      this._sendToService(infoData);
    }
  }

  /**
   * Set user context for error tracking
   * @param {Object} user - User information
   */
  setUserContext(user) {
    this.userContext = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    // TODO: Set user context in monitoring service
    // Example: Sentry.setUser(this.userContext);
  }

  /**
   * Clear user context
   */
  clearUserContext() {
    this.userContext = null;
    
    // TODO: Clear user context in monitoring service
    // Example: Sentry.setUser(null);
  }

  /**
   * Add breadcrumb for debugging
   * @param {string} message - Breadcrumb message
   * @param {Object} data - Additional data
   */
  addBreadcrumb(message, data = {}) {
    const breadcrumb = {
      message,
      timestamp: new Date().toISOString(),
      ...data,
    };

    if (__DEV__) {
      console.log('🍞 Breadcrumb:', breadcrumb);
    }

    // TODO: Add breadcrumb to monitoring service
    // Example: Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Send data to monitoring service
   * @private
   */
  _sendToService(data) {
    // Placeholder for actual service integration
    // In production, this would send to your monitoring service
    
    if (__DEV__) {
      console.log('📤 Sending to monitoring service:', data);
    }
  }

  /**
   * Flush queued errors
   */
  flushQueue() {
    if (this.errorQueue.length > 0) {
      console.log(`📤 Flushing ${this.errorQueue.length} queued errors`);
      this.errorQueue.forEach(error => this._sendToService(error));
      this.errorQueue = [];
    }
  }
}

// Export singleton instance
const monitoringService = new MonitoringService();

export default monitoringService;
