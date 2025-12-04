/**
 * ValidatedFormField component with real-time validation
 * Integrates with useFormValidation hook for automatic validation and error display
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import theme from '../../../theme';
import FormField from '../FormField/FormField';

const ValidatedFormField = ({
  fieldName,
  label,
  value,
  onChangeText,
  validator,
  formValidation,
  sanitizer,
  placeholder,
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
  onBlur,
  ...rest
}) => {
  const {
    handleFieldChange,
    handleFieldBlur,
    shouldShowError,
    getFieldError,
  } = formValidation;

  /**
   * Handle text change with validation and sanitization
   */
  const handleChange = useCallback((text) => {
    // Sanitize input if sanitizer provided
    const sanitizedValue = sanitizer ? sanitizer(text) : text;
    
    // Handle change with validation
    handleFieldChange(fieldName, sanitizedValue, validator, onChangeText);
  }, [fieldName, validator, sanitizer, onChangeText, handleFieldChange]);

  /**
   * Handle blur with validation
   */
  const handleBlurEvent = useCallback(() => {
    handleFieldBlur(fieldName, value, validator, onBlur);
  }, [fieldName, value, validator, onBlur, handleFieldBlur]);

  const error = shouldShowError(fieldName);
  const errorMessage = getFieldError(fieldName);

  return (
    <FormField
      label={label}
      value={value}
      onChangeText={handleChange}
      onBlur={handleBlurEvent}
      placeholder={placeholder}
      error={error}
      errorMessage={errorMessage}
      helperText={helperText}
      required={required}
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
      testID={testID}
      style={style}
      labelStyle={labelStyle}
      inputStyle={inputStyle}
      {...rest}
    />
  );
};

ValidatedFormField.propTypes = {
  fieldName: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  validator: PropTypes.func.isRequired,
  formValidation: PropTypes.shape({
    handleFieldChange: PropTypes.func.isRequired,
    handleFieldBlur: PropTypes.func.isRequired,
    shouldShowError: PropTypes.func.isRequired,
    getFieldError: PropTypes.func.isRequired,
  }).isRequired,
  sanitizer: PropTypes.func,
  placeholder: PropTypes.string,
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
  onBlur: PropTypes.func,
};

export default ValidatedFormField;
