export const CricketInningValidationRules = {
  // Common fields for all score types
  match_public_id: {
    required: true,
    message: 'Match ID is required',
  },
  team_public_id: {
    required: true,
    message: 'Batting team is required',
  },
  inning_number: {
    required: true,
    custom: (value) => {
      const inning = Number(value);
      if (isNaN(inning) || inning < 1 || inning > 4) {
        return 'Inning number must be between 1 and 4';
      }
      return null;
    },
    message: 'Inning number is required',
  },
};

export const validateCricketInningField = (fieldName, value, allValues = {}) => {
  const rules = CricketInningValidationRules[fieldName];

  if (!rules) return null;

  // Handle function-based conditional requirements
  if (typeof rules.required === 'function') {
    const isRequired = rules.required(allValues);
    if (isRequired && (value === null || value === undefined || value === '')) {
      return rules.message;
    }
    if (!isRequired) {
      return null; // Field not required in this context
    }
  } else if (rules.required && (value === null || value === undefined || value === '')) {
    return rules.message;
  }

  // Skip other validations if field is empty and not required
  if (value === null || value === undefined || value === '') return null;

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value, allValues);
    if (customError) return customError;
  }

  return null;
};

export const validateCricketInningForm = (formData) => {
  const errors = {};

  // Add scoreType to formData for validation
  const dataWithType = { ...formData };

  // Common fields to always validate
  const commonFields = [
    'match_public_id',
    'team_public_id',
    'inning_number',
  ];

  // Validate common fields
  commonFields.forEach(field => {
    const error = validateCricketInningField(field, dataWithType[field], dataWithType);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};