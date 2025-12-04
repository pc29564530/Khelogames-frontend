/**
 * AnimatedStat - Animated statistic display with smooth transitions
 * 
 * Features:
 * - Smooth number counting animation
 * - Configurable duration and easing
 * - Support for decimal values
 * - Optional prefix/suffix
 * 
 * @component
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const AnimatedStat = ({
  value,
  previousValue = 0,
  duration = 500,
  decimals = 0,
  prefix = '',
  suffix = '',
  size = 'md',
  color = theme.colors.text.primary,
  style,
  testID,
}) => {
  const animatedValue = useRef(new Animated.Value(previousValue)).current;
  const displayValue = useRef(previousValue);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    const listenerId = animatedValue.addListener(({ value: currentValue }) => {
      displayValue.current = currentValue;
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value, duration, animatedValue]);

  const fontSize = {
    sm: theme.typography.fontSize.md,
    md: theme.typography.fontSize.lg,
    lg: theme.typography.fontSize.xl,
  }[size];

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Animated.Text
        style={[
          styles.text,
          {
            fontSize,
            color,
            fontWeight: theme.typography.fontWeight.semibold,
          },
        ]}
      >
        {animatedValue.interpolate({
          inputRange: [Math.min(previousValue, value), Math.max(previousValue, value)],
          outputRange: [
            `${prefix}${previousValue.toFixed(decimals)}${suffix}`,
            `${prefix}${value.toFixed(decimals)}${suffix}`,
          ],
        })}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: theme.typography.fontFamily.medium,
  },
});

AnimatedStat.propTypes = {
  value: PropTypes.number.isRequired,
  previousValue: PropTypes.number,
  duration: PropTypes.number,
  decimals: PropTypes.number,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string,
};

export default AnimatedStat;
