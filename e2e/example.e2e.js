/**
 * Example E2E Test
 * 
 * This is an example test file demonstrating how to write E2E tests
 * using Detox with the test utilities and helpers.
 */

import {
  waitForElement,
  tapElement,
  typeText,
  expectElementToBeVisible,
  expectElementToHaveText,
  reloadApp,
} from './utils/testHelpers';

import {
  generateTestUser,
  TEST_CREDENTIALS,
} from './utils/testDataSeeder';

import { TIMEOUTS } from './utils/config';

describe('Example E2E Test Suite', () => {
  beforeAll(async () => {
    // This runs once before all tests in this suite
    console.log('Starting Example E2E tests');
  });

  beforeEach(async () => {
    // Reload app before each test to ensure clean state
    await reloadApp();
  });

  describe('App Launch', () => {
    it('should launch the app successfully', async () => {
      // Wait for the app to load
      await waitForElement('app-root', TIMEOUTS.long);
      
      // Verify app is visible
      await expectElementToBeVisible('app-root');
    });

    it('should display the home screen', async () => {
      // Wait for home screen to be visible
      await waitForElement('home-screen', TIMEOUTS.medium);
      
      // Verify home screen is displayed
      await expectElementToBeVisible('home-screen');
    });
  });

  describe('Navigation', () => {
    it('should navigate between screens', async () => {
      // Wait for home screen
      await waitForElement('home-screen', TIMEOUTS.medium);
      
      // Tap on a navigation item (example)
      // await tapElement('nav-matches');
      
      // Verify navigation occurred
      // await expectElementToBeVisible('matches-screen');
      
      // Navigate back
      // await device.pressBack();
      
      // Verify we're back on home screen
      // await expectElementToBeVisible('home-screen');
    });
  });

  describe('User Interactions', () => {
    it('should handle button taps', async () => {
      // Example of tapping a button
      // await waitForElement('example-button', TIMEOUTS.medium);
      // await tapElement('example-button');
      
      // Verify the action occurred
      // await expectElementToBeVisible('result-screen');
    });

    it('should handle text input', async () => {
      // Example of typing text
      // await waitForElement('text-input', TIMEOUTS.medium);
      // await typeText('text-input', 'Hello World');
      
      // Verify the text was entered
      // await expectElementToHaveText('text-input', 'Hello World');
    });
  });

  describe('Data Generation', () => {
    it('should generate test user data', () => {
      // Generate a test user
      const user = generateTestUser();
      
      // Verify user has required fields
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('password');
      expect(user).toHaveProperty('username');
      expect(user.email).toContain('@');
    });

    it('should use predefined test credentials', () => {
      // Use predefined credentials
      const { validUser } = TEST_CREDENTIALS;
      
      // Verify credentials exist
      expect(validUser.email).toBe('test@khelogames.com');
      expect(validUser.password).toBe('Test@1234');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Example of testing error handling
      // This would require triggering a network error scenario
      
      // For now, this is a placeholder
      expect(true).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should load screens within acceptable time', async () => {
      const startTime = Date.now();
      
      // Wait for screen to load
      await waitForElement('home-screen', TIMEOUTS.long);
      
      const loadTime = Date.now() - startTime;
      
      // Verify load time is acceptable (less than 3 seconds)
      expect(loadTime).toBeLessThan(3000);
    });
  });
});
