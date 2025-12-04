/**
 * Main theme configuration for the Khelogames application
 * Exports all theme tokens and provides a unified theme object
 */

import colors from './colors.js';
import typography from './typography.js';
import spacing from './spacing.js';
import shadows from './shadows.js';
import animations from './animations.js';

// Border radius values
const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Z-index values for layering
const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

// Breakpoints for responsive design
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Main theme object
const theme = {
  colors,
  typography,
  spacing,
  shadows,
  animations,
  borderRadius,
  zIndex,
  breakpoints,
};

export default theme;

// Export individual modules for selective imports
export {
  colors,
  typography,
  spacing,
  shadows,
  animations,
  borderRadius,
  zIndex,
  breakpoints,
};
