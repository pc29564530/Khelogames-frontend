/**
 * FocusIndicator - Visual focus indicator for keyboard navigation
 * Provides clear visual feedback when elements receive focus
 */

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const FocusIndicator = ({
  isFocused,
  children,
  style,
  indicatorStyle,
  indicatorColor = theme.colors.primary.main,
  indicatorWidth = 2,
  borderRadius = theme.borderRadius.md,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, animatedValue]);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', indicatorColor],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor,
          borderWidth: indicatorWidth,
          borderRadius,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

FocusIndicator.propTypes = {
  isFocused: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  indicatorStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  indicatorColor: PropTypes.string,
  indicatorWidth: PropTypes.number,
  borderRadius: PropTypes.number,
};

export default FocusIndicator;
