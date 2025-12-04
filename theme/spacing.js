/**
 * Spacing configuration for the Khelogames application
 * Following 8px grid system for consistent spacing
 */

const BASE_UNIT = 8;

const spacing = {
  // Base spacing unit
  unit: BASE_UNIT,

  // Spacing scale (multiples of 8px)
  none: 0,
  xxs: BASE_UNIT * 0.5,  // 4px
  xs: BASE_UNIT,          // 8px
  sm: BASE_UNIT * 1.5,    // 12px
  md: BASE_UNIT * 2,      // 16px
  lg: BASE_UNIT * 3,      // 24px
  xl: BASE_UNIT * 4,      // 32px
  xxl: BASE_UNIT * 5,     // 40px
  xxxl: BASE_UNIT * 6,    // 48px

  // Component-specific spacing
  component: {
    buttonPaddingVertical: BASE_UNIT * 1.5,    // 12px
    buttonPaddingHorizontal: BASE_UNIT * 3,    // 24px
    inputPaddingVertical: BASE_UNIT * 1.5,     // 12px
    inputPaddingHorizontal: BASE_UNIT * 2,     // 16px
    cardPadding: BASE_UNIT * 2,                // 16px
    screenPadding: BASE_UNIT * 2,              // 16px
    sectionSpacing: BASE_UNIT * 3,             // 24px
    listItemPadding: BASE_UNIT * 2,            // 16px
  },

  // Layout spacing
  layout: {
    gutter: BASE_UNIT * 2,        // 16px
    containerPadding: BASE_UNIT * 2, // 16px
    sectionMargin: BASE_UNIT * 4,    // 32px
  },

  // Helper function to get spacing value
  get: (multiplier) => BASE_UNIT * multiplier,
};

export default spacing;
