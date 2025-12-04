# Secure Authentication Implementation

This document describes the secure authentication enhancements implemented for the Khelogames application.

## Overview

The secure authentication system provides:
- **Secure Token Storage**: Tokens stored in encrypted keychain instead of AsyncStorage
- **Automatic Token Refresh**: Tokens refresh automatically before expiration
- **Biometric Authentication**: Support for fingerprint/face authentication
- **Secure Logout**: Complete cleanup of all sensitive data

## Requirements

### Dependencies

You need to install `react-native-keychain`:

```bash
npm install react-native-keychain --save
```

For iOS, also run:
```bash
cd ios && pod install
```

### Permissions

#### iOS (Info.plist)
```xml
<key>NSFaceIDUsageDescription</key>
<string>Enable Face ID to quickly and securely access your account</string>
```

#### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

## Services

### 1. Secure Storage Service (`secureStorage.js`)

Handles secure storage of tokens and user data using react-native-keychain.

#### Key Functions:

```javascript
import { 
  storeTokens, 
  getTokens, 
  clearSecureStorage,
  migrateFromAsyncStorage 
} from './services/secureStorage';

// Store tokens securely
await storeTokens({
  accessToken: 'token',
  refreshToken: 'refresh',
  accessTokenExpiresAt: '2024-12-31T23:59:59Z',
  refreshTokenExpiresAt: '2025-01-31T23:59:59Z',
});

// Retrieve tokens
const tokens = await getTokens();

// Clear all secure data
await clearSecureStorage();

// Migrate from AsyncStorage (call once on app start)
await migrateFromAsyncStorage();
```

### 2. Token Refresh Service (`tokenRefreshService.js`)

Automatically refreshes access tokens before expiration.

#### Key Functions:

```javascript
import { 
  initializeTokenRefresh,
  getValidAccessToken,
  setupAxiosInterceptor 
} from './services/tokenRefreshService';

// Initialize on app start
await initializeTokenRefresh();

// Setup axios to automatically use valid tokens
setupAxiosInterceptor();

// Get a valid token (refreshes if needed)
const token = await getValidAccessToken();
```

#### How It Works:

1. Tokens are checked 5 minutes before expiration
2. Automatic refresh is scheduled based on expiration time
3. If refresh fails, user is logged out
4. Axios interceptor automatically adds tokens to requests
5. 401 responses trigger automatic token refresh and retry

### 3. Biometric Authentication Service (`biometricAuthService.js`)

Provides biometric authentication for sensitive actions.

#### Key Functions:

```javascript
import { 
  isBiometricAvailable,
  authenticateWithBiometric,
  authenticateForSensitiveAction,
  enableBiometricAuth 
} from './services/biometricAuthService';

// Check if biometric is available
const { available, biometryType } = await isBiometricAvailable();

// Simple biometric prompt
const result = await authenticateWithBiometric({
  promptMessage: 'Authenticate to continue',
});

// Authenticate for sensitive action with fallback
await authenticateForSensitiveAction({
  action: 'delete account',
  onSuccess: async () => {
    // Perform sensitive action
  },
  onFallback: async () => {
    // Show password prompt
  },
  onCancel: () => {
    // User cancelled
  },
});

// Enable biometric for app
await enableBiometricAuth();
```

### 4. Enhanced Auth Service (`enhancedAuthService.js`)

Unified authentication service with secure storage integration.

#### Key Functions:

```javascript
import { 
  initializeAuth,
  loginWithEmail,
  loginWithGoogle,
  signupWithEmail,
  secureLogout 
} from './services/enhancedAuthService';

// Initialize on app start
await initializeAuth();

// Login
await loginWithEmail({
  email: 'user@example.com',
  password: 'password',
  dispatch,
});

// Secure logout
await secureLogout({ dispatch, navigation });
```

## Integration Guide

### 1. App Initialization (App.js or index.js)

```javascript
import { initializeAuth } from './services/enhancedAuthService';
import { setupAxiosInterceptor } from './services/tokenRefreshService';

// In your app initialization
useEffect(() => {
  const initialize = async () => {
    await initializeAuth();
    setupAxiosInterceptor();
  };
  
  initialize();
}, []);
```

### 2. Update Login Screen

```javascript
import { loginWithEmail } from './services/enhancedAuthService';

const handleLogin = async () => {
  try {
    await loginWithEmail({
      email: formData.email,
      password: formData.password,
      dispatch,
    });
    // Navigation handled by auth state
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### 3. Update Logout

```javascript
import { secureLogout } from './services/enhancedAuthService';

const handleLogout = async () => {
  try {
    await secureLogout({ dispatch, navigation });
  } catch (error) {
    Alert.alert('Error', 'Failed to logout');
  }
};
```

### 4. Add Biometric to Settings

```javascript
import { 
  getBiometricSettings,
  enableBiometricAuth,
  disableBiometricAuth 
} from './services/biometricAuthService';

