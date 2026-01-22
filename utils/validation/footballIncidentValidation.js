

export const FootballIncidentValidationRules = {
  // Common fields for all score types
  match_public_id: {
    required: true,
    message: 'Match ID is required',
  },
  team_public_id: {
    required: true,
    message: 'Team is required',
  },
  player_public_id: {
    required: true,
    message: 'Player is required',
  },
  player_in_public_id: {
    required: true,
    message: 'PlayerIn is required',
  },
  player_out_public_id: {
    required: true,
    message: 'PlayerOut is required',
  },
  periods: {
    required: true,
    message: 'Periods is required',
  },
  incident_type: {
    required: true,
    message: 'IncidentType is required',
  },
  incident_time: {
    required: true,
    message: 'Incident Time is required',
  },
  description: {
    required: false,
    minLength: 4,
    maxLength: 20,
    message: 'Description must be between 4 and 20',
  },
  penalty_shootout_scored: {
    required: true,
    message: 'Penalty shootout scored is required'
  },
};

export const validateFootballIncidentField = (fieldName, value, allValues = {}) => {
  const rules = FootballIncidentValidationRules[fieldName];

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

export const validateFootballIncidentForm = (formData) => {
    const errors = {};


    const commanParams = [
        'match_public_id',
        'team_public_id',
        'periods',
        'incident_type',
        'incident_time',
        'description',
    ]

    commanParams.forEach((field) => {
        const error = validateFootballIncidentField(field)
        if (error) {
            errors[field] = error;
        }
    } );

    if (formData['event_type'] === 'substitution') {
        const playerInError = validateFootballIncidentField(formData['player_in_public_id'])
        if(playerInError) {
            errors['player_in_public_id'] = playerInError;
        } 
        const playerOutError = validateFootballIncidentField(formData['player_out_public_id'])
        if(playerOutError) {
            errors['player_out_public_id'] = playerOutError;
        }
    }

    if (formData['event_type'] === 'normal') {
        const error = validateFootballIncidentField(formData['player_public_id'])
        if (error) {
            errors['player_public_id'] = error;
        }
    }

    if (formData['event_type'] === 'penalty_shootout') {
        const playerError = validateFootballIncidentField(formData['player_public_id'])
        if (playerError) {
            errors['player_public_id'] = playerError;
        }

    }


    return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
}

