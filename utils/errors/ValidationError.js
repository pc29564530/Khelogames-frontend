import AppError from './AppError';

/**
 * Validation error class
 * Handles form validation and data validation errors
 */
class ValidationError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {Object} errors - Field-specific validation errors
   * @param {Object} metadata - Additional context
   */
  constructor(message = 'Validation failed', errors = {}, metadata = {}) {
    super(message, 'VALIDATION_ERROR', 400, { ...metadata, errors });
    this.errors = errors;
  }

  getUserMessage() {
    if (Object.keys(this.errors).length === 0) {
      return this.message;
    }

    // Return first error message if available
    const firstField = Object.keys(this.errors)[0];
    const firstError = this.errors[firstField];
    
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0];
    }
    
    return typeof firstError === 'string' ? firstError : this.message;
  }

  /**
   * Gets errors for a specific field
   * @param {string} fieldName - Name of the field
   * @returns {Array<string>} Array of error messages for the field
   */
  getFieldErrors(fieldName) {
    const fieldErrors = this.errors[fieldName];
    if (!fieldErrors) return [];
    return Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
  }

  /**
   * Checks if a specific field has errors
   * @param {string} fieldName - Name of the field
   * @returns {boolean} Whether the field has errors
   */
  hasFieldError(fieldName) {
    return !!this.errors[fieldName];
  }

  /**
   * Gets all field names with errors
   * @returns {Array<string>} Array of field names
   */
  getErrorFields() {
    return Object.keys(this.errors);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

/**
 * Form validation error
 */
export class FormValidationError extends ValidationError {
  constructor(message = 'Form validation failed', errors = {}, metadata = {}) {
    super(message, errors, { ...metadata, type: 'form' });
    this.code = 'FORM_VALIDATION_ERROR';
  }
}

/**
 * Data validation error
 */
export class DataValidationError extends ValidationError {
  constructor(message = 'Data validation failed', errors = {}, metadata = {}) {
    super(message, errors, { ...metadata, type: 'data' });
    this.code = 'DATA_VALIDATION_ERROR';
  }
}

export default ValidationError;
