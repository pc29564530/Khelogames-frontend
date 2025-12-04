/**
 * Matches Selectors
 * Memoized selectors for matches state
 */

import { createSelector } from 'reselect';

// Base selectors
const selectMatchesState = (state) => state.matches;

// Memoized selectors
export const selectAllMatches = createSelector(
  [selectMatchesState],
  (matchesState) => matchesState.matches
);

export const selectCurrentMatch = createSelector(
  [selectMatchesState],
  (matchesState) => matchesState.match
);

// Derived selectors
export const selectMatchById = createSelector(
  [selectAllMatches, (_, matchId) => matchId],
  (matches, matchId) => {
    // Search through all match stages
    for (const stage of matches) {
      // Check league stage
      if (stage.league_stage) {
        const match = stage.league_stage.find(m => m?.id === matchId);
        if (match) return match;
      }
      
      // Check group stage
      if (stage.group_stage) {
        const match = stage.group_stage.find(m => m?.id === matchId);
        if (match) return match;
      }
      
      // Check knockout stages
      if (stage.knockout_stage) {
        const knockoutStages = [
          'final', 'semifinal', 'quaterfinal', 
          'round_16', 'round_32', 'round_64', 'round_128'
        ];
        
        for (const stageName of knockoutStages) {
          const stageMatches = stage.knockout_stage[stageName];
          if (Array.isArray(stageMatches)) {
            const match = stageMatches.find(m => m?.id === matchId);
            if (match) return match;
          }
        }
      }
    }
    
    return null;
  }
);

export const selectMatchesByStatus = createSelector(
  [selectAllMatches, (_, status) => status],
  (matches, status) => {
    const filteredMatches = [];
    
    for (const stage of matches) {
      const checkStage = (stageMatches) => {
        if (Array.isArray(stageMatches)) {
          return stageMatches.filter(m => m?.status_code === status);
        }
        return [];
      };
      
      if (stage.league_stage) {
        filteredMatches.push(...checkStage(stage.league_stage));
      }
      
      if (stage.group_stage) {
        filteredMatches.push(...checkStage(stage.group_stage));
      }
      
      if (stage.knockout_stage) {
        const knockoutStages = [
          'final', 'semifinal', 'quaterfinal',
          'round_16', 'round_32', 'round_64', 'round_128'
        ];
        
        for (const stageName of knockoutStages) {
          filteredMatches.push(...checkStage(stage.knockout_stage[stageName]));
        }
      }
    }
    
    return filteredMatches;
  }
);

export const selectLiveMatches = createSelector(
  [selectAllMatches],
  (matches) => {
    const liveMatches = [];
    
    for (const stage of matches) {
      const checkStage = (stageMatches) => {
        if (Array.isArray(stageMatches)) {
          return stageMatches.filter(m => m?.status_code === 'in_progress');
        }
        return [];
      };
      
      if (stage.league_stage) {
        liveMatches.push(...checkStage(stage.league_stage));
      }
      
      if (stage.group_stage) {
        liveMatches.push(...checkStage(stage.group_stage));
      }
      
      if (stage.knockout_stage) {
        const knockoutStages = [
          'final', 'semifinal', 'quaterfinal',
          'round_16', 'round_32', 'round_64', 'round_128'
        ];
        
        for (const stageName of knockoutStages) {
          liveMatches.push(...checkStage(stage.knockout_stage[stageName]));
        }
      }
    }
    
    return liveMatches;
  }
);

export const selectMatchesCount = createSelector(
  [selectAllMatches],
  (matches) => {
    let count = 0;
    
    for (const stage of matches) {
      if (stage.league_stage) count += stage.league_stage.length;
      if (stage.group_stage) count += stage.group_stage.length;
      
      if (stage.knockout_stage) {
        const knockoutStages = [
          'final', 'semifinal', 'quaterfinal',
          'round_16', 'round_32', 'round_64', 'round_128'
        ];
        
        for (const stageName of knockoutStages) {
          const stageMatches = stage.knockout_stage[stageName];
          if (Array.isArray(stageMatches)) {
            count += stageMatches.length;
          }
        }
      }
    }
    
    return count;
  }
);
