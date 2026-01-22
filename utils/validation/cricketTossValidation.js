export const CricketTossValidationRules = {
  // Common fields for all toss types
  match_public_id: {
    required: true,
    message: 'Match Public ID is required',
  },
  toss_decision: {
    required: true,
    message: 'Toss decision is required',
  },
  toss_win: {
    required: true,
    message: 'Toss win team is required',
  },
};

export const validateCricketTossField = (fieldName, value, allValues = {}) => {
  const rules = CricketTossValidationRules[fieldName];

  if (!rules) return null;

  // Handle function-based conditional requirements
  if (typeof rules.required === 'function') {
    const isRequired = rules.required(allValues);
    if (isRequired && (!value || value === '')) {
      return rules.message;
    }
    if (!isRequired) {
      return null; // Field not required in this context
    }
  } else if (rules.required && (!value || value === '')) {
    return rules.message;
  }

  // Skip other validations if field is empty and not required
  if (!value || value === '') return null;

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value, allValues);
    if (customError) return customError;
  }

  return null;
};


export const validateCricketTossForm = (formData) => {
  const errors = {};

  // Common fields to always validate
  const commonFields = [
    'match_public_id',
    'toss_decision',
    'toss_win',
  ];

  // Validate common fields
  commonFields.forEach(field => {
    const error = validateCricketTossField(field, formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(error).length === 0,
    errors,
  };
};
