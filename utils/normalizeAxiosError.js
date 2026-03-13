/**
 * Normalizes Axios error responses from the backend
 *
 * Backend error structure:
 * {
 *   success: false,
 *   error: {
 *     code: "INVALID_REQUEST" | "FORBIDDEN" | "INTERNAL_ERROR",
 *     message: "Error message",
 *     fields: { field1: "error", field2: "error" }  // Only for validation errors
 *   },
 *   request_id: "..."
 * }
 */
export const normalizeAxiosError = (error) => {
    // Network error - no response from server
    if (!error.response) {
        return {
            type: 'NETWORK',
            status: null,
            code: 'NETWORK_ERROR',
            message: 'No internet connection. Please try again.',
            raw: error,
        };
    }

    console.log("normalizeAxiosError - Response data:", error.response.data);
    const data = error.response.data;
    const status = error.response.status;

    // Client errors (400-499)
    if (status >= 400 && status < 500) {
        // Validation error (400) with field-level errors
        if (status === 400 && data?.error?.fields) {
            return {
                type: 'VALIDATION',
                status: status,
                code: data?.error?.code || 'INVALID_REQUEST',
                message: data.error.fields, // Return fields object
                generalMessage: data?.error?.message || 'Invalid input',
                raw: error,
            };
        }

        // Other client errors (401, 403, 404, etc.)
        return {
            type: 'API',
            status: status,
            code: data?.error?.code || 'API_ERROR',
            message: data?.error?.message || getDefaultErrorMessage(status),
            raw: error,
        };
    }

    // Server errors (500-599)
    if (status >= 500) {
        return {
            type: 'SERVER',
            status: status,
            code: data?.error?.code || 'SERVER_ERROR',
            message: data?.error?.message || 'A server error occurred. Please try again later.',
            raw: error,
        };
    }

    // Unknown error
    return {
        type: 'UNKNOWN',
        status: status,
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred.',
        raw: error,
    };
};

/**
 * Get default error message based on HTTP status code
 */
const getDefaultErrorMessage = (status) => {
    switch (status) {
        case 400:
            return 'Invalid request. Please check your input.';
        case 401:
            return 'Session expired. Please sign in again.';
        case 403:
            return 'Access denied. You don\'t have permission.';
        case 404:
            return 'Resource not found.';
        case 409:
            return 'This operation conflicts with existing data.';
        case 422:
            return 'Validation failed. Please check your input.';
        case 429:
            return 'Too many requests. Please slow down.';
        default:
            return 'Something went wrong. Please try again.';
    }
};