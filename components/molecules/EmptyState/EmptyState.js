/**
 * EmptyState component for displaying empty data scenarios
 * Provides contextual messaging, illustrations, and actions for empty states
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../atoms/Text/Text';
import Button from '../../atoms/Button/Button';
import Icon from '../../atoms/Icon/Icon';
import theme from '../../../theme';

const EmptyState = ({
  icon,
  image,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'default',
  testID,
}) => {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${message}`}
      testID={testID}
    >
      {/* Icon or Image */}
      {image ? (
        <Image
          source={image}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel={`${variant} empty state illustration`}
        />
      ) : icon ? (
        <View style={styles.iconContainer}>
          <Icon
            size="xl"
            color={theme.colors.text.disabled}
            accessibilityLabel={`${variant} empty state icon`}
          >
            {icon}
          </Icon>
        </View>
      ) : null}

      {/* Title */}
      {title && (
        <Text
          variant="h4"
          align="center"
          style={styles.title}
          accessibilityRole="header"
          testID={testID ? `${testID}-title` : undefined}
        >
          {title}
        </Text>
      )}

      {/* Message */}
      {message && (
        <Text
          variant="body1"
          align="center"
          color={theme.colors.text.secondary}
          style={styles.message}
          testID={testID ? `${testID}-message` : undefined}
        >
          {message}
        </Text>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actions}>
          {actionLabel && onAction && (
            <Button
              variant="primary"
              size="md"
              onPress={onAction}
              accessibilityLabel={actionLabel}
              accessibilityHint={`Tap to ${actionLabel.toLowerCase()}`}
              testID={testID ? `${testID}-action` : undefined}
              style={styles.primaryAction}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              size="md"
              onPress={onSecondaryAction}
              accessibilityLabel={secondaryActionLabel}
              accessibilityHint={`Tap to ${secondaryActionLabel.toLowerCase()}`}
              testID={testID ? `${testID}-secondary-action` : undefined}
              style={styles.secondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.lg,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  message: {
    marginBottom: theme.spacing.xl,
    maxWidth: 320,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: theme.spacing.md,
  },
  primaryAction: {
    width: '100%',
  },
  secondaryAction: {
    width: '100%',
  },
});

EmptyState.propTypes = {
  icon: PropTypes.node,
  image: PropTypes.oneOfType([
    PropTypes.number, // For require() images
    PropTypes.shape({
      uri: PropTypes.string,
    }),
  ]),
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  secondaryActionLabel: PropTypes.string,
  onSecondaryAction: PropTypes.func,
  variant: PropTypes.oneOf([
    'default',
    'matches',
    'tournaments',
    'clubs',
    'communities',
    'search',
    'profile',
    'followers',
    'posts',
  ]),
  testID: PropTypes.string,
};

export default EmptyState;
