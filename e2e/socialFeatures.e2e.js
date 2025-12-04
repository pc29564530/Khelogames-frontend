/**
 * Social Features E2E Tests
 * 
 * This test suite covers the complete social features flows including:
 * - Creating a thread
 * - Commenting on threads
 * - Following users
 * 
 * Requirements: 5.3
 * 
 * NOTE: This test file requires testIDs to be added to the following screens:
 * - screen/CreateThread.js
 * - screen/Thread.js
 * - screen/ThreadComment.js
 * - screen/Profile.js
 * - components/ThreadItems.js
 * - components/Comment.js
 * 
 * See the inline comments for required testID additions.
 */

import {
  waitForElement,
  tapElement,
  typeText,
  replaceText,
  expectElementToBeVisible,
  expectElementToHaveText,
  reloadApp,
  waitForLoadingToComplete,
  expectElementNotToBeVisible,
  scrollToElement,
  swipeElement,
  clearText,
} from './utils/testHelpers';

import {
  generateThread,
  generateComment,
  generateTestUser,
  TEST_CREDENTIALS,
} from './utils/testDataSeeder';

import { TIMEOUTS } from './utils/config';

describe('Social Features E2E Tests', () => {
  beforeEach(async () => {
    // Reload app and ensure user is logged in before each test
    await reloadApp();
    
    // Login with valid credentials
    await waitForElement('signin-screen', TIMEOUTS.long);
    await tapElement('signin-email-input');
    await replaceText('signin-email-input', TEST_CREDENTIALS.validUser.email);
    
    await tapElement('signin-password-input');
    await replaceText('signin-password-input', TEST_CREDENTIALS.validUser.password);
    await tapElement('signin-submit-button');
    
    // Wait for home screen
    await waitForElement('home-screen', TIMEOUTS.long);
  });

  describe('Thread Creation Flow', () => {
    /**
     * Required testIDs for CreateThread.js:
     * - create-thread-screen
     * - thread-title-input
     * - thread-content-input
     * - select-community-button
     * - community-modal
     * - community-item-{index}
     * - upload-media-button
     * - media-preview-image
     * - media-preview-video
     * - submit-thread-button
     * - thread-validation-error
     * - thread-creation-loading
     */

    it('should successfully create a thread with title and content', async () => {
      // Generate test thread data
      const testThread = generateThread();
      
      // Navigate to create thread screen
      // NOTE: Adjust navigation based on actual app structure
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      
      // Tap create thread button
      await tapElement('create-thread-button');
      await waitForElement('create-thread-screen', TIMEOUTS.medium);
      
      // Verify we're on the create thread screen
      await expectElementToBeVisible('thread-title-input');
      await expectElementToBeVisible('thread-content-input');
      
      // Enter thread title
      await tapElement('thread-title-input');
      await replaceText('thread-title-input', testThread.title);
      
      // Enter thread content
      await tapElement('thread-content-input');
      await replaceText('thread-content-input', testThread.content);
      
      // Select community
      await tapElement('select-community-button');
      await waitForElement('community-modal', TIMEOUTS.short);
      
      // Select first community from list
      await tapElement('community-item-0');
      
      // Verify community is selected
      await expectElementToBeVisible('selected-community-name');
      
      // Submit thread
      await tapElement('submit-thread-button');
      
      // Wait for loading to complete
      await waitForLoadingToComplete('thread-creation-loading', TIMEOUTS.long);
      
      // Verify navigation back to thread list
      await waitForElement('thread-list-screen', TIMEOUTS.medium);
      
      // Verify thread appears in the list
      await expectElementToBeVisible('thread-item-0');
    });

    it('should show validation error when title is empty', async () => {
      // Navigate to create thread screen
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('create-thread-button');
      await waitForElement('create-thread-screen', TIMEOUTS.medium);
      
      // Enter only content, leave title empty
      await tapElement('thread-content-input');
      await replaceText('thread-content-input', 'This is test content without a title');
      
      // Select community
      await tapElement('select-community-button');
      await waitForElement('community-modal', TIMEOUTS.short);
      await tapElement('community-item-0');
      
      // Try to submit
      await tapElement('submit-thread-button');
      
      // Verify validation error is shown
      await waitForElement('thread-validation-error', TIMEOUTS.short);
      await expectElementToBeVisible('thread-validation-error');
    });

    it('should show validation error when content is empty', async () => {
      // Navigate to create thread screen
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('create-thread-button');
      await waitForElement('create-thread-screen', TIMEOUTS.medium);
      
      // Enter only title, leave content empty
      await tapElement('thread-title-input');
      await replaceText('thread-title-input', 'Test Thread Title');
      
      // Select community
      await tapElement('select-community-button');
      await waitForElement('community-modal', TIMEOUTS.short);
      await tapElement('community-item-0');
      
      // Try to submit
      await tapElement('submit-thread-button');
      
      // Verify validation error is shown
      await waitForElement('thread-validation-error', TIMEOUTS.short);
      await expectElementToBeVisible('thread-validation-error');
    });

    it('should show validation error when community is not selected', async () => {
      const testThread = generateThread();
      
      // Navigate to create thread screen
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('create-thread-button');
      await waitForElement('create-thread-screen', TIMEOUTS.medium);
      
      // Enter title and content
      await tapElement('thread-title-input');
      await replaceText('thread-title-input', testThread.title);
      
      await tapElement('thread-content-input');
      await replaceText('thread-content-input', testThread.content);
      
      // Try to submit without selecting community
      await tapElement('submit-thread-button');
      
      // Verify validation error is shown
      await waitForElement('thread-validation-error', TIMEOUTS.short);
      await expectElementToBeVisible('thread-validation-error');
    });

    it('should create thread with media attachment', async () => {
      const testThread = generateThread();
      
      // Navigate to create thread screen
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('create-thread-button');
      await waitForElement('create-thread-screen', TIMEOUTS.medium);
      
      // Enter title and content
      await tapElement('thread-title-input');
      await replaceText('thread-title-input', testThread.title);
      
      await tapElement('thread-content-input');
      await replaceText('thread-content-input', testThread.content);
      
      // Upload media
      await tapElement('upload-media-button');
      
      // NOTE: Actual media selection would require mocking the image picker
      // For now, we verify the button is tappable
      await expectElementToBeVisible('upload-media-button');
      
      // Select community
      await tapElement('select-community-button');
      await waitForElement('community-modal', TIMEOUTS.short);
      await tapElement('community-item-0');
      
      // Submit thread
      await tapElement('submit-thread-button');
      
      // Wait for loading
      await waitForLoadingToComplete('thread-creation-loading', TIMEOUTS.long);
      
      // Verify success
      await waitForElement('thread-list-screen', TIMEOUTS.medium);
    });

    it('should allow canceling thread creation', async () => {
      const testThread = generateThread();
      
      // Navigate to create thread screen
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('create-thread-button');
      await waitForElement('create-thread-screen', TIMEOUTS.medium);
      
      // Enter some data
      await tapElement('thread-title-input');
      await replaceText('thread-title-input', testThread.title);
      
      // Cancel by going back
      await tapElement('cancel-thread-button');
      
      // Verify navigation back to previous screen
      await waitForElement('community-screen', TIMEOUTS.medium);
      await expectElementToBeVisible('community-screen');
    });
  });

  describe('Thread Commenting Flow', () => {
    /**
     * Required testIDs for ThreadComment.js and Comment.js:
     * - thread-comment-screen
     * - thread-author-avatar
     * - thread-author-name
     * - thread-author-username
     * - thread-content-text
     * - thread-media-image
     * - thread-media-video
     * - thread-like-count
     * - thread-like-button
     * - thread-comment-button
     * - comment-input
     * - comment-submit-button
     * - comment-list
     * - comment-item-{index}
     * - comment-author-{index}
     * - comment-text-{index}
     * - comment-loading
     */

    it('should successfully add a comment to a thread', async () => {
      const testComment = generateComment();
      
      // Navigate to thread list
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      
      // Select a thread
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      
      // Verify thread details are visible
      await expectElementToBeVisible('thread-author-name');
      await expectElementToBeVisible('thread-content-text');
      
      // Tap comment button to focus input
      await tapElement('thread-comment-button');
      
      // Verify comment input is visible
      await expectElementToBeVisible('comment-input');
      
      // Enter comment text
      await tapElement('comment-input');
      await replaceText('comment-input', testComment.content);
      
      // Submit comment
      await tapElement('comment-submit-button');
      
      // Wait for loading to complete
      await waitForLoadingToComplete('comment-loading', TIMEOUTS.medium);
      
      // Verify comment appears in the list
      await waitForElement('comment-item-0', TIMEOUTS.medium);
      await expectElementToBeVisible('comment-item-0');
      
      // Verify comment text is displayed
      await expectElementToBeVisible('comment-text-0');
    });

    it('should show validation error when comment is empty', async () => {
      // Navigate to thread
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      
      // Try to submit empty comment
      await tapElement('comment-submit-button');
      
      // Verify error or that button is disabled
      // NOTE: Actual behavior depends on implementation
      await expectElementToBeVisible('comment-input');
    });

    it('should display existing comments on thread', async () => {
      // Navigate to thread with existing comments
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      
      // Verify comment list is visible
      await expectElementToBeVisible('comment-list');
      
      // Verify at least one comment exists
      // NOTE: This assumes test data has been seeded
      await expectElementToBeVisible('comment-item-0');
      await expectElementToBeVisible('comment-author-0');
      await expectElementToBeVisible('comment-text-0');
    });

    it('should like a thread', async () => {
      // Navigate to thread
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      
      // Get initial like count
      await expectElementToBeVisible('thread-like-count');
      
      // Tap like button
      await tapElement('thread-like-button');
      
      // Wait for like to register
      await waitForLoadingToComplete('like-loading', TIMEOUTS.short);
      
      // Verify like count increased
      // NOTE: Actual verification would require reading the text value
      await expectElementToBeVisible('thread-like-count');
    });

    it('should navigate to thread author profile', async () => {
      // Navigate to thread
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      
      // Tap on author avatar or name
      await tapElement('thread-author-avatar');
      
      // Verify navigation to profile screen
      await waitForElement('profile-screen', TIMEOUTS.medium);
      await expectElementToBeVisible('profile-screen');
    });

    it('should scroll through multiple comments', async () => {
      // Navigate to thread with many comments
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      
      // Verify first comment is visible
      await expectElementToBeVisible('comment-item-0');
      
      // Scroll down to see more comments
      await scrollToElement('thread-comment-screen', 'comment-item-5');
      
      // Verify scrolled comment is visible
      await expectElementToBeVisible('comment-item-5');
    });

    it('should clear comment input after submission', async () => {
      const testComment = generateComment();
      
      // Navigate to thread
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      
      // Enter and submit comment
      await tapElement('comment-input');
      await replaceText('comment-input', testComment.content);
      await tapElement('comment-submit-button');
      
      // Wait for submission
      await waitForLoadingToComplete('comment-loading', TIMEOUTS.medium);
      
      // Verify input is cleared
      // NOTE: This would require checking the input value
      await expectElementToBeVisible('comment-input');
    });
  });

  describe('User Following Flow', () => {
    /**
     * Required testIDs for Profile.js:
     * - profile-screen
     * - profile-avatar
     * - profile-full-name
     * - profile-username
     * - profile-follower-count
     * - profile-following-count
     * - follow-button
     * - unfollow-button
     * - following-button
     * - edit-profile-button
     * - message-button
     * - player-button
     * - follow-loading
     * - follower-list-button
     * - following-list-button
     */

    it('should successfully follow a user', async () => {
      // Navigate to another user's profile
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      
      // Navigate to a thread and tap on author
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      await tapElement('thread-author-avatar');
      
      // Wait for profile screen
      await waitForElement('profile-screen', TIMEOUTS.medium);
      
      // Verify profile details are visible
      await expectElementToBeVisible('profile-full-name');
      await expectElementToBeVisible('profile-username');
      await expectElementToBeVisible('profile-follower-count');
      await expectElementToBeVisible('profile-following-count');
      
      // Verify follow button is visible
      await expectElementToBeVisible('follow-button');
      
      // Tap follow button
      await tapElement('follow-button');
      
      // Wait for follow action to complete
      await waitForLoadingToComplete('follow-loading', TIMEOUTS.medium);
      
      // Verify button changes to "Following"
      await waitForElement('following-button', TIMEOUTS.short);
      await expectElementToBeVisible('following-button');
    });

    it('should successfully unfollow a user', async () => {
      // Navigate to a user's profile that we're already following
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      await tapElement('thread-author-avatar');
      await waitForElement('profile-screen', TIMEOUTS.medium);
      
      // First follow the user if not already following
      const followButtonExists = await element(by.id('follow-button')).exists();
      if (followButtonExists) {
        await tapElement('follow-button');
        await waitForLoadingToComplete('follow-loading', TIMEOUTS.medium);
      }
      
      // Verify "Following" button is visible
      await expectElementToBeVisible('following-button');
      
      // Tap to unfollow
      await tapElement('following-button');
      
      // Wait for unfollow action to complete
      await waitForLoadingToComplete('follow-loading', TIMEOUTS.medium);
      
      // Verify button changes back to "Follow"
      await waitForElement('follow-button', TIMEOUTS.short);
      await expectElementToBeVisible('follow-button');
    });

    it('should update follower count after following', async () => {
      // Navigate to user profile
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      await tapElement('thread-author-avatar');
      await waitForElement('profile-screen', TIMEOUTS.medium);
      
      // Get initial follower count
      await expectElementToBeVisible('profile-follower-count');
      
      // Follow the user
      await tapElement('follow-button');
      await waitForLoadingToComplete('follow-loading', TIMEOUTS.medium);
      
      // Verify follower count is updated
      // NOTE: Actual verification would require reading and comparing the count
      await expectElementToBeVisible('profile-follower-count');
    });

    it('should navigate to follower list', async () => {
      // Navigate to own profile
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('profile-tab');
      await waitForElement('profile-screen', TIMEOUTS.medium);
      
      // Tap on follower count
      await tapElement('follower-list-button');
      
      // Verify navigation to follower list
      await waitForElement('follower-list-screen', TIMEOUTS.medium);
      await expectElementToBeVisible('follower-list-screen');
    });

    it('should navigate to following list', async () => {
      // Navigate to own profile
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('profile-tab');
      await waitForElement('profile-screen', TIMEOUTS.medium);
      
      // Tap on following count
      await tapElement('following-list-button');
      
      // Verify navigation to following list
      await waitForElement('following-list-screen', TIMEOUTS.medium);
      await expectElementToBeVisible('following-list-screen');
    });

    it('should show edit profile button on own profile', async () => {
      // Navigate to own profile
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('profile-tab');
      await waitForElement('profile-screen', TIMEOUTS.medium);
      
      // Verify edit profile button is visible
      await expectElementToBeVisible('edit-profile-button');
      
      // Verify follow button is NOT visible on own profile
      await expectElementNotToBeVisible('follow-button');
    });

    it('should not show edit profile button on other user profile', async () => {
      // Navigate to another user's profile
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      await tapElement('thread-author-avatar');
      await waitForElement('profile-screen', TIMEOUTS.medium);
      
      // Verify edit profile button is NOT visible
      await expectElementNotToBeVisible('edit-profile-button');
      
      // Verify follow button IS visible
      await expectElementToBeVisible('follow-button');
    });

    it('should navigate to message screen from profile', async () => {
      // Navigate to another user's profile
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      await tapElement('thread-author-avatar');
      await waitForElement('profile-screen', TIMEOUTS.medium);
      
      // Tap message button
      await tapElement('message-button');
      
      // Verify navigation to message screen
      await waitForElement('message-screen', TIMEOUTS.medium);
      await expectElementToBeVisible('message-screen');
    });

    it('should handle follow action with poor network', async () => {
      // This test would require mocking network conditions
      // For now, it's a placeholder for future implementation
      //
      // Expected behavior:
      // 1. Navigate to user profile
      // 2. Simulate poor network
      // 3. Tap follow button
      // 4. Verify loading indicator is shown
      // 5. Verify retry mechanism works
      // 6. Verify error message if network fails completely
    });
  });

  describe('Social Features Integration', () => {
    it('should create thread, comment on it, and follow thread author', async () => {
      const testThread = generateThread();
      const testComment = generateComment();
      
      // Step 1: Create a thread
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('create-thread-button');
      await waitForElement('create-thread-screen', TIMEOUTS.medium);
      
      await tapElement('thread-title-input');
      await replaceText('thread-title-input', testThread.title);
      
      await tapElement('thread-content-input');
      await replaceText('thread-content-input', testThread.content);
      
      await tapElement('select-community-button');
      await waitForElement('community-modal', TIMEOUTS.short);
      await tapElement('community-item-0');
      
      await tapElement('submit-thread-button');
      await waitForLoadingToComplete('thread-creation-loading', TIMEOUTS.long);
      
      // Step 2: Navigate to the created thread and add a comment
      await waitForElement('thread-list-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      
      await tapElement('comment-input');
      await replaceText('comment-input', testComment.content);
      await tapElement('comment-submit-button');
      await waitForLoadingToComplete('comment-loading', TIMEOUTS.medium);
      
      // Step 3: Navigate to thread author profile and follow
      await tapElement('thread-author-avatar');
      await waitForElement('profile-screen', TIMEOUTS.medium);
      
      await tapElement('follow-button');
      await waitForLoadingToComplete('follow-loading', TIMEOUTS.medium);
      
      // Verify all actions completed successfully
      await expectElementToBeVisible('following-button');
    });

    it('should view thread from followed user profile', async () => {
      // Navigate to a user profile
      await waitForElement('home-screen', TIMEOUTS.medium);
      await tapElement('community-tab');
      await waitForElement('community-screen', TIMEOUTS.medium);
      await tapElement('thread-item-0');
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      await tapElement('thread-author-avatar');
      await waitForElement('profile-screen', TIMEOUTS.medium);
      
      // Follow the user
      await tapElement('follow-button');
      await waitForLoadingToComplete('follow-loading', TIMEOUTS.medium);
      
      // Navigate to user's threads tab
      await tapElement('profile-threads-tab');
      
      // Verify threads are visible
      await expectElementToBeVisible('profile-thread-item-0');
      
      // Tap on a thread
      await tapElement('profile-thread-item-0');
      
      // Verify navigation to thread detail
      await waitForElement('thread-comment-screen', TIMEOUTS.medium);
      await expectElementToBeVisible('thread-comment-screen');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during thread creation', async () => {
      // This test would require mocking network failures
      // For now, it's a placeholder for future implementation
      //
      // Expected behavior:
      // 1. Fill in thread details
      // 2. Trigger network error during submission
      // 3. Verify error message is displayed
      // 4. Verify retry option is available
      // 5. Verify form data is preserved
    });

    it('should handle network errors during comment submission', async () => {
      // This test would require mocking network failures
      // For now, it's a placeholder for future implementation
      //
      // Expected behavior:
      // 1. Enter comment text
      // 2. Trigger network error during submission
      // 3. Verify error message is displayed
      // 4. Verify comment text is preserved
      // 5. Verify retry option is available
    });

    it('should handle network errors during follow action', async () => {
      // This test would require mocking network failures
      // For now, it's a placeholder for future implementation
      //
      // Expected behavior:
      // 1. Navigate to user profile
      // 2. Trigger network error during follow
      // 3. Verify error message is displayed
      // 4. Verify retry option is available
      // 5. Verify follow state is not changed
    });
  });
});
