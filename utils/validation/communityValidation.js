// utils/validation/communityValidation.js

export const CommunityValidationRules = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 50,
    requiredMessage: 'Community name is required',
    lengthMessage: 'Community name must be between 3 and 50 characters',
  },
  description: {
    required: false,
    minLength: 3,
    maxLength: 100,
    lengthMessage: 'Description must be between 3 and 100 characters',
  }
};

export const validateCommunityField = (fieldName, value, allValues = {}) => {
  const rules = CommunityValidationRules[fieldName];
  console.log("Rules: ", rules)
  if (!rules) return null;

  // Check if field is conditionally required
  if (typeof rules.required === 'function') {
    if (rules.required(allValues.stage) && (!value || value.trim() === '')) {
      return rules.requiredMessage || `${fieldName} is required`;
    }
  } else if (rules.required && (!value || value.trim() === '')) {
    return rules.requiredMessage || `${fieldName} is required`;
  }

  // Skip other validations if field is empty and not required
  if (!value || value.trim() === '') return null;

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.trim().length < rules.minLength) {
      return rules.lengthMessage || `Must be at least ${rules.minLength} characters`;
    }
    if (rules.maxLength && value.trim().length > rules.maxLength) {
      return rules.lengthMessage || `Must be less than ${rules.maxLength} characters`;
    }
  }

  return null;
};

export const validateCommunityForm = (formData) => {
  console.log("Line no 48: ", formData)
  const errors = {};
  const fieldsToValidate = ['name', 'description'];

  fieldsToValidate.forEach(field => {
    console.log("Line no 54: ", field)
    const error = validateCommunityField(field, formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};