/**
 * AnimatedOverlay - Overlay component with fade animation
 * 
 * Features:
 * - Smooth fade in/out animation
 * - Configurable opacity
 * - Optional press handler
 * 
 * @component
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const AnimatedOverlay = ({
  visible,
  onPress,
  opacity = 0.5,
  color = theme.colors.text.primary,
  style,
  testID,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: visible ? theme.animations.duration.normal : theme.animations.duration.fast,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible && fadeAnim._value === 0) {
    return null;
  }

  const overlayStyle = [
    styles.overlay,
    {
      backgroundColor: color,
      opacity: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, opacity],
      }),
    },
    style,
  ];

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View style={overlayStyle} testID={testID} />
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

AnimatedOverlay.propTypes = {
  visible: PropTypes.bool.isRequired,
  onPress: PropTypes.func,
  opacity: PropTypes.number,
  color: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string,
};

export default AnimatedOverlay;
