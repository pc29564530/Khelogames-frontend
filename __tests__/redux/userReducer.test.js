/**
 * User Reducer Tests
 * Tests user state management including following/followers
 * Requirements: 5.1
 */

import userReducers from '../../redux/reducers/userReducers';
import * as actionTypes from '../../redux/types/actionTypes';

describe('User Reducer', () => {
  const initialState = {
    user: null,
    following: [],
    follower: [],
    isFollowing: false,
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    full_name: 'Test User',
  };

  const mockFollowUser = {
    id: 2,
    username: 'followuser',
    full_name: 'Follow User',
  };

  it('should return initial state', () => {
    const state = userReducers(undefined, {});
    expect(state).toEqual(initialState);
  });

  describe('SET_USER', () => {
    it('should set user', () => {
      const action = {
        type: actionTypes.SET_USER,
        payload: mockUser,
      };
      const state = userReducers(initialState, action);

      expect(state.user).toEqual(mockUser);
    });

    it('should update existing user', () => {
      const currentState = {
        ...initialState,
        user: mockUser,
      };
      const updatedUser = {
        ...mockUser,
        full_name: 'Updated Name',
      };
      const action = {
        type: actionTypes.SET_USER,
        payload: updatedUser,
      };
      const state = userReducers(currentState, action);

      expect(state.user.full_name).toBe('Updated Name');
    });
  });

  describe('FOLLOW_USER', () => {
    it('should add user to following list', () => {
      const action = {
        type: actionTypes.FOLLOW_USER,
        payload: mockFollowUser,
      };
      const state = userReducers(initialState, action);

      expect(state.following).toHaveLength(1);
      expect(state.following[0]).toEqual(mockFollowUser);
    });

    it('should append to existing following list', () => {
      const currentState = {
        ...initialState,
        following: [mockUser],
      };
      const action = {
        type: actionTypes.FOLLOW_USER,
        payload: mockFollowUser,
      };
      const state = userReducers(currentState, action);

      expect(state.following).toHaveLength(2);
      expect(state.following).toContainEqual(mockUser);
      expect(state.following).toContainEqual(mockFollowUser);
    });
  });

  describe('UNFOLLOW_USER', () => {
    it('should remove user from following list', () => {
      const currentState = {
        ...initialState,
        following: [mockUser, mockFollowUser],
      };
      const action = {
        type: actionTypes.UNFOLLOW_USER,
        payload: mockFollowUser,
      };
      const state = userReducers(currentState, action);

      expect(state.following).toHaveLength(1);
      expect(state.following).toContainEqual(mockUser);
      expect(state.following).not.toContainEqual(mockFollowUser);
    });

    it('should handle unfollowing non-existent user', () => {
      const currentState = {
        ...initialState,
        following: [mockUser],
      };
      const action = {
        type: actionTypes.UNFOLLOW_USER,
        payload: mockFollowUser,
      };
      const state = userReducers(currentState, action);

      expect(state.following).toHaveLength(1);
      expect(state.following).toContainEqual(mockUser);
    });

    it('should handle empty following list', () => {
      const action = {
        type: actionTypes.UNFOLLOW_USER,
        payload: mockFollowUser,
      };
      const state = userReducers(initialState, action);

      expect(state.following).toHaveLength(0);
    });
  });

  describe('GET_FOLLOWING_USER', () => {
    it('should set following list', () => {
      const followingList = [mockUser, mockFollowUser];
      const action = {
        type: actionTypes.GET_FOLLOWING_USER,
        payload: followingList,
      };
      const state = userReducers(initialState, action);

      expect(state.following).toEqual(followingList);
    });

    it('should replace existing following list', () => {
      const currentState = {
        ...initialState,
        following: [mockUser],
      };
      const newFollowingList = [mockFollowUser];
      const action = {
        type: actionTypes.GET_FOLLOWING_USER,
        payload: newFollowingList,
      };
      const state = userReducers(currentState, action);

      expect(state.following).toEqual(newFollowingList);
    });
  });

  describe('GET_FOLLOWER_USER', () => {
    it('should set follower list', () => {
      const followerList = [mockUser, mockFollowUser];
      const action = {
        type: actionTypes.GET_FOLLOWER_USER,
        payload: followerList,
      };
      const state = userReducers(initialState, action);

      expect(state.follower).toEqual(followerList);
    });

    it('should replace existing follower list', () => {
      const currentState = {
        ...initialState,
        follower: [mockUser],
      };
      const newFollowerList = [mockFollowUser];
      const action = {
        type: actionTypes.GET_FOLLOWER_USER,
        payload: newFollowerList,
      };
      const state = userReducers(currentState, action);

      expect(state.follower).toEqual(newFollowerList);
    });
  });

  describe('IS_FOLLOWING', () => {
    it('should set isFollowing to true', () => {
      const action = {
        type: actionTypes.IS_FOLLOWING,
        payload: true,
      };
      const state = userReducers(initialState, action);

      expect(state.isFollowing).toBe(true);
    });

    it('should set isFollowing to false', () => {
      const currentState = {
        ...initialState,
        isFollowing: true,
      };
      const action = {
        type: actionTypes.IS_FOLLOWING,
        payload: false,
      };
      const state = userReducers(currentState, action);

      expect(state.isFollowing).toBe(false);
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const originalState = { ...initialState };
      const action = {
        type: actionTypes.SET_USER,
        payload: mockUser,
      };
      
      userReducers(originalState, action);

      expect(originalState).toEqual(initialState);
    });

    it('should not mutate following array', () => {
      const originalFollowing = [mockUser];
      const currentState = {
        ...initialState,
        following: originalFollowing,
      };
      const action = {
        type: actionTypes.FOLLOW_USER,
        payload: mockFollowUser,
      };
      
      userReducers(currentState, action);

      expect(originalFollowing).toHaveLength(1);
      expect(originalFollowing).toEqual([mockUser]);
    });
  });

  describe('Unknown Actions', () => {
    it('should return current state for unknown action', () => {
      const currentState = {
        ...initialState,
        user: mockUser,
      };
      const action = {
        type: 'UNKNOWN_ACTION',
        payload: {},
      };
      const state = userReducers(currentState, action);

      expect(state).toEqual(currentState);
    });
  });
});
