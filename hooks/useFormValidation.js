/**
 * Custom hook for form validation with Redux integration
 * Provides validation state management and inline error display
 */

import { useCallback, useEffect, useState, useRef } from 'react';
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
 * @param {Object} options - Configuration options
 * @returns {Object} Validation utilities
 */
export const useFormValidation = (formId, options = {}) => {
  const {
    validateOnChange = false,
    validateOnBlur = true,
    debounceMs = 300,
  } = options;

  const dispatch = useDispatch();
  const formErrors = useSelector(state => state.validation.forms[formId] || {});
  const [touchedFields, setTouchedFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceTimers = useRef({});

  /**
   * Mark a field as touched
   * @param {string} fieldName - Name of the field
   */
  const touchField = useCallback((fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  /**
   * Check if a field has been touched
   * @param {string} fieldName - Name of the field
   * @returns {boolean} Whether the field has been touched
   */
  const isFieldTouched = useCallback((fieldName) => {
    return !!touchedFields[fieldName];
  }, [touchedFields]);

  /**
   * Validate a single field
   * @param {string} fieldName - Name of the field to validate
   * @param {any} value - Value to validate
   * @param {Function} validator - Validator function
   * @param {boolean} immediate - Skip debounce if true
   */
  const validateField = useCallback((fieldName, value, validator, immediate = false) => {
    // Clear existing debounce timer
    if (debounceTimers.current[fieldName]) {
      clearTimeout(debounceTimers.current[fieldName]);
    }

    const performValidation = () => {
      const result = validator(value);
      
      if (!result.isValid) {
        dispatch(setValidationError(formId, fieldName, result.error));
        return false;
      } else {
        dispatch(clearValidationError(formId, fieldName));
        return true;
      }
    };

    if (immediate || debounceMs === 0) {
      return performValidation();
    } else {
      // Debounce validation
      debounceTimers.current[fieldName] = setTimeout(() => {
        performValidation();
      }, debounceMs);
      
      return true; // Return true for debounced validation
    }
  }, [dispatch, formId, debounceMs]);

  /**
   * Handle field change with optional validation
   * @param {string} fieldName - Name of the field
   * @param {any} value - New value
   * @param {Function} validator - Validator function
   * @param {Function} onChange - Original onChange handler
   */
  const handleFieldChange = useCallback((fieldName, value, validator, onChange) => {
    // Call original onChange handler
    if (onChange) {
      onChange(value);
    }

    // Validate on change if enabled and field has been touched
    if (validateOnChange && (isFieldTouched(fieldName) || isSubmitting)) {
      validateField(fieldName, value, validator);
    }
  }, [validateOnChange, validateField, isFieldTouched, isSubmitting]);

  /**
   * Handle field blur with validation
   * @param {string} fieldName - Name of the field
   * @param {any} value - Current value
   * @param {Function} validator - Validator function
   * @param {Function} onBlur - Original onBlur handler
   */
  const handleFieldBlur = useCallback((fieldName, value, validator, onBlur) => {
    // Mark field as touched
    touchField(fieldName);

    // Call original onBlur handler
    if (onBlur) {
      onBlur();
    }

    // Validate on blur if enabled
    if (validateOnBlur) {
      validateField(fieldName, value, validator, true);
    }
  }, [validateOnBlur, validateField, touchField]);

  /**
   * Validate entire form
   * @param {Object} fields - Object with field names as keys and values
   * @param {Object} validators - Object with field names as keys and validator functions
   * @returns {boolean} Whether the form is valid
   */
  const validateFormFields = useCallback((fields, validators) => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validators).forEach(fieldName => {
      allTouched[fieldName] = true;
    });
    setTouchedFields(allTouched);

    return dispatch(validateForm(formId, fields, validators));
  }, [dispatch, formId]);

  /**
   * Handle form submission with validation
   * @param {Object} fields - Form field values
   * @param {Object} validators - Field validators
   * @param {Function} onSubmit - Submit handler
   * @returns {Promise} Promise that resolves when submission is complete
   */
  const handleSubmit = useCallback(async (fields, validators, onSubmit) => {
    setIsSubmitting(true);
    
    const isValid = validateFormFields(fields, validators);
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(fields);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
    
    return isValid;
  }, [validateFormFields]);

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
    setTouchedFields({});
    setIsSubmitting(false);
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
   * Check if field should show error (touched or submitting)
   * @param {string} fieldName - Name of the field
   * @returns {boolean} Whether to show the error
   */
  const shouldShowError = useCallback((fieldName) => {
    return hasFieldError(fieldName) && (isFieldTouched(fieldName) || isSubmitting);
  }, [hasFieldError, isFieldTouched, isSubmitting]);

  /**
   * Check if form has any errors
   * @returns {boolean} Whether the form has any errors
   */
  const hasErrors = useCallback(() => {
    return Object.keys(formErrors).length > 0;
  }, [formErrors]);

  /**
   * Check if form is valid (no errors)
   * @returns {boolean} Whether the form is valid
   */
  const isFormValid = useCallback(() => {
    return Object.keys(formErrors).length === 0;
  }, [formErrors]);

  /**
   * Get all errors
   * @returns {Object} All form errors
   */
  const getAllErrors = useCallback(() => {
    return formErrors;
  }, [formErrors]);

  /**
   * Reset form validation state
   */
  const resetForm = useCallback(() => {
    clearErrors();
    setTouchedFields({});
    setIsSubmitting(false);
  }, [clearErrors]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      // Clear all debounce timers
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
      
      dispatch(clearFormValidationErrors(formId));
    };
  }, [dispatch, formId]);

  return {
    // Validation methods
    validateField,
    validateFormFields,
    
    // Field handlers
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    
    // Error management
    clearFieldError,
    clearErrors,
    getFieldError,
    hasFieldError,
    shouldShowError,
    hasErrors,
    isFormValid,
    getAllErrors,
    
    // Field state
    touchField,
    isFieldTouched,
    touchedFields,
    
    // Form state
    isSubmitting,
    formErrors,
    resetForm,
  };
};

export default useFormValidation;
