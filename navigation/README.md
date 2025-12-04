# Navigation System Documentation

## Overview

The Khelogames navigation system provides a comprehensive, production-ready navigation experience with smooth animations, gesture support, deep linking, and state persistence.

## Features

### 🎬 Smooth Transitions
- Multiple transition types (slide, fade, modal, scale)
- Optimized performance with native driver
- Platform-specific animations
- Configurable timing and easing

### 👆 Gesture Navigation
- iOS-style swipe-back
- Drawer edge swipe
- Modal swipe-to-dismiss
- Platform-optimized configurations

### 🔗 Deep Linking
- Custom URL scheme (`khelogames://`)
- HTTPS support (`https://khelogames.com`)
- Comprehensive route coverage
- Share functionality
- External app integration

### 💾 State Persistence
- Automatic state saving
- State restoration on launch
- 24-hour expiration
- Authentication-aware
- Sanitized for security

## Quick Start

### Basic Navigation

```javascript
import { useNavigation } from '@react-navigation/native';

function MyScreen() {
  const navigation = useNavigation();
  
  // Navigate to a screen
  navigation.navigate('CricketMatchPage', { matchId: '123' });
  
  // Go back
  navigation.goBack();
  
  // Reset navigation
  navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }],
  });
}
```

### Using Custom Transitions

```javascript
import { modalScreenOptions, fadeTransition } from './navigationConfig';

// In your navigator
<Stack.Screen 
  name="CreateMatch" 
  component={CreateMatch}
  options={modalScreenOptions}
/>

<Stack.Screen 
  name="Shorts" 
  component={Shorts}
  options={fadeTransition}
/>
```

### Deep Linking

```javascript
import { useDeepLink } from '../hooks/useDeepLink';

function ShareButton({ matchId }) {
  const { shareDeepLink } = useDeepLink();
  
  const handleShare = async () => {
    await shareDeepLink(
      'CricketMatchPage',
      { matchId },
      'Check out this match!'
    );
  };
  
  return <Button onPress={handleShare}>Share</Button>;
}
```

### Navigation Persistence

```javascript
import { useNavigationPersistence } from '../hooks/useNavigationPersistence';

function App() {
  const { isReady, initialState } = useNavigationPersistence();
  
  if (!isReady) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer initialState={initialState}>
      {/* Your navigation */}
    </NavigationContainer>
  );
}
```

## Configuration Files

### navigationConfig.js
Defines transition animations and screen options.

**Exports:**
- `slideFromRightTransition` - Default iOS-style slide
- `fadeTransition` - Opacity-based transition
- `modalTransition` - Bottom-to-top modal
- `scaleTransition` - Scale and fade for dialogs
- `defaultScreenOptions` - Default screen configuration
- `modalScreenOptions` - Modal screen configuration
- `getTransitionConfig(type)` - Get transition by type

### gestureConfig.js
Defines gesture-based navigation configurations.

**Exports:**
- `swipeBackGestureConfig` - iOS-style swipe back
- `drawerSwipeConfig` - Drawer edge swipe
- `modalSwipeDismissConfig` - Modal swipe to dismiss
- `disableGesturesConfig` - Disable all gestures
- `getGestureConfig(type)` - Get gesture config by type

### deepLinkingConfig.js
Defines deep linking routes and handlers.

**Exports:**
- `deepLinkingConfig` - Main linking configuration
- `generateDeepLink(screen, params)` - Create deep link
- `parseDeepLink(url)` - Parse deep link URL
- `handleDeepLink(url, navigation)` - Handle incoming link
- `subscribeToDeepLinks(callback)` - Listen for links

### navigationPersistence.js
Handles navigation state persistence.

**Exports:**
- `saveNavigationState(state)` - Save state
- `restoreNavigationState()` - Restore state
- `clearNavigationState()` - Clear saved state
- `shouldRestoreNavigationState()` - Check if should restore
- `getNavigationStateMetadata()` - Get state info
- `sanitizeNavigationState(state)` - Remove sensitive data

## Hooks

### useDeepLink()
Hook for deep linking functionality.

```javascript
const {
  navigateToDeepLink,  // Navigate to a deep link URL
  createDeepLink,      // Generate a deep link
  shareDeepLink,       // Share a deep link
  openDeepLink,        // Open link in browser
} = useDeepLink();
```

### useNavigationPersistence()
Hook for navigation state persistence.

