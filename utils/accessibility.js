/**
 * Accessibility utilities for ensuring WCAG 2.1 AA compliance
 * Provides helpers for accessibility labels, roles, and validation
 */

/**
 * Generates a descriptive accessibility label for interactive elements
 * @param {string} type - The type of element (button, link, input, etc.)
 * @param {string} action - The action performed (submit, cancel, open, etc.)
 * @param {string} context - Additional context (form name, item name, etc.)
 * @returns {string} - Formatted accessibility label
 */
export const generateAccessibilityLabel = (type, action, context = '') => {
  if (!type || !action) {
    console.warn('generateAccessibilityLabel: type and action are required');
    return '';
  }
  
  const label = context ? `${action} ${context}` : action;
  return label.trim();
};

/**
 * Generates an accessibility hint for interactive elements
 * @param {string} action - The action that will occur
 * @param {string} result - The expected result
 * @returns {string} - Formatted accessibility hint
 */
export const generateAccessibilityHint = (action, result) => {
  if (!action || !result) {
    return '';
  }
  return `${action} to ${result}`;
};

/**
 * Maps common UI elements to their appropriate accessibility roles
 */
export const AccessibilityRoles = {
  BUTTON: 'button',
  LINK: 'link',
  SEARCH: 'search',
  IMAGE: 'image',
  IMAGE_BUTTON: 'imagebutton',
  KEYBOARD_KEY: 'keyboardkey',
  TEXT: 'text',
  ADJUSTABLE: 'adjustable',
  HEADER: 'header',
  SUMMARY: 'summary',
  ALERT: 'alert',
  CHECKBOX: 'checkbox',
  COMBOBOX: 'combobox',
  MENU: 'menu',
  MENUBAR: 'menubar',
  MENUITEM: 'menuitem',
  PROGRESSBAR: 'progressbar',
  RADIO: 'radio',
  RADIOGROUP: 'radiogroup',
  SCROLLBAR: 'scrollbar',
  SPINBUTTON: 'spinbutton',
  SWITCH: 'switch',
  TAB: 'tab',
  TABLIST: 'tablist',
  TIMER: 'timer',
  TOOLBAR: 'toolbar',
};

/**
 * Common accessibility props for interactive elements
 * @param {Object} config - Configuration object
 * @param {string} config.label - Accessibility label
 * @param {string} config.hint - Accessibility hint
 * @param {string} config.role - Accessibility role
 * @param {Object} config.state - Accessibility state (disabled, selected, etc.)
 * @param {boolean} config.disabled - Whether element is disabled
 * @param {boolean} config.selected - Whether element is selected
 * @param {boolean} config.checked - Whether element is checked
 * @returns {Object} - Accessibility props object
 */
export const getAccessibilityProps = ({
  label,
  hint,
  role = AccessibilityRoles.BUTTON,
  state = {},
  disabled = false,
  selected = false,
  checked = undefined,
}) => {
  const props = {
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: role,
    accessibilityState: {
      disabled,
      selected,
      ...state,
    },
  };

  if (hint) {
    props.accessibilityHint = hint;
  }

  if (checked !== undefined) {
    props.accessibilityState.checked = checked;
  }

  return props;
};

/**
 * Validates if an element meets minimum touch target size (44x44 points)
 * @param {number} width - Element width
 * @param {number} height - Element height
 * @returns {boolean} - Whether element meets minimum size
 */
export const meetsMinimumTouchTarget = (width, height) => {
  const MINIMUM_SIZE = 44;
  return width >= MINIMUM_SIZE && height >= MINIMUM_SIZE;
};

/**
 * Calculates hitSlop needed to meet minimum touch target
 * @param {number} width - Current element width
 * @param {number} height - Current element height
 * @returns {Object} - hitSlop object with top, bottom, left, right values
 */
