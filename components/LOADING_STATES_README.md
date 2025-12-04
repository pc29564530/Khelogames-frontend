# Loading States Documentation

This document describes the loading state components and patterns implemented in the Khelogames application.

## Overview

The application provides a comprehensive set of loading state components to enhance user experience during asynchronous operations:

1. **Skeleton** - Shimmer loading placeholders
2. **Spinner** - Activity indicators for buttons and operations
3. **ProgressBar** - Progress indicators for long operations
4. **Skeleton Screens** - Pre-built skeleton layouts for common views

## Components

### Skeleton Component

The Skeleton component displays a shimmer animation placeholder for content that is loading.

#### Props

- `width` (number | string) - Width of the skeleton (default: '100%')
- `height` (number) - Height of the skeleton (default: 20)
- `borderRadius` (number) - Border radius (default: theme.borderRadius.sm)
- `variant` ('rect' | 'circle' | 'text') - Shape variant (default: 'rect')
- `style` (object | array) - Additional styles
- `testID` (string) - Test identifier

#### Usage

```javascript
import { Skeleton } from './components/atoms';

// Rectangle skeleton
<Skeleton width={200} height={100} />

// Circle skeleton (for avatars)
<Skeleton width={50} height={50} variant="circle" />

// Text skeleton
<Skeleton width="80%" height={16} variant="text" />
```

### Spinner Component

The Spinner component displays an activity indicator with customizable size and color.

#### Props

- `size` ('xs' | 'sm' | 'md' | 'lg' | 'xl' | number) - Size of the spinner (default: 'md')
- `color` (string) - Color of the spinner (default: theme.colors.primary.main)
- `style` (object | array) - Additional styles
- `testID` (string) - Test identifier
- `accessibilityLabel` (string) - Accessibility label (default: 'Loading')

#### Usage

```javascript
import { Spinner } from './components/atoms';

// Default spinner
<Spinner />

// Large spinner with custom color
<Spinner size="lg" color="#FF0000" />

// In a button
<Button loading onPress={handleSubmit}>
  Submit
</Button>
```

### ProgressBar Component

The ProgressBar component shows determinate or indeterminate progress for long operations.

#### Props

- `progress` (number) - Progress value between 0 and 1 (default: 0)
- `indeterminate` (boolean) - Show indeterminate progress (default: false)
- `height` (number) - Height of the progress bar (default: 4)
- `color` (string) - Color of the progress bar (default: theme.colors.primary.main)
- `backgroundColor` (string) - Background color (default: theme.colors.border.light)
- `style` (object | array) - Additional styles
- `testID` (string) - Test identifier
- `accessibilityLabel` (string) - Accessibility label

#### Usage

```javascript
import { ProgressBar } from './components/atoms';

// Determinate progress
<ProgressBar progress={0.5} />

// Indeterminate progress
<ProgressBar indeterminate />

// Custom styled progress bar
<ProgressBar
  progress={0.75}
  height={8}
  color={theme.colors.success.main}
/>
```

## Skeleton Screens

Pre-built skeleton layouts for common list views.

### MatchListSkeleton

Skeleton screen for match lists.

```javascript
import { MatchListSkeleton } from './components/molecules';

<MatchListSkeleton count={3} />
```

### TournamentListSkeleton

Skeleton screen for tournament lists.

```javascript
import { TournamentListSkeleton } from './components/molecules';

<TournamentListSkeleton count={3} />
```

### PlayerListSkeleton

Skeleton screen for player lists.

```javascript
import { PlayerListSkeleton } from './components/molecules';

<PlayerListSkeleton count={5} />
```

## Redux Integration

### Loading State Management

The application uses Redux to manage loading states globally.

#### Action Types

- `SET_LOADING` - Set a loading state
- `CLEAR_LOADING` - Clear a loading state
- `CLEAR_ALL_LOADING` - Clear all loading states

#### Action Creators

