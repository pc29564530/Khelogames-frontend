/**
 * AnimatedScore - Animated score display component
 * 
 * Features:
 * - Smooth number transitions with spring animation
 * - Celebration animations for score increases
 * - Color pulse on change
 * - Configurable animation intensity
 * 
 * @component
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  Vibration,
} from 'react-native';
import PropTypes from 'prop-types';
import { Text } from '../Text';
import theme from '../../../theme';

const AnimatedScore = ({
  score,
  previousScore,
  size = 'md',
  color = theme.colors.text.primary,
  celebrationColor = theme.colors.success.main,
  enableCelebration = true,
  enableHaptic = true,
  style,
  testID,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (score !== previousScore && previousScore !== undefined) {
      const isIncrease = score > previousScore;
      
      if (isIncrease && enableCelebration) {
        // Celebration animation for score increase
        if (enableHaptic) {
          Vibration.vibrate(20);
        }

        Animated.sequence([
          // Scale up
          Animated.spring(scaleAnim, {
            toValue: 1.3,
            ...theme.animations.spring.bouncy,
            useNativeDriver: true,
          }),
          // Scale back
          Animated.spring(scaleAnim, {
            toValue: 1,
            ...theme.animations.spring.standard,
            useNativeDriver: true,
          }),
        ]).start();

        // Color pulse
        Animated.sequence([
          Animated.timing(colorAnim, {
            toValue: 1,
            duration: theme.animations.duration.fast,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnim, {
            toValue: 0,
            duration: theme.animations.duration.slow,
            useNativeDriver: false,
          }),
        ]).start();

        // Bounce animation
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: theme.animations.duration.fastest,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 0,
            ...theme.animations.spring.bouncy,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Simple pulse for score decrease
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: theme.animations.duration.fastest,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            ...theme.animations.spring.standard,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [score, previousScore, enableCelebration, enableHaptic, scaleAnim, colorAnim, bounceAnim]);

  const animatedColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [color, celebrationColor],
  });

  const fontSize = {
    sm: theme.typography.fontSize.lg,
    md: theme.typography.fontSize.xl,
    lg: theme.typography.fontSize['2xl'],
  }[size];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: bounceAnim },
          ],
        },
        style,
      ]}
      testID={testID}
    >
      <Animated.Text
        style={[
          styles.score,
          {
            fontSize,
            color: animatedColor,
          },
        ]}
      >
        {score}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontWeight: theme.typography.fontWeight.bold,
    fontFamily: theme.typography.fontFamily.bold,
  },
});

AnimatedScore.propTypes = {
  score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  previousScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.string,
  celebrationColor: PropTypes.string,
  enableCelebration: PropTypes.bool,
  enableHaptic: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string,
};

export default AnimatedScore;
