/**
 * Loading Reducer Tests
 * Tests loading state management for async operations
 * Requirements: 5.1
 */

import loadingReducers from '../../redux/reducers/loadingReducers';
import * as actionTypes from '../../redux/types/actionTypes';

describe('Loading Reducer', () => {
  const initialState = {
    global: false,
    matches: false,
    tournaments: false,
    teams: false,
    players: false,
    clubs: false,
    communities: false,
    threads: false,
    comments: false,
    profile: false,
    auth: false,
    operations: {},
  };

  it('should return initial state', () => {
    const state = loadingReducers(undefined, {});
    expect(state).toEqual(initialState);
  });

  describe('SET_LOADING', () => {
    it('should set loading for feature key', () => {
      const action = {
        type: actionTypes.SET_LOADING,
        payload: { key: 'matches', value: true },
      };
      const state = loadingReducers(initialState, action);

      expect(state.matches).toBe(true);
    });

    it('should set loading for custom operation', () => {
      const action = {
        type: actionTypes.SET_LOADING,
        payload: { key: 'fetchUserProfile', value: true },
      };
      const state = loadingReducers(initialState, action);

      expect(state.operations.fetchUserProfile).toBe(true);
    });

    it('should default value to true when not provided', () => {
      const action = {
        type: actionTypes.SET_LOADING,
        payload: { key: 'matches' },
      };
      const state = loadingReducers(initialState, action);

      expect(state.matches).toBe(true);
    });

    it('should set loading to false', () => {
      const currentState = {
        ...initialState,
        matches: true,
      };
      const action = {
        type: actionTypes.SET_LOADING,
        payload: { key: 'matches', value: false },
      };
      const state = loadingReducers(currentState, action);

      expect(state.matches).toBe(false);
    });

    it('should handle multiple operations', () => {
      let state = initialState;
      
      state = loadingReducers(state, {
        type: actionTypes.SET_LOADING,
        payload: { key: 'operation1', value: true },
      });
      
      state = loadingReducers(state, {
        type: actionTypes.SET_LOADING,
        payload: { key: 'operation2', value: true },
      });

      expect(state.operations.operation1).toBe(true);
      expect(state.operations.operation2).toBe(true);
    });
  });

  describe('CLEAR_LOADING', () => {
    it('should clear loading for feature key', () => {
      const currentState = {
        ...initialState,
        matches: true,
      };
      const action = {
        type: actionTypes.CLEAR_LOADING,
        payload: { key: 'matches' },
      };
      const state = loadingReducers(currentState, action);

      expect(state.matches).toBe(false);
    });

    it('should remove operation from operations object', () => {
      const currentState = {
        ...initialState,
        operations: {
          operation1: true,
          operation2: true,
        },
      };
      const action = {
        type: actionTypes.CLEAR_LOADING,
        payload: { key: 'operation1' },
      };
      const state = loadingReducers(currentState, action);

      expect(state.operations.operation1).toBeUndefined();
      expect(state.operations.operation2).toBe(true);
    });

    it('should handle clearing non-existent operation', () => {
      const action = {
        type: actionTypes.CLEAR_LOADING,
        payload: { key: 'nonExistent' },
      };
      const state = loadingReducers(initialState, action);

      expect(state.operations.nonExistent).toBeUndefined();
    });
  });

  describe('CLEAR_ALL_LOADING', () => {
    it('should reset to initial state', () => {
      const currentState = {
        ...initialState,
        matches: true,
        tournaments: true,
        operations: {
          operation1: true,
          operation2: true,
        },
      };
      const action = {
        type: actionTypes.CLEAR_ALL_LOADING,
      };
      const state = loadingReducers(currentState, action);

      expect(state).toEqual(initialState);
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const originalState = { ...initialState };
      const action = {
        type: actionTypes.SET_LOADING,
        payload: { key: 'matches', value: true },
      };
      
      loadingReducers(originalState, action);

      expect(originalState).toEqual(initialState);
    });

    it('should not mutate operations object', () => {
      const originalOperations = { operation1: true };
      const currentState = {
        ...initialState,
        operations: originalOperations,
      };
      const action = {
        type: actionTypes.SET_LOADING,
        payload: { key: 'operation2', value: true },
      };
      
      loadingReducers(currentState, action);

      expect(originalOperations).toEqual({ operation1: true });
    });
  });

  describe('Unknown Actions', () => {
    it('should return current state for unknown action', () => {
      const currentState = {
        ...initialState,
        matches: true,
      };
      const action = {
        type: 'UNKNOWN_ACTION',
        payload: {},
      };
      const state = loadingReducers(currentState, action);

      expect(state).toEqual(currentState);
    });
  });
});
