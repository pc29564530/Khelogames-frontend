# End-to-End Testing with Detox

This directory contains E2E tests for the Khelogames application using Detox.

## Setup

### 1. Install Detox CLI

```bash
npm install -g detox-cli
```

### 2. Install Detox Dependencies

```bash
npm install --save-dev detox jest
```

### 3. Set Up Android Emulator

Ensure you have an Android emulator set up with the name specified in `.detoxrc.js`:

```bash
# List available AVDs
emulator -list-avds

# Create a new AVD if needed (example)
avdmanager create avd -n Pixel_3a_API_30_x86 -k "system-images;android-30;google_apis;x86"
```

## Running E2E Tests

### Build the App

```bash
# Debug build
detox build --configuration android.debug

# Release build
detox build --configuration android.release
```

### Run Tests

```bash
# Run all E2E tests
detox test --configuration android.debug

# Run specific test file
detox test --configuration android.debug e2e/authentication.e2e.js

# Run with cleanup
detox test --configuration android.debug --cleanup
```

## Writing E2E Tests

### Example Test

Create a file `e2e/example.e2e.js`:

```javascript
describe('Example E2E Test', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show home screen', async () => {
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should navigate to login screen', async () => {
    await element(by.id('login-button')).tap();
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should login successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('submit-button')).tap();
    
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

## Detox Matchers

Common matchers for assertions:

```javascript
// Visibility
await expect(element(by.id('element'))).toBeVisible();
await expect(element(by.id('element'))).toBeNotVisible();

// Existence
await expect(element(by.id('element'))).toExist();
await expect(element(by.id('element'))).toNotExist();

// Text
await expect(element(by.id('element'))).toHaveText('Hello');
await expect(element(by.id('element'))).toHaveLabel('Button');

// Value
await expect(element(by.id('input'))).toHaveValue('text');
```

## Detox Actions

Common actions for interactions:

```javascript
// Tap
await element(by.id('button')).tap();
await element(by.id('button')).multiTap(3);
await element(by.id('button')).longPress();

// Type
await element(by.id('input')).typeText('Hello World');
await element(by.id('input')).replaceText('New Text');
await element(by.id('input')).clearText();

// Scroll
await element(by.id('scrollView')).scroll(200, 'down');
await element(by.id('scrollView')).scrollTo('bottom');

// Swipe
await element(by.id('element')).swipe('up');
await element(by.id('element')).swipe('down', 'fast');
```

## Selectors

Ways to select elements:

```javascript
// By test ID (recommended)
element(by.id('testID'))

// By text
element(by.text('Button Text'))

// By label
element(by.label('Accessibility Label'))

// By type
element(by.type('RCTTextInput'))

// Combining matchers
element(by.id('button').and(by.text('Submit')))
```

## Best Practices

1. **Use Test IDs**: Always add `testID` props to components for reliable selection
2. **Wait for Elements**: Use `waitFor()` for async operations
3. **Keep Tests Independent**: Each test should be able to run in isolation
4. **Clean State**: Reset app state between tests
5. **Avoid Hardcoded Delays**: Use `waitFor()` instead of `sleep()`
6. **Test Critical Paths**: Focus on main user flows
7. **Use Descriptive Names**: Test names should clearly describe the scenario

## Troubleshooting

### App Not Launching

```bash
# Clean and rebuild
detox clean-framework-cache && detox build-framework-cache
detox build --configuration android.debug
```

### Element Not Found

- Verify the element has a `testID` prop
- Check if the element is actually rendered
- Use `await waitFor(element(by.id('id'))).toBeVisible()`

### Tests Timing Out

- Increase timeout in test: `await waitFor(...).withTimeout(10000)`
- Check if app is stuck in loading state
- Verify network requests are completing

## Additional Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Detox API Reference](https://wix.github.io/Detox/docs/api/actions)
- [Detox Troubleshooting Guide](https://wix.github.io/Detox/docs/troubleshooting/building-the-app)
