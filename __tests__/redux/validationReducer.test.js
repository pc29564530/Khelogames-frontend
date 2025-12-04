/**
 * Validation Reducer Tests
 * Tests form validation error display through Redux
 * Requirements: 5.1
 */

import validationReducer from '../../redux/reducers/validationReducers';
import {
  setValidationError,
  clearValidationError,
  clearFormValidationErrors,
  clearAllValidationErrors,
} from '../../redux/actions/actions';

describe('Validation Reducer', () => {
  const initialState = {
    forms: {},
  };

  describe('Set Validation Error', () => {
    it('should set error for a field in a form', () => {
      const action = setValidationError('login-form', 'email', 'Invalid email');
      const newState = validationReducer(initialState, action);

      expect(newState.forms['login-form']).toBeDefined();
      expect(newState.forms['login-form'].email).toBe('Invalid email');
    });

    it('should set multiple errors for different fields', () => {
      let state = initialState;
      
      state = validationReducer(state, setValidationError('login-form', 'email', 'Invalid email'));
      state = validationReducer(state, setValidationError('login-form', 'password', 'Password too short'));

      expect(state.forms['login-form'].email).toBe('Invalid email');
      expect(state.forms['login-form'].password).toBe('Password too short');
    });

    it('should update existing error for a field', () => {
      let state = validationReducer(initialState, setValidationError('login-form', 'email', 'Invalid email'));
      state = validationReducer(state, setValidationError('login-form', 'email', 'Email is required'));

      expect(state.forms['login-form'].email).toBe('Email is required');
    });

    it('should handle errors for multiple forms', () => {
      let state = initialState;
      
      state = validationReducer(state, setValidationError('login-form', 'email', 'Invalid email'));
      state = validationReducer(state, setValidationError('signup-form', 'username', 'Username taken'));

      expect(state.forms['login-form'].email).toBe('Invalid email');
      expect(state.forms['signup-form'].username).toBe('Username taken');
    });
  });

  describe('Clear Validation Error', () => {
    it('should clear error for a specific field', () => {
      let state = validationReducer(initialState, setValidationError('login-form', 'email', 'Invalid email'));
      state = validationReducer(state, clearValidationError('login-form', 'email'));

      expect(state.forms['login-form'].email).toBeUndefined();
    });

    it('should keep other field errors when clearing one', () => {
      let state = initialState;
      state = validationReducer(state, setValidationError('login-form', 'email', 'Invalid email'));
      state = validationReducer(state, setValidationError('login-form', 'password', 'Password too short'));
      state = validationReducer(state, clearValidationError('login-form', 'email'));

      expect(state.forms['login-form'].email).toBeUndefined();
      expect(state.forms['login-form'].password).toBe('Password too short');
    });
  });

  describe('Clear Form Validation Errors', () => {
    it('should clear all errors for a specific form', () => {
      let state = initialState;
      state = validationReducer(state, setValidationError('login-form', 'email', 'Invalid email'));
      state = validationReducer(state, setValidationError('login-form', 'password', 'Password too short'));
      state = validationReducer(state, clearFormValidationErrors('login-form'));

      expect(state.forms['login-form']).toBeUndefined();
    });

    it('should keep errors for other forms', () => {
      let state = initialState;
      state = validationReducer(state, setValidationError('login-form', 'email', 'Invalid email'));
      state = validationReducer(state, setValidationError('signup-form', 'username', 'Username taken'));
      state = validationReducer(state, clearFormValidationErrors('login-form'));

      expect(state.forms['login-form']).toBeUndefined();
      expect(state.forms['signup-form'].username).toBe('Username taken');
    });
  });

  describe('Clear All Validation Errors', () => {
    it('should clear all errors for all forms', () => {
      let state = initialState;
      state = validationReducer(state, setValidationError('login-form', 'email', 'Invalid email'));
      state = validationReducer(state, setValidationError('signup-form', 'username', 'Username taken'));
      state = validationReducer(state, clearAllValidationErrors());

      expect(state).toEqual(initialState);
    });
  });

  describe('Validation Scenarios', () => {
    it('should handle email validation errors', () => {
      const state = validationReducer(initialState, 
        setValidationError('contact-form', 'email', 'Please enter a valid email address')
      );

      expect(state.forms['contact-form'].email).toBe('Please enter a valid email address');
    });

    it('should handle password validation errors', () => {
      const state = validationReducer(initialState, 
        setValidationError('signup-form', 'password', 'Password must be at least 8 characters')
      );

      expect(state.forms['signup-form'].password).toBe('Password must be at least 8 characters');
    });

    it('should handle required field errors', () => {
      const state = validationReducer(initialState, 
        setValidationError('profile-form', 'name', 'This field is required')
      );

      expect(state.forms['profile-form'].name).toBe('This field is required');
    });

    it('should handle numeric validation errors', () => {
      const state = validationReducer(initialState, 
        setValidationError('score-form', 'runs', 'Must be a positive number')
      );

      expect(state.forms['score-form'].runs).toBe('Must be a positive number');
    });

    it('should handle custom validation errors', () => {
      const state = validationReducer(initialState, 
        setValidationError('match-form', 'date', 'Match date must be in the future')
      );

      expect(state.forms['match-form'].date).toBe('Match date must be in the future');
    });
  });

  describe('Edge Cases', () => {
    it('should handle clearing non-existent field error', () => {
      const state = validationReducer(initialState, clearValidationError('login-form', 'email'));

      // Should not create the form if it doesn't exist
      expect(state.forms['login-form']).toBeDefined();
    });

    it('should handle clearing non-existent form errors', () => {
      const state = validationReducer(initialState, clearFormValidationErrors('non-existent-form'));

      expect(state.forms['non-existent-form']).toBeUndefined();
    });

    it('should maintain immutability', () => {
      const state1 = validationReducer(initialState, setValidationError('form1', 'field1', 'Error 1'));
      const state2 = validationReducer(state1, setValidationError('form1', 'field2', 'Error 2'));

      // Original state should not be mutated
      expect(state1.forms.form1.field2).toBeUndefined();
      expect(state2.forms.form1.field1).toBe('Error 1');
      expect(state2.forms.form1.field2).toBe('Error 2');
    });
  });
});
