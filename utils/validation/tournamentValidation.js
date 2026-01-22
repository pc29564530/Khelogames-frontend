// utils/validation/tournamentValidation.js

export const TournamentValidationRules = {
  tournamentName: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Tournament name must be between 3 and 100 characters',
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
  startOn: {
    required: true,
    message: 'Start date is required',
  },
  stage: {
    required: true,
    message: 'Please select a stage',
  },
  groupCount: {
    required: (stage) => stage === 'Group' || stage === 'League',
    min: 2,
    message: 'Group count must be at least 2',
  },
  maxTeamGroup: {
    required: (stage) => stage === 'Group' || stage === 'League',
    min: 2,
    message: 'Teams per group must be at least 2',
  },
};

export const validateTournamentField = (fieldName, value, allValues = {}) => {
  const rules = TournamentValidationRules[fieldName];
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

export const validateTournamentForm = (formData) => {
  const errors = {};
  const fieldsToValidate = [
    'tournamentName',
    'city',
    'state',
    'country',
    'startOn',
    'stage',
  ];

  // Add conditional fields based on stage
  if (formData.stage === 'Group' || formData.stage === 'League') {
    fieldsToValidate.push('groupCount', 'maxTeamGroup');
  }

  fieldsToValidate.forEach(field => {
    const error = validateTournamentField(field, formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateTournamentParticipantForm = (formData) => {
  const errors = {};

  // Validate tournament_public_id
  if (!formData.tournament_public_id || formData.tournament_public_id.trim() === '') {
    errors.tournament_public_id = 'Tournament ID is required';
  }

  // Validate entity_public_id
  if (!formData.entity_public_id || formData.entity_public_id.trim() === '') {
    errors.entity_public_id = 'Participant is required';
  }

  // Validate entity_type
  if (!formData.entity_type || formData.entity_type.trim() === '') {
    errors.entity_type = 'Participant type is required';
  } else if (!['team', 'player'].includes(formData.entity_type)) {
    errors.entity_type = 'Participant type must be either team or player';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};