```javascript
import { setLoading, clearLoading, clearAllLoading } from './redux/actions/actions';

// Set loading state
dispatch(setLoading('matches', true));

// Clear loading state
dispatch(clearLoading('matches'));

// Clear all loading states
dispatch(clearAllLoading());
```

#### Loading State Structure

```javascript
{
  loading: {
    global: false,
    matches: false,
    tournaments: false,
    teams: false,
    players: false,
    clubs: false,
    communities: false,
    threads: false,
    comments: false,
    profile: false,
    auth: false,
    operations: {
      'custom-operation': true,
    }
  }
}
```

### useLoadingState Hook

Custom hook for managing loading states with Redux.

```javascript
import useLoadingState from './hooks/useLoadingState';

function MyComponent() {
  const { isLoading, startLoading, stopLoading } = useLoadingState('matches');

  const fetchMatches = async () => {
    startLoading();
    try {
      const data = await api.getMatches();
      // Handle data
    } finally {
      stopLoading();
    }
  };

  if (isLoading) {
    return <MatchListSkeleton />;
  }

  return <MatchList />;
}
```

## Usage Patterns

### Pattern 1: Simple Loading State

```javascript
import { Spinner } from './components/atoms';

function MyComponent() {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Spinner size="lg" />;
  }

  return <Content />;
}
```

### Pattern 2: Skeleton Screen

```javascript
import { MatchListSkeleton } from './components/molecules';
import useLoadingState from './hooks/useLoadingState';

function MatchList() {
  const { isLoading } = useLoadingState('matches');
  const matches = useSelector(state => state.matches.matches);

  if (isLoading) {
    return <MatchListSkeleton count={5} />;
  }

  return (
    <FlatList
      data={matches}
      renderItem={({ item }) => <MatchCard match={item} />}
    />
  );
}
```

### Pattern 3: Button Loading

```javascript
import { Button } from './components/atoms';

function SubmitButton() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.submitForm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Button
      loading={submitting}
      onPress={handleSubmit}
      accessibilityLabel="Submit form"
    >
      Submit
    </Button>
  );
}
```

### Pattern 4: Progress Tracking

```javascript
import { ProgressBar } from './components/atoms';

function FileUpload() {
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    await axios.post('/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = progressEvent.loaded / progressEvent.total;
        setProgress(percentCompleted);
      },
    });
  };

  return (
    <View>
      <ProgressBar progress={progress} />
      <Text>{Math.round(progress * 100)}% uploaded</Text>
    </View>
  );
}
```

## Best Practices

1. **Use Skeleton Screens for Lists**: Prefer skeleton screens over spinners for list views to provide better visual feedback.

2. **Match Loading State to Content**: Use skeleton shapes that match the actual content layout.

3. **Provide Accessibility Labels**: Always include accessibility labels for loading indicators.

4. **Clear Loading States**: Always clear loading states in finally blocks to handle errors properly.

5. **Use Redux for Global States**: Use Redux loading states for data that affects multiple components.

6. **Use Local State for Component-Specific Loading**: Use local state for loading that only affects a single component.

7. **Show Progress for Long Operations**: Use ProgressBar for operations that take more than a few seconds.

8. **Disable Interactions During Loading**: Disable buttons and forms while operations are in progress.

## Testing

All loading components include proper accessibility attributes and test IDs for testing:

```javascript
// Testing skeleton
<Skeleton testID="match-skeleton" />

// Testing spinner
<Spinner testID="loading-spinner" />

// Testing progress bar
<ProgressBar testID="upload-progress" progress={0.5} />
```

## Example Component

See `components/LoadingStatesExample.js` for a comprehensive example demonstrating all loading state components and patterns.

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 1.3**: Loading states with skeleton screens or spinners for all asynchronous operations
- **Requirement 1.4**: Visual feedback for all user interactions
- **Requirement 4.1**: Accessibility labels for all interactive elements
- **Requirement 4.2**: Screen reader support with proper accessibility roles

## Related Documentation

- [Design System Documentation](../theme/README.md)
- [Component Documentation](./atoms/README.md)
- [Redux Documentation](../redux/README.md)
