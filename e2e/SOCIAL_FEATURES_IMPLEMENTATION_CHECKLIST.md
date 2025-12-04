# Social Features E2E Tests - Implementation Checklist

## Overview
This checklist guides you through implementing the testIDs required for social features E2E tests.

## Progress Tracking

### CreateThread.js
- [ ] `create-thread-screen` - Main container View
- [ ] `thread-title-input` - Title TextInput
- [ ] `thread-content-input` - Content TextInput
- [ ] `select-community-button` - Community selection Pressable
- [ ] `community-modal` - Community selection Modal
- [ ] `community-item-{index}` - Community list items (use index)
- [ ] `selected-community-name` - Selected community Text display
- [ ] `upload-media-button` - Media upload Pressable
- [ ] `media-preview-image` - Image preview (conditional)
- [ ] `media-preview-video` - Video preview (conditional)
- [ ] `submit-thread-button` - Submit Pressable in header
- [ ] `cancel-thread-button` - Back/Cancel button
- [ ] `thread-validation-error` - Error message Text
- [ ] `thread-creation-loading` - Loading indicator

**Status**: 0/14 completed

### Thread.js & ThreadItems.js
- [ ] `thread-list-screen` - Main container View
- [ ] `thread-item-{index}` - Individual thread items
- [ ] `create-thread-button` - Create new thread button

**Status**: 0/3 completed

### ThreadComment.js
- [ ] `thread-comment-screen` - Main container View
- [ ] `thread-author-avatar` - Author avatar Pressable/Image
- [ ] `thread-author-name` - Author name Text
- [ ] `thread-author-username` - Author username Text
- [ ] `thread-content-text` - Thread content Text
- [ ] `thread-media-image` - Thread image (conditional)
- [ ] `thread-media-video` - Thread video (conditional)
- [ ] `thread-like-count` - Like count Text
- [ ] `thread-like-button` - Like Pressable
- [ ] `thread-comment-button` - Comment Pressable
- [ ] `comment-input` - Comment TextInput
- [ ] `comment-submit-button` - Submit comment Pressable
- [ ] `comment-list` - Comments container View
- [ ] `comment-item-{index}` - Individual comment items
- [ ] `comment-author-{index}` - Comment author Text
- [ ] `comment-text-{index}` - Comment text Text
- [ ] `comment-loading` - Comment submission loading
- [ ] `like-loading` - Like action loading

**Status**: 0/17 completed

### Comment.js
- [ ] Verify comment items have proper testIDs
- [ ] Add testIDs to comment author elements
- [ ] Add testIDs to comment text elements

**Status**: 0/3 completed

### Profile.js
- [ ] `profile-screen` - Main container View
- [ ] `profile-avatar` - Profile avatar Image
- [ ] `profile-full-name` - Full name Text
- [ ] `profile-username` - Username Text
- [ ] `profile-follower-count` - Follower count Text/Pressable
- [ ] `profile-following-count` - Following count Text/Pressable
- [ ] `follow-button` - Follow Pressable (conditional)
- [ ] `following-button` - Following Pressable (conditional)
- [ ] `unfollow-button` - Unfollow Pressable (if separate)
- [ ] `edit-profile-button` - Edit profile Pressable (own profile)
- [ ] `message-button` - Message Pressable
- [ ] `player-button` - Player profile Pressable
- [ ] `follow-loading` - Follow action loading
- [ ] `follower-list-button` - Navigate to followers
- [ ] `following-list-button` - Navigate to following
- [ ] `profile-threads-tab` - User threads tab

**Status**: 0/16 completed

### Follow.js, Follower.js, Following.js
- [ ] `follower-list-screen` - Follower list container
- [ ] `following-list-screen` - Following list container
- [ ] `follower-item-{index}` - Individual follower items
- [ ] `following-item-{index}` - Individual following items

**Status**: 0/4 completed

### Navigation Components
- [ ] `home-screen` - Home screen container
- [ ] `community-tab` - Community tab button
- [ ] `profile-tab` - Profile tab button
- [ ] `community-screen` - Community screen container
- [ ] `message-screen` - Message screen container

**Status**: 0/5 completed

## Total Progress: 0/62 testIDs

## Implementation Steps

### Step 1: CreateThread.js
```javascript
// Example implementation
<View testID="create-thread-screen" style={tailwind`flex-1 bg-white`}>
  <ScrollView>
    <View style={tailwind`p-4`}>
      <TextInput
        testID="thread-title-input"
        style={tailwind`font-bold text-2xl`}
        value={title}
        onChangeText={setTitle}
        placeholder="Write the title here..."
      />
      
      <TextInput
        testID="thread-content-input"
        style={tailwind`text-lg`}
        multiline={true}
        value={content}
        onChangeText={setContent}
        placeholder="Write something here..."
      />
    </View>
    
    {mediaType === 'image' && (
      <Image 
        testID="media-preview-image"
        source={{uri: mediaURL}}
        style={tailwind`w-full h-64`}
      />
    )}
  </ScrollView>
  
  <Pressable 
    testID="upload-media-button"
    onPress={handleMediaSelection}
  >
    <MaterialIcons name="perm-media" size={25} />
  </Pressable>
  
  {isCommunityListModal && (
    <Modal testID="community-modal" visible={isCommunityListModal}>
      <ScrollView>
        {communityList.map((item, index) => (
          <Pressable 
            key={index}
            testID={`community-item-${index}`}
            onPress={() => selectCommunity(item)}
          >
            <Text>{item.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Modal>
  )}
</View>
```

