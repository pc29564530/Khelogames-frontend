/**
 * Gesture Configuration for Navigation
 * 
 * Provides gesture-based navigation configurations including:
 * - Swipe-back gesture for iOS-style navigation
 * - Drawer swipe gesture
 * - Swipe-to-dismiss for modals
 * 
 * Requirements: 7.1
 */

import { Platform } from 'react-native';

/**
 * Gesture response distance thresholds
 */
const GESTURE_RESPONSE_DISTANCE = {
  horizontal: 50,
  vertical: 135,
};

/**
 * Swipe velocity threshold for gesture completion
 */
const SWIPE_VELOCITY_THRESHOLD = 500;

/**
 * iOS-style swipe-back gesture configuration
 */
export const swipeBackGestureConfig = {
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  gestureResponseDistance: GESTURE_RESPONSE_DISTANCE.horizontal,
  // Enable full-width swipe on Android, edge swipe on iOS
  fullScreenGestureEnabled: Platform.OS === 'android',
};

/**
 * Drawer swipe gesture configuration
 */
export const drawerSwipeConfig = {
  swipeEnabled: true,
  swipeEdgeWidth: 50,
  swipeMinDistance: 20,
  // Customize drawer animation
  drawerType: 'slide',
  overlayColor: 'rgba(0, 0, 0, 0.5)',
  // Gesture velocity threshold
  swipeVelocityThreshold: SWIPE_VELOCITY_THRESHOLD,
};

/**
 * Modal swipe-to-dismiss gesture configuration
 */
export const modalSwipeDismissConfig = {
  gestureEnabled: true,
  gestureDirection: 'vertical',
  gestureResponseDistance: GESTURE_RESPONSE_DISTANCE.vertical,
  // Custom gesture velocity threshold for modals
  gestureVelocityImpact: 0.3,
};

/**
 * Disable gestures configuration (for screens that shouldn't be dismissible)
 */
export const disableGesturesConfig = {
  gestureEnabled: false,
};

/**
 * Get gesture config based on screen type
 */
export const getGestureConfig = (screenType = 'default') => {
  switch (screenType) {
    case 'modal':
      return modalSwipeDismissConfig;
    case 'drawer':
      return drawerSwipeConfig;
    case 'disabled':
      return disableGesturesConfig;
    case 'swipeBack':
    case 'default':
    default:
      return swipeBackGestureConfig;
  }
};

/**
 * Enhanced stack gesture configuration with platform-specific behavior
 */
export const stackGestureConfig = {
  ...swipeBackGestureConfig,
  // Platform-specific customization
  ...(Platform.OS === 'ios' && {
    // iOS-specific: Enable edge swipe
    fullScreenGestureEnabled: false,
    gestureResponseDistance: GESTURE_RESPONSE_DISTANCE.horizontal,
  }),
  ...(Platform.OS === 'android' && {
    // Android-specific: Enable full-screen swipe
    fullScreenGestureEnabled: true,
    gestureResponseDistance: GESTURE_RESPONSE_DISTANCE.horizontal * 2,
  }),
};

/**
 * Bottom sheet gesture configuration
 */
export const bottomSheetGestureConfig = {
  gestureEnabled: true,
  gestureDirection: 'vertical',
  gestureResponseDistance: GESTURE_RESPONSE_DISTANCE.vertical,
  // Snap points for bottom sheet
  snapPoints: ['25%', '50%', '90%'],
};

export default {
  swipeBackGestureConfig,
  drawerSwipeConfig,
  modalSwipeDismissConfig,
  disableGesturesConfig,
  getGestureConfig,
  stackGestureConfig,
  bottomSheetGestureConfig,
};
