/**
 * Validation utility functions for form inputs
 * Provides common validation patterns and error message generation
 */

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the value is valid
 * @property {string|null} error - Error message if invalid
 */

/**
 * Email validation
 * @param {string} email - Email address to validate
 * @returns {ValidationResult}
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, error: null };
};

/**
 * Phone number validation
 * @param {string} phone - Phone number to validate
 * @returns {ValidationResult}
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }

  return { isValid: true, error: null };
};

/**
 * Username validation
 * @param {string} username - Username to validate
 * @returns {ValidationResult}
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === '') {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 30) {
    return { isValid: false, error: 'Username must be less than 30 characters' };
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }

  return { isValid: true, error: null };
};

/**
 * Password validation
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = false,
  } = options;

  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (requireNumber && !/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true, error: null };
};

/**
 * Confirm password validation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {ValidationResult}
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true, error: null };
};

/**
 * Required field validation
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {ValidationResult}
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true, error: null };
};

/**
 * Numeric validation
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validateNumber = (value, options = {}) => {
  const { min, max, integer = false } = options;

  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: 'Please enter a number' };
  }

  const num = Number(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (integer && !Number.isInteger(num)) {
    return { isValid: false, error: 'Please enter a whole number' };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `Number must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `Number must be at most ${max}` };
  }

  return { isValid: true, error: null };
};

/**
 * Date validation
 * @param {string|Date} date - Date to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validateDate = (date, options = {}) => {
  const { minDate, maxDate, futureOnly = false, pastOnly = false } = options;

  if (!date) {
    return { isValid: false, error: 'Date is required' };
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  const now = new Date();
  
  if (futureOnly && dateObj <= now) {
    return { isValid: false, error: 'Date must be in the future' };
  }

  if (pastOnly && dateObj >= now) {
    return { isValid: false, error: 'Date must be in the past' };
  }

  if (minDate && dateObj < new Date(minDate)) {
    return { isValid: false, error: `Date must be after ${new Date(minDate).toLocaleDateString()}` };
  }

  if (maxDate && dateObj > new Date(maxDate)) {
    return { isValid: false, error: `Date must be before ${new Date(maxDate).toLocaleDateString()}` };
  }

  return { isValid: true, error: null };
};

/**
 * URL validation
 * @param {string} url - URL to validate
 * @returns {ValidationResult}
 */
export const validateUrl = (url) => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Match score validation (for cricket/football)
 * @param {any} score - Score to validate
 * @returns {ValidationResult}
 */
export const validateScore = (score) => {
  const result = validateNumber(score, { min: 0, integer: true });
  
  if (!result.isValid) {
    return { isValid: false, error: 'Please enter a valid score (0 or greater)' };
  }

  return { isValid: true, error: null };
};

/**
 * Team name validation
 * @param {string} teamName - Team name to validate
 * @returns {ValidationResult}
 */
export const validateTeamName = (teamName) => {
  if (!teamName || teamName.trim() === '') {
    return { isValid: false, error: 'Team name is required' };
  }

  if (teamName.length < 2) {
    return { isValid: false, error: 'Team name must be at least 2 characters' };
  }

  if (teamName.length > 50) {
    return { isValid: false, error: 'Team name must be less than 50 characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate multiple fields
 * @param {Object} fields - Object with field names as keys and values to validate
 * @param {Object} validators - Object with field names as keys and validator functions as values
 * @returns {Object} Object with field names as keys and validation results as values
 */
export const validateFields = (fields, validators) => {
  const errors = {};
  let isValid = true;

  Object.keys(validators).forEach(fieldName => {
    const validator = validators[fieldName];
    const value = fields[fieldName];
    const result = validator(value);

    if (!result.isValid) {
      errors[fieldName] = result.error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Sanitize text input to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize HTML to allow only safe tags
 * @param {string} html - HTML to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
};

/**
 * Validate and sanitize form data
 * @param {Object} formData - Form data to validate and sanitize
 * @param {Object} validators - Validators for each field
 * @returns {Object} Object with isValid, errors, and sanitizedData
 */
export const validateAndSanitizeForm = (formData, validators) => {
  const validation = validateFields(formData, validators);
  
  const sanitizedData = {};
  Object.keys(formData).forEach(key => {
    const value = formData[key];
    if (typeof value === 'string') {
      sanitizedData[key] = sanitizeText(value);
    } else {
      sanitizedData[key] = value;
    }
  });

  return {
    isValid: validation.isValid,
    errors: validation.errors,
    sanitizedData,
  };
};
