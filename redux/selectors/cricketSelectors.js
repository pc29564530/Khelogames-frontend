/**
 * Cricket Selectors
 * Memoized selectors for cricket match state
 */

import { createSelector } from 'reselect';

// Base selectors
const selectCricketMatchScoreState = (state) => state.cricketMatchScore;
const selectCricketPlayerScoreState = (state) => state.cricketPlayerScore;
const selectCricketInningState = (state) => state.cricketMatchInning;
const selectCricketTossState = (state) => state.cricketToss;

// Cricket Match Score Selectors
export const selectCricketMatchScore = createSelector(
  [selectCricketMatchScoreState],
  (scoreState) => scoreState.score || null
);

export const selectCricketBattingScore = createSelector(
  [selectCricketMatchScoreState],
  (scoreState) => scoreState.battingScore || []
);

export const selectCricketBowlingScore = createSelector(
  [selectCricketMatchScoreState],
  (scoreState) => scoreState.bowlingScore || []
);

export const selectCricketWicketsFallen = createSelector(
  [selectCricketMatchScoreState],
  (scoreState) => scoreState.wicketsFallen || []
);

// Cricket Player Score Selectors
export const selectCricketPlayerScore = createSelector(
  [selectCricketPlayerScoreState],
  (playerState) => playerState.playerScore || []
);

export const selectCricketHomeTeamPlayers = createSelector(
  [selectCricketPlayerScoreState],
  (playerState) => playerState.homeTeamPlayers || []
);

export const selectCricketAwayTeamPlayers = createSelector(
  [selectCricketPlayerScoreState],
  (playerState) => playerState.awayTeamPlayers || []
);

// Cricket Inning Selectors
export const selectCricketInningScore = createSelector(
  [selectCricketInningState],
  (inningState) => inningState.inningScore || null
);

export const selectCurrentInning = createSelector(
  [selectCricketInningState],
  (inningState) => inningState.currentInning || null
);

export const selectCurrentInningNumber = createSelector(
  [selectCricketInningState],
  (inningState) => inningState.currentInningNumber || 1
);

export const selectInningStatus = createSelector(
  [selectCricketInningState],
  (inningState) => inningState.inningStatus || 'not_started'
);

export const selectIsInningCompleted = createSelector(
  [selectCricketInningState],
  (inningState) => inningState.inningCompleted || false
);

export const selectCurrentBatsmen = createSelector(
  [selectCricketInningState],
  (inningState) => inningState.currentBatsmen || []
);

export const selectCurrentBowler = createSelector(
  [selectCricketInningState],
  (inningState) => inningState.currentBowler || null
);

export const selectMatchFormat = createSelector(
  [selectCricketInningState],
  (inningState) => inningState.matchFormat || null
);

// Cricket Toss Selectors
export const selectCricketToss = createSelector(
  [selectCricketTossState],
  (tossState) => tossState.toss || null
);

export const selectBattingTeam = createSelector(
  [selectCricketTossState],
  (tossState) => tossState.battingTeam || null
);

// Derived Cricket Selectors
export const selectCricketMatchSquad = createSelector(
  [selectCricketHomeTeamPlayers, selectCricketAwayTeamPlayers],
  (homePlayers, awayPlayers) => ({
    home: homePlayers,
    away: awayPlayers,
    total: homePlayers.length + awayPlayers.length
  })
);

export const selectTopBatsmen = createSelector(
  [selectCricketBattingScore],
  (battingScore) => 
    [...battingScore]
      .sort((a, b) => (b.runs || 0) - (a.runs || 0))
      .slice(0, 5)
);

export const selectTopBowlers = createSelector(
  [selectCricketBowlingScore],
  (bowlingScore) => 
    [...bowlingScore]
      .sort((a, b) => (b.wickets || 0) - (a.wickets || 0))
      .slice(0, 5)
);

export const selectTotalRuns = createSelector(
  [selectCricketInningScore],
  (inningScore) => inningScore?.runs || 0
);

export const selectTotalWickets = createSelector(
  [selectCricketInningScore],
  (inningScore) => inningScore?.wickets || 0
);

export const selectTotalOvers = createSelector(
  [selectCricketInningScore],
  (inningScore) => inningScore?.overs || 0
);

export const selectCurrentRunRate = createSelector(
  [selectTotalRuns, selectTotalOvers],
  (runs, overs) => overs > 0 ? (runs / overs).toFixed(2) : '0.00'
);
