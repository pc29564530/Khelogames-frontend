# Authentication E2E Tests Guide

## Overview
This guide provides instructions for running and maintaining the authentication E2E tests.

## Prerequisites

### 1. Android Emulator Setup
Ensure you have an Android emulator configured and running:
```bash
# List available emulators
emulator -list-avds

# Start the emulator (replace with your AVD name)
emulator -avd Pixel_3a_API_30_x86
```

### 2. Test Environment
- Node.js and npm installed
- React Native development environment set up
- Detox CLI installed globally (optional but recommended):
  ```bash
  npm install -g detox-cli
  ```

## Running the Tests

### Quick Start
```bash
# 1. Build the app for testing
npm run e2e:build:android

# 2. Run the authentication tests
npm run e2e:test:android -- e2e/authentication.e2e.js
```

### Run All E2E Tests
```bash
npm run e2e:test:android
```

### Run Specific Test Suite
```bash
# Run only login tests
npm run e2e:test:android -- e2e/authentication.e2e.js --testNamePattern="Login Flow"

# Run only signup tests
npm run e2e:test:android -- e2e/authentication.e2e.js --testNamePattern="Signup Flow"

# Run only logout tests
npm run e2e:test:android -- e2e/authentication.e2e.js --testNamePattern="Logout Flow"
```

### Run Single Test
```bash
npm run e2e:test:android -- e2e/authentication.e2e.js --testNamePattern="should successfully login with valid credentials"
```

### Debug Mode
```bash
# Run tests with verbose output
npm run e2e:test:android -- e2e/authentication.e2e.js --loglevel verbose

# Run tests with screenshots on failure (enabled by default)
npm run e2e:test:android -- e2e/authentication.e2e.js --take-screenshots failing
```

## Test Structure

### Test Suites
1. **Login Flow** - 7 tests
   - Valid login
   - Invalid email format
   - Empty email
   - Empty password
   - Weak password
   - Password visibility toggle
   - Navigate to signup

2. **Signup Flow** - 8 tests
   - Valid signup
   - Empty full name
   - Invalid email format
   - Weak password
   - Password mismatch
   - Password visibility toggle
   - Confirm password visibility toggle
   - Navigate to signin

3. **Logout Flow** - 1 test (partial)
   - Logout and return to signin

4. **Session Persistence** - 1 test
   - Maintain session after reload

5. **Error Handling** - 2 tests (placeholders)
   - Network errors during login
   - Server errors during signup

## Test Data

### Predefined Credentials
Located in `e2e/utils/testDataSeeder.js`:
```javascript
TEST_CREDENTIALS = {
  validUser: {
    email: 'test@khelogames.com',
    password: 'Test@1234',
    username: 'testuser',
  },
  adminUser: {
    email: 'admin@khelogames.com',
    password: 'Admin@1234',
    username: 'adminuser',
  },
  invalidUser: {
    email: 'invalid@khelogames.com',
    password: 'WrongPassword',
  },
}
```

### Dynamic Test Data
The signup tests use `generateTestUser()` to create unique test data:
```javascript
const testUser = generateTestUser({
  email: `test${Date.now()}@khelogames.com`,
});
```

## Troubleshooting

### Common Issues

#### 1. Emulator Not Found
```
Error: Cannot boot device
```
**Solution**: Ensure emulator is running before running tests
```bash
emulator -avd Pixel_3a_API_30_x86
```

#### 2. App Not Installed
```
Error: Activity not started
```
**Solution**: Rebuild the app
```bash
npm run e2e:build:android
```

#### 3. Element Not Found
```
Error: Test Failed: Cannot find element with testID
```
**Solution**: 
- Verify testID exists in the component
- Check if element is visible on screen
- Increase timeout if element takes time to appear

#### 4. Tests Timing Out
```
Error: Timeout - Async callback was not invoked
```
**Solution**:
- Increase timeout in test configuration
- Check if app is responding
- Verify network connectivity for API calls

#### 5. Flaky Tests
**Solution**:
- Add explicit waits before interactions
- Use `waitForElement()` instead of fixed delays
- Ensure clean state between tests with `reloadApp()`

### Debug Tips

1. **Take Screenshots**
   ```bash
   npm run e2e:test:android -- --take-screenshots all
   ```
   Screenshots are saved in `artifacts/` directory

2. **View Logs**
   ```bash
   # View Detox logs
   npm run e2e:test:android -- --loglevel trace

   # View device logs
   adb logcat
   ```

3. **Inspect Elements**
   Use React Native Debugger or Flipper to inspect element testIDs

4. **Run Single Test**
   Isolate failing tests to debug more easily

## Maintenance

### Adding New Tests

1. **Add testIDs to components**
   ```javascript
   <TextInput testID="my-input" />
   <Pressable testID="my-button">
   ```

2. **Write test in `e2e/authentication.e2e.js`**
   ```javascript
   it('should do something', async () => {
     await waitForElement('my-input', TIMEOUTS.medium);
     await tapElement('my-button');
     await expectElementToBeVisible('result-screen');
   });
   ```

3. **Run test to verify**
   ```bash
   npm run e2e:test:android -- --testNamePattern="should do something"
   ```

### Updating Test Data

Edit `e2e/utils/testDataSeeder.js`:
```javascript
export const TEST_CREDENTIALS = {
  validUser: {
    email: 'newemail@khelogames.com',
    password: 'NewPassword@123',
  },
};
```

### Updating Timeouts

Edit `e2e/utils/config.js`:
```javascript
export const TIMEOUTS = {
  short: 3000,
  medium: 5000,
  long: 10000,
};
```

## Best Practices

### 1. Use Descriptive Test Names
```javascript
// Good
it('should show error when email is empty', async () => {});

// Bad
it('test email', async () => {});
```

### 2. Clean State Between Tests
```javascript
beforeEach(async () => {
  await reloadApp();
});
```

### 3. Use Explicit Waits
```javascript
// Good
await waitForElement('signin-screen', TIMEOUTS.medium);

// Bad
await sleep(2000);
```

### 4. Test One Thing at a Time
```javascript
// Good - focused test
it('should show error with invalid email', async () => {
  await tapElement('email-input');
  await replaceText('email-input', 'invalid');
  await tapElement('submit-button');
  await expectElementToBeVisible('email-error');
});

// Bad - testing multiple things
it('should validate all fields', async () => {
  // Tests email, password, name validation all at once
});
```

### 5. Use Test Helpers
```javascript
// Good
await waitForElement('screen', TIMEOUTS.medium);
await tapElement('button');

// Bad
await waitFor(element(by.id('screen'))).toBeVisible().withTimeout(5000);
await element(by.id('button')).tap();
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: |
    npm run e2e:build:android
    npm run e2e:test:android -- e2e/authentication.e2e.js
```

### Test Reports
Test results are output in JUnit format and can be integrated with CI/CD pipelines.

## Related Documentation
- [E2E Setup Guide](./SETUP_CHECKLIST.md)
- [E2E Quick Start](./QUICK_START.md)
- [Test Helpers Documentation](./utils/testHelpers.js)
- [Test Data Seeder Documentation](./utils/testDataSeeder.js)

## Support
For issues or questions:
1. Check the troubleshooting section above
2. Review Detox documentation: https://wix.github.io/Detox/
3. Check test logs and screenshots in `artifacts/` directory
