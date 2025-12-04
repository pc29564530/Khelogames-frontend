/**
 * Optimized Validation Reducer
 * Uses Immer for immutable state updates
 */

import { produce } from 'immer';
import {
  SET_VALIDATION_ERROR,
  CLEAR_VALIDATION_ERROR,
  CLEAR_FORM_VALIDATION_ERRORS,
  CLEAR_ALL_VALIDATION_ERRORS,
} from '../types/actionTypes';

const initialState = {
  forms: {},
};

const validationReducer = (state = initialState, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case SET_VALIDATION_ERROR: {
        const { formId, fieldName, error } = action.payload;
        
        // Initialize form object if it doesn't exist
        if (!draft.forms[formId]) {
          draft.forms[formId] = {};
        }
        
        // Set the error
        draft.forms[formId][fieldName] = error;
        break;
      }

      case CLEAR_VALIDATION_ERROR: {
        const { formId, fieldName } = action.payload;
        
        // Remove the field error if form exists
        if (draft.forms[formId]) {
          delete draft.forms[formId][fieldName];
          
          // Clean up empty form object
          if (Object.keys(draft.forms[formId]).length === 0) {
            delete draft.forms[formId];
          }
        }
        break;
      }

      case CLEAR_FORM_VALIDATION_ERRORS: {
        const { formId } = action.payload;
        delete draft.forms[formId];
        break;
      }

      case CLEAR_ALL_VALIDATION_ERRORS:
        draft.forms = {};
        break;

      default:
        // No changes needed, Immer will return original state
        break;
    }
  });
};

export default validationReducer;
