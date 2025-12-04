/**
 * Button component with variants and accessibility support
 * Supports primary, secondary, outline, and ghost variants with different sizes
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  Animated,
  Vibration,
} from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  textStyle,
  enableHaptic = true,
  enableAnimation = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  // Animate button press with scale effect
  const animatePress = () => {
    if (!enableAnimation) return;
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: theme.animations.duration.fastest,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: theme.animations.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Loading spinner rotation animation
  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      loadingRotation.setValue(0);
    }
  }, [loading, loadingRotation]);

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      // Trigger haptic feedback
      if (enableHaptic) {
        Vibration.vibrate(10);
      }
      
      // Trigger press animation
      animatePress();
      
      // Call the actual onPress handler
      onPress();
    }
  };

  const spin = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={buttonStyles}
        onPress={handlePress}
        disabled={disabled || loading}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        testID={testID}
        activeOpacity={0.7}
      >
        {loading ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <ActivityIndicator
              color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary.main : theme.colors.primary.contrast}
              size="small"
            />
          </Animated.View>
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={textStyles}>{children}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.button,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.spacing.xs,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary.main,
  },
  secondary: {
    backgroundColor: theme.colors.secondary.main,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  size_sm: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: theme.spacing.component.buttonPaddingVertical,
    paddingHorizontal: theme.spacing.component.buttonPaddingHorizontal,
    minHeight: 44, // Meets accessibility minimum touch target
  },
  size_lg: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 52,
  },

  // Text styles
  text: {
    ...theme.typography.variants.button,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  text_primary: {
    color: theme.colors.primary.contrast,
  },
  text_secondary: {
    color: theme.colors.secondary.contrast,
  },
  text_outline: {
    color: theme.colors.primary.main,
  },
  text_ghost: {
    color: theme.colors.primary.main,
  },

  // Text sizes
  textSize_sm: {
    fontSize: theme.typography.fontSize.sm,
  },
  textSize_md: {
    fontSize: theme.typography.fontSize.md,
  },
  textSize_lg: {
    fontSize: theme.typography.fontSize.lg,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.5,
  },
});

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  onPress: PropTypes.func.isRequired,
  accessibilityLabel: PropTypes.string.isRequired,
  accessibilityHint: PropTypes.string,
  testID: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  enableHaptic: PropTypes.bool,
  enableAnimation: PropTypes.bool,
};

export default Button;
