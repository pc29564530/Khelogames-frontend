/**
 * AnimatedListItem - Wrapper component for list items with enter/exit animations
 * 
 * Features:
 * - Fade-in and slide-up animation on mount
 * - Swipe actions with animation support
 * - Configurable animation timing
 * 
 * @component
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const AnimatedListItem = ({
  children,
  index = 0,
  onSwipeLeft,
  onSwipeRight,
  swipeEnabled = false,
  animateOnMount = true,
  delay = 0,
  style,
  testID,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;

  // Animate item entrance
  useEffect(() => {
    if (animateOnMount) {
      const animationDelay = delay || index * 50; // Stagger animation based on index
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: theme.animations.duration.normal,
          delay: animationDelay,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: theme.animations.duration.normal,
          delay: animationDelay,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [animateOnMount, index, delay, fadeAnim, slideAnim]);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => swipeEnabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return swipeEnabled && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        swipeAnim.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;

        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          // Complete the swipe
          Animated.timing(swipeAnim, {
            toValue: dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
            duration: theme.animations.duration.fast,
            useNativeDriver: true,
          }).start(() => {
            if (dx > 0 && onSwipeRight) {
              onSwipeRight();
            } else if (dx < 0 && onSwipeLeft) {
              onSwipeLeft();
            }
            // Reset position
            swipeAnim.setValue(0);
          });
        } else {
          // Snap back to original position
          Animated.spring(swipeAnim, {
            toValue: 0,
            ...theme.animations.spring.standard,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [
      { translateY: slideAnim },
      { translateX: swipeAnim },
    ],
  };

  return (
    <Animated.View
      style={[styles.container, animatedStyle, style]}
      {...(swipeEnabled ? panResponder.panHandlers : {})}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

AnimatedListItem.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number,
  onSwipeLeft: PropTypes.func,
  onSwipeRight: PropTypes.func,
  swipeEnabled: PropTypes.bool,
  animateOnMount: PropTypes.bool,
  delay: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string,
};

export default AnimatedListItem;
