/**
 * Font scaling utilities for dynamic text sizing
 * Supports system font size preferences for accessibility
 */

import { PixelRatio, Platform } from 'react-native';

/**
 * Get the current font scale from system settings
 * @returns {number} - Font scale multiplier (1.0 = normal, 1.5 = large, etc.)
 */
export const getFontScale = () => {
  return PixelRatio.getFontScale();
};

/**
 * Scale a font size based on system font scale
 * @param {number} size - Base font size
 * @param {number} maxScale - Maximum scale factor (default: 1.5)
 * @returns {number} - Scaled font size
 */
export const scaleFontSize = (size, maxScale = 1.5) => {
  const scale = getFontScale();
  const limitedScale = Math.min(scale, maxScale);
  return Math.round(size * limitedScale);
};

/**
 * Scale a font size with platform-specific adjustments
 * @param {number} size - Base font size
 * @returns {number} - Scaled font size
 */
export const platformScaleFontSize = (size) => {
  const scale = getFontScale();
  
  // iOS handles font scaling well, Android may need adjustments
  if (Platform.OS === 'android') {
    // Limit Android scaling to prevent layout issues
    const limitedScale = Math.min(scale, 1.3);
    return Math.round(size * limitedScale);
  }
  
  return Math.round(size * scale);
};

/**
 * Get responsive font size based on screen width
 * @param {number} baseSize - Base font size
 * @param {number} screenWidth - Current screen width
 * @returns {number} - Responsive font size
 */
export const getResponsiveFontSize = (baseSize, screenWidth) => {
  // Base width for calculations (iPhone 11 Pro width)
  const baseWidth = 375;
  
  // Calculate scale factor
  const scale = screenWidth / baseWidth;
  
  // Apply scale with limits
  const minScale = 0.85;
  const maxScale = 1.15;
  const limitedScale = Math.max(minScale, Math.min(scale, maxScale));
  
  return Math.round(baseSize * limitedScale);
};

/**
 * Check if large text is enabled in system settings
 * @returns {boolean} - Whether large text is enabled
 */
export const isLargeTextEnabled = () => {
  const scale = getFontScale();
  return scale > 1.2;
};

/**
 * Get accessibility font size category
 * @returns {string} - 'small' | 'normal' | 'large' | 'extra-large'
 */
export const getFontSizeCategory = () => {
  const scale = getFontScale();
  
  if (scale <= 0.85) return 'small';
  if (scale <= 1.15) return 'normal';
  if (scale <= 1.5) return 'large';
  return 'extra-large';
};

/**
 * Calculate line height based on font size
 * Ensures adequate spacing for larger text
 * @param {number} fontSize - Font size
 * @param {number} baseLineHeight - Base line height multiplier (default: 1.5)
 * @returns {number} - Calculated line height
 */
export const calculateLineHeight = (fontSize, baseLineHeight = 1.5) => {
  const scale = getFontScale();
  
  // Increase line height for larger text
  if (scale > 1.3) {
    return Math.round(fontSize * (baseLineHeight + 0.1));
  }
  
  return Math.round(fontSize * baseLineHeight);
};

/**
 * Get scaled typography variant
 * @param {Object} variant - Typography variant object
 * @returns {Object} - Scaled variant
 */
export const getScaledVariant = (variant) => {
  const scale = getFontScale();
  
  return {
    ...variant,
    fontSize: scaleFontSize(variant.fontSize),
    lineHeight: calculateLineHeight(
      scaleFontSize(variant.fontSize),
      variant.lineHeight
    ),
  };
};

/**
 * Create scalable style object
 * @param {Object} styles - Style object with fontSize
 * @returns {Object} - Scaled style object
 */
export const createScalableStyle = (styles) => {
  if (!styles.fontSize) return styles;
  
  return {
    ...styles,
    fontSize: scaleFontSize(styles.fontSize),
    ...(styles.lineHeight && {
      lineHeight: calculateLineHeight(scaleFontSize(styles.fontSize)),
    }),
  };
};

/**
 * Font scaling presets for common scenarios
 */
export const FontScalingPresets = {
  /**
   * No scaling - fixed size
   */
  none: (size) => size,

  /**
   * Limited scaling - prevents extreme sizes
   */
  limited: (size) => scaleFontSize(size, 1.3),

  /**
   * Normal scaling - respects system settings
   */
  normal: (size) => scaleFontSize(size, 1.5),

  /**
   * Full scaling - allows maximum accessibility
   */
  full: (size) => scaleFontSize(size, 2.0),
};

/**
 * Validate if layout can accommodate scaled text
 * @param {number} containerHeight - Container height
 * @param {number} fontSize - Font size
 * @param {number} lineCount - Number of lines
 * @returns {boolean} - Whether text fits
 */
export const validateTextFit = (containerHeight, fontSize, lineCount = 1) => {
  const scaledFontSize = scaleFontSize(fontSize);
  const lineHeight = calculateLineHeight(scaledFontSize);
  const totalHeight = lineHeight * lineCount;
  
  return totalHeight <= containerHeight;
};

/**
 * Get recommended minimum container height for text
 * @param {number} fontSize - Font size
 * @param {number} lineCount - Number of lines
 * @returns {number} - Recommended height
 */
export const getRecommendedContainerHeight = (fontSize, lineCount = 1) => {
  const scaledFontSize = scaleFontSize(fontSize);
  const lineHeight = calculateLineHeight(scaledFontSize);
  const padding = 16; // Standard padding
  
  return (lineHeight * lineCount) + padding;
};

export default {
  getFontScale,
  scaleFontSize,
  platformScaleFontSize,
  getResponsiveFontSize,
  isLargeTextEnabled,
  getFontSizeCategory,
  calculateLineHeight,
  getScaledVariant,
  createScalableStyle,
  FontScalingPresets,
  validateTextFit,
  getRecommendedContainerHeight,
};
