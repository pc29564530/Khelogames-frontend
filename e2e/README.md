# End-to-End Testing with Detox

This directory contains E2E tests for the Khelogames application using Detox.

## 📋 Table of Contents

- [Setup](#setup)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Test Data Seeding](#test-data-seeding)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Setup

### Prerequisites

1. **Android Studio** with Android SDK installed
2. **Android Emulator** configured
3. **Node.js** and **npm** installed

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Set Up Android Emulator

Ensure you have an Android emulator set up with the name specified in `.detoxrc.js`:

```bash
# List available AVDs
emulator -list-avds

# Create a new AVD if needed (example)
avdmanager create avd -n Pixel_3a_API_30_x86 -k "system-images;android-30;google_apis;x86"

# Start the emulator
emulator -avd Pixel_3a_API_30_x86
```

### 3. Build the App for Testing

```bash
# Build debug version
npm run e2e:build:android

# Or build release version
npm run e2e:build:release
```

## 🧪 Running Tests

### Run All Tests

```bash
# Run all E2E tests (debug build)
npm run e2e:test:android

# Run all E2E tests (release build)
npm run e2e:test:android:release
```

### Run Specific Test File

```bash
# Run authentication tests
detox test --configuration android.debug e2e/authentication.e2e.js

# Run match management tests
detox test --configuration android.debug e2e/matchManagement.e2e.js

# Run social features tests
detox test --configuration android.debug e2e/socialFeatures.e2e.js
```

### Run with Additional Options

```bash
# Run with cleanup (removes app data before tests)
detox test --configuration android.debug --cleanup

# Run with specific test name pattern
detox test --configuration android.debug --testNamePattern="login"

# Run in headless mode (no emulator window)
detox test --configuration android.debug --headless

# Run with retries on failure
detox test --configuration android.debug --retries 2
```

### Clean and Rebuild

```bash
# Clean Detox cache and rebuild
npm run e2e:clean
npm run e2e:build:android
```

## 📁 Project Structure

```
e2e/
├── README.md                 # This file
├── jest.config.js           # Jest configuration for E2E tests
├── setup.js                 # Global setup and teardown
├── example.e2e.js          # Example test file
├── utils/
│   ├── testHelpers.js      # Common test helper functions
│   ├── testDataSeeder.js   # Test data generation utilities
│   └── config.js           # Test configuration and constants
└── (test files)            # Your E2E test files (*.e2e.js)
```

## ✍️ Writing Tests

### Basic Test Structure

```javascript
import {
  waitForElement,
  tapElement,
  typeText,
  expectElementToBeVisible,
} from './utils/testHelpers';

import { generateTestUser } from './utils/testDataSeeder';
import { TIMEOUTS } from './utils/config';

describe('Feature Name', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should perform action', async () => {
    // Wait for element
    await waitForElement('element-id', TIMEOUTS.medium);
    
    // Perform action
    await tapElement('button-id');
    
    // Verify result
    await expectElementToBeVisible('result-screen');
  });
});
```

### Using Test Helpers

The `testHelpers.js` module provides convenient wrapper functions:

```javascript
// Wait for elements
await waitForElement('element-id', 5000);
await waitForElementToDisappear('loading-indicator');

// Interact with elements
await tapElement('button-id');
await typeText('input-id', 'Hello World');
await clearText('input-id');
await swipeElement('list-id', 'up');

// Verify elements
await expectElementToBeVisible('element-id');
await expectElementToHaveText('text-id', 'Expected Text');
await expectElementNotToExist('hidden-element');

// Navigation
await navigateBack();
await reloadApp();

// Utilities
await waitForLoadingToComplete();
await scrollToElement('scroll-view-id', 'target-element-id');
```

## 🎲 Test Data Seeding

The `testDataSeeder.js` module provides functions to generate test data:

```javascript
import {
  generateTestUser,
  generateCricketMatch,
  generateFootballMatch,
  generateTournament,
  TEST_CREDENTIALS,
} from './utils/testDataSeeder';

// Generate random test data
const user = generateTestUser();
const match = generateCricketMatch();
const tournament = generateTournament('cricket');

// Use predefined credentials
const { validUser } = TEST_CREDENTIALS;
await typeText('email-input', validUser.email);
await typeText('password-input', validUser.password);

// Generate multiple items
const users = generateMultipleUsers(5);
const matches = generateMultipleMatches('cricket', 10);

// Create complete test scenario
const scenario = createCompleteTestScenario();
```

### Available Generators

- `generateTestUser(overrides)` - Generate user data
- `generateCricketMatch(overrides)` - Generate cricket match
- `generateFootballMatch(overrides)` - Generate football match
- `generateTournament(sport, overrides)` - Generate tournament
- `generateClub(sport, overrides)` - Generate club
- `generateCommunity(overrides)` - Generate community
- `generatePlayerProfile(sport, overrides)` - Generate player profile
- `generateThread(overrides)` - Generate thread/post
- `generateComment(overrides)` - Generate comment
- `generateCricketScore(overrides)` - Generate cricket score
- `generateFootballScore(overrides)` - Generate football score

## ⚙️ Configuration

The `config.js` module provides centralized configuration:

```javascript
import { TIMEOUTS, API_CONFIG, getApiUrl } from './utils/config';

// Use predefined timeouts
await waitForElement('element-id', TIMEOUTS.long);

// Get API URLs
const loginUrl = getApiUrl(API_CONFIG.endpoints.auth.login);

// Check platform
if (isAndroid()) {
  // Android-specific logic
}
```

### Available Configuration

- `TIMEOUTS` - Predefined timeout values
- `API_CONFIG` - API endpoints and base URL
- `TEST_ENV` - Test environment settings
- `DEVICE_CONFIG` - Device configuration
- `APP_CONFIG` - App configuration
- `TEST_DATA_CONFIG` - Test data settings

## 📝 Best Practices

### 1. Use Test IDs

Always add `testID` props to components for reliable element selection:

```javascript
// In your component
<Button testID="submit-button" onPress={handleSubmit}>
  Submit
</Button>

// In your test
await tapElement('submit-button');
```

### 2. Wait for Elements

Always wait for elements before interacting with them:

```javascript
// ✅ Good
await waitForElement('button-id');
await tapElement('button-id');

// ❌ Bad
await tapElement('button-id'); // May fail if element not ready
```

### 3. Keep Tests Independent

Each test should be able to run in isolation:

```javascript
beforeEach(async () => {
  // Reset app state
  await device.reloadReactNative();
});
```

### 4. Use Descriptive Test Names

```javascript
// ✅ Good
it('should display error message when login fails with invalid credentials', async () => {
  // ...
});

// ❌ Bad
it('test login', async () => {
  // ...
});
```

### 5. Avoid Hardcoded Delays

```javascript
// ✅ Good
await waitForElement('result-screen', TIMEOUTS.long);

// ❌ Bad
await sleep(3000);
```

### 6. Test Critical User Flows

Focus on the most important user journeys:

- Authentication (login, signup, logout)
- Match creation and scoring
- Tournament management
- Social features (threads, comments)

### 7. Handle Async Operations

Always use async/await for Detox operations:

```javascript
it('should handle async operation', async () => {
  await tapElement('button');
  await waitForElement('result');
  await expectElementToBeVisible('result');
});
```

## 🔧 Troubleshooting

### App Not Launching

```bash
# Clean and rebuild
npm run e2e:clean
npm run e2e:build:android

# Check if emulator is running
adb devices

# Restart emulator
adb reboot
```

### Element Not Found

1. Verify the element has a `testID` prop
2. Check if the element is actually rendered
3. Use `waitFor()` with appropriate timeout
4. Check element hierarchy with React DevTools

```javascript
// Add longer timeout
await waitForElement('element-id', TIMEOUTS.extraLong);

// Check if element exists but not visible
await expect(element(by.id('element-id'))).toExist();
```

### Tests Timing Out

1. Increase timeout in test configuration
2. Check if app is stuck in loading state
3. Verify network requests are completing
4. Check for infinite loops or blocking operations

```javascript
// Increase timeout for specific operation
await waitFor(element(by.id('slow-element')))
  .toBeVisible()
  .withTimeout(30000);
```

### Build Failures

```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Rebuild
npm run e2e:build:android
```

### Detox Server Connection Issues

```bash
# Kill any running Metro bundler
npx react-native start --reset-cache

# Restart ADB server
adb kill-server
adb start-server
```

## 📚 Additional Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Detox API Reference](https://wix.github.io/Detox/docs/api/actions)
- [Detox Troubleshooting Guide](https://wix.github.io/Detox/docs/troubleshooting/building-the-app)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)

## 🎯 Test Suites

### Completed Test Suites

1. ✅ **Authentication E2E Tests** (task 18.2)
   - File: `e2e/authentication.e2e.js`
   - Guide: `e2e/AUTHENTICATION_TESTS_GUIDE.md`
   - Coverage: Login, signup, logout flows

2. ✅ **Match Management E2E Tests** (task 18.3)
   - File: `e2e/matchManagement.e2e.js`
   - Guide: `e2e/MATCH_MANAGEMENT_TESTS_GUIDE.md`
   - Coverage: Match creation, score updates, match viewing

3. ✅ **Social Features E2E Tests** (task 18.4)
   - File: `e2e/socialFeatures.e2e.js`
   - Guide: `e2e/SOCIAL_FEATURES_TESTS_GUIDE.md`
   - Quick Reference: `e2e/SOCIAL_TESTS_QUICK_REFERENCE.md`
   - Coverage: Thread creation, commenting, user following

## 📞 Support

If you encounter issues:

1. Check this README for troubleshooting steps
2. Review the Detox documentation
3. Check existing test files for examples
4. Ask the team for help
