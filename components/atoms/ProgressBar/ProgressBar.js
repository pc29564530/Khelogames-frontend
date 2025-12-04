/**
 * ProgressBar component for long operations
 * Shows determinate or indeterminate progress
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const ProgressBar = ({
  progress = 0,
  indeterminate = false,
  height = 4,
  color,
  backgroundColor,
  style,
  testID,
  accessibilityLabel,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const indeterminateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (indeterminate) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(indeterminateAnimation, {
            toValue: 1,
            duration: 1500,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1),
            useNativeDriver: true,
          }),
          Animated.timing(indeterminateAnimation, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

      animation.start();

      return () => animation.stop();
    } else {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: theme.animations.duration.normal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [progress, indeterminate, animatedValue, indeterminateAnimation]);

  const getProgressColor = () => {
    return color || theme.colors.primary.main;
  };

  const getBackgroundColor = () => {
    return backgroundColor || theme.colors.border.light;
  };

  const progressWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const indeterminateTranslateX = indeterminateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 400],
  });

  const progressPercentage = Math.round(progress * 100);

  return (
    <View
      style={[
        styles.container,
        { height, backgroundColor: getBackgroundColor() },
        style,
      ]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || `Progress ${progressPercentage}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: progressPercentage,
      }}
    >
      {indeterminate ? (
        <Animated.View
          style={[
            styles.indeterminateBar,
            {
              backgroundColor: getProgressColor(),
              transform: [{ translateX: indeterminateTranslateX }],
            },
          ]}
        />
      ) : (
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  indeterminateBar: {
    position: 'absolute',
    width: 200,
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
});

ProgressBar.propTypes = {
  progress: PropTypes.number,
  indeterminate: PropTypes.bool,
  height: PropTypes.number,
  color: PropTypes.string,
  backgroundColor: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string,
  accessibilityLabel: PropTypes.string,
};

export default ProgressBar;
