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

// SignUp Validation

export const SignUpValidationRules = {
  fullName: {
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
  confirmPassword: {
    required: true,
    message: 'Please confirm your password',
  },
};

export const validateSignUpForm = (formData) => {
  const errors = {};

  // fullName
  const fullName = formData.fullName?.trim() || '';
  if (!fullName) {
    errors.fullName = 'Full name is required';
  } else if (fullName.length < SignUpValidationRules.fullName.minLength) {
    errors.fullName = SignUpValidationRules.fullName.message;
  }

  // email
  if (!formData.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!SignUpValidationRules.email.pattern.test(formData.email.trim())) {
    errors.email = SignUpValidationRules.email.message;
  }

  // password
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!SignUpValidationRules.password.pattern.test(formData.password)) {
    errors.password = SignUpValidationRules.password.message;
  }

  // confirmPassword
  if (!formData.confirmPassword) {
    errors.confirmPassword = SignUpValidationRules.confirmPassword.message;
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