export const calculateHitSlop = (width, height) => {
  const MINIMUM_SIZE = 44;
  
  const horizontalSlop = Math.max(0, Math.ceil((MINIMUM_SIZE - width) / 2));
  const verticalSlop = Math.max(0, Math.ceil((MINIMUM_SIZE - height) / 2));
  
  return {
    top: verticalSlop,
    bottom: verticalSlop,
    left: horizontalSlop,
    right: horizontalSlop,
  };
};

/**
 * Calculates relative luminance for color contrast checking
 * @param {string} color - Hex color code (e.g., '#FFFFFF')
 * @returns {number} - Relative luminance value
 */
const getRelativeLuminance = (color) => {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
};

/**
 * Calculates contrast ratio between two colors
 * @param {string} foreground - Foreground color hex code
 * @param {string} background - Background color hex code
 * @returns {number} - Contrast ratio
 */
export const getContrastRatio = (foreground, background) => {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Checks if color combination meets WCAG AA standards
 * @param {string} foreground - Foreground color hex code
 * @param {string} background - Background color hex code
 * @param {string} level - Text level ('normal' or 'large')
 * @returns {Object} - { passes: boolean, ratio: number, required: number }
 */
export const meetsContrastRequirement = (foreground, background, level = 'normal') => {
  const ratio = getContrastRatio(foreground, background);
  const required = level === 'large' ? 3 : 4.5;
  
  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
  };
};

/**
 * Common accessibility patterns for different component types
 */
export const AccessibilityPatterns = {
  /**
   * Button pattern
   */
  button: (label, hint) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: AccessibilityRoles.BUTTON,
  }),

  /**
   * Link pattern
   */
  link: (label, destination) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: `Navigate to ${destination}`,
    accessibilityRole: AccessibilityRoles.LINK,
  }),

  /**
   * Tab pattern
   */
  tab: (label, isSelected) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: AccessibilityRoles.TAB,
    accessibilityState: { selected: isSelected },
  }),

  /**
   * Checkbox pattern
   */
  checkbox: (label, isChecked) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: AccessibilityRoles.CHECKBOX,
    accessibilityState: { checked: isChecked },
  }),

  /**
   * Switch pattern
   */
  switch: (label, isOn) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: AccessibilityRoles.SWITCH,
    accessibilityState: { checked: isOn },
  }),

  /**
   * Image pattern
   */
  image: (description) => ({
    accessible: true,
    accessibilityLabel: description,
    accessibilityRole: AccessibilityRoles.IMAGE,
  }),

  /**
   * Header pattern
   */
  header: (text, level = 1) => ({
    accessible: true,
    accessibilityLabel: text,
    accessibilityRole: AccessibilityRoles.HEADER,
    accessibilityLevel: level,
  }),

  /**
   * Alert pattern
   */
  alert: (message) => ({
    accessible: true,
    accessibilityLabel: message,
    accessibilityRole: AccessibilityRoles.ALERT,
    accessibilityLiveRegion: 'polite',
  }),
};

/**
 * Validates accessibility props for an element
 * @param {Object} props - Component props
 * @param {string} componentType - Type of component
 * @returns {Object} - { valid: boolean, warnings: string[] }
 */
export const validateAccessibilityProps = (props, componentType) => {
  const warnings = [];
  
  if (!props.accessibilityLabel && !props['aria-label']) {
    warnings.push(`${componentType} is missing accessibilityLabel`);
  }
  
  if (!props.accessibilityRole) {
    warnings.push(`${componentType} is missing accessibilityRole`);
  }
  
  if (props.onPress && props.accessibilityRole !== AccessibilityRoles.BUTTON && 
      props.accessibilityRole !== AccessibilityRoles.LINK) {
    warnings.push(`${componentType} has onPress but role is not button or link`);
  }
  
  return {
    valid: warnings.length === 0,
    warnings,
  };
};

export default {
  generateAccessibilityLabel,
  generateAccessibilityHint,
  AccessibilityRoles,
  getAccessibilityProps,
  meetsMinimumTouchTarget,
  calculateHitSlop,
  getContrastRatio,
  meetsContrastRequirement,
  AccessibilityPatterns,
  validateAccessibilityProps,
};
