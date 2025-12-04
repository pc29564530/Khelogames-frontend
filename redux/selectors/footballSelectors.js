/**
 * Football Selectors
 * Memoized selectors for football match state
 */

import { createSelector } from 'reselect';

// Base selectors
const selectFootballMatchScoreState = (state) => state.footballMatchScore;
const selectFootballPlayerScoreState = (state) => state.playerScore;
const selectFootballIncidentsState = (state) => state.footballIncidents;

// Football Match Score Selectors
export const selectFootballMatchScore = createSelector(
  [selectFootballMatchScoreState],
  (scoreState) => scoreState.score || null
);

export const selectFootballMatches = createSelector(
  [selectFootballMatchScoreState],
  (scoreState) => scoreState.matches || []
);

// Football Player Score Selectors
export const selectFootballPlayerScore = createSelector(
  [selectFootballPlayerScoreState],
  (playerState) => playerState.playerScore || []
);

// Football Incidents Selectors
export const selectFootballIncidents = createSelector(
  [selectFootballIncidentsState],
  (incidentsState) => incidentsState.incidents || []
);

// Derived Football Selectors
export const selectFootballMatchById = createSelector(
  [selectFootballMatches, (_, matchId) => matchId],
  (matches, matchId) => matches.find(m => m.id === matchId) || null
);

export const selectFootballIncidentsByType = createSelector(
  [selectFootballIncidents, (_, incidentType) => incidentType],
  (incidents, incidentType) => 
    incidents.filter(i => i.incident_type === incidentType)
);

export const selectFootballGoals = createSelector(
  [selectFootballIncidents],
  (incidents) => incidents.filter(i => i.incident_type === 'goal')
);

export const selectFootballCards = createSelector(
  [selectFootballIncidents],
  (incidents) => incidents.filter(i => 
    i.incident_type === 'yellow_card' || i.incident_type === 'red_card'
  )
);

export const selectFootballSubstitutions = createSelector(
  [selectFootballIncidents],
  (incidents) => incidents.filter(i => i.incident_type === 'substitution')
);

export const selectFootballIncidentsByTeam = createSelector(
  [selectFootballIncidents, (_, teamId) => teamId],
  (incidents, teamId) => incidents.filter(i => i.team_id === teamId)
);

export const selectFootballIncidentsCount = createSelector(
  [selectFootballIncidents],
  (incidents) => incidents.length
);

export const selectFootballGoalsCount = createSelector(
  [selectFootballGoals],
  (goals) => goals.length
);

export const selectFootballHomeScore = createSelector(
  [selectFootballMatchScore],
  (score) => score?.home_score || 0
);

export const selectFootballAwayScore = createSelector(
  [selectFootballMatchScore],
  (score) => score?.away_score || 0
);

export const selectFootballMatchStatus = createSelector(
  [selectFootballMatchScore],
  (score) => score?.status || 'scheduled'
);

export const selectTopScorers = createSelector(
  [selectFootballPlayerScore],
  (playerScores) => 
    [...playerScores]
      .sort((a, b) => (b.goals || 0) - (a.goals || 0))
      .slice(0, 5)
);
