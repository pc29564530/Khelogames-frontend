/**
 * Action Creators Tests
 * Tests Redux action creators
 * Requirements: 5.1
 */

import * as actions from '../../redux/actions/actions';
import * as actionTypes from '../../redux/types/actionTypes';

describe('Action Creators', () => {
  describe('Authentication Actions', () => {
    it('should create setAuthenticated action', () => {
      const action = actions.setAuthenticated(true);
      expect(action).toEqual({
        type: actionTypes.SET_AUTHENTICATED,
        payload: true,
      });
    });

    it('should create setMobileNumberVerified action', () => {
      const action = actions.setMobileNumberVerified(true);
      expect(action).toEqual({
        type: actionTypes.SET_MOBILE_NUMBER_VERIFIED,
        payload: true,
      });
    });

    it('should create logout action', () => {
      const action = actions.logout();
      expect(action).toEqual({
        type: actionTypes.LOGOUT,
      });
    });

    it('should create setUser action', () => {
      const user = { id: 1, username: 'test' };
      const action = actions.setUser(user);
      expect(action).toEqual({
        type: actionTypes.SET_USER,
        payload: user,
      });
    });
  });

  describe('User Actions', () => {
    it('should create setFollowUser action', () => {
      const user = { id: 2, username: 'followuser' };
      const action = actions.setFollowUser(user);
      expect(action).toEqual({
        type: actionTypes.FOLLOW_USER,
        payload: user,
      });
    });

    it('should create setUnFollowUser action', () => {
      const user = { id: 2, username: 'unfollowuser' };
      const action = actions.setUnFollowUser(user);
      expect(action).toEqual({
        type: actionTypes.UNFOLLOW_USER,
        payload: user,
      });
    });

    it('should create getFollowingUser action', () => {
      const users = [{ id: 1 }, { id: 2 }];
      const action = actions.getFollowingUser(users);
      expect(action).toEqual({
        type: actionTypes.GET_FOLLOWING_USER,
        payload: users,
      });
    });

    it('should create getFollowerUser action', () => {
      const users = [{ id: 1 }, { id: 2 }];
      const action = actions.getFollowerUser(users);
      expect(action).toEqual({
        type: actionTypes.GET_FOLLOWER_USER,
        payload: users,
      });
    });

    it('should create checkIsFollowing action', () => {
      const action = actions.checkIsFollowing(true);
      expect(action).toEqual({
        type: actionTypes.IS_FOLLOWING,
        payload: true,
      });
    });
  });

  describe('Thread Actions', () => {
    it('should create setThreads action', () => {
      const threads = [{ id: 1, title: 'Test' }];
      const action = actions.setThreads(threads);
      expect(action).toEqual({
        type: actionTypes.SET_THREADS,
        payload: threads,
      });
    });

    it('should create addThreads action', () => {
      const thread = { id: 1, title: 'Test' };
      const action = actions.addThreads(thread);
      expect(action).toEqual({
        type: actionTypes.ADD_THREADS,
        payload: thread,
      });
    });

    it('should create setLikes action', () => {
      const action = actions.setLikes(1, 10);
      expect(action).toEqual({
        type: actionTypes.SET_LIKES,
        payload: { threadId: 1, newLikesCount: 10 },
      });
    });

    it('should create toggleLikes action', () => {
      const action = actions.toggleLikes(1, true);
      expect(action).toEqual({
        type: actionTypes.TOGGLE_LIKES,
        payload: { threadId: 1, isLikes: true },
      });
    });
  });

  describe('Match Actions', () => {
    it('should create getMatches action', () => {
      const matches = [{ id: 1, home: 'Team A' }];
      const action = actions.getMatches(matches);
      expect(action).toEqual({
        type: actionTypes.GET_MATCHES,
        payload: matches,
      });
    });

    it('should create getMatch action', () => {
      const match = { id: 1, home: 'Team A' };
      const action = actions.getMatch(match);
      expect(action).toEqual({
        type: actionTypes.GET_MATCH,
        payload: match,
      });
    });

    it('should create setMatchStatus action', () => {
      const status = 'in_progress';
      const action = actions.setMatchStatus(status);
      expect(action).toEqual({
        type: actionTypes.SET_MATCH_STATUS,
        payload: status,
      });
    });
  });

  describe('Validation Actions', () => {
    it('should create setValidationError action', () => {
      const action = actions.setValidationError('login-form', 'email', 'Invalid email');
      expect(action).toEqual({
        type: actionTypes.SET_VALIDATION_ERROR,
        payload: {
          formId: 'login-form',
          fieldName: 'email',
          error: 'Invalid email',
        },
      });
    });

    it('should create clearValidationError action', () => {
      const action = actions.clearValidationError('login-form', 'email');
      expect(action).toEqual({
        type: actionTypes.CLEAR_VALIDATION_ERROR,
        payload: {
          formId: 'login-form',
          fieldName: 'email',
        },
      });
    });

    it('should create clearFormValidationErrors action', () => {
      const action = actions.clearFormValidationErrors('login-form');
      expect(action).toEqual({
        type: actionTypes.CLEAR_FORM_VALIDATION_ERRORS,
        payload: {
          formId: 'login-form',
        },
      });
    });

    it('should create clearAllValidationErrors action', () => {
      const action = actions.clearAllValidationErrors();
      expect(action).toEqual({
        type: actionTypes.CLEAR_ALL_VALIDATION_ERRORS,
      });
    });
  });

  describe('Loading Actions', () => {
    it('should create setLoading action with default value', () => {
      const action = actions.setLoading('matches');
      expect(action).toEqual({
        type: actionTypes.SET_LOADING,
        payload: { key: 'matches', value: true },
      });
    });

    it('should create setLoading action with custom value', () => {
      const action = actions.setLoading('matches', false);
      expect(action).toEqual({
        type: actionTypes.SET_LOADING,
        payload: { key: 'matches', value: false },
      });
    });

    it('should create clearLoading action', () => {
      const action = actions.clearLoading('matches');
      expect(action).toEqual({
        type: actionTypes.CLEAR_LOADING,
        payload: { key: 'matches' },
      });
    });

    it('should create clearAllLoading action', () => {
      const action = actions.clearAllLoading();
      expect(action).toEqual({
        type: actionTypes.CLEAR_ALL_LOADING,
      });
    });
  });

  describe('Tournament Actions', () => {
    it('should create getTournamentBySportAction', () => {
      const tournaments = [{ id: 1, name: 'Tournament' }];
      const action = actions.getTournamentBySportAction(tournaments);
      expect(action).toEqual({
        type: actionTypes.GET_TOURNAMENT_BY_SPORT,
        payload: tournaments,
      });
    });

    it('should create getTournamentByIdAction', () => {
      const tournament = { id: 1, name: 'Tournament' };
      const action = actions.getTournamentByIdAction(tournament);
      expect(action).toEqual({
        type: actionTypes.GET_TOURNAMENT_BY_ID,
        payload: tournament,
      });
    });

    it('should create addTournament action', () => {
      const tournament = { id: 1, name: 'New Tournament' };
      const action = actions.addTournament(tournament);
      expect(action).toEqual({
        type: actionTypes.ADD_TOURNAMENT,
        payload: tournament,
      });
    });
  });

  describe('Team Actions', () => {
    it('should create setTeams action', () => {
      const teams = [{ id: 1, name: 'Team A' }];
      const action = actions.setTeams(teams);
      expect(action).toEqual({
        type: actionTypes.SET_TEAMS,
        payload: teams,
      });
    });

    it('should create getTeams action', () => {
      const teams = [{ id: 1, name: 'Team A' }];
      const action = actions.getTeams(teams);
      expect(action).toEqual({
        type: actionTypes.GET_TEAMS,
        payload: teams,
      });
    });

    it('should create getTeamsBySport action', () => {
      const teams = [{ id: 1, name: 'Team A' }];
      const action = actions.getTeamsBySport(teams);
      expect(action).toEqual({
        type: actionTypes.GET_TEAMS_BY_SPORT,
        payload: teams,
      });
    });
  });

  describe('Comment Actions', () => {
    it('should create setComments action', () => {
      const comments = [{ id: 1, text: 'Comment' }];
      const action = actions.setComments(comments);
      expect(action).toEqual({
        type: actionTypes.SET_COMMENTS,
        payload: comments,
      });
    });

    it('should create addComments action', () => {
      const comment = { id: 1, text: 'New Comment' };
      const action = actions.addComments(comment);
      expect(action).toEqual({
        type: actionTypes.ADD_COMMENTS,
        payload: comment,
      });
    });
  });
});
