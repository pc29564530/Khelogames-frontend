import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';

/**
 * Network Error Display Component
 * 
 * Displays network errors with appropriate messaging and retry options
 */
const NetworkErrorDisplay = ({ error, onRetry, onDismiss }) => {
  const theme = useTheme();

  if (!error) {
    return null;
  }

  const getErrorMessage = () => {
    if (error.code === 'TIMEOUT_ERROR') {
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please check your connection and try again.',
        icon: '⏱️',
      };
    }

    if (error.code === 'CONNECTION_ERROR') {
      return {
        title: 'Connection Failed',
        message: 'Unable to connect to the server. Please check your internet connection.',
        icon: '🔌',
      };
    }

    if (error.code?.startsWith('NETWORK_5')) {
      return {
        title: 'Server Error',
        message: 'The server encountered an error. Please try again later.',
        icon: '🔧',
      };
    }

    if (error.code === 'NETWORK_429') {
      return {
        title: 'Too Many Requests',
        message: 'You\'ve made too many requests. Please wait a moment and try again.',
        icon: '⏸️',
      };
    }

    return {
      title: 'Network Error',
      message: error.message || 'An unexpected error occurred. Please try again.',
      icon: '⚠️',
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{errorInfo.icon}</Text>
        
        <Text style={[styles.title, { color: theme.colors.error }]}>
          {errorInfo.title}
        </Text>
        
        <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
          {errorInfo.message}
        </Text>

        {error.context?.timeout && (
          <Text style={[styles.detail, { color: theme.colors.text.disabled }]}>
            Timeout: {(error.context.timeout / 1000).toFixed(0)}s
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity
            style={[styles.button, styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={onRetry}
            accessibilityLabel="Retry request"
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        )}

        {onDismiss && (
          <TouchableOpacity
            style={[styles.button, styles.dismissButton, { borderColor: theme.colors.text.disabled }]}
            onPress={onDismiss}
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
              Dismiss
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  detail: {
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButton: {
    // backgroundColor set via theme
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NetworkErrorDisplay;
