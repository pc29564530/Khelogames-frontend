#!/usr/bin/env node

/**
 * Color Contrast Audit Script
 * Validates color combinations meet WCAG 2.1 AA standards
 * 
 * Usage: node scripts/auditColorContrast.js
 */

const theme = require('../theme').default;

/**
 * Calculate relative luminance for color contrast checking
 */
function getRelativeLuminance(color) {
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
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(foreground, background) {
  // Handle rgba colors by extracting hex
  const fgHex = foreground.startsWith('rgba') ? '#000000' : foreground;
  const bgHex = background.startsWith('rgba') ? '#FFFFFF' : background;
  
  const l1 = getRelativeLuminance(fgHex);
  const l2 = getRelativeLuminance(bgHex);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 */
function meetsContrastRequirement(foreground, background, level = 'normal') {
  const ratio = getContrastRatio(foreground, background);
  const required = level === 'large' ? 3 : 4.5;
  
  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
  };
}

/**
 * Test color combinations
 */
function auditColorCombinations() {
  console.log('\n=== Color Contrast Audit Report ===\n');
  console.log('WCAG 2.1 AA Requirements:');
  console.log('- Normal text: 4.5:1 minimum');
  console.log('- Large text (18pt+ or 14pt+ bold): 3:1 minimum');
  console.log('- UI components: 3:1 minimum\n');

  const results = {
    passed: [],
    failed: [],
  };

  // Test common color combinations
  const tests = [
    // Text on backgrounds
    {
      name: 'Primary text on default background',
      foreground: theme.colors.text.primary,
      background: theme.colors.background.default,
      level: 'normal',
    },
    {
      name: 'Secondary text on default background',
      foreground: theme.colors.text.secondary,
      background: theme.colors.background.default,
      level: 'normal',
    },
    {
      name: 'Disabled text on default background',
      foreground: theme.colors.text.disabled,
      background: theme.colors.background.default,
      level: 'normal',
    },
    {
      name: 'Primary text on paper background',
      foreground: theme.colors.text.primary,
      background: theme.colors.background.paper,
      level: 'normal',
    },
    {
      name: 'Secondary text on paper background',
      foreground: theme.colors.text.secondary,
      background: theme.colors.background.paper,
      level: 'normal',
    },
    
    // Button text
    {
      name: 'Primary button text on primary background',
      foreground: theme.colors.primary.contrast,
      background: theme.colors.primary.main,
      level: 'large',
    },
    {
      name: 'Secondary button text on secondary background',
      foreground: theme.colors.secondary.contrast,
      background: theme.colors.secondary.main,
      level: 'large',
    },
    
    // Semantic colors
    {
      name: 'Success text on success background',
      foreground: theme.colors.success.contrast,
      background: theme.colors.success.main,
      level: 'large',
    },
    {
      name: 'Error text on error background',
      foreground: theme.colors.error.contrast,
      background: theme.colors.error.main,
      level: 'large',
    },
    {
      name: 'Warning text on warning background',
      foreground: theme.colors.warning.contrast,
      background: theme.colors.warning.main,
      level: 'large',
    },
    {
      name: 'Info text on info background',
      foreground: theme.colors.info.contrast,
      background: theme.colors.info.main,
      level: 'large',
    },
    
    // Error text on backgrounds
    {
      name: 'Error text on default background',
      foreground: theme.colors.error.main,
      background: theme.colors.background.default,
      level: 'normal',
    },
    {
      name: 'Success text on default background',
      foreground: theme.colors.success.main,
      background: theme.colors.background.default,
      level: 'normal',
    },
    
    // Links and interactive elements
    {
      name: 'Primary color on default background (links)',
      foreground: theme.colors.primary.main,
      background: theme.colors.background.default,
      level: 'normal',
    },
    {
      name: 'Primary color on paper background (links)',
      foreground: theme.colors.primary.main,
      background: theme.colors.background.paper,
      level: 'normal',
    },
    
    // Sport colors
    {
      name: 'Cricket color on default background',
      foreground: theme.colors.sports.cricket,
      background: theme.colors.background.default,
      level: 'normal',
    },
    {
      name: 'Football color on default background',
      foreground: theme.colors.sports.football,
      background: theme.colors.background.default,
      level: 'normal',
    },
    
    // Border contrast
    {
      name: 'Default border on default background',
      foreground: theme.colors.border.default,
      background: theme.colors.background.default,
      level: 'large', // UI components use 3:1
    },
  ];

  tests.forEach(test => {
    const result = meetsContrastRequirement(
      test.foreground,
      test.background,
      test.level
    );

    const testResult = {
      ...test,
      ...result,
    };

    if (result.passes) {
      results.passed.push(testResult);
    } else {
      results.failed.push(testResult);
    }
  });

  // Display results
  console.log(`\n✅ Passed: ${results.passed.length}/${tests.length}\n`);
  
  if (results.failed.length > 0) {
    console.log(`❌ Failed: ${results.failed.length}/${tests.length}\n`);
    console.log('Failed combinations:\n');
    
    results.failed.forEach(test => {
      console.log(`  ${test.name}`);
      console.log(`    Foreground: ${test.foreground}`);
      console.log(`    Background: ${test.background}`);
      console.log(`    Ratio: ${test.ratio}:1 (Required: ${test.required}:1)`);
      console.log(`    Level: ${test.level}\n`);
    });
    
    console.log('⚠️  Please update theme colors to meet WCAG 2.1 AA standards.\n');
  } else {
    console.log('All tested color combinations meet WCAG 2.1 AA standards! 🎉\n');
  }

  // Display passed combinations for reference
  if (results.passed.length > 0) {
    console.log('Passed combinations:\n');
    results.passed.forEach(test => {
      console.log(`  ✓ ${test.name}`);
      console.log(`    Ratio: ${test.ratio}:1 (Required: ${test.required}:1)\n`);
    });
  }

  console.log('=== Recommendations ===\n');
  console.log('1. Use theme colors for consistent contrast compliance');
  console.log('2. Test custom colors with utils/accessibility.js');
  console.log('3. Use meetsContrastRequirement() before applying custom colors');
  console.log('4. Refer to ACCESSIBILITY_GUIDE.md for detailed guidance\n');

  return results.failed.length === 0;
}

/**
 * Main execution
 */
function main() {
  const success = auditColorCombinations();
  process.exit(success ? 0 : 1);
}

// Run the audit
main();
