/**
 * E2E Test Setup
 * 
 * This file contains global setup and teardown logic for E2E tests.
 * It runs before and after the entire test suite.
 */

/**
 * Global setup - runs once before all tests
 */
beforeAll(async () => {
  console.log('🚀 Starting E2E test suite...');
  
  // Launch the app
  await device.launchApp({
    newInstance: true,
    permissions: {
      notifications: 'YES',
      camera: 'YES',
      photos: 'YES',
      location: 'always',
    },
  });
  
  console.log('✅ App launched successfully');
});

/**
 * Global teardown - runs once after all tests
 */
afterAll(async () => {
  console.log('🏁 E2E test suite completed');
});

/**
 * Before each test - runs before every test
 */
beforeEach(async () => {
  // Reload React Native to ensure clean state
  // Comment this out if you want to maintain state between tests
  // await device.reloadReactNative();
});

/**
 * After each test - runs after every test
 */
afterEach(async () => {
  // Take screenshot on test failure
  if (jasmine.currentTest && jasmine.currentTest.failedExpectations.length > 0) {
    const testName = jasmine.currentTest.fullName.replace(/\s+/g, '_');
    await device.takeScreenshot(`FAILED_${testName}`);
  }
});
