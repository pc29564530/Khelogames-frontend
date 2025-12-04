/**
 * Custom hook for form validation with Redux integration
 * Provides validation state management and inline error display
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setValidationError,
  clearValidationError,
  clearFormValidationErrors,
  validateForm,
} from '../redux/actions/actions';

/**
 * Hook for managing form validation
 * @param {string} formId - Unique identifier for the form
 * @returns {Object} Validation utilities
 */
export const useFormValidation = (formId) => {
  const dispatch = useDispatch();
  const formErrors = useSelector(state => state.validation.forms[formId] || {});

  /**
   * Validate a single field
   * @param {string} fieldName - Name of the field to validate
   * @param {any} value - Value to validate
   * @param {Function} validator - Validator function
   */
  const validateField = useCallback((fieldName, value, validator) => {
    const result = validator(value);
    
    if (!result.isValid) {
      dispatch(setValidationError(formId, fieldName, result.error));
      return false;
    } else {
      dispatch(clearValidationError(formId, fieldName));
      return true;
    }
  }, [dispatch, formId]);

  /**
   * Validate entire form
   * @param {Object} fields - Object with field names as keys and values
   * @param {Object} validators - Object with field names as keys and validator functions
   * @returns {boolean} Whether the form is valid
   */
  const validateFormFields = useCallback((fields, validators) => {
    return dispatch(validateForm(formId, fields, validators));
  }, [dispatch, formId]);

  /**
   * Clear error for a specific field
   * @param {string} fieldName - Name of the field to clear error
   */
  const clearFieldError = useCallback((fieldName) => {
    dispatch(clearValidationError(formId, fieldName));
  }, [dispatch, formId]);

  /**
   * Clear all errors for the form
   */
  const clearErrors = useCallback(() => {
    dispatch(clearFormValidationErrors(formId));
  }, [dispatch, formId]);

  /**
   * Get error for a specific field
   * @param {string} fieldName - Name of the field
   * @returns {string|undefined} Error message if exists
   */
  const getFieldError = useCallback((fieldName) => {
    return formErrors[fieldName];
  }, [formErrors]);

  /**
   * Check if a field has an error
   * @param {string} fieldName - Name of the field
   * @returns {boolean} Whether the field has an error
   */
  const hasFieldError = useCallback((fieldName) => {
    return !!formErrors[fieldName];
  }, [formErrors]);

  /**
   * Check if form has any errors
   * @returns {boolean} Whether the form has any errors
   */
  const hasErrors = useCallback(() => {
    return Object.keys(formErrors).length > 0;
  }, [formErrors]);

  /**
   * Get all errors
   * @returns {Object} All form errors
   */
  const getAllErrors = useCallback(() => {
    return formErrors;
  }, [formErrors]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearFormValidationErrors(formId));
    };
  }, [dispatch, formId]);

  return {
    validateField,
    validateFormFields,
    clearFieldError,
    clearErrors,
    getFieldError,
    hasFieldError,
    hasErrors,
    getAllErrors,
    formErrors,
  };
};

export default useFormValidation;
