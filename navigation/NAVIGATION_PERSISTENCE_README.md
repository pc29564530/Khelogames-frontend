# Navigation State Persistence Guide

This guide explains how navigation state persistence works in the Khelogames application.

## Overview

Navigation state persistence allows the app to remember where users were in the navigation stack when they close and reopen the app. This provides a seamless user experience by restoring the exact screen and navigation history.

## Features

- **Automatic State Saving**: Navigation state is automatically saved when it changes
- **State Restoration**: State is restored when the app launches
- **State Expiration**: Old states (>24 hours) are automatically discarded
- **State Sanitization**: Sensitive screens (login, signup) are excluded from persistence
- **Authentication Aware**: State is only persisted for authenticated users

## How It Works

### 1. State Saving

The navigation state is automatically saved to AsyncStorage whenever the user navigates:

```javascript
// In MainNavigation.js
<NavigationContainer
  onStateChange={handleNavigationStateChange}
>
  {/* Navigation content */}
</NavigationContainer>
```

### 2. State Restoration

When the app launches, the saved state is restored:

```javascript
useEffect(() => {
  const restoreState = async () => {
    const state = await restoreNavigationState();
    if (state && isAuthenticated) {
      setInitialNavigationState(state);
    }
  };
  restoreState();
}, []);
```

### 3. State Sanitization

Before saving, the state is sanitized to remove sensitive screens:

```javascript
const sanitized = sanitizeNavigationState(state);
// Removes: SignIn, SignUp, User screens
```

## Usage

### Using the Hook

```javascript
import { useNavigationPersistence } from '../hooks/useNavigationPersistence';

function MyComponent() {
  const {
    isReady,
    initialState,
    metadata,
    saveState,
    clearState,
    refreshMetadata,
  } = useNavigationPersistence();

  // Wait for state to be ready
  if (!isReady) {
    return <LoadingScreen />;
  }

  // Use initial state in NavigationContainer
  return (
    <NavigationContainer initialState={initialState}>
      {/* Navigation content */}
    </NavigationContainer>
  );
}
```

### Manual State Management

```javascript
import {
  saveNavigationState,
  restoreNavigationState,
  clearNavigationState,
} from '../navigation/navigationPersistence';

// Save state manually
await saveNavigationState(navigationState);

// Restore state manually
const state = await restoreNavigationState();

// Clear saved state
await clearNavigationState();
```

### State Metadata

Get information about the saved state:

```javascript
import { getNavigationStateMetadata } from '../navigation/navigationPersistence';

const metadata = await getNavigationStateMetadata();
console.log(metadata);
// {
//   timestamp: 1234567890,
//   age: 3600000, // milliseconds
//   isStale: false,
//   savedAt: '2024-01-01T12:00:00.000Z'
// }
```

## Configuration

### State Expiration

The maximum age for persisted state is 24 hours. You can modify this in `navigationPersistence.js`:

```javascript
const MAX_STATE_AGE = 24 * 60 * 60 * 1000; // 24 hours
```

### Excluded Routes

Certain routes are excluded from persistence for security. Modify the list in `sanitizeNavigationState`:

```javascript
const excludedRoutes = ['SignIn', 'SignUp', 'User'];
```

## Best Practices

1. **Always Sanitize**: Never save sensitive screens in navigation state
2. **Check Authentication**: Only restore state for authenticated users
3. **Handle Errors**: Always wrap persistence calls in try-catch blocks
4. **Validate State**: Check if restored state is valid before using it
5. **Clear on Logout**: Clear navigation state when user logs out

## Example: Complete Implementation

```javascript
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  restoreNavigationState,
  saveNavigationState,
  sanitizeNavigationState,
  clearNavigationState,
} from './navigation/navigationPersistence';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  // Restore state on mount
  useEffect(() => {
    const restoreState = async () => {
      try {
        if (isAuthenticated) {
          const state = await restoreNavigationState();
          if (state) {
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };

    restoreState();
  }, [isAuthenticated]);

  // Clear state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      clearNavigationState();
    }
  }, [isAuthenticated]);

  // Handle state changes
  const handleStateChange = (state) => {
    if (state && isAuthenticated) {
      const sanitized = sanitizeNavigationState(state);
      saveNavigationState(sanitized);
    }
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={handleStateChange}
    >
      {/* Your navigation structure */}
    </NavigationContainer>
  );
}
```

## Troubleshooting

### State Not Restoring

1. Check if user is authenticated
2. Verify state is not older than 24 hours
3. Check AsyncStorage for saved state:
   ```javascript
   const state = await AsyncStorage.getItem('@navigation_state');
   console.log(state);
   ```

### State Causing Crashes

1. Clear the saved state:
   ```javascript
   await clearNavigationState();
   ```
2. Check if state structure matches current navigation structure
3. Verify all screens in saved state still exist

### State Not Saving

1. Check if `onStateChange` is properly connected
2. Verify AsyncStorage permissions
3. Check for errors in console logs

## Testing

### Test State Persistence

```javascript
// Save a test state
const testState = {
  routes: [{ name: 'Home' }],
  index: 0,
};
await saveNavigationState(testState);

// Restore and verify
const restored = await restoreNavigationState();
console.log('Restored state:', restored);
```

### Test State Expiration

```javascript
// Get metadata
const metadata = await getNavigationStateMetadata();
console.log('State age:', metadata.age);
console.log('Is stale:', metadata.isStale);
```

## Requirements

This implementation satisfies:
- **Requirement 7.2**: Navigation state persistence across app restarts

## Related Files

- `navigation/navigationPersistence.js` - Core persistence logic
- `hooks/useNavigationPersistence.js` - React hook for persistence
- `navigation/MainNavigation.js` - Implementation in main navigation
