import { normalizeAxiosError } from './normalizeAxiosError';

// Error severity levels
export const ErrorSeverity = {
  SILENT: 'silent',    // Log only, don't show user
  INFO: 'info',        // FYI, non-critical
  WARNING: 'warning',  // Degraded functionality
  ERROR: 'error',      // Operation failed, user should see it
  FATAL: 'fatal',      // App crash, requires restart
};


export const handleError = (normalizeError, options = {}) => {
    const {
        severity = ErrorSeverity.SILENT,
        userMessage,
        context = {},
        showToast = false,
        logToConsole = true,
    } = options;

    //Console logging (always in development)
    if (logToConsole && __DEV__) {
        console.error('Error:', normalizeError);
        if (Object.keys(context).length > 0) {
            console.error('Context:', context);
        }
    }

    // if (!__DEV__ && severity !== ErrorSeverity.SILENT) {
    //     Sentry.captureException(error, {
    //         level: severity,
    //         extra: { ...context, userMessage },
    //     });
    // }

    // Show toast for network/session errors
    if (showToast && userMessage) {
        const ToastManager = require('./ToastManager').default;
        ToastManager.show(userMessage, severity);
    }

    // Fatal errors only - use Alert
    if (severity === ErrorSeverity.FATAL) {
        const { Alert } = require('react-native');
        Alert.alert(
            'Critical Error',
            userMessage || 'The app encountered a critical error. Please restart.',
            [{ text: 'OK' }]
        );
    }
};

// Check if error is a network error
export const isNetworkError = (error) => {
    return !error.response ||
           error.message === 'Network Error' ||
           error.code === 'ECONNABORTED';
};

// For background/silent operations
// Just logs, doesn't show anything to user
export const logSilentError = (error, context = {}) => {
    handleError(error, {
        severity: ErrorSeverity.SILENT,
        context,
        showToast: false,
    });
};

// For user-initiated actions that fail
// Returns error message to show inline on screen

export const handleInlineError = (error, context = {}) => {
    const normalized = normalizeAxiosError(error);
    const message = normalized?.message || 'An error occurred. Please try again.';

    handleError(normalized, {
        severity: ErrorSeverity.ERROR,
        userMessage: message,
        context,
        showToast: false,
        logToConsole: false,
    });

    return message; // Return for component to display
};

// Fatal error
export const handleFatalError = (error, context = {}) => {
    const normalized = normalizeAxiosError(error);
    const message = normalized?.message || 'A critical error occurred. Please restart the app.';
    handleError(normalized, {
        severity: ErrorSeverity.FATAL,
        userMessage: message,
        context,
        showToast: false,
        logToConsole: true,
    });
}

// For network/session issues
// Shows non-blocking toast notification
export const handleToastError = (error, customMessage = null, context = {}) => {
    const normalized = normalizeAxiosError(error);
    const message = customMessage || normalized?.message || 'Something went wrong. Please try again.';

    handleError(normalized, {
        severity: isNetworkError(error) ? ErrorSeverity.WARNING : ErrorSeverity.ERROR,
        userMessage: message,
        context,
        showToast: true,
        logToConsole: true,
    });
};
