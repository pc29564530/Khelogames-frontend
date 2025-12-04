/**
 * Tests for ValidatedFormField component
 * Tests form validation UI integration
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ValidatedFormField from '../../../components/molecules/ValidatedFormField';
import { validateEmail, validateUsername, sanitizeEmail } from '../../../utils/validation';

// Mock FormField component
jest.mock('../../../components/molecules/FormField/FormField', () => {
  const React = require('react');
  const { TextInput, View, Text } = require('react-native');
  
  return function FormField({
    label,
    value,
    onChangeText,
    onBlur,
    error,
    errorMessage,
    placeholder,
    testID,
  }) {
    return (
      <View testID={testID}>
        {label && <Text testID={`${testID}-label`}>{label}</Text>}
        <TextInput
          testID={`${testID}-input`}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
        />
        {error && errorMessage && (
          <Text testID={`${testID}-error`}>{errorMessage}</Text>
        )}
      </View>
    );
  };
});

describe('ValidatedFormField', () => {
  const mockFormValidation = {
    handleFieldChange: jest.fn(),
    handleFieldBlur: jest.fn(),
    shouldShowError: jest.fn(() => false),
    getFieldError: jest.fn(() => null),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders with label and input', () => {
      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value=""
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidation}
          testID="email-field"
        />
      );

      expect(getByTestId('email-field')).toBeTruthy();
      expect(getByTestId('email-field-label')).toBeTruthy();
      expect(getByTestId('email-field-input')).toBeTruthy();
    });

    test('renders with placeholder', () => {
      const { getByPlaceholderText } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value=""
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidation}
          placeholder="Enter your email"
          testID="email-field"
        />
      );

      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    });

    test('displays error message when validation fails', () => {
      const mockFormValidationWithError = {
        ...mockFormValidation,
        shouldShowError: jest.fn(() => true),
        getFieldError: jest.fn(() => 'Please enter a valid email address'),
      };

      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value="invalid"
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidationWithError}
          testID="email-field"
        />
      );

      expect(getByTestId('email-field-error')).toBeTruthy();
      expect(getByTestId('email-field-error').props.children).toBe(
        'Please enter a valid email address'
      );
    });
  });

  describe('Validation on Change', () => {
    test('calls handleFieldChange with validator on text change', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value=""
          onChangeText={onChangeText}
          validator={validateEmail}
          formValidation={mockFormValidation}
          testID="email-field"
        />
      );

      const input = getByTestId('email-field-input');
      fireEvent.changeText(input, 'test@example.com');

      expect(mockFormValidation.handleFieldChange).toHaveBeenCalledWith(
        'email',
        'test@example.com',
        validateEmail,
        onChangeText
      );
    });

    test('applies sanitizer before validation', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value=""
          onChangeText={onChangeText}
          validator={validateEmail}
          sanitizer={sanitizeEmail}
          formValidation={mockFormValidation}
          testID="email-field"
        />
      );

      const input = getByTestId('email-field-input');
      fireEvent.changeText(input, 'Test@Example.COM');

      // Should sanitize to lowercase
      expect(mockFormValidation.handleFieldChange).toHaveBeenCalledWith(
        'email',
        'test@example.com',
        validateEmail,
        onChangeText
      );
    });

    test('handles text change without sanitizer', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="username"
          label="Username"
          value=""
          onChangeText={onChangeText}
          validator={validateUsername}
          formValidation={mockFormValidation}
          testID="username-field"
        />
      );

      const input = getByTestId('username-field-input');
      fireEvent.changeText(input, 'testuser');

      expect(mockFormValidation.handleFieldChange).toHaveBeenCalledWith(
        'username',
        'testuser',
        validateUsername,
        onChangeText
      );
    });
  });

  describe('Validation on Blur', () => {
    test('calls handleFieldBlur with validator on blur', () => {
      const onBlur = jest.fn();
      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value="test@example.com"
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidation}
          onBlur={onBlur}
          testID="email-field"
        />
      );

      const input = getByTestId('email-field-input');
      fireEvent(input, 'blur');

      expect(mockFormValidation.handleFieldBlur).toHaveBeenCalledWith(
        'email',
        'test@example.com',
        validateEmail,
        onBlur
      );
    });

    test('handles blur without custom onBlur callback', () => {
      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value="test@example.com"
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidation}
          testID="email-field"
        />
      );

      const input = getByTestId('email-field-input');
      fireEvent(input, 'blur');

      expect(mockFormValidation.handleFieldBlur).toHaveBeenCalledWith(
        'email',
        'test@example.com',
        validateEmail,
        undefined
      );
    });
  });

  describe('Error Display', () => {
    test('shows error when shouldShowError returns true', () => {
      const mockFormValidationWithError = {
        ...mockFormValidation,
        shouldShowError: jest.fn(() => true),
        getFieldError: jest.fn(() => 'Email is required'),
      };

      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value=""
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidationWithError}
          testID="email-field"
        />
      );

      expect(mockFormValidationWithError.shouldShowError).toHaveBeenCalledWith('email');
      expect(mockFormValidationWithError.getFieldError).toHaveBeenCalledWith('email');
      expect(getByTestId('email-field-error')).toBeTruthy();
    });

    test('hides error when shouldShowError returns false', () => {
      const { queryByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value="test@example.com"
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidation}
          testID="email-field"
        />
      );

      expect(mockFormValidation.shouldShowError).toHaveBeenCalledWith('email');
      expect(queryByTestId('email-field-error')).toBeNull();
    });

    test('updates error message when validation changes', () => {
      const mockFormValidationWithError = {
        ...mockFormValidation,
        shouldShowError: jest.fn(() => true),
        getFieldError: jest.fn(() => 'Please enter a valid email address'),
      };

      const { getByTestId, rerender } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value="invalid"
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidationWithError}
          testID="email-field"
        />
      );

      expect(getByTestId('email-field-error').props.children).toBe(
        'Please enter a valid email address'
      );

      // Update error message
      mockFormValidationWithError.getFieldError = jest.fn(() => 'Email is required');

      rerender(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value=""
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidationWithError}
          testID="email-field"
        />
      );

      expect(getByTestId('email-field-error').props.children).toBe('Email is required');
    });
  });

  describe('Sanitization', () => {
    test('sanitizes email input to lowercase', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value=""
          onChangeText={onChangeText}
          validator={validateEmail}
          sanitizer={sanitizeEmail}
          formValidation={mockFormValidation}
          testID="email-field"
        />
      );

      const input = getByTestId('email-field-input');
      fireEvent.changeText(input, 'TEST@EXAMPLE.COM');

      expect(mockFormValidation.handleFieldChange).toHaveBeenCalledWith(
        'email',
        'test@example.com',
        validateEmail,
        onChangeText
      );
    });

    test('sanitizes removes invalid characters', () => {
      const sanitizeUsername = (value) => value.replace(/[^a-zA-Z0-9_-]/g, '');
      const onChangeText = jest.fn();
      
      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="username"
          label="Username"
          value=""
          onChangeText={onChangeText}
          validator={validateUsername}
          sanitizer={sanitizeUsername}
          formValidation={mockFormValidation}
          testID="username-field"
        />
      );

      const input = getByTestId('username-field-input');
      fireEvent.changeText(input, 'user@name!');

      expect(mockFormValidation.handleFieldChange).toHaveBeenCalledWith(
        'username',
        'username',
        validateUsername,
        onChangeText
      );
    });
  });

  describe('Integration with Form Validation', () => {
    test('integrates with form validation state', () => {
      const mockFormValidationWithState = {
        handleFieldChange: jest.fn(),
        handleFieldBlur: jest.fn(),
        shouldShowError: jest.fn((fieldName) => fieldName === 'email'),
        getFieldError: jest.fn((fieldName) => 
          fieldName === 'email' ? 'Email is required' : null
        ),
      };

      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value=""
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidationWithState}
          testID="email-field"
        />
      );

      expect(mockFormValidationWithState.shouldShowError).toHaveBeenCalledWith('email');
      expect(mockFormValidationWithState.getFieldError).toHaveBeenCalledWith('email');
      expect(getByTestId('email-field-error')).toBeTruthy();
    });

    test('handles multiple fields independently', () => {
      const mockFormValidationMultiField = {
        handleFieldChange: jest.fn(),
        handleFieldBlur: jest.fn(),
        shouldShowError: jest.fn((fieldName) => fieldName === 'email'),
        getFieldError: jest.fn((fieldName) => 
          fieldName === 'email' ? 'Email is required' : null
        ),
      };

      const { getByTestId: getByTestIdEmail } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value=""
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidationMultiField}
          testID="email-field"
        />
      );

      const { queryByTestId: queryByTestIdUsername } = render(
        <ValidatedFormField
          fieldName="username"
          label="Username"
          value="validuser"
          onChangeText={jest.fn()}
          validator={validateUsername}
          formValidation={mockFormValidationMultiField}
          testID="username-field"
        />
      );

      // Email should show error
      expect(getByTestIdEmail('email-field-error')).toBeTruthy();
      
      // Username should not show error
      expect(queryByTestIdUsername('username-field-error')).toBeNull();
    });
  });

  describe('Real-time Validation Flow', () => {
    test('validates on change and blur', () => {
      const onChangeText = jest.fn();
      const onBlur = jest.fn();
      
      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value=""
          onChangeText={onChangeText}
          validator={validateEmail}
          formValidation={mockFormValidation}
          onBlur={onBlur}
          testID="email-field"
        />
      );

      const input = getByTestId('email-field-input');
      
      // Type invalid email
      fireEvent.changeText(input, 'invalid');
      expect(mockFormValidation.handleFieldChange).toHaveBeenCalledTimes(1);
      
      // Blur
      fireEvent(input, 'blur');
      expect(mockFormValidation.handleFieldBlur).toHaveBeenCalledTimes(1);
      
      // Type valid email
      fireEvent.changeText(input, 'test@example.com');
      expect(mockFormValidation.handleFieldChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Props Forwarding', () => {
    test('forwards all props to FormField', () => {
      const { getByTestId } = render(
        <ValidatedFormField
          fieldName="email"
          label="Email"
          value=""
          onChangeText={jest.fn()}
          validator={validateEmail}
          formValidation={mockFormValidation}
          placeholder="Enter email"
          required={true}
          disabled={false}
          testID="email-field"
        />
      );

      const input = getByTestId('email-field-input');
      expect(input.props.placeholder).toBe('Enter email');
    });
  });
});
