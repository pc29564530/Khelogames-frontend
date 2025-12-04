# E2E Testing Quick Start Guide

This guide will help you get started with E2E testing using Detox in under 5 minutes.

## Prerequisites Checklist

- [ ] Android Studio installed
- [ ] Android SDK configured
- [ ] Android Emulator created (Pixel_3a_API_30_x86)
- [ ] Node.js and npm installed
- [ ] Project dependencies installed (`npm install`)

## Quick Start Steps

### 1. Start Android Emulator

```bash
# List available emulators
emulator -list-avds

# Start the emulator (use the name from .detoxrc.js)
emulator -avd Pixel_3a_API_30_x86 &
```

### 2. Build the App

```bash
# Build the debug version for testing
npm run e2e:build:android
```

This will take a few minutes the first time.

### 3. Run Example Test

```bash
# Run the example test
npm run e2e:test:android
```

## Your First Test

Create a new file `e2e/myFirstTest.e2e.js`:

```javascript
import { waitForElement, tapElement, expectElementToBeVisible } from './utils/testHelpers';
import { TIMEOUTS } from './utils/config';

describe('My First E2E Test', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show the home screen', async () => {
    // Wait for home screen to load
    await waitForElement('home-screen', TIMEOUTS.long);
    
    // Verify it's visible
    await expectElementToBeVisible('home-screen');
  });
});
```

Run your test:

```bash
detox test --configuration android.debug e2e/myFirstTest.e2e.js
```

## Common Commands

```bash
# Build app
npm run e2e:build:android

# Run all tests
npm run e2e:test:android

# Run specific test
detox test --configuration android.debug e2e/myFirstTest.e2e.js

# Clean and rebuild
npm run e2e:clean
npm run e2e:build:android

# Run with cleanup (removes app data)
detox test --configuration android.debug --cleanup
```

## Adding Test IDs to Components

To make components testable, add `testID` props:

```javascript
// Before
<Button onPress={handlePress}>
  Submit
</Button>

// After
<Button testID="submit-button" onPress={handlePress}>
  Submit
</Button>
```

Then in your test:

```javascript
await tapElement('submit-button');
```

## Test Structure Template

```javascript
import { 
  waitForElement, 
  tapElement, 
  typeText,
  expectElementToBeVisible 
} from './utils/testHelpers';
import { TIMEOUTS } from './utils/config';

describe('Feature Name', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Scenario Name', () => {
    it('should do something', async () => {
      // 1. Setup - wait for initial state
      await waitForElement('screen-id', TIMEOUTS.medium);
      
      // 2. Action - perform user action
      await tapElement('button-id');
      
      // 3. Assert - verify result
      await expectElementToBeVisible('result-screen');
    });
  });
});
```

## Using Test Data

```javascript
import { generateTestUser, TEST_CREDENTIALS } from './utils/testDataSeeder';

// Generate random user
const user = generateTestUser();
await typeText('email-input', user.email);

// Use predefined credentials
const { validUser } = TEST_CREDENTIALS;
await typeText('email-input', validUser.email);
await typeText('password-input', validUser.password);
```

## Debugging Tips

### 1. Take Screenshots

```javascript
await device.takeScreenshot('my-screenshot');
```

### 2. Add Logging

```javascript
console.log('About to tap button');
await tapElement('button-id');
console.log('Button tapped successfully');
```

### 3. Increase Timeouts

```javascript
// If test is timing out
await waitForElement('slow-element', 30000); // 30 seconds
```

### 4. Check Element Exists

```javascript
// Check if element exists before interacting
await expect(element(by.id('element-id'))).toExist();
```

## Common Issues

### "Cannot find element"

**Solution**: Add `testID` prop to the component and ensure it's rendered.

### "Test timeout"

**Solution**: Increase timeout or check if app is stuck in loading state.

### "App not launching"

**Solution**: 
```bash
npm run e2e:clean
npm run e2e:build:android
```

### "Emulator not found"

**Solution**: Check emulator name in `.detoxrc.js` matches your AVD name.

## Next Steps

1. ✅ Run the example test
2. ✅ Write your first test
3. ✅ Add test IDs to your components
4. 📖 Read the full [README.md](./README.md)
5. 🧪 Write tests for critical user flows

## Resources

- [Full E2E Testing Guide](./README.md)
- [Test Helpers Documentation](./utils/testHelpers.js)
- [Test Data Seeding](./utils/testDataSeeder.js)
- [Detox Documentation](https://wix.github.io/Detox/)

## Need Help?

- Check the [Troubleshooting section](./README.md#troubleshooting) in README
- Review existing test files for examples
- Ask the team for assistance

Happy Testing! 🎉
