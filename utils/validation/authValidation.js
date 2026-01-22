// utils/validation/authValidation.js

export const AuthValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 8,
    message: 'Password must be at least 8 characters',
  },
};

export const validateAuthField = (fieldName, value) => {
  const rules = AuthValidationRules[fieldName];
  if (!rules) return null;

  // Required check
  if (rules.required && (!value || value.trim() === '')) {
    return rules.message || `${fieldName} is required`;
  }

  // Skip further checks if empty
  if (!value) return null;

  // Pattern (email)
  if (rules.pattern && !rules.pattern.test(value.trim())) {
    return rules.message;
  }

  // Min length (password)
  if (rules.minLength && value.length < rules.minLength) {
    return rules.message;
  }

  return null;
};

export const validateAuthForm = (formData) => {
  const errors = {};

  Object.keys(AuthValidationRules).forEach(field => {
    const error = validateAuthField(field, formData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
