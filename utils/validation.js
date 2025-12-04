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
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validateScore = (score, options = {}) => {
  const { sport = 'general', max } = options;
  
  const result = validateNumber(score, { min: 0, integer: true, max });
  
  if (!result.isValid) {
    return { isValid: false, error: 'Please enter a valid score (0 or greater)' };
  }

  // Sport-specific validation
  if (sport === 'cricket') {
    // Cricket scores typically don't exceed 1000 in most formats
    if (score > 1000) {
      return { isValid: false, error: 'Cricket score seems unusually high' };
    }
  } else if (sport === 'football') {
    // Football scores rarely exceed 20
    if (score > 50) {
      return { isValid: false, error: 'Football score seems unusually high' };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Cricket wickets validation
 * @param {any} wickets - Number of wickets to validate
 * @returns {ValidationResult}
 */
export const validateWickets = (wickets) => {
  const result = validateNumber(wickets, { min: 0, max: 10, integer: true });
  
  if (!result.isValid) {
    return { isValid: false, error: 'Wickets must be between 0 and 10' };
  }

  return { isValid: true, error: null };
};

/**
 * Cricket overs validation
 * @param {any} overs - Number of overs to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validateOvers = (overs, options = {}) => {
  const { maxOvers = 50 } = options;
  
  if (!overs && overs !== 0) {
    return { isValid: false, error: 'Overs is required' };
  }

  const oversNum = Number(overs);
  
  if (isNaN(oversNum)) {
    return { isValid: false, error: 'Please enter a valid number of overs' };
  }

  if (oversNum < 0) {
    return { isValid: false, error: 'Overs cannot be negative' };
  }

  if (oversNum > maxOvers) {
    return { isValid: false, error: `Overs cannot exceed ${maxOvers}` };
  }

  // Validate decimal format (e.g., 19.4 is valid, 19.7 is not)
  const decimalPart = (oversNum % 1).toFixed(1);
  if (decimalPart > 0.5) {
    return { isValid: false, error: 'Invalid over format (balls must be 0-5)' };
  }

  return { isValid: true, error: null };
};

/**
 * Match date validation
 * @param {string|Date} date - Match date to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validateMatchDate = (date, options = {}) => {
  const { allowPast = true, allowFuture = true, maxFutureDays = 365 } = options;
  
  if (!date) {
    return { isValid: false, error: 'Match date is required' };
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const matchDate = new Date(dateObj);
  matchDate.setHours(0, 0, 0, 0);

  if (!allowPast && matchDate < now) {
    return { isValid: false, error: 'Match date cannot be in the past' };
  }

  if (!allowFuture && matchDate > now) {
    return { isValid: false, error: 'Match date cannot be in the future' };
  }

  if (maxFutureDays && matchDate > now) {
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + maxFutureDays);
    
    if (matchDate > maxDate) {
      return { isValid: false, error: `Match date cannot be more than ${maxFutureDays} days in the future` };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Tournament date range validation
 * @param {string|Date} startDate - Tournament start date
 * @param {string|Date} endDate - Tournament end date
 * @returns {ValidationResult}
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate) {
    return { isValid: false, error: 'Start date is required' };
  }

  if (!endDate) {
    return { isValid: false, error: 'End date is required' };
  }

  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  if (isNaN(start.getTime())) {
    return { isValid: false, error: 'Please enter a valid start date' };
  }

  if (isNaN(end.getTime())) {
    return { isValid: false, error: 'Please enter a valid end date' };
  }

  if (end < start) {
    return { isValid: false, error: 'End date must be after start date' };
  }

  // Check if date range is reasonable (not more than 1 year)
  const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    return { isValid: false, error: 'Tournament duration cannot exceed 1 year' };
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
 * Player name validation
 * @param {string} name - Player name to validate
 * @returns {ValidationResult}
 */
export const validatePlayerName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Player name is required' };
  }

  if (name.length < 2) {
    return { isValid: false, error: 'Player name must be at least 2 characters' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Player name must be less than 100 characters' };
  }

  // Allow letters, spaces, hyphens, apostrophes, and periods
  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Player name can only contain letters, spaces, hyphens, apostrophes, and periods' };
  }

  return { isValid: true, error: null };
};

/**
 * Tournament name validation
 * @param {string} name - Tournament name to validate
 * @returns {ValidationResult}
 */
export const validateTournamentName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Tournament name is required' };
  }

  if (name.length < 3) {
    return { isValid: false, error: 'Tournament name must be at least 3 characters' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Tournament name must be less than 100 characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Description validation
 * @param {string} description - Description to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validateDescription = (description, options = {}) => {
  const { required = false, minLength = 10, maxLength = 1000 } = options;

  if (required && (!description || description.trim() === '')) {
    return { isValid: false, error: 'Description is required' };
  }

  if (!description || description.trim() === '') {
    return { isValid: true, error: null };
  }

  if (description.length < minLength) {
    return { isValid: false, error: `Description must be at least ${minLength} characters` };
  }

  if (description.length > maxLength) {
    return { isValid: false, error: `Description must be less than ${maxLength} characters` };
  }

  return { isValid: true, error: null };
};

/**
 * File upload validation
 * @param {Object} file - File object to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
    allowedExtensions = ['.jpg', '.jpeg', '.png'],
  } = options;

  if (!file) {
    return { isValid: false, error: 'Please select a file' };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const fileName = file.name || '';
    const hasValidExtension = allowedExtensions.some(ext => 
      fileName.toLowerCase().endsWith(ext.toLowerCase())
    );
    
    if (!hasValidExtension) {
      return { isValid: false, error: `File extension must be one of: ${allowedExtensions.join(', ')}` };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Image file validation
 * @param {Object} file - Image file to validate
 * @returns {ValidationResult}
 */
export const validateImage = (file) => {
  return validateFile(file, {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  });
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
  
  // Convert to string if not already
  const str = String(text);
  
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
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
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*'[^']*'/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  // Remove style tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  return sanitized;
};

/**
 * Sanitize numeric input
 * @param {any} value - Value to sanitize
 * @param {Object} options - Sanitization options
 * @returns {number|null} Sanitized number or null if invalid
 */
export const sanitizeNumber = (value, options = {}) => {
  const { allowNegative = true, allowDecimal = true, defaultValue = null } = options;
  
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  // Convert to string and remove non-numeric characters except . and -
  let sanitized = String(value).replace(/[^\d.-]/g, '');
  
  // Remove negative sign if not allowed
  if (!allowNegative) {
    sanitized = sanitized.replace(/-/g, '');
  }
  
  // Remove decimal point if not allowed
  if (!allowDecimal) {
    sanitized = sanitized.replace(/\./g, '');
  }
  
  // Parse to number
  const num = allowDecimal ? parseFloat(sanitized) : parseInt(sanitized, 10);
  
  // Return null if not a valid number
  if (isNaN(num)) {
    return defaultValue;
  }
  
  return num;
};

/**
 * Sanitize integer input
 * @param {any} value - Value to sanitize
 * @param {Object} options - Sanitization options
 * @returns {number|null} Sanitized integer or null if invalid
 */
export const sanitizeInteger = (value, options = {}) => {
  const num = sanitizeNumber(value, { ...options, allowDecimal: true });
  if (num === null) return null;
  return Math.floor(num);
};

/**
 * Sanitize email input
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (!email) return '';
  
  // Convert to lowercase and trim
  let sanitized = String(email).toLowerCase().trim();
  
  // Remove any characters that are not valid in email addresses
  sanitized = sanitized.replace(/[^a-z0-9@._+-]/g, '');
  
  return sanitized;
};

/**
 * Sanitize username input
 * @param {string} username - Username to sanitize
 * @returns {string} Sanitized username
 */
export const sanitizeUsername = (username) => {
  if (!username) return '';
  
  // Trim and remove invalid characters
  let sanitized = String(username).trim();
  
  // Only allow alphanumeric, underscore, and hyphen
  sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, '');
  
  return sanitized;
};

