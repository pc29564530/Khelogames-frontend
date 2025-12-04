# Social Features E2E Tests - Quick Reference

## Quick Start

```bash
# Run all social features tests
npm run test:e2e -- e2e/socialFeatures.e2e.js

# Run specific test suite
npm run test:e2e -- e2e/socialFeatures.e2e.js --grep "Thread Creation"

# Debug mode
npm run test:e2e -- e2e/socialFeatures.e2e.js --loglevel trace
```

## Essential TestIDs Checklist

### Thread Creation (CreateThread.js)
- [ ] `create-thread-screen`
- [ ] `thread-title-input`
- [ ] `thread-content-input`
- [ ] `select-community-button`
- [ ] `submit-thread-button`

### Thread Comments (ThreadComment.js)
- [ ] `thread-comment-screen`
- [ ] `thread-author-avatar`
- [ ] `comment-input`
- [ ] `comment-submit-button`
- [ ] `thread-like-button`

### User Profile (Profile.js)
- [ ] `profile-screen`
- [ ] `follow-button`
- [ ] `following-button`
- [ ] `profile-follower-count`
- [ ] `profile-following-count`

## Common Test Patterns

### Navigate and Create Thread
```javascript
await tapElement('community-tab');
await tapElement('create-thread-button');
await replaceText('thread-title-input', 'Test Title');
await replaceText('thread-content-input', 'Test Content');
await tapElement('select-community-button');
await tapElement('community-item-0');
await tapElement('submit-thread-button');
```

### Add Comment
```javascript
await tapElement('thread-item-0');
await tapElement('comment-input');
await replaceText('comment-input', 'Test Comment');
await tapElement('comment-submit-button');
```

### Follow User
```javascript
await tapElement('thread-author-avatar');
await waitForElement('profile-screen');
await tapElement('follow-button');
await waitForLoadingToComplete('follow-loading');
```

## Debugging Commands

```javascript
// Take screenshot
await device.takeScreenshot('debug-screen');

// Check if element exists
const exists = await element(by.id('follow-button')).exists();

// Get element attributes
await expect(element(by.id('thread-title'))).toHaveText('Expected');

// Scroll to element
await scrollToElement('thread-list', 'thread-item-5');
```

## Test Data Generators

```javascript
import { generateThread, generateComment } from './utils/testDataSeeder';

const testThread = generateThread();
const testComment = generateComment();
```

## Common Assertions

```javascript
// Element visibility
await expectElementToBeVisible('follow-button');
await expectElementNotToBeVisible('edit-profile-button');

// Text content
await expectElementToHaveText('profile-username', '@testuser');

// Element existence
await expectElementToExist('thread-item-0');
```

## Timeout Values

```javascript
TIMEOUTS.short = 3000    // Quick actions
TIMEOUTS.medium = 5000   // Normal operations
TIMEOUTS.long = 10000    // Network requests
```

## Error Handling

```javascript
try {
  await tapElement('follow-button');
  await waitForLoadingToComplete('follow-loading');
} catch (error) {
  console.error('Follow action failed:', error);
  await device.takeScreenshot('follow-error');
  throw error;
}
```

## Test Structure Template

```javascript
describe('Feature Name', () => {
  beforeEach(async () => {
    await reloadApp();
    // Login
    await waitForElement('signin-screen');
    await tapElement('signin-email-input');
    await replaceText('signin-email-input', TEST_CREDENTIALS.validUser.email);
    await tapElement('signin-password-input');
    await replaceText('signin-password-input', TEST_CREDENTIALS.validUser.password);
    await tapElement('signin-submit-button');
    await waitForElement('home-screen');
  });

  it('should perform action successfully', async () => {
    // Arrange
    const testData = generateTestData();
    
    // Act
    await performAction(testData);
    
    // Assert
    await expectElementToBeVisible('success-indicator');
  });
});
```

## CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
- name: Run Social Features Tests
  run: npm run test:e2e -- e2e/socialFeatures.e2e.js
  env:
    DETOX_CONFIGURATION: android.emu.release
```

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Element not found | Add `waitForElement` before interaction |
| Test timeout | Increase timeout value |
| Navigation fails | Add proper wait conditions |
| Input not working | Use `replaceText` instead of `typeText` |
| Modal not visible | Wait for modal animation to complete |

## Performance Tips

1. Use `replaceText` instead of `typeText` (faster)
2. Minimize `sleep` usage, prefer `waitFor`
3. Reuse login state when possible
4. Run tests in parallel when independent
5. Use appropriate timeout values

## Test Coverage Summary

- ✅ Thread Creation: 6 tests
- ✅ Thread Commenting: 7 tests
- ✅ User Following: 9 tests
- ✅ Integration: 2 tests
- ✅ Error Handling: 3 tests

**Total: 27 E2E tests**

## Next Steps After Implementation

1. Add testIDs to all components
2. Run tests locally
3. Fix any failing tests
4. Add to CI/CD pipeline
5. Monitor test results
6. Update documentation as needed

## Resources

- Full Guide: `e2e/SOCIAL_FEATURES_TESTS_GUIDE.md`
- Test Helpers: `e2e/utils/testHelpers.js`
- Test Data: `e2e/utils/testDataSeeder.js`
- Config: `e2e/utils/config.js`
