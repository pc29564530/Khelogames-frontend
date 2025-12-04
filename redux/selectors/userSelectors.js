/**
 * User Selectors
 * Memoized selectors for user state
 */

import { createSelector } from 'reselect';

// Base selectors
const selectUserState = (state) => state.user;

// Memoized selectors
export const selectCurrentUser = createSelector(
  [selectUserState],
  (userState) => userState.user
);

export const selectUserProfile = createSelector(
  [selectUserState],
  (userState) => userState.profile
);

export const selectIsFollowing = createSelector(
  [selectUserState],
  (userState) => userState.isFollowing
);

export const selectFollowingUsers = createSelector(
  [selectUserState],
  (userState) => userState.following || []
);

export const selectFollowerUsers = createSelector(
  [selectUserState],
  (userState) => userState.followers || []
);

// Derived selectors
export const selectUserId = createSelector(
  [selectCurrentUser],
  (user) => user?.id || user?.public_id || null
);

export const selectUserName = createSelector(
  [selectCurrentUser],
  (user) => user?.full_name || user?.username || 'User'
);

export const selectUserAvatar = createSelector(
  [selectCurrentUser],
  (user) => user?.avatar || user?.profile_picture || null
);

export const selectFollowingCount = createSelector(
  [selectFollowingUsers],
  (following) => following.length
);

export const selectFollowerCount = createSelector(
  [selectFollowerUsers],
  (followers) => followers.length
);

export const selectIsUserFollowing = createSelector(
  [selectFollowingUsers, (_, userId) => userId],
  (following, userId) => following.some(user => user.id === userId)
);