const BiometricSettings = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const biometricSettings = await getBiometricSettings();
    setSettings(biometricSettings);
  };

  const toggleBiometric = async () => {
    if (settings.enabled) {
      await disableBiometricAuth();
    } else {
      await enableBiometricAuth();
    }
    await loadSettings();
  };

  return (
    <View>
      <Text>{settings?.biometryTypeName} Authentication</Text>
      <Switch value={settings?.enabled} onValueChange={toggleBiometric} />
    </View>
  );
};
```

### 5. Protect Sensitive Actions

```javascript
import { authenticateForSensitiveAction } from './services/biometricAuthService';

const deleteAccount = async () => {
  const authenticated = await authenticateForSensitiveAction({
    action: 'delete your account',
    onSuccess: async () => {
      // Proceed with deletion
      await performAccountDeletion();
    },
    onFallback: async () => {
      // Show password prompt
      return await promptForPassword();
    },
  });

  if (!authenticated) {
    Alert.alert('Authentication required');
  }
};
```

## Security Features

### Token Storage
- Tokens stored in iOS Keychain / Android Keystore
- Hardware-backed encryption when available
- Accessible only when device unlocked
- Automatic migration from AsyncStorage

### Token Refresh
- Automatic refresh 5 minutes before expiration
- Prevents multiple simultaneous refresh attempts
- Automatic logout on refresh failure
- Axios interceptor for seamless integration

### Biometric Authentication
- Support for Touch ID, Face ID, Fingerprint, Face, Iris
- Graceful fallback to password
- Configurable per-user
- Secure storage of biometric preference

### Secure Logout
- Clears keychain storage
- Clears AsyncStorage
- Purges Redux persist
- Cancels scheduled refreshes
- Disables biometric auth
- Calls backend logout endpoint

## Migration from Old System

The system automatically migrates tokens from AsyncStorage to secure keychain storage on first run.

### What Gets Migrated:
- AccessToken → Secure keychain
- RefreshToken → Secure keychain
- AccessTokenExpiresAt → Secure keychain
- RefreshTokenExpiresAt → Secure keychain
- User data → Secure keychain
- Role → AsyncStorage (non-sensitive)
- UserPublicID → AsyncStorage (non-sensitive)

### Migration Process:
1. Check if tokens already in keychain
2. If not, read from AsyncStorage
3. Store in secure keychain
4. Remove from AsyncStorage
5. Log migration success

## Testing

### Test Secure Storage
```javascript
import { storeTokens, getTokens } from './services/secureStorage';

const testSecureStorage = async () => {
  await storeTokens({
    accessToken: 'test_token',
    refreshToken: 'test_refresh',
    accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
    refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
  });

  const tokens = await getTokens();
  console.log('Retrieved tokens:', tokens);
};
```

### Test Token Refresh
```javascript
import { isTokenExpired, scheduleTokenRefresh } from './services/tokenRefreshService';

const testTokenRefresh = async () => {
  const expiresAt = new Date(Date.now() + 60000).toISOString(); // 1 minute
  const needsRefresh = isTokenExpired(expiresAt);
  console.log('Needs refresh:', needsRefresh);

  scheduleTokenRefresh(expiresAt);
  console.log('Refresh scheduled');
};
```

### Test Biometric
```javascript
import { isBiometricAvailable, authenticateWithBiometric } from './services/biometricAuthService';

const testBiometric = async () => {
  const { available, biometryType } = await isBiometricAvailable();
  console.log('Biometric available:', available, biometryType);

  if (available) {
    const result = await authenticateWithBiometric({
      promptMessage: 'Test authentication',
    });
    console.log('Auth result:', result);
  }
};
```

## Troubleshooting

### Keychain Access Errors
- Ensure device is unlocked
- Check keychain access permissions
- Verify app signing configuration

### Token Refresh Failures
- Check network connectivity
- Verify refresh endpoint is correct
- Check token expiration times
- Review backend logs

### Biometric Not Available
- Check device capabilities
- Verify permissions in manifest/plist
- Ensure biometric is enrolled on device
- Check for device lock screen

### Migration Issues
- Clear app data and reinstall
- Check AsyncStorage permissions
- Verify keychain access

## Best Practices

1. **Always use `getValidAccessToken()`** instead of directly accessing tokens
2. **Call `initializeAuth()` on app start** to setup token refresh
3. **Use `secureLogout()` instead of manual cleanup** to ensure complete data removal
4. **Implement biometric for sensitive actions** like payments, account deletion
5. **Handle biometric fallback gracefully** with password prompts
6. **Test on both iOS and Android** as implementations differ
7. **Monitor token refresh logs** in production for issues
8. **Keep refresh buffer time reasonable** (5 minutes is recommended)

## API Reference

See individual service files for complete API documentation:
- `secureStorage.js` - Token and user data storage
- `tokenRefreshService.js` - Automatic token refresh
- `biometricAuthService.js` - Biometric authentication
- `enhancedAuthService.js` - Unified auth service
