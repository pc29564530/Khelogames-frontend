/**
 * E2E Test Helper Utilities
 * 
 * This module provides common helper functions for Detox E2E tests
 * to reduce code duplication and improve test maintainability.
 */

/**
 * Wait for an element to be visible with custom timeout
 * @param {string} testID - The testID of the element
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 */
export const waitForElement = async (testID, timeout = 5000) => {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
};

/**
 * Wait for an element to disappear
 * @param {string} testID - The testID of the element
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 */
export const waitForElementToDisappear = async (testID, timeout = 5000) => {
  await waitFor(element(by.id(testID)))
    .not.toBeVisible()
    .withTimeout(timeout);
};

/**
 * Tap an element by testID
 * @param {string} testID - The testID of the element to tap
 */
export const tapElement = async (testID) => {
  await element(by.id(testID)).tap();
};

/**
 * Type text into an input field
 * @param {string} testID - The testID of the input element
 * @param {string} text - The text to type
 */
export const typeText = async (testID, text) => {
  await element(by.id(testID)).typeText(text);
};

/**
 * Replace text in an input field
 * @param {string} testID - The testID of the input element
 * @param {string} text - The text to replace with
 */
export const replaceText = async (testID, text) => {
  await element(by.id(testID)).replaceText(text);
};

/**
 * Clear text from an input field
 * @param {string} testID - The testID of the input element
 */
export const clearText = async (testID) => {
  await element(by.id(testID)).clearText();
};

/**
 * Scroll to an element within a scroll view
 * @param {string} scrollViewTestID - The testID of the scroll view
 * @param {string} elementTestID - The testID of the element to scroll to
 */
export const scrollToElement = async (scrollViewTestID, elementTestID) => {
  await waitFor(element(by.id(elementTestID)))
    .toBeVisible()
    .whileElement(by.id(scrollViewTestID))
    .scroll(200, 'down');
};

/**
 * Swipe on an element
 * @param {string} testID - The testID of the element
 * @param {string} direction - Direction to swipe ('up', 'down', 'left', 'right')
 * @param {string} speed - Speed of swipe ('fast', 'slow')
 */
export const swipeElement = async (testID, direction = 'up', speed = 'fast') => {
  await element(by.id(testID)).swipe(direction, speed);
};

/**
 * Check if element exists
 * @param {string} testID - The testID of the element
 */
export const expectElementToExist = async (testID) => {
  await expect(element(by.id(testID))).toExist();
};

/**
 * Check if element is visible
 * @param {string} testID - The testID of the element
 */
export const expectElementToBeVisible = async (testID) => {
  await expect(element(by.id(testID))).toBeVisible();
};

/**
 * Check if element has text
 * @param {string} testID - The testID of the element
 * @param {string} text - The expected text
 */
export const expectElementToHaveText = async (testID, text) => {
  await expect(element(by.id(testID))).toHaveText(text);
};

/**
 * Check if element has label
 * @param {string} testID - The testID of the element
 * @param {string} label - The expected label
 */
export const expectElementToHaveLabel = async (testID, label) => {
  await expect(element(by.id(testID))).toHaveLabel(label);
};

/**
 * Reload React Native app
 */
export const reloadApp = async () => {
  await device.reloadReactNative();
};

/**
 * Launch app with specific permissions
 * @param {Object} permissions - Permissions object
 */
export const launchAppWithPermissions = async (permissions = {}) => {
  await device.launchApp({
    permissions,
    newInstance: true,
  });
};

/**
 * Take a screenshot
 * @param {string} name - Name of the screenshot
 */
export const takeScreenshot = async (name) => {
  await device.takeScreenshot(name);
};

/**
 * Wait for a specific amount of time (use sparingly, prefer waitFor)
 * @param {number} ms - Milliseconds to wait
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Dismiss keyboard
 */
export const dismissKeyboard = async () => {
  // Tap outside input fields to dismiss keyboard
  await tapElement('dismiss-keyboard-area');
};

/**
 * Navigate back using Android back button
 */
export const navigateBack = async () => {
  await device.pressBack();
};

/**
 * Multi-tap an element
 * @param {string} testID - The testID of the element
 * @param {number} times - Number of times to tap
 */
export const multiTap = async (testID, times = 2) => {
  await element(by.id(testID)).multiTap(times);
};

/**
 * Long press an element
 * @param {string} testID - The testID of the element
 * @param {number} duration - Duration in milliseconds
 */
export const longPress = async (testID, duration = 1000) => {
  await element(by.id(testID)).longPress(duration);
};

/**
 * Select a date in a date picker (Android)
 * @param {string} testID - The testID of the date picker
 * @param {Date} date - The date to select
 */
export const selectDate = async (testID, date) => {
  await element(by.id(testID)).tap();
  // Implementation depends on your date picker component
  // This is a placeholder for custom date picker logic
};

/**
 * Select an item from a picker/dropdown
 * @param {string} pickerTestID - The testID of the picker
 * @param {string} itemTestID - The testID of the item to select
 */
export const selectPickerItem = async (pickerTestID, itemTestID) => {
  await element(by.id(pickerTestID)).tap();
  await element(by.id(itemTestID)).tap();
};

/**
 * Verify toast/snackbar message
 * @param {string} message - Expected message text
 * @param {number} timeout - Timeout in milliseconds
 */
export const expectToastMessage = async (message, timeout = 3000) => {
  await waitFor(element(by.text(message)))
    .toBeVisible()
    .withTimeout(timeout);
};

/**
 * Wait for loading indicator to disappear
 * @param {string} testID - The testID of the loading indicator
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 */
export const waitForLoadingToComplete = async (testID = 'loading-indicator', timeout = 10000) => {
  await waitForElementToDisappear(testID, timeout);
};

/**
 * Scroll to top of a scroll view
 * @param {string} scrollViewTestID - The testID of the scroll view
 */
export const scrollToTop = async (scrollViewTestID) => {
  await element(by.id(scrollViewTestID)).scrollTo('top');
};

/**
 * Scroll to bottom of a scroll view
 * @param {string} scrollViewTestID - The testID of the scroll view
 */
export const scrollToBottom = async (scrollViewTestID) => {
  await element(by.id(scrollViewTestID)).scrollTo('bottom');
};

/**
 * Verify element is not visible
 * @param {string} testID - The testID of the element
 */
export const expectElementNotToBeVisible = async (testID) => {
  await expect(element(by.id(testID))).not.toBeVisible();
};

/**
 * Verify element does not exist
 * @param {string} testID - The testID of the element
 */
export const expectElementNotToExist = async (testID) => {
  await expect(element(by.id(testID))).not.toExist();
};
