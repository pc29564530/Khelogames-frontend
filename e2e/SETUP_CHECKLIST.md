# E2E Testing Setup Checklist

Use this checklist to verify your E2E testing environment is properly configured.

## ✅ Installation Checklist

- [x] Detox installed (`detox@20.27.2`)
- [x] E2E test scripts added to `package.json`
- [x] `.detoxrc.js` configured for Android
- [x] `e2e/jest.config.js` configured
- [x] Test utilities created (`e2e/utils/`)
- [x] Documentation created (`README.md`, `QUICK_START.md`)

## 📋 Prerequisites Checklist

Before running E2E tests, ensure you have:

- [ ] Android Studio installed
- [ ] Android SDK installed and configured
- [ ] Android Emulator created (name: `Pixel_3a_API_30_x86`)
- [ ] Node.js and npm installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Environment variables configured (if needed)

## 🔧 Configuration Checklist

Verify these configuration files exist and are correct:

- [x] `.detoxrc.js` - Detox configuration
  - [x] Android debug configuration
  - [x] Android release configuration
  - [x] Emulator device configuration
  
- [x] `e2e/jest.config.js` - Jest configuration
  - [x] Test match pattern
  - [x] Test timeout (120000ms)
  - [x] Setup files configured
  - [x] Detox test environment
  
- [x] `package.json` - NPM scripts
  - [x] `e2e:build:android`
  - [x] `e2e:test:android`
  - [x] `e2e:test:android:release`
  - [x] `e2e:build:release`
  - [x] `e2e:clean`

## 📁 File Structure Checklist

Verify these files exist:

```
e2e/
├── [x] README.md
├── [x] QUICK_START.md
├── [x] SETUP_CHECKLIST.md (this file)
├── [x] jest.config.js
├── [x] setup.js
├── [x] example.e2e.js
└── utils/
    ├── [x] testHelpers.js
    ├── [x] testDataSeeder.js
    └── [x] config.js
```

## 🧪 Test Utilities Checklist

Verify test utilities are available:

### testHelpers.js
- [x] `waitForElement()`
- [x] `tapElement()`
- [x] `typeText()`
- [x] `expectElementToBeVisible()`
- [x] `scrollToElement()`
- [x] `navigateBack()`
- [x] `reloadApp()`
- [x] `takeScreenshot()`

### testDataSeeder.js
- [x] `generateTestUser()`
- [x] `generateCricketMatch()`
- [x] `generateFootballMatch()`
- [x] `generateTournament()`
- [x] `TEST_CREDENTIALS`

### config.js
- [x] `TIMEOUTS`
- [x] `API_CONFIG`
- [x] `TEST_ENV`
- [x] `getApiUrl()`
- [x] `isAndroid()`

## 🚀 First Run Checklist

Follow these steps for your first E2E test run:

1. [ ] Start Android Emulator
   ```bash
   emulator -avd Pixel_3a_API_30_x86 &
   ```

2. [ ] Build the app
   ```bash
   npm run e2e:build:android
   ```

3. [ ] Run example test
   ```bash
   npm run e2e:test:android
   ```

4. [ ] Verify test passes
   - [ ] App launches successfully
   - [ ] Tests execute without errors
   - [ ] Test results are displayed

## 🔍 Verification Commands

Run these commands to verify your setup:

```bash
# Check Detox is installed
npm list detox

# Check Android SDK
echo $ANDROID_HOME

# List available emulators
emulator -list-avds

# Check if emulator is running
adb devices

# Verify Detox configuration
cat .detoxrc.js

# List E2E test files
ls -la e2e/*.e2e.js
```

## 📝 Component Preparation Checklist

To make components testable, ensure:

- [ ] Add `testID` props to interactive elements
- [ ] Use descriptive testID names
- [ ] Add testIDs to screens/containers
- [ ] Add testIDs to buttons and inputs
- [ ] Add testIDs to navigation elements

Example:
```javascript
<Button testID="submit-button" onPress={handleSubmit}>
  Submit
</Button>
```

## 🐛 Troubleshooting Checklist

If tests fail, check:

- [ ] Emulator is running (`adb devices`)
- [ ] App is built (`npm run e2e:build:android`)
- [ ] Metro bundler is not blocking port 8081
- [ ] No other apps using port 8081
- [ ] Android SDK path is correct
- [ ] Emulator name matches `.detoxrc.js`
- [ ] Test files have `.e2e.js` extension
- [ ] testID props are added to components

## 📚 Documentation Checklist

Review these documents:

- [ ] Read `e2e/README.md` - Comprehensive guide
- [ ] Read `e2e/QUICK_START.md` - Quick start guide
- [ ] Review `e2e/example.e2e.js` - Example test
- [ ] Review `e2e/utils/testHelpers.js` - Helper functions
- [ ] Review `e2e/utils/testDataSeeder.js` - Data generators
- [ ] Review `e2e/utils/config.js` - Configuration

## ✨ Next Steps

Once setup is verified:

1. [ ] Write authentication E2E tests (Task 18.2)
2. [ ] Write match management E2E tests (Task 18.3)
3. [ ] Write social features E2E tests (Task 18.4)
4. [ ] Add testIDs to all components
5. [ ] Integrate E2E tests into CI/CD pipeline

## 🎯 Success Criteria

Your E2E testing setup is complete when:

- [x] Detox is installed and configured
- [x] Test utilities are created
- [x] Documentation is available
- [ ] Example test runs successfully
- [ ] You can write and run new tests
- [ ] Tests are integrated into development workflow

## 📞 Getting Help

If you encounter issues:

1. Check the [Troubleshooting section](./README.md#troubleshooting) in README
2. Review the [Quick Start Guide](./QUICK_START.md)
3. Check [Detox Documentation](https://wix.github.io/Detox/)
4. Ask the team for assistance

---

**Last Updated**: November 27, 2024
**Detox Version**: 20.27.2
**Status**: ✅ Setup Complete
