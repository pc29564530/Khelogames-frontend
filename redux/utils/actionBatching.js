/**
 * Action Batching Utilities
 * Utilities for batching multiple Redux actions into a single dispatch
 */

import * as actionTypes from '../types/actionTypes';

// Batch action type
export const BATCH_ACTIONS = 'BATCH_ACTIONS';

/**
 * Creates a batch action that contains multiple actions
 * @param {Array} actions - Array of action objects to batch
 * @returns {Object} Batch action object
 */
export const batchActions = (actions) => ({
  type: BATCH_ACTIONS,
  payload: actions,
});

/**
 * Middleware to handle batched actions
 * Dispatches each action in the batch sequentially
 */
export const batchActionsMiddleware = (store) => (next) => (action) => {
  if (action.type === BATCH_ACTIONS) {
    action.payload.forEach((batchedAction) => {
      store.dispatch(batchedAction);
    });
    return;
  }
  
  return next(action);
};

/**
 * Helper to batch multiple state updates
 * Useful for updating multiple related pieces of state at once
 */
export const batchStateUpdates = (...actions) => {
  return (dispatch) => {
    dispatch(batchActions(actions));
  };
};

/**
 * Batch cricket score updates
 * Updates batting score, bowling score, and inning score in one batch
 */
export const batchCricketScoreUpdate = (battingUpdate, bowlingUpdate, inningUpdate) => {
  const actions = [];
  
  if (battingUpdate) {
    actions.push({
      type: actionTypes.UPDATE_BATSMAN_SCORE,
      payload: battingUpdate,
    });
  }
  
  if (bowlingUpdate) {
    actions.push({
      type: actionTypes.UPDATE_BOWLER_SCORE,
      payload: bowlingUpdate,
    });
  }
  
  if (inningUpdate) {
    actions.push({
      type: actionTypes.UPDATE_INNING_SCORE,
      payload: inningUpdate,
    });
  }
  
  return batchActions(actions);
};

/**
 * Batch match status and score updates
 * Updates match status and score simultaneously
 */
export const batchMatchUpdate = (matchId, statusUpdate, scoreUpdate) => {
  const actions = [];
  
  if (statusUpdate) {
    actions.push({
      type: actionTypes.SET_MATCH_STATUS,
      payload: { match_id: matchId, ...statusUpdate },
    });
  }
  
  if (scoreUpdate) {
    actions.push({
      type: actionTypes.GET_MATCH,
      payload: { id: matchId, ...scoreUpdate },
    });
  }
  
  return batchActions(actions);
};

/**
 * Batch user profile updates
 * Updates multiple user profile fields at once
 */
export const batchUserProfileUpdate = (updates) => {
  const actions = [];
  
  if (updates.avatar) {
    actions.push({
      type: actionTypes.SET_PROFILE_AVATAR,
      payload: updates.avatar,
    });
  }
  
  if (updates.fullName) {
    actions.push({
      type: actionTypes.SET_EDIT_FULL_NAME,
      payload: updates.fullName,
    });
  }
  
  if (updates.description) {
    actions.push({
      type: actionTypes.SET_EDIT_DESCRIPTION,
      payload: updates.description,
    });
  }
  
  return batchActions(actions);
};

/**
 * Batch loading state updates
 * Sets multiple loading states at once
 */
export const batchLoadingStates = (loadingStates) => {
  const actions = Object.entries(loadingStates).map(([operationId, isLoading]) => ({
    type: isLoading ? actionTypes.SET_LOADING : actionTypes.CLEAR_LOADING,
    payload: operationId,
  }));
  
  return batchActions(actions);
};
