/**
 * Tournament Selectors
 * Memoized selectors for tournament state
 */

import { createSelector } from 'reselect';

// Base selectors
const selectTournamentsState = (state) => state.tournamentsReducers;

// Memoized selectors
export const selectAllTournaments = createSelector(
  [selectTournamentsState],
  (tournamentsState) => tournamentsState.tournaments || []
);

export const selectCurrentTournament = createSelector(
  [selectTournamentsState],
  (tournamentsState) => tournamentsState.tournament || null
);

export const selectTournamentStanding = createSelector(
  [selectTournamentsState],
  (tournamentsState) => tournamentsState.standing || []
);

export const selectTournamentGroups = createSelector(
  [selectTournamentsState],
  (tournamentsState) => tournamentsState.groups || []
);

// Derived selectors
export const selectTournamentById = createSelector(
  [selectAllTournaments, (_, tournamentId) => tournamentId],
  (tournaments, tournamentId) => 
    tournaments.find(t => t.id === tournamentId) || null
);

export const selectTournamentsBySport = createSelector(
  [selectAllTournaments, (_, sportId) => sportId],
  (tournaments, sportId) => 
    tournaments.filter(t => t.sport_id === sportId)
);

export const selectActiveTournaments = createSelector(
  [selectAllTournaments],
  (tournaments) => 
    tournaments.filter(t => t.status === 'active' || t.status === 'in_progress')
);

export const selectUpcomingTournaments = createSelector(
  [selectAllTournaments],
  (tournaments) => 
    tournaments.filter(t => t.status === 'upcoming' || t.status === 'scheduled')
);

export const selectCompletedTournaments = createSelector(
  [selectAllTournaments],
  (tournaments) => 
    tournaments.filter(t => t.status === 'completed' || t.status === 'finished')
);

export const selectTournamentsCount = createSelector(
  [selectAllTournaments],
  (tournaments) => tournaments.length
);

export const selectTournamentTeams = createSelector(
  [selectCurrentTournament],
  (tournament) => tournament?.teams || []
);

export const selectTournamentMatches = createSelector(
  [selectCurrentTournament],
  (tournament) => tournament?.matches || []
);
