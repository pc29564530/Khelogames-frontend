// utils/validation/matchValidation.js

export const MatchValidationRules = {
  firstEntity: {
    required: true,
    message: 'Please select the first team/player',
  },
  secondEntity: {
    required: true,
    custom: (value, formData) => {
      if (value && formData.firstEntity && value.public_id === formData.firstEntity.public_id) {
        return 'Both teams cannot be the same';
      }
      return null;
    },
    message: 'Please select the second team/player',
  },
  startOn: {
    required: true,
    message: 'Please select match start time',
  },
  matchType: {
    required: true,
    message: 'Please select match type',
  },
  stage: {
    required: true,
    message: 'Please select stage',
  },
  matchFormat: (formData) => {
    // Only required for Team cricket matches
    if (formData.matchType === 'Team' && formData.game === 'cricket') {
      return {
        required: true,
        message: 'Please select match format for cricket',
      };
    }
    return null;
  },
  knockoutLevel: (formData) => {
    // Only required for Knockout stage
    if (formData.stage === 'Knockout') {
      return {
        required: true,
        message: 'Please select knockout level',
      };
    }
    return null;
  },
  location: {
    required: false, // Optional field
    custom: (value, formData) => {
      // If location is being used, validate coordinates
      if (formData.latitude && !formData.longitude) {
        return 'Location is incomplete';
      }
      if (!formData.latitude && formData.longitude) {
        return 'Location is incomplete';
      }
      return null;
    },
  },
  status_code: {
    required: true,
    message: 'Please select correct match status'
  },
  sub_status: {
    required: true,
    message: 'Please select sub_status'
  }
};

export const validateMatchField = (fieldName, value, allValues = {}) => {
  const rules = MatchValidationRules[fieldName];
  
  if (!rules) return null;

  // Handle function-based conditional rules
  if (typeof rules === 'function') {
    const dynamicRules = rules(allValues);
    if (!dynamicRules) return null; // Field not required in this context
    
    if (dynamicRules.required && !value) {
      return dynamicRules.message;
    }
  } else {
    // Handle standard rules
    if (rules.required && !value) {
      return rules.message;
    }

    // Custom validation
    if (rules.custom && value) {
      const customError = rules.custom(value, allValues);
      if (customError) return customError;
    }
  }

  return null;
};

export const validateMatchForm = (formData) => {
  const errors = {};
  
  // Always validate these fields
  const fieldsToValidate = [
    'firstEntity',
    'secondEntity',
    'startOn',
    'matchType',
    'stage',
    'location',
  ];

  // Add conditional fields
  if (formData.matchType === 'Team' && formData.game === 'cricket') {
    fieldsToValidate.push('matchFormat');
  }
  
  if (formData.stage === 'Knockout') {
    fieldsToValidate.push('knockoutLevel');
  }

  fieldsToValidate.forEach(field => {
    const error = validateMatchField(field, formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateMatchStatus = (formData) => {
  const errors = {};
  
  // Always validate these fields
  const fieldsToValidate = [
    'status',
  ];

  fieldsToValidate.forEach(field => {
    const error = validateMatchField(field, formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateMatchSubStatus = (formData) => {
  const errors = {};
  
  // Always validate these fields
  const fieldsToValidate = [
    'sub_status'
  ];

  fieldsToValidate.forEach(field => {
    const error = validateMatchField(field, formData[field], formData);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};