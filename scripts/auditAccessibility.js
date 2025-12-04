#!/usr/bin/env node

/**
 * Accessibility Audit Script
 * Scans the codebase for accessibility issues
 * 
 * Usage: node scripts/auditAccessibility.js
 */

const fs = require('fs');
const path = require('path');

const MINIMUM_TOUCH_TARGET = 44;
const ISSUES = {
  missingAccessibilityLabel: [],
  missingAccessibilityRole: [],
  smallTouchTarget: [],
  missingHitSlop: [],
};

/**
 * Recursively find all JS files in a directory
 */
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, coverage, and other build directories
      if (!['node_modules', 'coverage', 'android', 'ios', '.git'].includes(file)) {
        findJSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Check if a file contains TouchableOpacity or Pressable without accessibility props
 */
function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let inTouchable = false;
  let touchableStart = 0;
  let touchableContent = '';
  let hasAccessibilityLabel = false;
  let hasAccessibilityRole = false;
  let hasMinHeight = false;
  let hasHitSlop = false;

  lines.forEach((line, index) => {
    // Check for TouchableOpacity or Pressable
    if (line.match(/<(TouchableOpacity|Pressable|TouchableWithoutFeedback)/)) {
      inTouchable = true;
      touchableStart = index + 1;
      touchableContent = line;
      hasAccessibilityLabel = line.includes('accessibilityLabel');
      hasAccessibilityRole = line.includes('accessibilityRole');
      hasMinHeight = line.includes('minHeight') || line.includes('minWidth');
      hasHitSlop = line.includes('hitSlop');
    } else if (inTouchable) {
      touchableContent += '\n' + line;

      if (!hasAccessibilityLabel && line.includes('accessibilityLabel')) {
        hasAccessibilityLabel = true;
      }
      if (!hasAccessibilityRole && line.includes('accessibilityRole')) {
        hasAccessibilityRole = true;
      }
      if (!hasMinHeight && (line.includes('minHeight') || line.includes('minWidth'))) {
        hasMinHeight = true;
      }
      if (!hasHitSlop && line.includes('hitSlop')) {
        hasHitSlop = true;
      }

      // Check for closing tag
      if (line.match(/<\/(TouchableOpacity|Pressable|TouchableWithoutFeedback)>/) || line.includes('/>')) {
        // Touchable component ended, check for issues
        if (!hasAccessibilityLabel) {
          ISSUES.missingAccessibilityLabel.push({
            file: filePath,
            line: touchableStart,
            snippet: touchableContent.substring(0, 100),
          });
        }

        if (!hasAccessibilityRole) {
          ISSUES.missingAccessibilityRole.push({
            file: filePath,
            line: touchableStart,
            snippet: touchableContent.substring(0, 100),
          });
        }

        if (!hasMinHeight && !hasHitSlop) {
          ISSUES.smallTouchTarget.push({
            file: filePath,
            line: touchableStart,
            snippet: touchableContent.substring(0, 100),
          });
        }

        // Reset
        inTouchable = false;
        touchableContent = '';
        hasAccessibilityLabel = false;
        hasAccessibilityRole = false;
        hasMinHeight = false;
        hasHitSlop = false;
      }
    }
  });
}

/**
 * Generate report
 */
function generateReport() {
  console.log('\n=== Accessibility Audit Report ===\n');

  const totalIssues = 
    ISSUES.missingAccessibilityLabel.length +
    ISSUES.missingAccessibilityRole.length +
    ISSUES.smallTouchTarget.length;

  if (totalIssues === 0) {
    console.log('✅ No accessibility issues found!\n');
    return;
  }

  console.log(`Found ${totalIssues} potential accessibility issues:\n`);

  if (ISSUES.missingAccessibilityLabel.length > 0) {
    console.log(`\n⚠️  Missing accessibilityLabel (${ISSUES.missingAccessibilityLabel.length} issues):`);
    ISSUES.missingAccessibilityLabel.slice(0, 10).forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.snippet.trim()}`);
    });
    if (ISSUES.missingAccessibilityLabel.length > 10) {
      console.log(`  ... and ${ISSUES.missingAccessibilityLabel.length - 10} more`);
    }
  }

  if (ISSUES.missingAccessibilityRole.length > 0) {
    console.log(`\n⚠️  Missing accessibilityRole (${ISSUES.missingAccessibilityRole.length} issues):`);
    ISSUES.missingAccessibilityRole.slice(0, 10).forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.snippet.trim()}`);
    });
    if (ISSUES.missingAccessibilityRole.length > 10) {
      console.log(`  ... and ${ISSUES.missingAccessibilityRole.length - 10} more`);
    }
  }

  if (ISSUES.smallTouchTarget.length > 0) {
    console.log(`\n⚠️  Potential small touch targets (${ISSUES.smallTouchTarget.length} issues):`);
    console.log('  (Missing both minHeight/minWidth and hitSlop)');
    ISSUES.smallTouchTarget.slice(0, 10).forEach(issue => {
      console.log(`  ${issue.file}:${issue.line}`);
      console.log(`    ${issue.snippet.trim()}`);
    });
    if (ISSUES.smallTouchTarget.length > 10) {
      console.log(`  ... and ${ISSUES.smallTouchTarget.length - 10} more`);
    }
  }

  console.log('\n=== Recommendations ===\n');
  console.log('1. Add accessibilityLabel to all interactive elements');
  console.log('2. Add accessibilityRole to indicate element type');
  console.log('3. Ensure minimum 44x44pt touch targets using:');
  console.log('   - minHeight/minWidth styles');
  console.log('   - hitSlop prop for small visual elements');
  console.log('   - AccessibleTouchable component (auto-handles sizing)');
  console.log('\nSee ACCESSIBILITY_GUIDE.md for detailed implementation guidance.\n');
}

/**
 * Main execution
 */
function main() {
  console.log('Starting accessibility audit...\n');

  const componentsDir = path.join(process.cwd(), 'components');
  const screenDir = path.join(process.cwd(), 'screen');
  const navigationDir = path.join(process.cwd(), 'navigation');

  const files = [
    ...findJSFiles(componentsDir),
    ...findJSFiles(screenDir),
    ...findJSFiles(navigationDir),
  ];

  console.log(`Scanning ${files.length} files...\n`);

  files.forEach(file => {
    auditFile(file);
  });

  generateReport();
}

// Run the audit
main();
