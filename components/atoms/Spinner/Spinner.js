/**
 * Spinner component with different sizes
 * Used for loading indicators in buttons and async operations
 */

import React from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const Spinner = ({
  size = 'md',
  color,
  style,
  testID,
  accessibilityLabel = 'Loading',
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'xs':
        return 16;
      case 'sm':
        return 20;
      case 'md':
        return 24;
      case 'lg':
        return 32;
      case 'xl':
        return 40;
      default:
        return size; // Allow custom numeric size
    }
  };

  const getColor = () => {
    return color || theme.colors.primary.main;
  };

  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator
        size={getSizeValue()}
        color={getColor()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

Spinner.propTypes = {
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    PropTypes.number,
  ]),
  color: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string,
  accessibilityLabel: PropTypes.string,
};

export default Spinner;
