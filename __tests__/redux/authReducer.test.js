/**
 * Auth Reducer Tests
 * Tests authentication state management
 * Requirements: 5.1
 */

import authReducers from '../../redux/reducers/authReducers';
import * as actionTypes from '../../redux/types/actionTypes';

describe('Auth Reducer', () => {
  const initialState = {
    isAuthenticated: null,
    isMobileNumberVerified: false,
    expireTime: '',
    loading: true,
  };

  it('should return initial state', () => {
    const state = authReducers(undefined, {});
    expect(state).toEqual(initialState);
  });

  describe('SET_AUTHENTICATED', () => {
    it('should set authenticated to true', () => {
      const action = {
        type: actionTypes.SET_AUTHENTICATED,
        payload: true,
      };
      const state = authReducers(initialState, action);

      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('should set authenticated to false', () => {
      const action = {
        type: actionTypes.SET_AUTHENTICATED,
        payload: false,
      };
      const state = authReducers(initialState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
    });

    it('should maintain other state properties', () => {
      const currentState = {
        ...initialState,
        isMobileNumberVerified: true,
      };
      const action = {
        type: actionTypes.SET_AUTHENTICATED,
        payload: true,
      };
      const state = authReducers(currentState, action);

      expect(state.isMobileNumberVerified).toBe(true);
    });
  });

  describe('SET_MOBILE_NUMBER_VERIFIED', () => {
    it('should set mobile number verified to true', () => {
      const action = {
        type: actionTypes.SET_MOBILE_NUMBER_VERIFIED,
        payload: true,
      };
      const state = authReducers(initialState, action);

      expect(state.isMobileNumberVerified).toBe(true);
    });

    it('should set mobile number verified to false', () => {
      const action = {
        type: actionTypes.SET_MOBILE_NUMBER_VERIFIED,
        payload: false,
      };
      const state = authReducers(initialState, action);

      expect(state.isMobileNumberVerified).toBe(false);
    });
  });

  describe('LOGOUT', () => {
    it('should reset authentication state', () => {
      const authenticatedState = {
        isAuthenticated: true,
        isMobileNumberVerified: true,
        expireTime: '2024-12-31',
        loading: false,
      };
      const action = {
        type: actionTypes.LOGOUT,
        payload: null,
      };
      const state = authReducers(authenticatedState, action);

      expect(state.isAuthenticated).toBeNull();
      expect(state.user).toBeNull();
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const originalState = { ...initialState };
      const action = {
        type: actionTypes.SET_AUTHENTICATED,
        payload: true,
      };
      
      authReducers(originalState, action);

      expect(originalState).toEqual(initialState);
    });
  });

  describe('Unknown Actions', () => {
    it('should return current state for unknown action', () => {
      const currentState = {
        ...initialState,
        isAuthenticated: true,
      };
      const action = {
        type: 'UNKNOWN_ACTION',
        payload: 'test',
      };
      const state = authReducers(currentState, action);

      expect(state).toEqual(currentState);
    });
  });
});
