/**
 * Validation Reducer
 * Manages form validation errors across the application
 */

import {
  SET_VALIDATION_ERROR,
  CLEAR_VALIDATION_ERROR,
  CLEAR_FORM_VALIDATION_ERRORS,
  CLEAR_ALL_VALIDATION_ERRORS,
} from '../types/actionTypes';

const initialState = {
  // Structure: { formId: { fieldName: errorMessage } }
  forms: {},
};

const validationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_VALIDATION_ERROR:
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.payload.formId]: {
            ...state.forms[action.payload.formId],
            [action.payload.fieldName]: action.payload.error,
          },
        },
      };

    case CLEAR_VALIDATION_ERROR:
      const { [action.payload.fieldName]: removed, ...remainingFields } = 
        state.forms[action.payload.formId] || {};
      
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.payload.formId]: remainingFields,
        },
      };

    case CLEAR_FORM_VALIDATION_ERRORS:
      const { [action.payload.formId]: removedForm, ...remainingForms } = state.forms;
      
      return {
        ...state,
        forms: remainingForms,
      };

    case CLEAR_ALL_VALIDATION_ERRORS:
      return initialState;

    default:
      return state;
  }
};

export default validationReducer;
