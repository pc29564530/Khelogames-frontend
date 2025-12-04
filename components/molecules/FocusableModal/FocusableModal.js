/**
 * FocusableModal - Modal component with proper focus management
 * Implements focus trap to keep focus within modal when open
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import { useFocusTrap, useScreenReaderAnnouncement } from '../../../hooks/useFocusManagement';
import theme from '../../../theme';

const FocusableModal = ({
  visible,
  onClose,
  children,
  title,
  dismissible = true,
  animationType = 'fade',
  transparent = true,
  accessibilityLabel,
  testID,
  style,
}) => {
  const { trapRef, restoreFocus } = useFocusTrap(visible);
  const announce = useScreenReaderAnnouncement();

  useEffect(() => {
    if (visible && title) {
      // Announce modal opening to screen readers
      announce(`${title} dialog opened`, { delay: 100 });
    }
  }, [visible, title, announce]);

  const handleClose = () => {
    if (dismissible && onClose) {
      restoreFocus();
      onClose();
    }
  };

  const handleBackdropPress = () => {
    if (dismissible) {
      handleClose();
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      animationType={animationType}
      transparent={transparent}
      accessibilityViewIsModal={true}
      testID={testID}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          ref={trapRef}
          style={[styles.modal, style]}
          accessible={true}
          accessibilityRole="dialog"
          accessibilityLabel={accessibilityLabel || title || 'Dialog'}
          accessibilityViewIsModal={true}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxWidth: '90%',
    maxHeight: '80%',
    ...theme.shadows.modal,
  },
});

FocusableModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  dismissible: PropTypes.bool,
  animationType: PropTypes.oneOf(['none', 'slide', 'fade']),
  transparent: PropTypes.bool,
  accessibilityLabel: PropTypes.string,
  testID: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default FocusableModal;
