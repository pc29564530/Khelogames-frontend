/**
 * AnimatedModal - Modal component with slide-up, fade, and scale animations
 * 
 * Features:
 * - Slide-up animation for bottom sheets
 * - Fade animation for overlays
 * - Scale animation for dialogs
 * - Backdrop with fade animation
 * - Configurable animation types
 * 
 * @component
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedModal = ({
  visible,
  onClose,
  children,
  animationType = 'slide', // 'slide', 'fade', 'scale'
  position = 'bottom', // 'bottom', 'center', 'top'
  backdropOpacity = 0.5,
  closeOnBackdropPress = true,
  style,
  contentStyle,
  testID,
}) => {
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: theme.animations.duration.normal,
          useNativeDriver: true,
        }),
        animationType === 'slide'
          ? Animated.spring(slideAnim, {
              toValue: 0,
              ...theme.animations.spring.standard,
              useNativeDriver: true,
            })
          : animationType === 'fade'
          ? Animated.timing(fadeAnim, {
              toValue: 1,
              duration: theme.animations.duration.normal,
              useNativeDriver: true,
            })
          : Animated.spring(scaleAnim, {
              toValue: 1,
              ...theme.animations.spring.gentle,
              useNativeDriver: true,
            }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: theme.animations.duration.fast,
          useNativeDriver: true,
        }),
        animationType === 'slide'
          ? Animated.timing(slideAnim, {
              toValue: SCREEN_HEIGHT,
              duration: theme.animations.duration.fast,
              useNativeDriver: true,
            })
          : animationType === 'fade'
          ? Animated.timing(fadeAnim, {
              toValue: 0,
              duration: theme.animations.duration.fast,
              useNativeDriver: true,
            })
          : Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: theme.animations.duration.fast,
              useNativeDriver: true,
            }),
      ]).start();
    }
  }, [visible, animationType, backdropAnim, slideAnim, fadeAnim, scaleAnim]);

  const handleBackdropPress = () => {
    if (closeOnBackdropPress && onClose) {
      onClose();
    }
  };

  const getContentStyle = () => {
    const baseStyle = [styles.content, contentStyle];

    switch (animationType) {
      case 'slide':
        return [
          ...baseStyle,
          styles[`position_${position}`],
          { transform: [{ translateY: slideAnim }] },
        ];
      case 'fade':
        return [
          ...baseStyle,
          styles.position_center,
          { opacity: fadeAnim },
        ];
      case 'scale':
        return [
          ...baseStyle,
          styles.position_center,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ];
      default:
        return baseStyle;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      testID={testID}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, backdropOpacity],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Content */}
        <Animated.View style={getContentStyle()}>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.text.primary,
  },
  content: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  position_bottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  position_center: {
    alignSelf: 'center',
    marginHorizontal: theme.spacing.lg,
    maxWidth: 400,
  },
  position_top: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});

AnimatedModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  animationType: PropTypes.oneOf(['slide', 'fade', 'scale']),
  position: PropTypes.oneOf(['bottom', 'center', 'top']),
  backdropOpacity: PropTypes.number,
  closeOnBackdropPress: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  contentStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  testID: PropTypes.string,
};

export default AnimatedModal;
