/**
 * useScalableFonts hook
 * Provides utilities for working with scalable fonts that respect system settings
 */

import { useState, useEffect, useMemo } from 'react';
import { PixelRatio } from 'react-native';
import {
  getFontScale,
  scaleFontSize,
  isLargeTextEnabled,
  getFontSizeCategory,
  getScaledVariant,
} from '../utils/fontScaling';

/**
 * Hook for getting current font scale
 * @returns {number} - Current font scale
 */
export const useFontScale = () => {
  const [fontScale, setFontScale] = useState(getFontScale());

  useEffect(() => {
    // Update font scale if it changes (rare, but possible)
    const checkFontScale = () => {
      const currentScale = getFontScale();
      if (currentScale !== fontScale) {
        setFontScale(currentScale);
      }
    };

    // Check periodically (font scale changes are rare)
    const interval = setInterval(checkFontScale, 5000);

    return () => clearInterval(interval);
  }, [fontScale]);

  return fontScale;
};

/**
 * Hook for getting scaled font size
 * @param {number} baseSize - Base font size
 * @param {number} maxScale - Maximum scale factor
 * @returns {number} - Scaled font size
 */
export const useScaledFontSize = (baseSize, maxScale = 1.5) => {
  const fontScale = useFontScale();
  
  return useMemo(() => {
    return scaleFontSize(baseSize, maxScale);
  }, [baseSize, maxScale, fontScale]);
};

/**
 * Hook for checking if large text is enabled
 * @returns {boolean} - Whether large text is enabled
 */
export const useIsLargeText = () => {
  const fontScale = useFontScale();
  
  return useMemo(() => {
    return isLargeTextEnabled();
  }, [fontScale]);
};

/**
 * Hook for getting font size category
 * @returns {string} - Font size category
 */
export const useFontSizeCategory = () => {
  const fontScale = useFontScale();
  
  return useMemo(() => {
    return getFontSizeCategory();
  }, [fontScale]);
};

/**
 * Hook for getting scaled typography variant
 * @param {Object} variant - Typography variant
 * @returns {Object} - Scaled variant
 */
export const useScaledVariant = (variant) => {
  const fontScale = useFontScale();
  
  return useMemo(() => {
    return getScaledVariant(variant);
  }, [variant, fontScale]);
};

/**
 * Hook for creating responsive styles based on font scale
 * @param {Function} styleCreator - Function that creates styles based on font scale
 * @returns {Object} - Responsive styles
 */
export const useResponsiveStyles = (styleCreator) => {
  const fontScale = useFontScale();
  const isLargeText = useIsLargeText();
  const category = useFontSizeCategory();
  
  return useMemo(() => {
    return styleCreator({
      fontScale,
      isLargeText,
      category,
    });
  }, [styleCreator, fontScale, isLargeText, category]);
};

/**
 * Hook for adaptive layout based on text size
 * Returns layout adjustments for large text
 * @returns {Object} - Layout adjustments
 */
export const useAdaptiveLayout = () => {
  const isLargeText = useIsLargeText();
  const category = useFontSizeCategory();
  
  return useMemo(() => {
    const adjustments = {
      paddingMultiplier: 1,
      spacingMultiplier: 1,
      minHeight: 44,
    };

    if (category === 'large') {
      adjustments.paddingMultiplier = 1.2;
      adjustments.spacingMultiplier = 1.2;
      adjustments.minHeight = 52;
    } else if (category === 'extra-large') {
      adjustments.paddingMultiplier = 1.4;
      adjustments.spacingMultiplier = 1.4;
      adjustments.minHeight = 60;
    }

    return adjustments;
  }, [isLargeText, category]);
};

export default {
  useFontScale,
  useScaledFontSize,
  useIsLargeText,
  useFontSizeCategory,
  useScaledVariant,
  useResponsiveStyles,
  useAdaptiveLayout,
};
