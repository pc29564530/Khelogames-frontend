/**
 * Icon component wrapper with consistent sizing
 * Provides a standardized way to render icons across the application
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const Icon = ({
  children,
  size = 'md',
  color,
  accessibilityLabel,
  testID,
  style,
}) => {
  const iconStyles = [
    styles.base,
    styles[`size_${size}`],
    color && { color },
    style,
  ];

  return (
    <View
      style={iconStyles}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Size variants
  size_xs: {
    width: 16,
    height: 16,
  },
  size_sm: {
    width: 20,
    height: 20,
  },
  size_md: {
    width: 24,
    height: 24,
  },
  size_lg: {
    width: 32,
    height: 32,
  },
  size_xl: {
    width: 40,
    height: 40,
  },
});

Icon.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.string,
  accessibilityLabel: PropTypes.string,
  testID: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default Icon;
