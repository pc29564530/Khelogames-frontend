// utils/validation/threadValidation.js

export const ThreadValidationRules = {
  title: {
    required: false,
    minLength: 3,
    maxLength: 50,
    message: 'Title must be between 3 and 50 characters',
  },
  content: {
    required: false,
    minLength: 10,
    maxLength: 500,
    message: 'Content must be between 10 and 500 characters',
  },
  media_file: {
    required: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'],
    message: 'Please upload a valid image or video file (max 10MB)',
  },
};

export const validateThreadField = (fieldName, value, allValues = {}) => {
  const rules = ThreadValidationRules[fieldName];
  if (!rules) return null;

  // Check if field is conditionally required
  if (typeof rules.required === 'function') {
    if (rules.required(allValues.stage) && (!value || value === '')) {
      return rules.message || `${fieldName} is required`;
    }
  } else if (rules.required && (!value || value === '')) {
    return rules.message || `${fieldName} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!value || value === '') return null;

  // File validations
  if (fieldName === 'media_file' && value instanceof File) {
    if (rules.maxSize && value.size > rules.maxSize) {
      return `File size must be less than ${rules.maxSize / (1024 * 1024)}MB`;
    }
    if (rules.allowedTypes && !rules.allowedTypes.includes(value.type)) {
      return 'Invalid file type. Please upload an image or video.';
    }
    return null;
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.trim().length < rules.minLength) {
      return rules.message || `Must be at least ${rules.minLength} characters`;
    }
    if (rules.maxLength && value.trim().length > rules.maxLength) {
      return rules.message || `Must be less than ${rules.maxLength} characters`;
    }
  }

  return null;
};

export const validateThreadForm = (formData) => {
  const errors = {};
  const fieldsToValidate = ['title', 'content'];

  // Check if at least one field has content
  const hasTitle = formData.title && formData.title.trim().length > 0;
  const hasContent = formData.content && formData.content.trim().length > 0;
  const hasMedia = formData.mediaURL && formData.mediaURL.trim().length > 0;

  if (!hasTitle && !hasContent && !hasMedia) {
    return {
      isValid: false,
      errors: { 'global': 'Please provide at least title, content, or media'}
    };
  }

  fieldsToValidate.forEach(field => {
    const error = validateThreadField(field, formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};