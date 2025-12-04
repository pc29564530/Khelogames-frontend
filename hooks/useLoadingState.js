/**
 * useLoadingState hook
 * Custom hook for managing loading states with Redux
 */

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { setLoading, clearLoading } from '../redux/actions/actions';

/**
 * Hook to manage loading states
 * @param {string} key - The loading state key (e.g., 'matches', 'tournaments')
 * @returns {Object} - { isLoading, startLoading, stopLoading }
 */
const useLoadingState = (key) => {
  const dispatch = useDispatch();
  
  // Get loading state from Redux
  const isLoading = useSelector((state) => {
    // Check if it's a feature-level loading state
    if (state.loading.hasOwnProperty(key)) {
      return state.loading[key];
    }
    // Check if it's an operation-level loading state
    return state.loading.operations[key] || false;
  });

  // Start loading
  const startLoading = useCallback(() => {
    dispatch(setLoading(key, true));
  }, [dispatch, key]);

  // Stop loading
  const stopLoading = useCallback(() => {
    dispatch(clearLoading(key));
  }, [dispatch, key]);

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
};

export default useLoadingState;
