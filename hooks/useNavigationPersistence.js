/**
 * useNavigationPersistence Hook
 * 
 * Custom hook for managing navigation state persistence
 * Provides utilities for saving and restoring navigation state
 * 
 * Requirements: 7.2
 */

import { useState, useEffect, useCallback } from 'react';
import {
  restoreNavigationState,
  saveNavigationState,
  clearNavigationState,
  shouldRestoreNavigationState,
  getNavigationStateMetadata,
  sanitizeNavigationState,
} from '../navigation/navigationPersistence';

/**
 * Hook for navigation state persistence
 * 
 * @returns {object} Navigation persistence utilities
 */
export const useNavigationPersistence = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState(undefined);
  const [metadata, setMetadata] = useState(null);

  /**
   * Restore navigation state on mount
   */
  useEffect(() => {
    const restoreState = async () => {
      try {
        const shouldRestore = await shouldRestoreNavigationState();
        
        if (shouldRestore) {
          const state = await restoreNavigationState();
          const meta = await getNavigationStateMetadata();
          
          if (state) {
            setInitialState(state);
            setMetadata(meta);
            console.log('✅ Navigation state restored from persistence');
          }
        } else {
          console.log('ℹ️ Navigation state not restored (too old or missing)');
        }
      } catch (error) {
        console.error('❌ Error restoring navigation state:', error);
      } finally {
        setIsReady(true);
      }
    };

    restoreState();
  }, []);

  /**
   * Save navigation state
   */
  const saveState = useCallback(async (state) => {
    try {
      const sanitized = sanitizeNavigationState(state);
      await saveNavigationState(sanitized);
      return true;
    } catch (error) {
      console.error('❌ Error saving navigation state:', error);
      return false;
    }
  }, []);

  /**
   * Clear navigation state
   */
  const clearState = useCallback(async () => {
    try {
      await clearNavigationState();
      setInitialState(undefined);
      setMetadata(null);
      return true;
    } catch (error) {
      console.error('❌ Error clearing navigation state:', error);
      return false;
    }
  }, []);

  /**
   * Refresh metadata
   */
  const refreshMetadata = useCallback(async () => {
    try {
      const meta = await getNavigationStateMetadata();
      setMetadata(meta);
      return meta;
    } catch (error) {
      console.error('❌ Error refreshing metadata:', error);
      return null;
    }
  }, []);

  return {
    isReady,
    initialState,
    metadata,
    saveState,
    clearState,
    refreshMetadata,
  };
};

/**
 * Hook for handling navigation state changes
 * Automatically saves state when it changes
 * 
 * @param {boolean} enabled - Whether persistence is enabled
 * @returns {function} State change handler
 */
export const useNavigationStateHandler = (enabled = true) => {
  const handleStateChange = useCallback(async (state) => {
    if (!enabled || !state) return;

    try {
      const sanitized = sanitizeNavigationState(state);
      await saveNavigationState(sanitized);
    } catch (error) {
      console.error('❌ Error handling navigation state change:', error);
    }
  }, [enabled]);

  return handleStateChange;
};

export default useNavigationPersistence;
