/**
 * Validation Selectors
 * Memoized selectors for form validation state
 */

import { createSelector } from 'reselect';

// Base selectors
const selectValidationState = (state) => state.validation;

// Memoized selectors
export const selectAllValidationErrors = createSelector(
  [selectValidationState],
  (validation) => validation.forms
);

export const selectFormErrors = createSelector(
  [selectAllValidationErrors, (_, formId) => formId],
  (forms, formId) => forms[formId] || {}
);

export const selectFieldError = createSelector(
  [selectFormErrors, (_, __, fieldName) => fieldName],
  (formErrors, fieldName) => formErrors[fieldName] || null
);

// Derived selectors
export const selectHasFormErrors = createSelector(
  [selectFormErrors],
  (formErrors) => Object.keys(formErrors).length > 0
);

export const selectFormErrorCount = createSelector(
  [selectFormErrors],
  (formErrors) => Object.keys(formErrors).length
);

export const selectIsFormValid = createSelector(
  [selectFormErrors],
  (formErrors) => Object.keys(formErrors).length === 0
);

export const selectFormErrorMessages = createSelector(
  [selectFormErrors],
  (formErrors) => Object.values(formErrors).filter(Boolean)
);

export const selectHasFieldError = createSelector(
  [selectFieldError],
  (error) => error !== null && error !== undefined && error !== ''
);
