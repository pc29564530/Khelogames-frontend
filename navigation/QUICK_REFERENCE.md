# Navigation Quick Reference

## Common Tasks

### Add a New Screen with Custom Transition

```javascript
// In MainNavigation.js
import { modalScreenOptions } from './navigationConfig';

<Stack.Screen 
  name="MyNewScreen" 
  component={MyNewScreen}
  options={modalScreenOptions}  // or fadeTransition, defaultScreenOptions
/>
```

### Create a Deep Link

```javascript
import { useDeepLink } from '../hooks/useDeepLink';

const { createDeepLink } = useDeepLink();
const link = createDeepLink('CricketMatchPage', { matchId: '123' });
// Returns: khelogames://match/cricket/123
```

### Share Content via Deep Link

```javascript
import { useDeepLink } from '../hooks/useDeepLink';

const { shareDeepLink } = useDeepLink();
await shareDeepLink('PlayerProfile', { playerId: 'abc' }, 'Check out this player!');
```

### Disable Gestures for a Screen

```javascript
import { disableGesturesConfig } from './gestureConfig';

<Stack.Screen 
  name="ImportantForm" 
  component={ImportantForm}
  options={disableGesturesConfig}
/>
```

### Clear Navigation State (e.g., on Logout)

```javascript
import { clearNavigationState } from './navigationPersistence';

const handleLogout = async () => {
  await clearNavigationState();
  // ... rest of logout logic
};
```

## Available Transitions

| Transition | Use Case | Import |
|------------|----------|--------|
| `slideFromRightTransition` | Default navigation | `navigationConfig` |
| `fadeTransition` | Full-screen media | `navigationConfig` |
| `modalTransition` | Bottom-up modals | `navigationConfig` |
| `scaleTransition` | Dialogs/overlays | `navigationConfig` |
| `defaultScreenOptions` | Standard screens | `navigationConfig` |
| `modalScreenOptions` | Modal screens | `navigationConfig` |

## Available Gesture Configs

| Config | Use Case | Import |
|--------|----------|--------|
| `swipeBackGestureConfig` | iOS-style back | `gestureConfig` |
| `drawerSwipeConfig` | Drawer edge swipe | `gestureConfig` |
| `modalSwipeDismissConfig` | Modal dismiss | `gestureConfig` |
| `disableGesturesConfig` | No gestures | `gestureConfig` |

## Deep Link Patterns

```javascript
// Match
khelogames://match/{cricket|football}/:matchId

// Player
khelogames://player/:playerId

// Tournament
khelogames://tournament/:tournamentId

// Club
khelogames://club/:clubId

// Community
khelogames://community/:communityId

// Profile
khelogames://profile/:userId

// Thread
khelogames://thread/:threadId

// Auth
khelogames://signin
khelogames://signup
```

## Testing Commands

```bash
# Test deep link (Android)
adb shell am start -W -a android.intent.action.VIEW \
  -d "khelogames://match/cricket/12345" com.khelogamesapp

# List all tests
npm run test -- --listTests

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Common Imports

```javascript
// Transitions
import {
  defaultScreenOptions,
  modalScreenOptions,
  fadeTransition,
  getTransitionConfig,
} from './navigation/navigationConfig';

// Gestures
import {
  swipeBackGestureConfig,
  drawerSwipeConfig,
  disableGesturesConfig,
} from './navigation/gestureConfig';

// Deep Linking
import { useDeepLink } from './hooks/useDeepLink';
import {
  generateDeepLink,
  parseDeepLink,
} from './navigation/deepLinkingConfig';

// Persistence
import { useNavigationPersistence } from './hooks/useNavigationPersistence';
import {
  saveNavigationState,
  restoreNavigationState,
  clearNavigationState,
} from './navigation/navigationPersistence';
```

## Troubleshooting Quick Fixes

### Gestures not working
```javascript
// Make sure this is first in index.js
import 'react-native-gesture-handler';
```

### Deep links not opening
```bash
# Verify intent filters in AndroidManifest.xml
# Test with adb command
adb shell am start -W -a android.intent.action.VIEW -d "khelogames://signin" com.khelogamesapp
```

### State not persisting
```javascript
// Check if user is authenticated
// State only persists for authenticated users
if (isAuthenticated) {
  await saveNavigationState(state);
}
```

### Transition lag
```javascript
// Ensure native driver is enabled
animationEnabled: true,
// Use in screenOptions
```

## Performance Tips

1. Use `freezeOnBlur: true` for inactive screens
2. Enable `detachInactiveScreens: true` in navigator
3. Use native driver for animations
4. Sanitize navigation state before saving
5. Clear old states periodically

## Security Checklist

- [ ] Sanitize navigation state (remove auth screens)
- [ ] Validate deep link parameters
- [ ] Only persist state for authenticated users
- [ ] Clear state on logout
- [ ] Use secure storage for sensitive data

## File Locations

```
navigation/
├── MainNavigation.js          # Main navigation setup
├── DrawerNavigation.js        # Drawer configuration
├── StackNavigation.js         # Stack configuration
├── navigationConfig.js        # Transitions
├── gestureConfig.js           # Gestures
├── deepLinkingConfig.js       # Deep links
├── navigationPersistence.js   # State persistence
├── README.md                  # Full documentation
├── DEEP_LINKING_README.md     # Deep linking guide
├── NAVIGATION_PERSISTENCE_README.md  # Persistence guide
└── QUICK_REFERENCE.md         # This file

hooks/
├── useDeepLink.js             # Deep linking hook
└── useNavigationPersistence.js # Persistence hook
```