/**
 * Sanitize phone number input
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone number
 */
export const sanitizePhone = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters except + at the start
  let sanitized = String(phone).trim();
  
  // Keep + only if it's at the start
  const hasPlus = sanitized.startsWith('+');
  sanitized = sanitized.replace(/\D/g, '');
  
  if (hasPlus) {
    sanitized = '+' + sanitized;
  }
  
  return sanitized;
};

/**
 * Sanitize URL input
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
export const sanitizeUrl = (url) => {
  if (!url) return '';
  
  let sanitized = String(url).trim();
  
  // Remove javascript: and data: protocols
  if (sanitized.toLowerCase().startsWith('javascript:') || 
      sanitized.toLowerCase().startsWith('data:')) {
    return '';
  }
  
  // Ensure URL has a protocol
  if (!sanitized.match(/^https?:\/\//i)) {
    sanitized = 'https://' + sanitized;
  }
  
  return sanitized;
};

/**
 * Sanitize file name
 * @param {string} fileName - File name to sanitize
 * @returns {string} Sanitized file name
 */
export const sanitizeFileName = (fileName) => {
  if (!fileName) return '';
  
  let sanitized = String(fileName).trim();
  
  // Remove path separators and other dangerous characters
  sanitized = sanitized.replace(/[\/\\:*?"<>|]/g, '');
  
  // Remove leading dots to prevent hidden files
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    const name = sanitized.substring(0, 255 - ext.length);
    sanitized = name + ext;
  }
  
  return sanitized;
};

/**
 * Sanitize search query
 * @param {string} query - Search query to sanitize
 * @returns {string} Sanitized query
 */
export const sanitizeSearchQuery = (query) => {
  if (!query) return '';
  
  let sanitized = String(query).trim();
  
  // Remove special characters that could be used for injection
  sanitized = sanitized.replace(/[<>'"]/g, '');
  
  // Limit length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }
  
  return sanitized;
};

/**
 * Sanitize object by applying sanitizers to each field
 * @param {Object} obj - Object to sanitize
 * @param {Object} sanitizers - Object with field names as keys and sanitizer functions as values
 * @returns {Object} Sanitized object
 */
export const sanitizeObject = (obj, sanitizers) => {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const sanitized = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const sanitizer = sanitizers[key];
    
    if (sanitizer && typeof sanitizer === 'function') {
      sanitized[key] = sanitizer(value);
    } else if (typeof value === 'string') {
      // Default to text sanitization for strings
      sanitized[key] = sanitizeText(value);
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};

/**
 * Validate and sanitize form data
 * @param {Object} formData - Form data to validate and sanitize
 * @param {Object} validators - Validators for each field
 * @param {Object} sanitizers - Optional custom sanitizers for each field
 * @returns {Object} Object with isValid, errors, and sanitizedData
 */
export const validateAndSanitizeForm = (formData, validators, sanitizers = {}) => {
  // First sanitize the data
  const sanitizedData = sanitizeObject(formData, sanitizers);
  
  // Then validate the sanitized data
  const validation = validateFields(sanitizedData, validators);

  return {
    isValid: validation.isValid,
    errors: validation.errors,
    sanitizedData,
  };
};
