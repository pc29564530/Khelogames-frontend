// utils/validation/tournamentParticipantValidation.js

export const TournamentParticipantValidationRules = {
  tournament_public_id: {
    required: true,
    message: 'Tournament is required',
  },
  group_id: {
    required: false,
    message: 'group is required',
  },
  entity_public_id: {
    required: true,
    message: 'Entity is required',
  },
  entity_type: {
    required: true,
    message: 'Entity type is required',
  },
  seed_number: {
    required: false,
    message: 'Seed number is required',
  },
};

export const validateTournamentParticipantField = (fieldName, value, allValues = {}) => {
  const rules = TournamentValidationRules[fieldName];
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

export const validateTournamentParticipantForm = (formData) => {
  const errors = {};
  const fieldsToValidate = [
    'tournament_public_id',
    'group_id',
    'entity_public_id',
    'entity_type',
  ];

  fieldsToValidate.forEach(field => {
    const error = validateTournamentParticipantField(field, formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};