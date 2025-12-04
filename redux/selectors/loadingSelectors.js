/**
 * Loading Selectors
 * Memoized selectors for loading state
 */

import { createSelector } from 'reselect';

// Base selectors
const selectLoadingState = (state) => state.loading;

// Memoized selectors
export const selectAllLoadingStates = createSelector(
  [selectLoadingState],
  (loading) => loading.operations || {}
);

export const selectIsOperationLoading = createSelector(
  [selectAllLoadingStates, (_, operationId) => operationId],
  (operations, operationId) => operations[operationId] || false
);

// Derived selectors
export const selectAnyLoading = createSelector(
  [selectAllLoadingStates],
  (operations) => Object.values(operations).some(isLoading => isLoading)
);

export const selectLoadingOperations = createSelector(
  [selectAllLoadingStates],
  (operations) => Object.keys(operations).filter(key => operations[key])
);

export const selectLoadingCount = createSelector(
  [selectLoadingOperations],
  (loadingOps) => loadingOps.length
);

// Specific operation selectors
export const selectIsAuthLoading = createSelector(
  [selectAllLoadingStates],
  (operations) => operations.auth || operations.login || operations.signup || false
);

export const selectIsMatchLoading = createSelector(
  [selectAllLoadingStates],
  (operations) => operations.matches || operations.match || false
);

export const selectIsUserLoading = createSelector(
  [selectAllLoadingStates],
  (operations) => operations.user || operations.profile || false
);
