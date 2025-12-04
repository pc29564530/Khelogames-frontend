# EmptyState Component

A reusable component for displaying empty data scenarios with contextual messaging, illustrations, and actions.

## Features

- Customizable icon or image display
- Title and message text
- Primary and secondary action buttons
- Predefined variants for common scenarios
- Full accessibility support
- Consistent styling with design system

## Basic Usage

```javascript
import EmptyState from './components/molecules/EmptyState';

// Simple empty state
<EmptyState
  title="No Matches Yet"
  message="Start creating matches to see them here."
  actionLabel="Create Match"
  onAction={() => navigation.navigate('CreateMatch')}
/>
```

## Using Predefined Variants

```javascript
import EmptyState from './components/molecules/EmptyState';
import { getEmptyStateVariant } from './components/molecules/EmptyState/emptyStateVariants';

// Use a predefined variant
const matchesEmptyState = getEmptyStateVariant('matches', {
  onAction: () => navigation.navigate('CreateMatch'),
});

<EmptyState {...matchesEmptyState} />
```

## Available Variants

- `matches` - For empty match lists
- `tournaments` - For empty tournament lists
- `clubs` - For empty club lists
- `communities` - For empty community lists
- `searchNoResults` - For search with no results
- `searchSuggestions` - For search with suggestions
- `profilePosts` - For user profiles with no posts
- `profileMatches` - For user profiles with no matches
- `followers` - For empty followers list
- `following` - For empty following list
- `clubMembers` - For clubs with no members
- `tournamentMatches` - For tournaments with no matches
- `tournamentParticipants` - For tournaments with no participants
- `communityThreads` - For communities with no discussions
- `comments` - For posts with no comments

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `icon` | `ReactNode` | No | - | Icon component to display |
| `image` | `ImageSource` | No | - | Image to display (overrides icon) |
| `title` | `string` | Yes | - | Main heading text |
| `message` | `string` | No | - | Descriptive message text |
| `actionLabel` | `string` | No | - | Primary action button label |
| `onAction` | `function` | No | - | Primary action button handler |
| `secondaryActionLabel` | `string` | No | - | Secondary action button label |
| `onSecondaryAction` | `function` | No | - | Secondary action button handler |
| `variant` | `string` | No | `'default'` | Variant name for styling |
| `testID` | `string` | No | - | Test identifier |

## Custom Icon Example

```javascript
import { Ionicons } from '@expo/vector-icons';

<EmptyState
  icon={<Ionicons name="trophy-outline" size={40} color="#999" />}
  title="No Trophies Yet"
  message="Win tournaments to earn trophies."
/>
```

## Custom Image Example

```javascript
<EmptyState
  image={require('../assets/images/empty-matches.png')}
  title="No Matches Yet"
  message="Start creating matches to see them here."
  actionLabel="Create Match"
  onAction={handleCreateMatch}
/>
```

## With Secondary Action

```javascript
<EmptyState
  title="No Clubs Available"
  message="Join or create a club to connect with players."
  actionLabel="Create Club"
  onAction={handleCreateClub}
  secondaryActionLabel="Browse Clubs"
  onSecondaryAction={handleBrowseClubs}
/>
```

## Accessibility

The component includes:
- Proper accessibility labels for screen readers
- Semantic roles for content
- Accessible touch targets (44x44 minimum)
- Clear focus indicators
- Descriptive hints for actions

## Styling

The component uses the centralized theme system for:
- Colors
- Typography
- Spacing
- Border radius
- Shadows

All styling is consistent with the design system and can be customized through the theme configuration.
