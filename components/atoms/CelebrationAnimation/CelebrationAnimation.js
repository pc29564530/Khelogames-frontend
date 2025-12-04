/**
 * CelebrationAnimation - Celebration animation for goals/wickets
 * 
 * Features:
 * - Confetti-like particle animation
 * - Burst effect with multiple animated elements
 * - Configurable colors and intensity
 * - Auto-dismiss after animation completes
 * 
 * @component
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  Dimensions,
  Vibration,
} from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CelebrationAnimation = ({
  visible,
  onComplete,
  type = 'goal', // 'goal', 'wicket', 'milestone'
  intensity = 'medium', // 'low', 'medium', 'high'
  enableHaptic = true,
}) => {
  const particles = useRef(
    Array.from({ length: 20 }, () => ({
      x: new Animated.Value(SCREEN_WIDTH / 2),
      y: new Animated.Value(SCREEN_HEIGHT / 2),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
    }))
  ).current;

  const burstAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (enableHaptic) {
        // Pattern: short-long-short for celebration
        Vibration.vibrate([0, 50, 100, 100]);
      }

      // Burst animation
      Animated.timing(burstAnim, {
        toValue: 1,
        duration: theme.animations.duration.slow,
        useNativeDriver: true,
      }).start();

      // Particle animations
      const particleAnimations = particles.map((particle, index) => {
        const angle = (index / particles.length) * Math.PI * 2;
        const distance = intensity === 'high' ? 200 : intensity === 'medium' ? 150 : 100;
        const targetX = SCREEN_WIDTH / 2 + Math.cos(angle) * distance;
        const targetY = SCREEN_HEIGHT / 2 + Math.sin(angle) * distance;

        return Animated.parallel([
          Animated.timing(particle.x, {
            toValue: targetX,
            duration: theme.animations.duration.slowest,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: targetY,
            duration: theme.animations.duration.slowest,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: theme.animations.duration.slowest,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 1.5,
              duration: theme.animations.duration.fast,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 0,
              duration: theme.animations.duration.normal,
              useNativeDriver: true,
            }),
          ]),
        ]);
      });

      Animated.parallel(particleAnimations).start(() => {
        // Reset animations
        particles.forEach((particle) => {
          particle.x.setValue(SCREEN_WIDTH / 2);
          particle.y.setValue(SCREEN_HEIGHT / 2);
          particle.opacity.setValue(1);
          particle.scale.setValue(1);
        });
        burstAnim.setValue(0);

        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [visible, particles, burstAnim, intensity, enableHaptic, onComplete]);

  if (!visible) {
    return null;
  }

  const getParticleColor = () => {
    switch (type) {
      case 'goal':
        return theme.colors.success.main;
      case 'wicket':
        return theme.colors.error.main;
      case 'milestone':
        return theme.colors.warning.main;
      default:
        return theme.colors.primary.main;
    }
  };

  const burstScale = burstAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  const burstOpacity = burstAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 0.4, 0],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Burst effect */}
      <Animated.View
        style={[
          styles.burst,
          {
            backgroundColor: getParticleColor(),
            transform: [{ scale: burstScale }],
            opacity: burstOpacity,
          },
        ]}
      />

      {/* Particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              backgroundColor: getParticleColor(),
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burst: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

CelebrationAnimation.propTypes = {
  visible: PropTypes.bool.isRequired,
  onComplete: PropTypes.func,
  type: PropTypes.oneOf(['goal', 'wicket', 'milestone']),
  intensity: PropTypes.oneOf(['low', 'medium', 'high']),
  enableHaptic: PropTypes.bool,
};

export default CelebrationAnimation;
