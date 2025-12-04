/**
 * Skeleton component with shimmer animation
 * Used for loading states to show placeholder content
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

const Skeleton = ({
  width = '100%',
  height = 20,
  borderRadius = theme.borderRadius.sm,
  style,
  variant = 'rect',
  testID,
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  const getVariantStyle = () => {
    switch (variant) {
      case 'circle':
        return {
          width: typeof width === 'number' ? width : height,
          height: height,
          borderRadius: height / 2,
        };
      case 'text':
        return {
          width,
          height: height || 16,
          borderRadius: theme.borderRadius.sm,
        };
      case 'rect':
      default:
        return {
          width,
          height,
          borderRadius,
        };
    }
  };

  return (
    <View
      style={[
        styles.container,
        getVariantStyle(),
        style,
      ]}
      testID={testID}
      accessible={true}
      accessibilityLabel="Loading content"
      accessibilityRole="progressbar"
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            opacity,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.border.light,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

Skeleton.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.number,
  borderRadius: PropTypes.number,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  variant: PropTypes.oneOf(['rect', 'circle', 'text']),
  testID: PropTypes.string,
};

export default Skeleton;
