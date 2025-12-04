/**
 * Custom hook for accessing theme configuration
 * Provides easy access to theme tokens throughout the application
 */

import { useMemo } from 'react';
import theme from '../theme';

/**
 * Hook to access the application theme
 * @returns {Object} Theme object with colors, typography, spacing, etc.
 */
export const useTheme = () => {
  return useMemo(() => theme, []);
};

export default useTheme;
