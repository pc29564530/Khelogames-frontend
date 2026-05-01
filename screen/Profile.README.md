# Profile Screen - Clean Architecture

This document describes the refactored Profile screen following big tech clean code practices.

## 📁 File Structure

```
frontend/
├── screen/
│   └── Profile.js                    # Main screen component (175 lines)
├── hooks/
│   ├── useProfile.js                 # Profile data & operations hook
│   └── useCommunity.js               # Community data hook
└── components/
    └── profile/
        ├── ProfileHeader.js          # Header with back/follow/more buttons
        ├── ProfileInfo.js            # Avatar, name, stats section
        ├── ProfileMenu.js            # Main menu items
        ├── CommunitySection.js       # Expandable community list
        └── ProfileMoreMenu.js        # More menu modal
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **Screen Component**: Orchestrates UI and navigation
- **Custom Hooks**: Manage state and business logic
- **UI Components**: Presentational, reusable components

### 2. **Single Responsibility**
Each file has one clear purpose:
- `useProfile.js`: Profile data fetching and follow/unfollow logic
- `useCommunity.js`: Community data management
- `ProfileHeader.js`: Renders only the header
- etc.

### 3. **Composition over Inheritance**
Components are composed together rather than creating large monolithic components.

### 4. **Custom Hooks for Reusability**
Business logic is extracted into custom hooks that can be reused across the app.

## 🎣 Custom Hooks

### `useProfile(profilePublicID)`

Manages all profile-related data and operations.

**Returns:**
```javascript
{
  // State
  currentProfile,      // Profile being viewed
  authProfile,         // Authenticated user's profile
  isFollowing,         // Following status
  loading,             // Loading state
  followerCount,       // Number of followers
  followingCount,      // Number of following
  error,              // Error state
  isOwnProfile,       // Boolean: viewing own profile

  // Actions
  followUser,         // Follow function
  unfollowUser,       // Unfollow function
  toggleFollow,       // Toggle follow/unfollow
  fetchProfileData,   // Refresh profile data
}
```

**Features:**
- ✅ Automatic data fetching on mount/focus
- ✅ Handles both own profile and other profiles
- ✅ Optimistic updates with error handling
- ✅ Proper cleanup and dependency management

### `useCommunity()`

Manages community-related operations.

**Returns:**
```javascript
{
  showMyCommunity,     // Expanded state
  myCommunityData,     // List of communities
  error,              // Error state
  toggleMyCommunity,  // Toggle expand/collapse
  fetchMyCommunities, // Fetch communities manually
}
```

## 🧩 Components

### ProfileHeader
Header with back button and conditional follow/more menu.

**Props:**
```javascript
{
  isOwnProfile: boolean,
  isFollowing: boolean,
  onBack: () => void,
  onFollowPress: () => void,
  onMorePress: () => void,
}
```

### ProfileInfo
Avatar, name, username, and stats (followers/following).

**Props:**
```javascript
{
  profile: object,
  followerCount: number,
  followingCount: number,
  onFollowersPress: () => void,
  onFollowingPress: () => void,
}
```

### ProfileMenu
Main menu with player, connections, posts, and logout.

**Props:**
```javascript
{
  isOwnProfile: boolean,
  onPlayerProfilePress: () => void,
  onConnectionsPress: () => void,
  onMyPostsPress: () => void,
  onLogoutPress: () => void,
}
```

### CommunitySection
Expandable section showing user's communities.

**Props:**
```javascript
{
  isExpanded: boolean,
  communities: array,
  onToggle: () => void,
  onCommunityPress: (community) => void,
}
```

### ProfileMoreMenu
Modal with additional actions (edit, settings, share, report).

**Props:**
```javascript
{
  visible: boolean,
  isOwnProfile: boolean,
  isFollowing: boolean,
  onClose: () => void,
  onEditProfile: () => void,
  onSettings: () => void,
  onShareProfile: () => void,
  onFollow: () => void,
  onMessage: () => void,
  onReport: () => void,
}
```

## 🎯 Benefits of This Architecture

### Before (525 lines)
- ❌ One massive file with mixed concerns
- ❌ Hard to test individual pieces
- ❌ Difficult to reuse logic
- ❌ Complex state management
- ❌ Poor readability

### After (175 lines main + modular pieces)
- ✅ Clear separation of concerns
- ✅ Each piece is testable in isolation
- ✅ Hooks can be reused in other screens
- ✅ Components are composable
- ✅ Easy to maintain and extend
- ✅ Better code documentation
- ✅ Follows React best practices

## 📝 Usage Example

```javascript
import Profile from './screen/Profile';

// Navigation
<Stack.Screen name="Profile" component={Profile} />

// Navigate to profile
navigation.navigate('Profile', {
  profilePublicID: 'user_abc123' // Optional: omit for own profile
});
```

## 🔄 Data Flow

```
Profile Screen
    ↓
useProfile Hook → Redux Store
    ↓             ↓
API Calls ← axios
    ↓
Update Local State
    ↓
Re-render Components
```

## 🧪 Testing Strategy

### Unit Tests
- Test custom hooks in isolation
- Test individual components with mocked props
- Test utility functions

### Integration Tests
- Test hook + component interactions
- Test navigation flows
- Test API error handling

### Example:
```javascript
// Test useProfile hook
const { result } = renderHook(() => useProfile('user_123'));
expect(result.current.loading).toBe(true);
await waitFor(() => expect(result.current.currentProfile).toBeDefined());
```

## 🚀 Future Improvements

1. **Add TypeScript** for better type safety
2. **Add PropTypes** or TypeScript interfaces for component props
3. **Error Boundaries** for better error handling
4. **Loading States** with skeleton screens
5. **Memoization** for performance optimization (React.memo, useMemo)
6. **Analytics** tracking for user interactions
7. **Accessibility** improvements (a11y)

## 📚 References

- [React Hooks Documentation](https://react.dev/reference/react)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
