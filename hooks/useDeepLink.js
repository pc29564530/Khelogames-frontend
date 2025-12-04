/**
 * useDeepLink Hook
 * 
 * Custom hook for handling deep links in components
 * Provides utilities for:
 * - Generating deep links
 * - Navigating via deep links
 * - Sharing deep links
 * 
 * Requirements: 7.3
 */

import { useCallback, useEffect } from 'react';
import { Linking, Share, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { generateDeepLink, parseDeepLink, subscribeToDeepLinks } from '../navigation/deepLinkingConfig';

/**
 * Hook for deep linking functionality
 */
export const useDeepLink = () => {
  const navigation = useNavigation();

  /**
   * Navigate to a screen using deep link
   */
  const navigateToDeepLink = useCallback((url) => {
    const parsed = parseDeepLink(url);
    if (parsed) {
      navigation.navigate(parsed.screen, parsed.params);
    }
  }, [navigation]);

  /**
   * Generate a deep link for a screen
   */
  const createDeepLink = useCallback((screen, params = {}) => {
    return generateDeepLink(screen, params);
  }, []);

  /**
   * Share a deep link
   */
  const shareDeepLink = useCallback(async (screen, params = {}, message = '') => {
    try {
      const url = generateDeepLink(screen, params);
      const result = await Share.share({
        message: message || url,
        url: Platform.OS === 'ios' ? url : undefined,
        title: 'Share via',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type
          return { success: true, activityType: result.activityType };
        } else {
          // Shared
          return { success: true };
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        return { success: false, dismissed: true };
      }
    } catch (error) {
      console.error('Error sharing deep link:', error);
      return { success: false, error };
    }
  }, []);

  /**
   * Open a deep link in external browser
   */
  const openDeepLink = useCallback(async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return { success: true };
      } else {
        console.warn(`Cannot open URL: ${url}`);
        return { success: false, error: 'URL not supported' };
      }
    } catch (error) {
      console.error('Error opening deep link:', error);
      return { success: false, error };
    }
  }, []);

  /**
   * Subscribe to deep link events
   */
  useEffect(() => {
    const unsubscribe = subscribeToDeepLinks((url) => {
      navigateToDeepLink(url);
    });

    return unsubscribe;
  }, [navigateToDeepLink]);

  return {
    navigateToDeepLink,
    createDeepLink,
    shareDeepLink,
    openDeepLink,
  };
};

/**
 * Hook for getting initial deep link URL
 */
export const useInitialDeepLink = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const handleInitialURL = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          const parsed = parseDeepLink(url);
          if (parsed) {
            // Small delay to ensure navigation is ready
            setTimeout(() => {
              navigation.navigate(parsed.screen, parsed.params);
            }, 100);
          }
        }
      } catch (error) {
        console.error('Error handling initial URL:', error);
      }
    };

    handleInitialURL();
  }, [navigation]);
};

export default useDeepLink;
