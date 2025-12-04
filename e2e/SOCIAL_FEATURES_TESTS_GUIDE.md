# Social Features E2E Tests Guide

## Overview

This guide provides comprehensive documentation for the social features end-to-end (E2E) tests in the Khelogames application. These tests cover the complete user flows for creating threads, commenting on threads, and following users.

## Test Coverage

### 1. Thread Creation Flow
- ✅ Create thread with title and content
- ✅ Validation for empty title
- ✅ Validation for empty content
- ✅ Validation for missing community selection
- ✅ Create thread with media attachment
- ✅ Cancel thread creation

### 2. Thread Commenting Flow
- ✅ Add comment to thread
- ✅ Validation for empty comment
- ✅ Display existing comments
- ✅ Like a thread
- ✅ Navigate to thread author profile
- ✅ Scroll through multiple comments
- ✅ Clear comment input after submission

### 3. User Following Flow
- ✅ Follow a user
- ✅ Unfollow a user
- ✅ Update follower count after following
- ✅ Navigate to follower list
- ✅ Navigate to following list
- ✅ Show edit profile button on own profile
- ✅ Hide edit profile button on other user profiles
- ✅ Navigate to message screen from profile
- ✅ Handle follow action with poor network

### 4. Integration Tests
- ✅ Create thread, comment, and follow author
- ✅ View threads from followed user profile

### 5. Error Handling
- ✅ Network errors during thread creation
- ✅ Network errors during comment submission
- ✅ Network errors during follow action

## Required TestIDs

### CreateThread.js
```javascript
testID="create-thread-screen"           // Main screen container
testID="thread-title-input"             // Title input field
testID="thread-content-input"           // Content input field
testID="select-community-button"        // Community selection button
testID="community-modal"                // Community selection modal
testID="community-item-{index}"         // Community list items
testID="selected-community-name"        // Selected community display
testID="upload-media-button"            // Media upload button
testID="media-preview-image"            // Image preview
testID="media-preview-video"            // Video preview
testID="submit-thread-button"           // Submit button
testID="cancel-thread-button"           // Cancel button
testID="thread-validation-error"        // Validation error message
testID="thread-creation-loading"        // Loading indicator
```

### Thread.js & ThreadItems.js
```javascript
testID="thread-list-screen"             // Thread list container
testID="thread-item-{index}"            // Individual thread items
testID="create-thread-button"           // Create new thread button
```

### ThreadComment.js
```javascript
testID="thread-comment-screen"          // Main screen container
testID="thread-author-avatar"           // Author avatar (tappable)
testID="thread-author-name"             // Author full name
testID="thread-author-username"         // Author username
testID="thread-content-text"            // Thread content
testID="thread-media-image"             // Thread image (if present)
testID="thread-media-video"             // Thread video (if present)
testID="thread-like-count"              // Like count display
testID="thread-like-button"             // Like button
testID="thread-comment-button"          // Comment button
testID="comment-input"                  // Comment input field
testID="comment-submit-button"          // Submit comment button
testID="comment-list"                   // Comments list container
testID="comment-item-{index}"           // Individual comment items
testID="comment-author-{index}"         // Comment author name
testID="comment-text-{index}"           // Comment text content
testID="comment-loading"                // Comment submission loading
testID="like-loading"                   // Like action loading
testID="updated-score-indicator"        // Score update indicator
```

### Profile.js
```javascript
testID="profile-screen"                 // Main profile container
testID="profile-avatar"                 // Profile avatar
testID="profile-full-name"              // User's full name
testID="profile-username"               // User's username
testID="profile-follower-count"         // Follower count (tappable)
testID="profile-following-count"        // Following count (tappable)
testID="follow-button"                  // Follow button
testID="following-button"               // Following button (when already following)
testID="unfollow-button"                // Unfollow button
testID="edit-profile-button"            // Edit profile button (own profile only)
testID="message-button"                 // Message button
testID="player-button"                  // Player profile button
testID="follow-loading"                 // Follow action loading
testID="follower-list-button"           // Navigate to follower list
testID="following-list-button"          // Navigate to following list
testID="profile-threads-tab"            // User's threads tab
testID="profile-thread-item-{index}"    // Thread items in profile
```

### Follow.js, Follower.js, Following.js
```javascript
testID="follower-list-screen"           // Follower list screen
testID="following-list-screen"          // Following list screen
testID="follower-item-{index}"          // Individual follower items
testID="following-item-{index}"         // Individual following items
```

### Home.js & Navigation
```javascript
testID="home-screen"                    // Home screen
testID="community-tab"                  // Community tab navigation
testID="profile-tab"                    // Profile tab navigation
testID="community-screen"               // Community screen
testID="message-screen"                 // Message screen
```

## Implementation Guide

### Step 1: Add TestIDs to Components

#### Example: CreateThread.js
```javascript
<View testID="create-thread-screen" style={tailwind`flex-1 bg-white`}>
  <TextInput
    testID="thread-title-input"
    style={tailwind`font-bold text-2xl text-black-400 mb-4`}
    value={title} 
    onChangeText={setTitle} 
    placeholder="Write the title here..."
  />
  
  <TextInput
    testID="thread-content-input"
    style={tailwind`text-lg text-black-400`}
    multiline={true}
    value={content} 
    onChangeText={setContent} 
    placeholder="Write something here..."
  />
  
  <Pressable 
    testID="select-community-button"
    style={tailwind`p-2 flex-row border border-white rounded`} 
    onPress={handleSelectCommunity}
  >
    <Text style={tailwind`text-white text-lg mr-2`}>{communityType}</Text>
  </Pressable>
  
  <Pressable 
    testID="submit-thread-button"
    style={tailwind`p-2`} 
    onPress={HandleSubmit}
  >
    <MaterialIcons name="send" size={24} color="white" />
  </Pressable>
</View>
```

