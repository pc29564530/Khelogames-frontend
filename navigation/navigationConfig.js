/**
 * Navigation Configuration
 * 
 * Provides custom transition animations and configurations for React Navigation
 * Implements smooth screen transitions with slide, fade, and modal animations
 * 
 * Requirements: 1.2, 7.1
 */

import { Easing } from 'react-native';
import { TransitionPresets } from '@react-navigation/stack';

/**
 * Timing configuration for animations
 */
const ANIMATION_DURATION = 300;
const MODAL_ANIMATION_DURATION = 250;

/**
 * Custom easing functions for smooth animations
 */
const easingConfig = {
  easeInOut: Easing.bezier(0.4, 0.0, 0.2, 1),
  easeOut: Easing.bezier(0.0, 0.0, 0.2, 1),
  easeIn: Easing.bezier(0.4, 0.0, 1, 1),
};

/**
 * Slide transition from right (default iOS-style)
 */
export const slideFromRightTransition = {
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: ANIMATION_DURATION,
        easing: easingConfig.easeOut,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: ANIMATION_DURATION,
        easing: easingConfig.easeIn,
      },
    },
  },
  cardStyleInterpolator: ({ current, next, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
          {
            scale: next
              ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.95],
                })
              : 1,
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.3],
        }),
      },
    };
  },
};

/**
 * Fade transition for subtle screen changes
 */
export const fadeTransition = {
  gestureEnabled: false,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: ANIMATION_DURATION,
        easing: easingConfig.easeInOut,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: ANIMATION_DURATION,
        easing: easingConfig.easeInOut,
      },
    },
  },
  cardStyleInterpolator: ({ current }) => {
    return {
      cardStyle: {
        opacity: current.progress,
      },
    };
  },
};

/**
 * Modal transition from bottom (Android-style modal)
 */
export const modalTransition = {
  gestureEnabled: true,
  gestureDirection: 'vertical',
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: MODAL_ANIMATION_DURATION,
        easing: easingConfig.easeOut,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: MODAL_ANIMATION_DURATION,
        easing: easingConfig.easeIn,
      },
    },
  },
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

/**
 * Scale transition for dialogs and overlays
 */
export const scaleTransition = {
  gestureEnabled: false,
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: MODAL_ANIMATION_DURATION,
        easing: easingConfig.easeOut,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: MODAL_ANIMATION_DURATION,
        easing: easingConfig.easeIn,
      },
    },
  },
  cardStyleInterpolator: ({ current }) => {
    return {
      cardStyle: {
        opacity: current.progress,
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

/**
 * Default screen options with optimized performance
 */
export const defaultScreenOptions = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerTitleAlign: 'center',
  // Enable native animations for better performance
  animationEnabled: true,
  // Optimize for performance
  freezeOnBlur: true,
  // Use slide from right as default
  ...slideFromRightTransition,
  // Enable gestures by default
  gestureEnabled: true,
};

/**
 * Modal screen options
 */
export const modalScreenOptions = {
  headerShown: true,
  presentation: 'modal',
  ...modalTransition,
};

/**
 * Transparent modal options (for overlays)
 */
export const transparentModalOptions = {
  headerShown: false,
  presentation: 'transparentModal',
  cardStyle: { backgroundColor: 'transparent' },
  ...scaleTransition,
};

/**
 * Get transition config based on screen type
 */
export const getTransitionConfig = (screenType = 'default') => {
  switch (screenType) {
    case 'modal':
      return modalTransition;
    case 'fade':
      return fadeTransition;
    case 'scale':
      return scaleTransition;
    case 'slide':
    case 'default':
    default:
      return slideFromRightTransition;
  }
};

/**
 * Drawer screen options with gesture support
 */
export const drawerScreenOptions = {
  drawerType: 'slide',
  swipeEnabled: true,
  swipeEdgeWidth: 50,
  drawerStyle: {
    width: '80%',
  },
  // Smooth drawer animation
  drawerContentOptions: {
    activeTintColor: '#e91e63',
    itemStyle: { marginVertical: 5 },
  },
};

/**
 * Performance-optimized stack navigator config
 */
export const stackNavigatorConfig = {
  screenOptions: defaultScreenOptions,
  // Detach inactive screens to save memory
  detachInactiveScreens: true,
  // Use native driver for better performance
  headerMode: 'screen',
};

export default {
  slideFromRightTransition,
  fadeTransition,
  modalTransition,
  scaleTransition,
  defaultScreenOptions,
  modalScreenOptions,
  transparentModalOptions,
  getTransitionConfig,
  drawerScreenOptions,
  stackNavigatorConfig,
};
