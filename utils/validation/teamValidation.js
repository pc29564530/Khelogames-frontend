// utils/validation/teamValidation.js

export const TeamValidationRules = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Team name must be between 3 and 100 characters',
  },
  city: {
    required: true,
    minLength: 2,
    message: 'City is required',
  },
  state: {
    required: true,
    minLength: 2,
    message: 'State is required',
  },
  country: {
    required: true,
    minLength: 3,
    message: 'Country is required',
  },
  gender: {
    required: true,
    message: 'Gender is not selected',
  },
  stage: {
    required: true,
    message: 'Please select a stage',
  },
  type: {
    required: true,
    message: 'Type is required',
  },
};

export const validateTeamField = (fieldName, value, allValues = {}) => {
  const rules = TeamValidationRules[fieldName];
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
  // Number validations
  if (rules.min !== undefined) {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(numValue) || numValue < rules.min) {
      return rules.message || `Must be at least ${rules.min}`;
    }
  }

  return null;
};

export const validateTeamForm = (formData) => {
  const errors = {};
  const fieldsToValidate = [
    'name',
    'city',
    'state',
    'country',
    'type',
    'gender',
  ];


  fieldsToValidate.forEach(field => {
    const error = validateTeamField(field, formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};