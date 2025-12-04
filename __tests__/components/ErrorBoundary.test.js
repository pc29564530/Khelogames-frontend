/**
 * ErrorBoundary Component Tests
 * Tests error boundary catches and displays errors
 * Requirements: 5.1
 */

import React from 'react';
import { Text, View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorBoundary from '../../components/ErrorBoundary';
import monitoringService from '../../services/monitoringService';

// Mock monitoring service
jest.mock('../../services/monitoringService', () => ({
  logError: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

// Component that throws an error
const ThrowError = ({ shouldThrow, errorMessage }) => {
  if (shouldThrow) {
    throw new Error(errorMessage || 'Test error');
  }
  return <Text testID="success">No error</Text>;
};

// Component that works normally
const NormalComponent = () => (
  <View testID="normal-component">
    <Text>Normal content</Text>
  </View>
);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Mock navigator for React Native environment
    global.navigator = { userAgent: 'test-agent' };
  });

  afterEach(() => {
    console.error.mockRestore();
    delete global.navigator;
  });

  describe('Error Catching', () => {
    it('should render children when no error occurs', () => {
      const { getByTestId } = render(
        <ErrorBoundary>
          <NormalComponent />
        </ErrorBoundary>
      );

      expect(getByTestId('normal-component')).toBeTruthy();
    });

    it('should catch errors thrown by child components', () => {
      const { getByText, queryByTestId } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Component crashed" />
        </ErrorBoundary>
      );

      // Should not render the child component
      expect(queryByTestId('success')).toBeNull();

      // Should render error UI
      expect(getByText('Oops! Something went wrong')).toBeTruthy();
    });

    it('should display custom error message in fallback UI', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Custom error message" />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
      expect(getByText("We're sorry for the inconvenience. The app encountered an unexpected error.")).toBeTruthy();
    });

    it('should log error to monitoring service', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Logged error" />
        </ErrorBoundary>
      );

      expect(monitoringService.logError).toHaveBeenCalled();
      const loggedError = monitoringService.logError.mock.calls[0][0];
      expect(loggedError.message).toContain('Logged error');
    });
  });

  describe('Error Display', () => {
    it('should display retry button in error UI', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = getByText('Try Again');
      expect(retryButton).toBeTruthy();
    });

    it('should display error emoji in fallback UI', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('⚠️')).toBeTruthy();
    });

    it('should have accessible retry button', () => {
      const { getByLabelText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = getByLabelText('Try again');
      expect(retryButton).toBeTruthy();
      expect(retryButton.props.accessibilityRole).toBe('button');
    });
  });

  describe('Error Recovery', () => {
    it('should reset error state when retry button is pressed', () => {
      let shouldThrow = true;
      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <Text testID="success">Success</Text>;
      };

      const { getByText, queryByText, getByTestId } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      // Error UI should be visible
      expect(getByText('Try Again')).toBeTruthy();
      expect(getByText('Oops! Something went wrong')).toBeTruthy();

      // Fix the error condition
      shouldThrow = false;

      // Press retry button
      fireEvent.press(getByText('Try Again'));

      // After reset, error UI should be gone and success should show
      expect(queryByText('Oops! Something went wrong')).toBeNull();
      expect(getByTestId('success')).toBeTruthy();
    });

    it('should call onReset callback when retry is pressed', () => {
      const onReset = jest.fn();
      const { getByText } = render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.press(getByText('Try Again'));

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('should call onError callback when error is caught', () => {
      const onError = jest.fn();
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} errorMessage="Callback test" />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      const [error, errorInfo] = onError.mock.calls[0];
      expect(error.message).toBe('Callback test');
      expect(errorInfo).toBeTruthy();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback UI when provided', () => {
      const CustomFallback = () => (
        <View testID="custom-fallback">
          <Text>Custom Error UI</Text>
        </View>
      );

      const { getByTestId, getByText } = render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByTestId('custom-fallback')).toBeTruthy();
      expect(getByText('Custom Error UI')).toBeTruthy();
    });
  });

  describe('Multiple Errors', () => {
    it('should handle multiple sequential errors', () => {
      const { getByText, rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="First error" />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();

      // Reset
      fireEvent.press(getByText('Try Again'));

      // Throw another error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Second error" />
        </ErrorBoundary>
      );

      expect(getByText('Oops! Something went wrong')).toBeTruthy();
      expect(monitoringService.logError).toHaveBeenCalledTimes(2);
    });
  });
});
