/**
 * Biometric Authentication Service
 * 
 * Handles fingerprint/face authentication for sensitive actions
 * Provides fallback to PIN/password when biometric unavailable
 * 
 * Requirements: 10.1
 */

import * as Keychain from 'react-native-keychain';
import { Alert, Platform } from 'react-native';

// Biometric types
export const BIOMETRIC_TYPE = {
  TOUCH_ID: 'TouchID',
  FACE_ID: 'FaceID',
  FINGERPRINT: 'Fingerprint',
  FACE: 'Face',
  IRIS: 'Iris',
};

/**
 * Check if biometric authentication is available on device
 * @returns {Promise<Object>} Biometric availability info
 */
export const isBiometricAvailable = async () => {
  try {
    const biometryType = await Keychain.getSupportedBiometryType();
    
    return {
      available: biometryType !== null,
      biometryType: biometryType,
      isSupported: true,
    };
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return {
      available: false,
      biometryType: null,
      isSupported: false,
      error: error.message,
    };
  }
};

/**
 * Get user-friendly biometric type name
 * @param {string} biometryType - Biometry type from Keychain
 * @returns {string} User-friendly name
 */
const getBiometricTypeName = (biometryType) => {
  switch (biometryType) {
    case Keychain.BIOMETRY_TYPE.TOUCH_ID:
      return 'Touch ID';
    case Keychain.BIOMETRY_TYPE.FACE_ID:
      return 'Face ID';
    case Keychain.BIOMETRY_TYPE.FINGERPRINT:
      return 'Fingerprint';
    case Keychain.BIOMETRY_TYPE.FACE:
      return 'Face Recognition';
    case Keychain.BIOMETRY_TYPE.IRIS:
      return 'Iris Recognition';
    default:
      return 'Biometric';
  }
};

/**
 * Prompt user for biometric authentication
 * @param {Object} options - Authentication options
 * @param {string} options.promptMessage - Message to show in biometric prompt
 * @param {string} options.cancelButton - Cancel button text
 * @param {string} options.fallbackLabel - Fallback button text (iOS only)
 * @returns {Promise<Object>} Authentication result
 */
export const authenticateWithBiometric = async (options = {}) => {
  try {
    const {
      promptMessage = 'Authenticate to continue',
      cancelButton = 'Cancel',
      fallbackLabel = 'Use Password',
    } = options;

    // Check if biometric is available
    const biometricInfo = await isBiometricAvailable();
    
    if (!biometricInfo.available) {
      return {
        success: false,
        error: 'Biometric authentication not available',
        fallbackRequired: true,
      };
    }

    const biometricName = getBiometricTypeName(biometricInfo.biometryType);

    // Attempt biometric authentication
    const result = await Keychain.getGenericPassword({
      authenticationPrompt: {
        title: promptMessage,
        subtitle: `Use ${biometricName} to authenticate`,
        description: '',
        cancel: cancelButton,
        ...(Platform.OS === 'ios' && { fallback: fallbackLabel }),
      },
      authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
    });

    if (result) {
      return {
        success: true,
        biometryType: biometricInfo.biometryType,
      };
    }

    return {
      success: false,
      error: 'Authentication cancelled',
      cancelled: true,
    };
  } catch (error) {
    console.error('Biometric authentication error:', error);

    // Handle specific error cases
    if (error.message.includes('cancelled') || error.message.includes('Cancel')) {
      return {
        success: false,
        error: 'Authentication cancelled by user',
        cancelled: true,
      };
    }

    if (error.message.includes('locked') || error.message.includes('too many attempts')) {
      return {
        success: false,
        error: 'Biometric authentication locked. Please try again later.',
        locked: true,
        fallbackRequired: true,
      };
    }

    if (error.message.includes('not enrolled') || error.message.includes('No biometrics')) {
      return {
        success: false,
        error: 'No biometric credentials enrolled',
        fallbackRequired: true,
      };
    }

    return {
      success: false,
      error: error.message || 'Biometric authentication failed',
      fallbackRequired: true,
    };
  }
};

