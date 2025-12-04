/**
 * Animation configurations for the Khelogames application
 * Defines timing, easing, and duration values for consistent animations
 */

const animations = {
  // Duration values in milliseconds
  duration: {
    fastest: 100,
    fast: 200,
    normal: 300,
    slow: 400,
    slowest: 500,
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Custom cubic bezier curves
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },

  // Common animation presets
  presets: {
    fadeIn: {
      duration: 300,
      easing: 'ease-out',
    },
    fadeOut: {
      duration: 200,
      easing: 'ease-in',
    },
    slideUp: {
      duration: 300,
      easing: 'ease-out',
    },
    slideDown: {
      duration: 300,
      easing: 'ease-out',
    },
    scale: {
      duration: 200,
      easing: 'ease-in-out',
    },
    bounce: {
      duration: 400,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Spring configurations for React Native Animated
  spring: {
    gentle: {
      tension: 120,
      friction: 14,
    },
    standard: {
      tension: 170,
      friction: 26,
    },
    snappy: {
      tension: 210,
      friction: 20,
    },
    bouncy: {
      tension: 180,
      friction: 12,
    },
  },
};

export default animations;