### Step 2: ThreadComment.js
```javascript
<View testID="thread-comment-screen" style={tailwind`flex-1`}>
  <ScrollView>
    <Pressable 
      testID="thread-author-avatar"
      onPress={() => handleUser({profilePublicID: item.profile.public_id})}
    >
      <Image source={{uri: item.profile.avatar_url}} />
      <Text testID="thread-author-name">{item.profile.full_name}</Text>
      <Text testID="thread-author-username">@{item.profile.username}</Text>
    </Pressable>
    
    <Text testID="thread-content-text">{item.content}</Text>
    
    {item.media_type === 'image' && (
      <Image testID="thread-media-image" source={{uri: item.media_url}} />
    )}
    
    <Text testID="thread-like-count">{likeCounts} Likes</Text>
    
    <Pressable 
      testID="thread-like-button"
      onPress={() => handleLikes({...})}
    >
      <FontAwesome name="thumbs-o-up" />
      <Text>Like</Text>
    </Pressable>
    
    <Pressable 
      testID="thread-comment-button"
      onPress={handleComment}
    >
      <FontAwesome name="comment-o" />
      <Text>Comment</Text>
    </Pressable>
    
    <View testID="comment-list">
      <Comment thread={item} />
    </View>
  </ScrollView>
  
  <KeyboardAvoidingView>
    <TextInput
      testID="comment-input"
      ref={commentInputRef}
      value={commentText}
      onChangeText={(text) => dispatch(setCommentText(text))}
      placeholder="Write a comment..."
    />
    <Pressable
      testID="comment-submit-button"
      onPress={handleReduxSubmit}
    >
      <Text>POST</Text>
    </Pressable>
  </KeyboardAvoidingView>
</View>
```

### Step 3: Profile.js
```javascript
<View testID="profile-screen" style={tailwind`flex-1`}>
  <Image 
    testID="profile-avatar"
    source={profile?.avatar_url ? {uri: profile.avatar_url} : null}
  />
  
  <Text testID="profile-full-name">{profile?.full_name}</Text>
  <Text testID="profile-username">@{profile?.username}</Text>
  
  <Pressable 
    testID="follower-list-button"
    onPress={() => navigation.navigate('Follow')}
  >
    <Text testID="profile-follower-count">
      {followerCount} Followers
    </Text>
  </Pressable>
  
  <Pressable 
    testID="following-list-button"
    onPress={() => navigation.navigate('Follow')}
  >
    <Text testID="profile-following-count">
      {followingCount} Following
    </Text>
  </Pressable>
  
  {profilePublicID !== authProfilePublicID ? (
    <>
      <Pressable 
        testID={isFollowing?.is_following ? "following-button" : "follow-button"}
        onPress={handleFollowButton}
        disabled={loading}
      >
        <Text>
          {loading ? 'Loading...' : isFollowingConditionCheck()}
        </Text>
      </Pressable>
      
      <Pressable 
        testID="player-button"
        onPress={() => navigation.navigate("PlayerProfile", {...})}
      >
        <Text>Player</Text>
      </Pressable>
    </>
  ) : (
    <Pressable 
      testID="player-button"
      onPress={() => navigation.navigate("PlayerProfile", {...})}
    >
      <Text>Player</Text>
    </Pressable>
  )}
  
  <TouchableOpacity 
    testID="message-button"
    onPress={handleMessage}
  >
    <AntDesign name="message1" size={22} />
  </TouchableOpacity>
</View>
```

## Testing After Implementation

### 1. Verify TestIDs Exist
```bash
# Search for testIDs in files
grep -r "testID=" screen/CreateThread.js
grep -r "testID=" screen/ThreadComment.js
grep -r "testID=" screen/Profile.js
```

### 2. Run Tests
```bash
# Run all social features tests
npm run test:e2e -- e2e/socialFeatures.e2e.js

# Run with verbose logging
npm run test:e2e -- e2e/socialFeatures.e2e.js --loglevel trace
```

### 3. Debug Failures
```bash
# Take screenshots on failure
# Check test output for missing testIDs
# Verify element visibility
# Check navigation flow
```

## Common Issues

### Issue: TestID Not Found
**Solution**: 
1. Verify testID is added to component
2. Check spelling matches exactly
3. Ensure element is rendered (not conditional without data)

### Issue: Element Not Visible
**Solution**:
1. Add proper wait conditions
2. Check if element is scrolled out of view
3. Verify element is not hidden by modal/overlay

### Issue: Navigation Fails
**Solution**:
1. Verify navigation testIDs exist
2. Check navigation structure matches tests
3. Add proper wait conditions after navigation

## Validation Checklist

Before marking complete:
- [ ] All testIDs added to components
- [ ] Tests run without errors
- [ ] All assertions pass
- [ ] Screenshots captured for documentation
- [ ] CI/CD pipeline updated
- [ ] Documentation reviewed and updated

## Resources

- Full Guide: `e2e/SOCIAL_FEATURES_TESTS_GUIDE.md`
- Quick Reference: `e2e/SOCIAL_TESTS_QUICK_REFERENCE.md`
- Test File: `e2e/socialFeatures.e2e.js`
- Summary: `docs/TASK_18.4_SOCIAL_FEATURES_E2E_TESTS_SUMMARY.md`

## Notes

- Use consistent naming convention for testIDs
- Add testIDs to all interactive elements
- Include loading indicators in testIDs
- Use index-based testIDs for list items
- Test on both Android and iOS if applicable

## Completion Criteria

✅ All 62 testIDs implemented
✅ All 27 tests passing
✅ Documentation complete
✅ CI/CD integration complete
✅ Code review approved

---

**Last Updated**: [Current Date]
**Status**: In Progress
**Assigned To**: Development Team
