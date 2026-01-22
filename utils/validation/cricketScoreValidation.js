export const CricketScoreValidationRules = {
  // Common fields for all score types
  match_public_id: {
    required: true,
    message: 'Match ID is required',
  },
  batsman_team_public_id: {
    required: true,
    message: 'Batting team is required',
  },
  batsman_public_id: {
    required: true,
    message: 'Batsman is required',
  },
  bowler_public_id: {
    required: true,
    message: 'Bowler is required',
  },
  runs_scored: {
    required: true,
    custom: (value, formData) => {
      const runs = Number(value);

      // Check if it's a valid number
      if (isNaN(runs)) {
        return 'Runs must be a valid number';
      }

      // For regular scores, runs should be 0-6
      if (!formData.scoreType || formData.scoreType === 'regular') {
        if (runs < 0 || runs > 6) {
          return 'Regular runs must be between 0 and 6';
        }
      }

      // For wide and no ball, runs can be higher (including extra)
      if (formData.scoreType === 'wide' || formData.scoreType === 'no_ball') {
        if (runs < 0) {
          return 'Runs cannot be negative';
        }
      }

      return null;
    },
    message: 'Runs scored is required',
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

  // Wicket-specific fields
  wicket_type: {
    required: (formData) => formData.scoreType === 'wicket',
    custom: (value, formData) => {
      if (formData.scoreType === 'wicket') {
        const validTypes = ['Bowled', 'Catch', 'Run Out', 'Stamp', 'LBW', 'Hit Wicket'];
        if (!validTypes.includes(value)) {
          return 'Invalid wicket type';
        }
      }
      return null;
    },
    message: 'Wicket type is required',
  },
  fielder_public_id: {
    required: (formData) => {
      // Required for specific wicket types
      return formData.scoreType === 'wicket' &&
             (formData.wicket_type === 'Run Out' ||
              formData.wicket_type === 'Catch' ||
              formData.wicket_type === 'Stamp');
    },
    message: 'Fielder is required for this wicket type',
  },
  bowling_team_public_id: {
    required: (formData) => formData.scoreType === 'wicket',
    message: 'Bowling team is required for wicket',
  },
  bowl_type: {
    required: false, // Optional - only for no_ball wickets
    custom: (value, formData) => {
      if (value && formData.scoreType === 'wicket') {
        const validBowlTypes = ['no_ball', 'wide'];
        if (!validBowlTypes.includes(value)) {
          return 'Invalid bowl type';
        }
      }
      return null;
    },
  },
};

export const validateCricketScoreField = (fieldName, value, allValues = {}) => {
  const rules = CricketScoreValidationRules[fieldName];

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

export const validateCricketScoreForm = (formData) => {
  const errors = {};

  // Determine score type from addCurrentScoreEvent
  let scoreType = 'regular';
  if (formData.addCurrentScoreEvent && formData.addCurrentScoreEvent.length > 0) {
    scoreType = formData.addCurrentScoreEvent[0]; // 'wicket', 'wide', 'no_ball'
  }

  // Add scoreType to formData for validation
  const dataWithType = { ...formData, scoreType };

  // Common fields to always validate
  const commonFields = [
    'match_public_id',
    'batsman_team_public_id',
    'batsman_public_id',
    'bowler_public_id',
    'runs_scored',
    'inning_number',
  ];

  // Validate common fields
  commonFields.forEach(field => {
    const error = validateCricketScoreField(field, dataWithType[field], dataWithType);
    if (error) {
      errors[field] = error;
    }
  });

  // Additional validation based on score type
  if (scoreType === 'wicket') {
    // Validate wicket-specific fields
    const wicketFields = ['wicket_type', 'bowling_team_public_id'];

    wicketFields.forEach(field => {
      const error = validateCricketScoreField(field, dataWithType[field], dataWithType);
      if (error) {
        errors[field] = error;
      }
    });

    // Validate fielder if required for wicket type
    if (dataWithType.wicket_type === 'Run Out' ||
        dataWithType.wicket_type === 'Catch' ||
        dataWithType.wicket_type === 'Stamp') {
      const fielderError = validateCricketScoreField('fielder_public_id', dataWithType.fielder_public_id, dataWithType);
      if (fielderError) {
        errors.fielder_public_id = fielderError;
      }
    }

    // Validate bowl_type if present (for no_ball wickets)
    if (dataWithType.bowl_type) {
      const bowlTypeError = validateCricketScoreField('bowl_type', dataWithType.bowl_type, dataWithType);
      if (bowlTypeError) {
        errors.bowl_type = bowlTypeError;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegularScore = (formData) => {
  return validateCricketScoreForm({ ...formData, scoreType: 'regular' });
};

export const validateWideScore = (formData) => {
  return validateCricketScoreForm({ ...formData, scoreType: 'wide' });
};

export const validateNoBallScore = (formData) => {
  return validateCricketScoreForm({ ...formData, scoreType: 'no_ball' });
};

export const validateWicketScore = (formData) => {
  return validateCricketScoreForm({ ...formData, scoreType: 'wicket' });
};