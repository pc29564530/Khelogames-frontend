/**
 * Card component with consistent padding and shadows
 * Provides a container for grouping related content
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const Card = ({
  children,
  elevation = 'md',
  padding = 'md',
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}) => {
  const cardStyles = [
    styles.base,
    theme.shadows[elevation],
    styles[`padding_${padding}`],
    style,
  ];

  // If onPress is provided, make it touchable
  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        testID={testID}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={cardStyles}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },

  // Padding variants
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: theme.spacing.sm,
  },
  padding_md: {
    padding: theme.spacing.component.cardPadding,
  },
  padding_lg: {
    padding: theme.spacing.lg,
  },
  padding_xl: {
    padding: theme.spacing.xl,
  },
});

Card.propTypes = {
  children: PropTypes.node.isRequired,
  elevation: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
  onPress: PropTypes.func,
  accessibilityLabel: PropTypes.string,
  accessibilityHint: PropTypes.string,
  testID: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default Card;
