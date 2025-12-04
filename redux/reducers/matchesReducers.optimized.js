/**
 * Optimized Matches Reducer
 * Uses Immer for immutable state updates
 */

import { produce } from 'immer';
import * as actionTypes from '../types/actionTypes';

const initialState = {
  matches: [],
  match: null,
};

/**
 * Helper function to update match status in a stage array
 * @param {Array} stageArray - Array of matches in a stage
 * @param {number} matchId - ID of the match to update
 * @param {string} statusCode - New status code
 */
const updateMatchInStage = (stageArray, matchId, statusCode) => {
  if (!Array.isArray(stageArray)) return;
  
  const matchIndex = stageArray.findIndex(m => m?.id === matchId);
  if (matchIndex !== -1) {
    stageArray[matchIndex].status_code = statusCode;
  }
};

const matchesReducer = (state = initialState, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case actionTypes.GET_MATCHES:
        draft.matches = action.payload;
        break;

      case actionTypes.SET_MATCHES:
        draft.matches.push(action.payload);
        break;

      case actionTypes.GET_MATCH:
        draft.match = action.payload;
        break;

      case actionTypes.SET_MATCH_STATUS: {
        // Extract match ID and status code from payload
        let matchId, statusCode;
        
        if (action.payload.match_id !== undefined) {
          matchId = action.payload.match_id;
          statusCode = action.payload.status_code;
        } else if (action.payload.id !== undefined) {
          matchId = action.payload.id;
          statusCode = action.payload.status_code;
        } else {
          console.error('Invalid payload - no match_id or id found:', action.payload);
          break;
        }

        // Update matches in all stages
        draft.matches.forEach((stage) => {
          // Update league stage
          if (stage.league_stage) {
            updateMatchInStage(stage.league_stage, matchId, statusCode);
          }
          
          // Update group stage
          if (stage.group_stage) {
            updateMatchInStage(stage.group_stage, matchId, statusCode);
          }
          
          // Update knockout stages
          if (stage.knockout_stage) {
            const knockoutStages = [
              'final', 'semifinal', 'quaterfinal',
              'round_16', 'round_32', 'round_64', 'round_128'
            ];
            
            knockoutStages.forEach((stageName) => {
              if (stage.knockout_stage[stageName]) {
                updateMatchInStage(stage.knockout_stage[stageName], matchId, statusCode);
              }
            });
          }
        });
        
        // Update current match if it matches
        if (draft.match?.id === matchId) {
          draft.match.status_code = statusCode;
        }
        break;
      }

      case actionTypes.SET_MATCH_SUB_STATUS: {
        const { matchId, subStatus } = action.payload;
        
        // Update in matches array
        draft.matches.forEach((stage) => {
          const updateSubStatus = (stageArray) => {
            if (!Array.isArray(stageArray)) return;
            const matchIndex = stageArray.findIndex(m => m?.id === matchId);
            if (matchIndex !== -1) {
              stageArray[matchIndex].sub_status = subStatus;
            }
          };
          
          if (stage.league_stage) updateSubStatus(stage.league_stage);
          if (stage.group_stage) updateSubStatus(stage.group_stage);
          
          if (stage.knockout_stage) {
            const knockoutStages = [
              'final', 'semifinal', 'quaterfinal',
              'round_16', 'round_32', 'round_64', 'round_128'
            ];
            knockoutStages.forEach((stageName) => {
              if (stage.knockout_stage[stageName]) {
                updateSubStatus(stage.knockout_stage[stageName]);
              }
            });
          }
        });
        
        // Update current match
        if (draft.match?.id === matchId) {
          draft.match.sub_status = subStatus;
        }
        break;
      }

      default:
        // No changes needed, Immer will return original state
        break;
    }
  });
};

export default matchesReducer;
