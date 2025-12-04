/**
 * Selectors Tests
 * Tests memoized selectors for Redux state
 * Requirements: 5.1
 */

import * as authSelectors from '../../redux/selectors/authSelectors';
import * as userSelectors from '../../redux/selectors/userSelectors';
import * as matchesSelectors from '../../redux/selectors/matchesSelectors';
import * as validationSelectors from '../../redux/selectors/validationSelectors';
import * as loadingSelectors from '../../redux/selectors/loadingSelectors';
import * as tournamentSelectors from '../../redux/selectors/tournamentSelectors';

describe('Selectors', () => {
  describe('Auth Selectors', () => {
    const mockState = {
      auth: {
        isAuthenticated: true,
        isMobileNumberVerified: true,
        loading: false,
        expiretime: '2024-12-31',
      },
    };

    it('should select isAuthenticated', () => {
      const result = authSelectors.selectIsAuthenticated(mockState);
      expect(result).toBe(true);
    });

    it('should select isMobileNumberVerified', () => {
      const result = authSelectors.selectIsMobileNumberVerified(mockState);
      expect(result).toBe(true);
    });

    it('should select authLoading', () => {
      const result = authSelectors.selectAuthLoading(mockState);
      expect(result).toBe(false);
    });

    it('should select expireTime', () => {
      const result = authSelectors.selectExpireTime(mockState);
      expect(result).toBe('2024-12-31');
    });

    it('should select isAuthReady', () => {
      const result = authSelectors.selectIsAuthReady(mockState);
      expect(result).toBe(true);
    });

    it('should select requiresAuthentication', () => {
      const unauthState = {
        auth: {
          isAuthenticated: false,
          loading: false,
        },
      };
      const result = authSelectors.selectRequiresAuthentication(unauthState);
      expect(result).toBe(true);
    });

    describe('Memoization', () => {
      it('should return same reference for same input', () => {
        const result1 = authSelectors.selectIsAuthenticated(mockState);
        const result2 = authSelectors.selectIsAuthenticated(mockState);
        expect(result1).toBe(result2);
      });

      it('should return new reference for different input', () => {
        const state1 = { auth: { isAuthenticated: true } };
        const state2 = { auth: { isAuthenticated: false } };
        const result1 = authSelectors.selectIsAuthenticated(state1);
        const result2 = authSelectors.selectIsAuthenticated(state2);
        expect(result1).not.toBe(result2);
      });
    });
  });

  describe('User Selectors', () => {
    const mockUser = {
      id: 1,
      public_id: 'user123',
      full_name: 'Test User',
      username: 'testuser',
      avatar: 'avatar.jpg',
    };

    const mockState = {
      user: {
        user: mockUser,
        following: [{ id: 2 }, { id: 3 }],
        followers: [{ id: 4 }, { id: 5 }, { id: 6 }],
        isFollowing: true,
      },
    };

    it('should select current user', () => {
      const result = userSelectors.selectCurrentUser(mockState);
      expect(result).toEqual(mockUser);
    });

    it('should select userId', () => {
      const result = userSelectors.selectUserId(mockState);
      expect(result).toBe(1);
    });

    it('should select userName', () => {
      const result = userSelectors.selectUserName(mockState);
      expect(result).toBe('Test User');
    });

    it('should select userAvatar', () => {
      const result = userSelectors.selectUserAvatar(mockState);
      expect(result).toBe('avatar.jpg');
    });

    it('should select following users', () => {
      const result = userSelectors.selectFollowingUsers(mockState);
      expect(result).toHaveLength(2);
    });

    it('should select follower users', () => {
      const result = userSelectors.selectFollowerUsers(mockState);
      expect(result).toHaveLength(3);
    });

    it('should select following count', () => {
      const result = userSelectors.selectFollowingCount(mockState);
      expect(result).toBe(2);
    });

    it('should select follower count', () => {
      const result = userSelectors.selectFollowerCount(mockState);
      expect(result).toBe(3);
    });

    it('should check if user is following specific user', () => {
      const result = userSelectors.selectIsUserFollowing(mockState, 2);
      expect(result).toBe(true);
    });

    it('should return false for non-followed user', () => {
      const result = userSelectors.selectIsUserFollowing(mockState, 999);
      expect(result).toBe(false);
    });

    describe('Memoization', () => {
      it('should memoize derived selectors', () => {
        const result1 = userSelectors.selectFollowingCount(mockState);
        const result2 = userSelectors.selectFollowingCount(mockState);
        expect(result1).toBe(result2);
      });
    });
  });

  describe('Matches Selectors', () => {
    const mockMatches = [
      {
        league_stage: [
          { id: 1, status_code: 'scheduled' },
          { id: 2, status_code: 'in_progress' },
        ],
        group_stage: [
          { id: 3, status_code: 'completed' },
        ],
        knockout_stage: {
          final: [{ id: 4, status_code: 'in_progress' }],
          semifinal: [{ id: 5, status_code: 'scheduled' }],
        },
      },
    ];

    const mockState = {
      matches: {
        matches: mockMatches,
        match: { id: 1, status_code: 'scheduled' },
      },
    };

    it('should select all matches', () => {
      const result = matchesSelectors.selectAllMatches(mockState);
      expect(result).toEqual(mockMatches);
    });

    it('should select current match', () => {
      const result = matchesSelectors.selectCurrentMatch(mockState);
      expect(result).toEqual({ id: 1, status_code: 'scheduled' });
    });

    it('should select match by id from league stage', () => {
      const result = matchesSelectors.selectMatchById(mockState, 1);
      expect(result).toEqual({ id: 1, status_code: 'scheduled' });
    });

    it('should select match by id from knockout stage', () => {
      const result = matchesSelectors.selectMatchById(mockState, 4);
      expect(result).toEqual({ id: 4, status_code: 'in_progress' });
    });

    it('should return null for non-existent match', () => {
      const result = matchesSelectors.selectMatchById(mockState, 999);
      expect(result).toBeNull();
    });

    it('should select matches by status', () => {
      const result = matchesSelectors.selectMatchesByStatus(mockState, 'in_progress');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(4);
    });

    it('should select live matches', () => {
      const result = matchesSelectors.selectLiveMatches(mockState);
      expect(result).toHaveLength(2);
    });

    it('should count total matches', () => {
      const result = matchesSelectors.selectMatchesCount(mockState);
      expect(result).toBe(5);
    });

    describe('Memoization', () => {
      it('should memoize match selection', () => {
        const result1 = matchesSelectors.selectMatchById(mockState, 1);
        const result2 = matchesSelectors.selectMatchById(mockState, 1);
        expect(result1).toBe(result2);
      });

      it('should memoize live matches', () => {
        const result1 = matchesSelectors.selectLiveMatches(mockState);
        const result2 = matchesSelectors.selectLiveMatches(mockState);
        expect(result1).toBe(result2);
      });
    });
  });

  describe('Validation Selectors', () => {
    const mockState = {
      validation: {
        forms: {
          'login-form': {
            email: 'Invalid email',
            password: 'Password too short',
          },
          'signup-form': {
            username: 'Username taken',
          },
        },
      },
    };

    it('should select all validation errors', () => {
      const result = validationSelectors.selectAllValidationErrors(mockState);
      expect(result).toEqual(mockState.validation.forms);
    });

    it('should select form errors', () => {
      const result = validationSelectors.selectFormErrors(mockState, 'login-form');
      expect(result).toEqual({
        email: 'Invalid email',
        password: 'Password too short',
      });
    });

    it('should select field error', () => {
      const result = validationSelectors.selectFieldError(mockState, 'login-form', 'email');
      expect(result).toBe('Invalid email');
    });

    it('should return null for non-existent field error', () => {
      const result = validationSelectors.selectFieldError(mockState, 'login-form', 'nonexistent');
      expect(result).toBeNull();
    });

    it('should check if form has errors', () => {
      const result = validationSelectors.selectHasFormErrors(mockState, 'login-form');
      expect(result).toBe(true);
    });

    it('should count form errors', () => {
      const result = validationSelectors.selectFormErrorCount(mockState, 'login-form');
      expect(result).toBe(2);
    });

    it('should check if form is valid', () => {
      const result = validationSelectors.selectIsFormValid(mockState, 'login-form');
      expect(result).toBe(false);
    });

    it('should select form error messages', () => {
      const result = validationSelectors.selectFormErrorMessages(mockState, 'login-form');
      expect(result).toEqual(['Invalid email', 'Password too short']);
    });

    it('should check if field has error', () => {
      const result = validationSelectors.selectHasFieldError(mockState, 'login-form', 'email');
      expect(result).toBe(true);
    });

    describe('Memoization', () => {
      it('should memoize form errors', () => {
        const result1 = validationSelectors.selectFormErrors(mockState, 'login-form');
        const result2 = validationSelectors.selectFormErrors(mockState, 'login-form');
        expect(result1).toBe(result2);
      });
    });
  });

  describe('Loading Selectors', () => {
    const mockState = {
      loading: {
        global: false,
        matches: true,
        operations: {
          fetchUser: true,
          fetchMatches: false,
          login: true,
        },
      },
    };

    it('should select all loading states', () => {
      const result = loadingSelectors.selectAllLoadingStates(mockState);
      expect(result).toEqual(mockState.loading.operations);
    });

    it('should check if operation is loading', () => {
      const result = loadingSelectors.selectIsOperationLoading(mockState, 'fetchUser');
      expect(result).toBe(true);
    });

    it('should return false for non-loading operation', () => {
      const result = loadingSelectors.selectIsOperationLoading(mockState, 'fetchMatches');
      expect(result).toBe(false);
    });

    it('should check if any operation is loading', () => {
      const result = loadingSelectors.selectAnyLoading(mockState);
      expect(result).toBe(true);
    });

    it('should select loading operations', () => {
      const result = loadingSelectors.selectLoadingOperations(mockState);
      expect(result).toEqual(['fetchUser', 'login']);
    });

    it('should count loading operations', () => {
      const result = loadingSelectors.selectLoadingCount(mockState);
      expect(result).toBe(2);
    });

    it('should check if auth is loading', () => {
      const result = loadingSelectors.selectIsAuthLoading(mockState);
      expect(result).toBe(true);
    });

    describe('Memoization', () => {
      it('should memoize loading operations', () => {
        const result1 = loadingSelectors.selectLoadingOperations(mockState);
        const result2 = loadingSelectors.selectLoadingOperations(mockState);
        expect(result1).toBe(result2);
      });
    });
  });

  describe('Tournament Selectors', () => {
    const mockTournaments = [
      { id: 1, name: 'Tournament 1', sport_id: 1, status: 'active' },
      { id: 2, name: 'Tournament 2', sport_id: 1, status: 'completed' },
      { id: 3, name: 'Tournament 3', sport_id: 2, status: 'upcoming' },
    ];

    const mockState = {
      tournamentsReducers: {
        tournaments: mockTournaments,
        tournament: mockTournaments[0],
        standing: [{ team: 'Team A', points: 10 }],
        groups: [{ id: 1, name: 'Group A' }],
      },
    };

    it('should select all tournaments', () => {
      const result = tournamentSelectors.selectAllTournaments(mockState);
      expect(result).toEqual(mockTournaments);
    });

    it('should select current tournament', () => {
      const result = tournamentSelectors.selectCurrentTournament(mockState);
      expect(result).toEqual(mockTournaments[0]);
    });

    it('should select tournament by id', () => {
      const result = tournamentSelectors.selectTournamentById(mockState, 2);
      expect(result).toEqual(mockTournaments[1]);
    });

    it('should select tournaments by sport', () => {
      const result = tournamentSelectors.selectTournamentsBySport(mockState, 1);
      expect(result).toHaveLength(2);
    });

    it('should select active tournaments', () => {
      const result = tournamentSelectors.selectActiveTournaments(mockState);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('active');
    });

    it('should select upcoming tournaments', () => {
      const result = tournamentSelectors.selectUpcomingTournaments(mockState);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('upcoming');
    });

    it('should select completed tournaments', () => {
      const result = tournamentSelectors.selectCompletedTournaments(mockState);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('completed');
    });

    it('should count tournaments', () => {
      const result = tournamentSelectors.selectTournamentsCount(mockState);
      expect(result).toBe(3);
    });

    describe('Memoization', () => {
      it('should memoize tournament selection', () => {
        const result1 = tournamentSelectors.selectTournamentById(mockState, 1);
        const result2 = tournamentSelectors.selectTournamentById(mockState, 1);
        expect(result1).toBe(result2);
      });

      it('should memoize filtered tournaments', () => {
        const result1 = tournamentSelectors.selectActiveTournaments(mockState);
        const result2 = tournamentSelectors.selectActiveTournaments(mockState);
        expect(result1).toBe(result2);
      });
    });
  });
});
