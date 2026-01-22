// utils/validation/commentValidation.js

export const CommentValidationRules = {
  comment_text: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Comment must be between 3 and 100 characters',
  },
};

export const CommentValidationFields = (fieldName, value, allValues = {}) => {
  const rules = CommentValidationRules[fieldName];
  if (!rules) return null;

  // Check if field is conditionally required
  if (typeof rules.required === 'function') {
    if (rules.required(allValues.stage) && (!value || value === '')) {
      return `${fieldName} is required` || rules.message;
    }
  } else if (rules.required && (!value || value === '')) {
    return `${fieldName} is required` || rules.message;
  }

  // Skip other validations if field is empty and not required
  if (!value || value === '') return null;

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

export const validateCommentForm = (formData) => {
  const errors = {};
  const fieldsToValidate = ['comment_text'];

  fieldsToValidate.forEach(field => {
    const error = CommentValidationFields(field, formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};