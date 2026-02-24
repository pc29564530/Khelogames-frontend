// utils/validation/authValidation.js

export const AuthValidationRules = {
  full_name: {
    required: true,
    minLength: 2,
    message: 'Full name must be at least 2 characters',
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: 'Min 8 chars with uppercase, lowercase and number',
  },
  confirm_password: {
    required: true,
    message: 'Please confirm your password',
  },
};

export const validateAuthField = (fieldName, value, formData = {}) => {
  const rules = AuthValidationRules[fieldName];
  if (!rules) return null;

  const trimmedValue = typeof value === 'string' ? value.trim() : value;

  // Required check
  if (rules.required && (!trimmedValue || trimmedValue === '')) {
    return rules.message || `${fieldName} is required`;
  }

  if (!trimmedValue) return null;

  // Pattern check
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return rules.message;
  }

  // Min length check
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return rules.message;
  }

  // Confirm password match
  if (fieldName === 'confirm_password') {
    if (trimmedValue !== formData.password) {
      return 'Passwords do not match';
    }
  }

  return null;
};

export const validateAuthForm = (formData, fields) => {
  const errors = {};
  const fieldsToValidate = fields || Object.keys(formData);

  fieldsToValidate.forEach(field => {
    if (field in AuthValidationRules) {
      const error = validateAuthField(field, formData[field], formData);
      if (error) errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
