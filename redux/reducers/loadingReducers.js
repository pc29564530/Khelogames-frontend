/**
 * Loading state reducer
 * Manages loading states for async operations across the application
 */

import * as actionTypes from '../types/actionTypes';

const initialState = {
  // Global loading states
  global: false,
  
  // Feature-specific loading states
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
  
  // Operation-specific loading states
  operations: {},
};

const loadingReducers = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      const { key, value = true } = action.payload;
      
      // If key is a feature name, update that feature
      if (state.hasOwnProperty(key)) {
        return {
          ...state,
          [key]: value,
        };
      }
      
      // Otherwise, store in operations object
      return {
        ...state,
        operations: {
          ...state.operations,
          [key]: value,
        },
      };

    case actionTypes.CLEAR_LOADING:
      const { key: clearKey } = action.payload;
      
      // If key is a feature name, clear that feature
      if (state.hasOwnProperty(clearKey)) {
        return {
          ...state,
          [clearKey]: false,
        };
      }
      
      // Otherwise, remove from operations object
      const { [clearKey]: removed, ...remainingOperations } = state.operations;
      return {
        ...state,
        operations: remainingOperations,
      };

    case actionTypes.CLEAR_ALL_LOADING:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export default loadingReducers;
