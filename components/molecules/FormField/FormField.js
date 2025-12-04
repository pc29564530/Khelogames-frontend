/**
 * FormField component combining Input with label and error message
 * Provides a complete form field with consistent styling
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';
import { Text, Input } from '../../atoms';

const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  error = false,
  errorMessage,
  helperText,
  required = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  maxLength,
  leftIcon,
  rightIcon,
  onRightIconPress,
  testID,
  style,
  labelStyle,
  inputStyle,
  ...rest
}) => {
  const labelText = required ? `${label} *` : label;
  const accessibilityLabel = `${label}${required ? ', required' : ''} input field`;

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text
          variant="subtitle2"
          style={[styles.label, labelStyle]}
          accessibilityRole="text"
        >
          {labelText}
        </Text>
      )}

      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        error={error}
        errorMessage={errorMessage}
        disabled={disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        maxLength={maxLength}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        onRightIconPress={onRightIconPress}
        accessibilityLabel={accessibilityLabel}
        style={inputStyle}
        {...rest}
      />

      {helperText && !error && (
        <Text
          variant="caption"
          color={theme.colors.text.secondary}
          style={styles.helperText}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.primary,
  },
  helperText: {
    marginTop: theme.spacing.xxs,
    marginLeft: theme.spacing.xs,
  },
});

FormField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  secureTextEntry: PropTypes.bool,
  keyboardType: PropTypes.string,
  autoCapitalize: PropTypes.oneOf(['none', 'sentences', 'words', 'characters']),
  autoCorrect: PropTypes.bool,
  maxLength: PropTypes.number,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  onRightIconPress: PropTypes.func,
  testID: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default FormField;
