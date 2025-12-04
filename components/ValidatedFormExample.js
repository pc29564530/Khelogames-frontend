/**
 * Example component demonstrating real-time form validation
 * Shows how to use ValidatedFormField with useFormValidation hook
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text } from './atoms';
import ValidatedFormField from './molecules/ValidatedFormField';
import useFormValidation from '../hooks/useFormValidation';
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validatePhone,
  validateTeamName,
  sanitizeEmail,
  sanitizeUsername,
  sanitizePhone,
  sanitizeText,
} from '../utils/validation';
import theme from '../theme';

const ValidatedFormExample = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    phone: '',
    teamName: '',
  });

  // Initialize form validation with real-time validation enabled
  const formValidation = useFormValidation('exampleForm', {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
  });

  const {
    validateFormFields,
    handleSubmit,
    isFormValid,
    hasErrors,
    isSubmitting,
    resetForm,
  } = formValidation;

  /**
   * Update form field value
   */
  const updateField = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  /**
   * Define validators for each field
   */
  const validators = {
    email: validateEmail,
    username: validateUsername,
    password: (value) => validatePassword(value, {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
    }),
    phone: validatePhone,
    teamName: validateTeamName,
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (fields) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    Alert.alert(
      'Success',
      'Form submitted successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            setFormData({
              email: '',
              username: '',
              password: '',
              phone: '',
              teamName: '',
            });
          },
        },
      ]
    );
  };

  /**
   * Handle form submission with validation
   */
  const handleFormSubmit = () => {
    handleSubmit(formData, validators, onSubmit);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h5" style={styles.title}>
          Real-Time Form Validation Example
        </Text>

        <Text variant="body2" style={styles.description}>
          This form demonstrates real-time validation with inline error messages.
          Errors appear as you type (with debouncing) and on blur.
        </Text>

        <ValidatedFormField
          fieldName="email"
          label="Email"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          validator={validateEmail}
          sanitizer={sanitizeEmail}
          formValidation={formValidation}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          required
          testID="email-input"
        />

        <ValidatedFormField
          fieldName="username"
          label="Username"
          value={formData.username}
          onChangeText={(value) => updateField('username', value)}
          validator={validateUsername}
          sanitizer={sanitizeUsername}
          formValidation={formValidation}
          placeholder="Choose a username"
          autoCapitalize="none"
          helperText="3-30 characters, letters, numbers, underscores, and hyphens only"
          required
          testID="username-input"
        />

        <ValidatedFormField
          fieldName="password"
          label="Password"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          validator={(value) => validatePassword(value, {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumber: true,
          })}
          formValidation={formValidation}
          placeholder="Create a password"
          secureTextEntry
          helperText="At least 8 characters with uppercase, lowercase, and number"
          required
          testID="password-input"
        />

        <ValidatedFormField
          fieldName="phone"
          label="Phone Number"
          value={formData.phone}
          onChangeText={(value) => updateField('phone', value)}
          validator={validatePhone}
          sanitizer={sanitizePhone}
          formValidation={formValidation}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          helperText="10-15 digits"
          required
          testID="phone-input"
        />

        <ValidatedFormField
          fieldName="teamName"
          label="Team Name"
          value={formData.teamName}
          onChangeText={(value) => updateField('teamName', value)}
          validator={validateTeamName}
          sanitizer={sanitizeText}
          formValidation={formValidation}
          placeholder="Enter your team name"
          helperText="2-50 characters"
          required
          testID="team-name-input"
        />

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={handleFormSubmit}
            disabled={hasErrors() || isSubmitting}
            loading={isSubmitting}
            accessibilityLabel="Submit form"
            testID="submit-button"
          >
            Submit
          </Button>

          <Button
            variant="outline"
            onPress={() => {
              resetForm();
              setFormData({
                email: '',
                username: '',
                password: '',
                phone: '',
                teamName: '',
              });
            }}
            disabled={isSubmitting}
            accessibilityLabel="Reset form"
            testID="reset-button"
            style={styles.resetButton}
          >
            Reset
          </Button>
        </View>

        {hasErrors() && (
          <View style={styles.errorSummary}>
            <Text variant="body2" color={theme.colors.error}>
              Please fix the errors above before submitting
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  description: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.secondary,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  resetButton: {
    marginTop: theme.spacing.sm,
  },
  errorSummary: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error + '10',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
});

export default ValidatedFormExample;
