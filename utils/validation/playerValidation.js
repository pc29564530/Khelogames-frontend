// utils/validation/playerValidation.js

export const PlayerValidationRules = {
    position: {
        required: true,
        minLength: 2,
        maxLength: 20,
        message: 'Player Position required',
    },
    game_id: {
        required: true,
        message: 'Game is required',
    },
    country: {
        required: true,
        minLength: 3,
        maxLength: 50,
        message: 'Country is required'
    },
};

export const validatePlayerField = (fieldName, value, allValues = {}) => {
    const rules = PlayerValidationRules[fieldName];
    if (!rules) return null;

    //Check if field is conditionally required
    if (typeof rules.required === 'function') {
        if(rules.required(allValues.stage) && (!value || value === '')) {
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
}

export const validatePlayerForm = (formData) => {
    const errors = {};
    const fieldsToValidate = [
        'position',
        'game_id',
        'country',
    ];

    if (formData?.position === null || formData?.game_id === null || formData?.country === null ) {
        
    }

    fieldsToValidate.forEach(field => {
        const error = validatePlayerField(field, formData[field], formData);
        if (error) {
            errors[field] = error;
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}


