/**
 * ListItem component for consistent list rendering
 * Provides a flexible container for list items with optional icons and actions
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';
import { Text } from '../../atoms';

const ListItem = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  rightText,
  onPress,
  disabled = false,
  divider = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  contentStyle,
}) => {
  const containerStyles = [
    styles.container,
    divider && styles.divider,
    disabled && styles.disabled,
    style,
  ];

  const content = (
    <View style={[styles.content, contentStyle]}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

      <View style={styles.textContainer}>
        <Text
          variant="body1"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.title}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            variant="body2"
            color={theme.colors.text.secondary}
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightText && (
        <Text
          variant="body2"
          color={theme.colors.text.secondary}
          style={styles.rightText}
        >
          {rightText}
        </Text>
      )}

      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        disabled={disabled}
        accessible={true}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        testID={testID}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={containerStyles}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel || title}
      testID={testID}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface.default,
    minHeight: 56, // Meets accessibility minimum touch target
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.component.listItemPadding,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  disabled: {
    opacity: 0.5,
  },

  leftIcon: {
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: theme.spacing.xxs,
  },
  subtitle: {
    marginTop: theme.spacing.xxs,
  },
  rightText: {
    marginLeft: theme.spacing.md,
  },
  rightIcon: {
    marginLeft: theme.spacing.md,
  },
});

ListItem.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  rightText: PropTypes.string,
  onPress: PropTypes.func,
  disabled: PropTypes.bool,
  divider: PropTypes.bool,
  accessibilityLabel: PropTypes.string,
  accessibilityHint: PropTypes.string,
  testID: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  contentStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default ListItem;