/**
 * Authenticate for sensitive action with biometric or fallback
 * @param {Object} options - Authentication options
 * @param {string} options.action - Description of action requiring authentication
 * @param {Function} options.onSuccess - Callback on successful authentication
 * @param {Function} options.onFallback - Callback when fallback is needed
 * @param {Function} options.onCancel - Callback when user cancels
 * @returns {Promise<boolean>} Authentication success
 */
export const authenticateForSensitiveAction = async (options = {}) => {
  const {
    action = 'perform this action',
    onSuccess,
    onFallback,
    onCancel,
  } = options;

  try {
    // Check biometric availability
    const biometricInfo = await isBiometricAvailable();

    if (!biometricInfo.available) {
      // Biometric not available, use fallback immediately
      if (onFallback) {
        return await onFallback();
      }
      
      Alert.alert(
        'Authentication Required',
        'Biometric authentication is not available. Please use your password.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // Attempt biometric authentication
    const result = await authenticateWithBiometric({
      promptMessage: `Authenticate to ${action}`,
    });

    if (result.success) {
      if (onSuccess) {
        await onSuccess();
      }
      return true;
    }

    if (result.cancelled) {
      if (onCancel) {
        await onCancel();
      }
      return false;
    }

    if (result.fallbackRequired) {
      // Biometric failed, offer fallback
      if (onFallback) {
        return await onFallback();
      }

      Alert.alert(
        'Authentication Failed',
        'Biometric authentication failed. Please use your password.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return false;
  } catch (error) {
    console.error('Error in sensitive action authentication:', error);
    
    // On error, offer fallback
    if (onFallback) {
      return await onFallback();
    }

    return false;
  }
};

/**
 * Enable biometric authentication for the app
 * Stores a flag indicating biometric is enabled
 * @returns {Promise<boolean>} Success status
 */
export const enableBiometricAuth = async () => {
  try {
    const biometricInfo = await isBiometricAvailable();

    if (!biometricInfo.available) {
      Alert.alert(
        'Biometric Not Available',
        'Biometric authentication is not available on this device.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // Test biometric authentication
    const result = await authenticateWithBiometric({
      promptMessage: 'Verify your identity to enable biometric authentication',
    });

    if (result.success) {
      // Store biometric enabled flag
      await Keychain.setGenericPassword(
        'biometric_enabled',
        'true',
        {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        }
      );

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error enabling biometric auth:', error);
    return false;
  }
};

/**
 * Disable biometric authentication for the app
 * @returns {Promise<boolean>} Success status
 */
export const disableBiometricAuth = async () => {
  try {
    await Keychain.resetGenericPassword({
      service: 'biometric_enabled',
    });
    return true;
  } catch (error) {
    console.error('Error disabling biometric auth:', error);
    return false;
  }
};

/**
 * Check if biometric authentication is enabled for the app
 * @returns {Promise<boolean>} True if enabled
 */
export const isBiometricEnabled = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: 'biometric_enabled',
    });
    return credentials && credentials.password === 'true';
  } catch (error) {
    // If error, assume not enabled
    return false;
  }
};

/**
 * Show biometric prompt with custom message
 * Useful for quick authentication checks
 * @param {string} message - Message to display
 * @returns {Promise<boolean>} True if authenticated
 */
export const promptBiometric = async (message = 'Authenticate') => {
  try {
    const result = await authenticateWithBiometric({
      promptMessage: message,
    });
    return result.success;
  } catch (error) {
    console.error('Biometric prompt error:', error);
    return false;
  }
};

/**
 * Get biometric settings for display in settings screen
 * @returns {Promise<Object>} Biometric settings info
 */
export const getBiometricSettings = async () => {
  try {
    const availability = await isBiometricAvailable();
    const enabled = await isBiometricEnabled();

    return {
      available: availability.available,
      biometryType: availability.biometryType,
      biometryTypeName: getBiometricTypeName(availability.biometryType),
      enabled: enabled,
      canEnable: availability.available && !enabled,
      canDisable: availability.available && enabled,
    };
  } catch (error) {
    console.error('Error getting biometric settings:', error);
    return {
      available: false,
      enabled: false,
      canEnable: false,
      canDisable: false,
      error: error.message,
    };
  }
};
