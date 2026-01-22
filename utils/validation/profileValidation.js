// utils/validation/profileValidation.js

export const ProfileValidationRules = {
  full_name: {
    required: true,
    minLength: 3,
    maxLength: 50,
    message: 'Full name must be between 3 and 50 characters',
  },
  bio: {
    required: false,
    maxLength: 100,
    message: 'Bio must be less than 100 characters',
  },
  city: {
    required: false,
    minLength: 2,
    message: 'City name is too short',
  },
  state: {
    required: false,
    minLength: 2,
    message: 'State name is too short',
  },
  country: {
    required: false,
    minLength: 2,
    message: 'Country name is too short',
  },
};

export const validateProfileField = (fieldName, value) => {
  const rules = ProfileValidationRules[fieldName];
  if (!rules) return null;

  if (rules.required && (!value || !value.trim())) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
  }

  if (!value || !value.trim()) return null;

  if (rules.minLength && value.trim().length < rules.minLength) {
    return rules.message || `Must be at least ${rules.minLength} characters`;
  }

  if (rules.maxLength && value.trim().length > rules.maxLength) {
    return rules.message || `Must be less than ${rules.maxLength} characters`;
  }

  return null;
};

export const validateProfileForm = (formData) => {
  const errors = {};
  const fieldsToValidate = ['full_name', 'bio', 'city', 'state', 'country'];

  fieldsToValidate.forEach(field => {
    const error = validateProfileField(field, formData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};