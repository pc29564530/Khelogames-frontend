/**
 * Auth Selectors
 * Memoized selectors for authentication state
 */

import { createSelector } from 'reselect';

// Base selectors
const selectAuthState = (state) => state.auth;

// Memoized selectors
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectIsMobileNumberVerified = createSelector(
  [selectAuthState],
  (auth) => auth.isMobileNumberVerified
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading
);

export const selectExpireTime = createSelector(
  [selectAuthState],
  (auth) => auth.expiretime
);

// Derived selectors
export const selectIsAuthReady = createSelector(
  [selectIsAuthenticated, selectAuthLoading],
  (isAuthenticated, loading) => !loading && isAuthenticated !== null
);

export const selectRequiresAuthentication = createSelector(
  [selectIsAuthenticated, selectAuthLoading],
  (isAuthenticated, loading) => !loading && !isAuthenticated
);
