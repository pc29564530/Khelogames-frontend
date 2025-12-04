/**
 * AccessibleTouchable - A wrapper for TouchableOpacity with enforced accessibility
 * Ensures all interactive elements have proper accessibility labels and roles
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { calculateHitSlop, AccessibilityRoles } from '../../../utils/accessibility';

const AccessibleTouchable = ({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = AccessibilityRoles.BUTTON,
  disabled = false,
  selected = false,
  checked,
  style,
  hitSlop,
  ensureMinimumTouchTarget = true,
  testID,
  ...rest
}) => {
  // Warn in development if accessibility label is missing
  if (__DEV__ && !accessibilityLabel) {
    console.warn(
      'AccessibleTouchable: accessibilityLabel is required for accessibility compliance'
    );
  }

  // Calculate hitSlop if needed to meet minimum touch target
  const calculatedHitSlop = ensureMinimumTouchTarget && !hitSlop
    ? calculateHitSlop(44, 44) // Assume minimum if not specified
    : hitSlop;

  const accessibilityState = {
    disabled,
    ...(selected !== undefined && { selected }),
    ...(checked !== undefined && { checked }),
  };

  return (
    <TouchableOpacity
      style={[styles.touchable, style]}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      hitSlop={calculatedHitSlop}
      testID={testID}
      activeOpacity={0.7}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

AccessibleTouchable.propTypes = {
  children: PropTypes.node.isRequired,
  onPress: PropTypes.func.isRequired,
  accessibilityLabel: PropTypes.string.isRequired,
  accessibilityHint: PropTypes.string,
  accessibilityRole: PropTypes.string,
  disabled: PropTypes.bool,
  selected: PropTypes.bool,
  checked: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  hitSlop: PropTypes.object,
  ensureMinimumTouchTarget: PropTypes.bool,
  testID: PropTypes.string,
};

export default AccessibleTouchable;