```javascript
const {
  isReady,           // Whether state is ready
  initialState,      // Restored navigation state
  metadata,          // State metadata
  saveState,         // Save state manually
  clearState,        // Clear saved state
  refreshMetadata,   // Refresh metadata
} = useNavigationPersistence();
```

## Navigation Structure

```
App
└── NavigationContainer (with linking & persistence)
    └── Stack.Navigator
        ├── DrawerNavigation (authenticated)
        │   └── StackNavigation
        │       └── BottomTab
        │           ├── Home
        │           ├── Matches
        │           ├── Community
        │           ├── Tournament
        │           └── Club
        ├── Modal Screens (CreateThread, CreateMatch, etc.)
        ├── Detail Screens (MatchPage, PlayerProfile, etc.)
        └── Auth Screens (SignIn, SignUp)
```

## Supported Deep Links

| Screen | URL Pattern |
|--------|-------------|
| Cricket Match | `khelogames://match/cricket/:matchId` |
| Football Match | `khelogames://match/football/:matchId` |
| Player Profile | `khelogames://player/:playerId` |
| Tournament | `khelogames://tournament/:tournamentId` |
| Club | `khelogames://club/:clubId` |
| Community | `khelogames://community/:communityId` |
| User Profile | `khelogames://profile/:userId` |
| Thread | `khelogames://thread/:threadId` |
| Sign In | `khelogames://signin` |
| Sign Up | `khelogames://signup` |

## Testing

### Test Transitions
```bash
# Run the app and navigate between screens
npm run android
```

### Test Deep Links
```bash
# Test custom scheme
adb shell am start -W -a android.intent.action.VIEW \
  -d "khelogames://match/cricket/12345" com.khelogamesapp

# Test HTTPS URL
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://khelogames.com/match/cricket/12345" com.khelogamesapp
```

### Test State Persistence
1. Navigate to several screens
2. Close the app completely
3. Reopen the app
4. Verify you're back where you left off

## Best Practices

### Transitions
1. Use modal transitions for creation screens
2. Use fade transitions for full-screen media
3. Use default slide for standard navigation
4. Disable animations for performance-critical screens

### Gestures
1. Enable swipe-back for most screens
2. Disable gestures for forms to prevent accidental dismissal
3. Use modal swipe-to-dismiss for bottom sheets
4. Test gestures on different screen sizes

### Deep Linking
1. Always validate parameters before navigation
2. Handle missing content gracefully
3. Use descriptive share messages
4. Test all deep link routes
5. Monitor deep link analytics

### State Persistence
1. Only persist for authenticated users
2. Clear state on logout
3. Sanitize sensitive screens
4. Handle restoration errors gracefully
5. Test with old saved states

## Troubleshooting

### Transitions Not Smooth
- Check if native driver is enabled
- Verify no heavy operations during transition
- Test on physical device (not just emulator)

### Gestures Not Working
- Verify `react-native-gesture-handler` is imported first in index.js
- Check if gestures are enabled in screen options
- Test on physical device for accurate touch response

### Deep Links Not Opening
- Verify intent filters in AndroidManifest.xml
- Check URL scheme matches exactly
- Test with `adb shell` commands
- Verify app is installed

### State Not Restoring
- Check if user is authenticated
- Verify state is not older than 24 hours
- Check AsyncStorage for saved state
- Look for errors in console logs

## Performance Considerations

1. **Transitions**: Use native driver for 60fps animations
2. **Gestures**: Platform-specific optimizations applied
3. **Deep Linking**: Minimal parsing overhead
4. **Persistence**: Async operations don't block UI

## Security Considerations

1. **State Sanitization**: Sensitive screens excluded from persistence
2. **Authentication**: State only persisted for authenticated users
3. **Deep Links**: Validate all parameters before navigation
4. **Storage**: Use secure storage for sensitive navigation data

## Related Documentation

- [Deep Linking Guide](./DEEP_LINKING_README.md)
- [Navigation Persistence Guide](./NAVIGATION_PERSISTENCE_README.md)
- [React Navigation Docs](https://reactnavigation.org/)

## Requirements Satisfied

- ✅ **1.2**: Smooth transitions and animations
- ✅ **7.1**: Gesture-based navigation
- ✅ **7.2**: Navigation state persistence
- ✅ **7.3**: Deep linking support

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the specific feature documentation
3. Check React Navigation documentation
4. Review console logs for errors
