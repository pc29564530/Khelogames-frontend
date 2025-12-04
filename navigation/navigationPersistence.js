/**
 * Navigation State Persistence
 * 
 * Handles saving and restoring navigation state to provide seamless
 * user experience across app restarts
 * 
 * Requirements: 7.2
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage key for navigation state
 */
const NAVIGATION_STATE_KEY = '@navigation_state';

/**
 * Maximum age for persisted state (24 hours in milliseconds)
 * After this time, the state will be considered stale and ignored
 */
const MAX_STATE_AGE = 24 * 60 * 60 * 1000;

/**
 * Save navigation state to AsyncStorage
 * 
 * @param {object} state - Navigation state to save
 * @returns {Promise<boolean>} - Success status
 */
export const saveNavigationState = async (state) => {
  try {
    if (!state) {
      console.warn('No navigation state to save');
      return false;
    }

    const stateWithTimestamp = {
      state,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(
      NAVIGATION_STATE_KEY,
      JSON.stringify(stateWithTimestamp)
    );

    console.log('✅ Navigation state saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving navigation state:', error);
    return false;
  }
};

/**
 * Restore navigation state from AsyncStorage
 * 
 * @returns {Promise<object|null>} - Restored navigation state or null
 */
export const restoreNavigationState = async () => {
  try {
    const savedState = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);

    if (!savedState) {
      console.log('ℹ️ No saved navigation state found');
      return null;
    }

    const { state, timestamp } = JSON.parse(savedState);

    // Check if state is too old
    const age = Date.now() - timestamp;
    if (age > MAX_STATE_AGE) {
      console.log('⚠️ Saved navigation state is too old, ignoring');
      await clearNavigationState();
      return null;
    }

    console.log('✅ Navigation state restored successfully');
    return state;
  } catch (error) {
    console.error('❌ Error restoring navigation state:', error);
    return null;
  }
};

/**
 * Clear saved navigation state
 * 
 * @returns {Promise<boolean>} - Success status
 */
export const clearNavigationState = async () => {
  try {
    await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
    console.log('✅ Navigation state cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing navigation state:', error);
    return false;
  }
};

/**
 * Check if navigation state should be restored
 * 
 * @returns {Promise<boolean>} - Whether state should be restored
 */
export const shouldRestoreNavigationState = async () => {
  try {
    const savedState = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
    
    if (!savedState) {
      return false;
    }

    const { timestamp } = JSON.parse(savedState);
    const age = Date.now() - timestamp;

    return age <= MAX_STATE_AGE;
  } catch (error) {
    console.error('❌ Error checking navigation state:', error);
    return false;
  }
};

/**
 * Get navigation state metadata
 * 
 * @returns {Promise<object|null>} - State metadata or null
 */
export const getNavigationStateMetadata = async () => {
  try {
    const savedState = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
    
    if (!savedState) {
      return null;
    }

    const { timestamp } = JSON.parse(savedState);
    const age = Date.now() - timestamp;

    return {
      timestamp,
      age,
      isStale: age > MAX_STATE_AGE,
      savedAt: new Date(timestamp).toISOString(),
    };
  } catch (error) {
    console.error('❌ Error getting navigation state metadata:', error);
    return null;
  }
};

/**
 * Sanitize navigation state before saving
 * Removes sensitive or temporary data
 * 
 * @param {object} state - Navigation state to sanitize
 * @returns {object} - Sanitized state
 */
export const sanitizeNavigationState = (state) => {
  if (!state) return null;

  // Create a deep copy to avoid mutating original state
  const sanitized = JSON.parse(JSON.stringify(state));

  // Remove any routes that shouldn't be persisted
  const excludedRoutes = ['SignIn', 'SignUp', 'User'];

  if (sanitized.routes) {
    sanitized.routes = sanitized.routes.filter(
      route => !excludedRoutes.includes(route.name)
    );
  }

  return sanitized;
};

/**
 * Hook-friendly wrapper for navigation persistence
 */
export const useNavigationPersistence = () => {
  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();

  React.useEffect(() => {
    const restoreState = async () => {
      try {
        const state = await restoreNavigationState();
        if (state) {
          setInitialState(state);
        }
      } finally {
        setIsReady(true);
      }
    };

    restoreState();
  }, []);

  return {
    isReady,
    initialState,
    onStateChange: saveNavigationState,
  };
};

export default {
  saveNavigationState,
  restoreNavigationState,
  clearNavigationState,
  shouldRestoreNavigationState,
  getNavigationStateMetadata,
  sanitizeNavigationState,
};
