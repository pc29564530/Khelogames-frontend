/**
 * Color palette for the Khelogames application
 * Defines primary, secondary, background, surface, and semantic colors
 */

const colors = {
  // Primary colors - Main brand colors
  primary: {
    main: '#1E88E5',
    light: '#42A5F5',
    dark: '#1565C0',
    contrast: '#FFFFFF',
  },

  // Secondary colors - Accent colors
  secondary: {
    main: '#26A69A',
    light: '#4DB6AC',
    dark: '#00897B',
    contrast: '#FFFFFF',
  },

  // Background colors
  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF',
    elevated: '#FAFAFA',
  },

  // Surface colors
  surface: {
    default: '#FFFFFF',
    elevated: '#FAFAFA',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Semantic colors
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    contrast: '#FFFFFF',
  },

  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
    contrast: '#FFFFFF',
  },

  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    contrast: '#000000',
  },

  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrast: '#FFFFFF',
  },

  // Text colors
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.60)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    hint: 'rgba(0, 0, 0, 0.38)',
    inverse: '#FFFFFF',
  },

  // Border colors
  border: {
    default: 'rgba(0, 0, 0, 0.12)',
    light: 'rgba(0, 0, 0, 0.08)',
    dark: 'rgba(0, 0, 0, 0.24)',
  },

  // Divider colors
  divider: 'rgba(0, 0, 0, 0.12)',

  // Sport-specific colors
  sports: {
    cricket: '#4CAF50',
    football: '#2196F3',
  },

  // Status colors
  status: {
    online: '#4CAF50',
    offline: '#9E9E9E',
    away: '#FF9800',
    busy: '#F44336',
  },
};

export default colors;
