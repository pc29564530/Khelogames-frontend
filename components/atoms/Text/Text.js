/**
 * Text component with typography variants and accessibility support
 * Provides consistent text styling across the application
 */

import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';

const Text = ({
  children,
  variant = 'body1',
  color,
  align = 'left',
  numberOfLines,
  ellipsizeMode = 'tail',
  accessibilityLabel,
  accessibilityRole,
  accessibilityLevel,
  testID,
  style,
  ...rest
}) => {
  const textStyles = [
    styles.base,
    styles[variant],
    color && { color },
    align && { textAlign: align },
    style,
  ];

  return (
    <RNText
      style={textStyles}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      accessible={true}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityRole={accessibilityRole}
      {...(accessibilityLevel && { accessibilityLevel })}
      testID={testID}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    color: theme.colors.text.primary,
  },

  // Typography variants
  h1: {
    fontSize: theme.typography.variants.h1.fontSize,
    fontWeight: theme.typography.variants.h1.fontWeight,
    lineHeight: theme.typography.variants.h1.fontSize * theme.typography.variants.h1.lineHeight,
    letterSpacing: theme.typography.variants.h1.letterSpacing,
  },
  h2: {
    fontSize: theme.typography.variants.h2.fontSize,
    fontWeight: theme.typography.variants.h2.fontWeight,
    lineHeight: theme.typography.variants.h2.fontSize * theme.typography.variants.h2.lineHeight,
    letterSpacing: theme.typography.variants.h2.letterSpacing,
  },
  h3: {
    fontSize: theme.typography.variants.h3.fontSize,
    fontWeight: theme.typography.variants.h3.fontWeight,
    lineHeight: theme.typography.variants.h3.fontSize * theme.typography.variants.h3.lineHeight,
    letterSpacing: theme.typography.variants.h3.letterSpacing,
  },
  h4: {
    fontSize: theme.typography.variants.h4.fontSize,
    fontWeight: theme.typography.variants.h4.fontWeight,
    lineHeight: theme.typography.variants.h4.fontSize * theme.typography.variants.h4.lineHeight,
    letterSpacing: theme.typography.variants.h4.letterSpacing,
  },
  h5: {
    fontSize: theme.typography.variants.h5.fontSize,
    fontWeight: theme.typography.variants.h5.fontWeight,
    lineHeight: theme.typography.variants.h5.fontSize * theme.typography.variants.h5.lineHeight,
    letterSpacing: theme.typography.variants.h5.letterSpacing,
  },
  h6: {
    fontSize: theme.typography.variants.h6.fontSize,
    fontWeight: theme.typography.variants.h6.fontWeight,
    lineHeight: theme.typography.variants.h6.fontSize * theme.typography.variants.h6.lineHeight,
    letterSpacing: theme.typography.variants.h6.letterSpacing,
  },
  body1: {
    fontSize: theme.typography.variants.body1.fontSize,
    fontWeight: theme.typography.variants.body1.fontWeight,
    lineHeight: theme.typography.variants.body1.fontSize * theme.typography.variants.body1.lineHeight,
    letterSpacing: theme.typography.variants.body1.letterSpacing,
  },
  body2: {
    fontSize: theme.typography.variants.body2.fontSize,
    fontWeight: theme.typography.variants.body2.fontWeight,
    lineHeight: theme.typography.variants.body2.fontSize * theme.typography.variants.body2.lineHeight,
    letterSpacing: theme.typography.variants.body2.letterSpacing,
  },
  subtitle1: {
    fontSize: theme.typography.variants.subtitle1.fontSize,
    fontWeight: theme.typography.variants.subtitle1.fontWeight,
    lineHeight: theme.typography.variants.subtitle1.fontSize * theme.typography.variants.subtitle1.lineHeight,
    letterSpacing: theme.typography.variants.subtitle1.letterSpacing,
  },
  subtitle2: {
    fontSize: theme.typography.variants.subtitle2.fontSize,
    fontWeight: theme.typography.variants.subtitle2.fontWeight,
    lineHeight: theme.typography.variants.subtitle2.fontSize * theme.typography.variants.subtitle2.lineHeight,
    letterSpacing: theme.typography.variants.subtitle2.letterSpacing,
  },
  button: {
    fontSize: theme.typography.variants.button.fontSize,
    fontWeight: theme.typography.variants.button.fontWeight,
    lineHeight: theme.typography.variants.button.fontSize * theme.typography.variants.button.lineHeight,
    letterSpacing: theme.typography.variants.button.letterSpacing,
  },
  caption: {
    fontSize: theme.typography.variants.caption.fontSize,
    fontWeight: theme.typography.variants.caption.fontWeight,
    lineHeight: theme.typography.variants.caption.fontSize * theme.typography.variants.caption.lineHeight,
    letterSpacing: theme.typography.variants.caption.letterSpacing,
    color: theme.colors.text.secondary,
  },
  overline: {
    fontSize: theme.typography.variants.overline.fontSize,
    fontWeight: theme.typography.variants.overline.fontWeight,
    lineHeight: theme.typography.variants.overline.fontSize * theme.typography.variants.overline.lineHeight,
    letterSpacing: theme.typography.variants.overline.letterSpacing,
    textTransform: 'uppercase',
  },
});

Text.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'body1', 'body2',
    'subtitle1', 'subtitle2',
    'button', 'caption', 'overline'
  ]),
  color: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center', 'right', 'justify']),
  numberOfLines: PropTypes.number,
  ellipsizeMode: PropTypes.oneOf(['head', 'middle', 'tail', 'clip']),
  accessibilityLabel: PropTypes.string,
  accessibilityRole: PropTypes.string,
  accessibilityLevel: PropTypes.number,
  testID: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default Text;
