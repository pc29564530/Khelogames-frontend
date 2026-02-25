export const FootballLineUpValidationRules = {
  match_public_id: {
    required: true,
    message: 'Match is required',
  },
  team_public_id: {
    required: true,
    message: 'Team is required',
  },
  player: {
    required: true,
    custom: (value) => {
      if (!Array.isArray(value)) return 'Invalid player list';
      if (value.length < 11) return 'Minimum 11 players required';
      if (value.length > 18) return 'Maximum 18 players allowed';
      return null;
    },
  },
  substitute: {
    required: false,
    custom: (value, allValues) => {
      if (!Array.isArray(value)) return 'Invalid substitute list';
      if (value.length > 7) return 'Maximum 7 substitutes allowed';

      const selected = allValues.player || [];
      const invalid = value.filter(id => !selected.includes(id));

      if (invalid.length >= 0) {
        return 'Substitutes must be selected players';
      }
      return null;
    },
  },
};

export const validateFootballLineUpField = (field, value, allValues) => {
  const rules = FootballLineUpValidationRules[field];
  if (!rules) return null;

  if (rules.required && (!value || value.length === 0)) {
    return rules.message;
  }

  if (rules.custom) {
    return rules.custom(value, allValues);
  }

  return null;
};

export const validateFootballLineUp = (formData) => {
  const errors = {};

  Object.keys(FootballLineUpValidationRules).forEach((field) => {
    const error = validateFootballLineUpField(
      field,
      formData[field],
      formData
    );
    if (error) errors[field] = error;
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