#### Example: Profile.js
```javascript
<View testID="profile-screen" style={tailwind`flex-1`}>
  <Image 
    testID="profile-avatar"
    source={profile?.avatar_url ? {uri: profile.avatar_url} : null} 
  />
  
  <Text testID="profile-full-name" style={tailwind`text-2xl font-semibold`}>
    {profile?.full_name}
  </Text>
  
  <Text testID="profile-username" style={tailwind`text-gray-400`}>
    @{profile?.username}
  </Text>
  
  <Pressable 
    testID="follower-list-button"
    onPress={() => navigation.navigate('Follow')}
  >
    <Text testID="profile-follower-count" style={tailwind`text-lg`}>
      {followerCount} Followers
    </Text>
  </Pressable>
  
  <Pressable 
    testID={isFollowing?.is_following ? "following-button" : "follow-button"}
    onPress={handleFollowButton}
  >
    <Text>{isFollowing?.is_following ? 'Following' : 'Follow'}</Text>
  </Pressable>
</View>
```

### Step 2: Run the Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run only social features tests
npm run test:e2e -- e2e/socialFeatures.e2e.js

# Run with specific configuration
detox test --configuration android.emu.debug e2e/socialFeatures.e2e.js
```

### Step 3: Debug Failing Tests

If tests fail, use these debugging strategies:

1. **Check TestID Existence**
   ```bash
   # Add console logs in the app to verify testIDs
   console.log('TestID added:', testID);
   ```

2. **Take Screenshots**
   ```javascript
   await device.takeScreenshot('thread-creation-screen');
   ```

3. **Increase Timeouts**
   ```javascript
   await waitForElement('thread-item-0', TIMEOUTS.long);
   ```

4. **Check Element Visibility**
   ```javascript
   await expect(element(by.id('follow-button'))).toBeVisible();
   ```

## Test Data Requirements

### Seeded Data Needed
- At least 2 test users with valid credentials
- At least 3 communities
- At least 5 threads with various content types
- At least 10 comments across different threads
- Follow relationships between test users

### Test User Credentials
```javascript
export const TEST_CREDENTIALS = {
  validUser: {
    email: 'test@khelogames.com',
    password: 'Test@1234',
    username: 'testuser',
  },
  secondUser: {
    email: 'test2@khelogames.com',
    password: 'Test@1234',
    username: 'testuser2',
  },
};
```

## Common Issues and Solutions

### Issue 1: Element Not Found
**Problem:** Test fails with "Element not found" error
**Solution:** 
- Verify testID is correctly added to the component
- Check if element is rendered conditionally
- Increase timeout for slow-loading elements

### Issue 2: Navigation Timing
**Problem:** Test navigates before screen is ready
**Solution:**
- Add proper wait conditions
- Use `waitForElement` before interactions
- Verify navigation state

### Issue 3: Input Focus Issues
**Problem:** Text input doesn't receive focus
**Solution:**
- Tap the input element before typing
- Use `replaceText` instead of `typeText`
- Ensure keyboard is visible

### Issue 4: Modal Interactions
**Problem:** Can't interact with modal elements
**Solution:**
- Wait for modal to be fully visible
- Use proper testIDs on modal components
- Ensure modal is not transparent/blocking

## Best Practices

### 1. Test Independence
- Each test should be independent
- Use `beforeEach` to reset state
- Don't rely on test execution order

### 2. Descriptive Test Names
```javascript
it('should successfully create a thread with title and content', async () => {
  // Test implementation
});
```

### 3. Proper Assertions
```javascript
// Good
await expectElementToBeVisible('thread-item-0');
await expectElementToHaveText('thread-title', 'Expected Title');

// Avoid
await element(by.id('thread-item-0')).tap(); // Without verification
```

### 4. Error Messages
```javascript
try {
  await tapElement('follow-button');
} catch (error) {
  console.error('Failed to tap follow button:', error);
  throw error;
}
```

### 5. Cleanup
```javascript
afterEach(async () => {
  // Clean up test data if needed
  await clearTestData();
});
```

## Performance Considerations

### 1. Minimize Network Calls
- Use mocked data where possible
- Seed test data before test suite runs
- Cache frequently used data

### 2. Optimize Wait Times
- Use appropriate timeouts
- Don't use fixed delays (`sleep`)
- Prefer `waitFor` over `sleep`

### 3. Parallel Execution
- Tests should be parallelizable
- Avoid shared state between tests
- Use unique test data for each test

## Continuous Integration

### GitHub Actions Configuration
```yaml
- name: Run Social Features E2E Tests
  run: |
    npm run test:e2e -- e2e/socialFeatures.e2e.js
  env:
    DETOX_CONFIGURATION: android.emu.release
```

### Test Reports
- Screenshots saved to `artifacts/`
- Test results in JUnit format
- Coverage reports generated

## Maintenance

### Regular Updates
- Update tests when UI changes
- Add tests for new features
- Remove tests for deprecated features

### Code Review Checklist
- [ ] All testIDs are unique and descriptive
- [ ] Tests are independent and isolated
- [ ] Proper assertions are used
- [ ] Error handling is implemented
- [ ] Documentation is updated

## Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [E2E Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Support

For issues or questions:
1. Check this guide first
2. Review existing test examples
3. Check Detox documentation
4. Ask the team for help

## Changelog

### Version 1.0.0 (Current)
- Initial implementation of social features E2E tests
- Thread creation flow tests
- Thread commenting flow tests
- User following flow tests
- Integration tests
- Error handling tests
