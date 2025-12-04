# Deep Linking Guide

This guide explains how to use deep linking in the Khelogames application.

## Overview

Deep linking allows users to navigate directly to specific content within the app from external sources like:
- Web browsers
- Social media
- Email
- SMS
- Other apps

## Supported Deep Links

### URL Schemes

The app supports two URL schemes:
1. **Custom scheme**: `khelogames://`
2. **HTTPS**: `https://khelogames.com`

### Available Routes

#### Matches
- Cricket Match: `khelogames://match/cricket/{matchId}`
- Football Match: `khelogames://match/football/{matchId}`

Example:
```
khelogames://match/cricket/12345
https://khelogames.com/match/football/67890
```

#### Player Profile
- `khelogames://player/{playerId}`

Example:
```
khelogames://player/abc123
```

#### Tournament
- `khelogames://tournament/{tournamentId}`

Example:
```
khelogames://tournament/tour456
```

#### Club
- `khelogames://club/{clubId}`

Example:
```
khelogames://club/club789
```

#### Community
- `khelogames://community/{communityId}`

Example:
```
khelogames://community/comm101
```

#### User Profile
- `khelogames://profile/{userId}`

Example:
```
khelogames://profile/user202
```

#### Thread/Post
- `khelogames://thread/{threadId}`

Example:
```
khelogames://thread/thread303
```

#### Authentication
- Sign In: `khelogames://signin`
- Sign Up: `khelogames://signup`

## Usage in Code

### Using the Hook

```javascript
import { useDeepLink } from '../hooks/useDeepLink';

function MyComponent() {
  const { createDeepLink, shareDeepLink, navigateToDeepLink } = useDeepLink();
  
  // Generate a deep link
  const matchLink = createDeepLink('CricketMatchPage', { matchId: '12345' });
  
  // Share a deep link
  const handleShare = async () => {
    await shareDeepLink('CricketMatchPage', { matchId: '12345' }, 'Check out this match!');
  };
  
  // Navigate to a deep link
  const handleNavigate = () => {
    navigateToDeepLink('khelogames://match/cricket/12345');
  };
  
  return (
    // Your component JSX
  );
}
```

### Generating Deep Links

```javascript
import { generateDeepLink } from '../navigation/deepLinkingConfig';

// Generate a cricket match link
const link = generateDeepLink('CricketMatchPage', { matchId: '12345' });
// Returns: khelogames://match/cricket/12345

// Generate a player profile link
const playerLink = generateDeepLink('PlayerProfile', { playerId: 'abc123' });
// Returns: khelogames://player/abc123
```

### Parsing Deep Links

```javascript
import { parseDeepLink } from '../navigation/deepLinkingConfig';

const url = 'khelogames://match/cricket/12345';
const parsed = parseDeepLink(url);
// Returns: { screen: 'CricketMatchPage', params: { matchId: '12345' } }
```

## Testing Deep Links

### Android

#### Using ADB
```bash
# Test custom scheme
adb shell am start -W -a android.intent.action.VIEW -d "khelogames://match/cricket/12345" com.khelogamesapp

# Test HTTPS URL
adb shell am start -W -a android.intent.action.VIEW -d "https://khelogames.com/match/cricket/12345" com.khelogamesapp
```

#### Using Terminal
```bash
# Open deep link in running app
npx uri-scheme open khelogames://match/cricket/12345 --android
```

### iOS

#### Using Terminal
```bash
# Open deep link in simulator
xcrun simctl openurl booted "khelogames://match/cricket/12345"

# Using npx
npx uri-scheme open khelogames://match/cricket/12345 --ios
```

## Configuration

### Android Configuration

Deep linking is configured in `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Custom scheme -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="khelogames" />
</intent-filter>

<!-- HTTPS URLs -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="khelogames.com" />
</intent-filter>
```

### iOS Configuration

For iOS, you would need to configure in `Info.plist` (not included in this React Native Android project):

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>khelogames</string>
    </array>
  </dict>
</array>
```

## Sharing Deep Links

Use the `shareDeepLink` function to share content:

```javascript
import { useDeepLink } from '../hooks/useDeepLink';

function ShareButton({ matchId }) {
  const { shareDeepLink } = useDeepLink();
  
  const handleShare = async () => {
    const result = await shareDeepLink(
      'CricketMatchPage',
      { matchId },
      'Check out this amazing cricket match!'
    );
    
    if (result.success) {
      console.log('Shared successfully!');
    }
  };
  
  return <Button onPress={handleShare}>Share Match</Button>;
}
```

## Best Practices

1. **Always validate parameters**: Ensure IDs and parameters are valid before navigating
2. **Handle errors gracefully**: Deep links might fail if content doesn't exist
3. **Use descriptive messages**: When sharing, include context about what's being shared
4. **Test thoroughly**: Test all deep link routes on both Android and iOS
5. **Monitor analytics**: Track which deep links are most used

## Troubleshooting

### Deep link not working on Android
- Verify the intent filter in AndroidManifest.xml
- Check that the app is installed
- Ensure the URL scheme matches exactly

### App not opening from browser
- For HTTPS links, verify domain association (App Links)
- Check that autoVerify is set to true
- Ensure the domain is accessible

### Navigation not happening
- Check that the screen name matches exactly
- Verify parameters are being passed correctly
- Ensure navigation is ready before attempting to navigate

## Requirements

This implementation satisfies:
- **Requirement 7.3**: Deep linking for matches, profiles, and tournaments
