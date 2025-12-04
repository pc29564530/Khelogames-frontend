# Container and Presentational Component Pattern

## Overview

This pattern separates components into two categories:
- **Presentational Components**: Focus on how things look
- **Container Components**: Focus on how things work

## Benefits

1. **Better Separation of Concerns**: UI logic separated from business logic
2. **Reusability**: Presentational components can be reused with different data sources
3. **Testability**: Easier to test presentational components in isolation
4. **Maintainability**: Changes to data fetching don't affect UI components

## Presentational Components

### Characteristics
- Concerned with how things look
- Receive data and callbacks exclusively via props
- Rarely have their own state (only UI state like hover, focus)
- Don't specify how data is loaded or mutated
- Written as functional components
- Examples: Button, Card, PlayerCard, MatchList

### Example

```javascript
import React from 'react';
import { View } from 'react-native';
import { Text, Button, Card } from '@/components';

/**
 * Presentational component for displaying player information
 * @param {Object} props
 * @param {Object} props.player - Player data
 * @param {Function} props.onEdit - Callback when edit button is pressed
 * @param {Function} props.onDelete - Callback when delete button is pressed
 * @param {boolean} props.loading - Loading state
 */
const PlayerCard = ({ player, onEdit, onDelete, loading }) => {
  if (loading) {
    return <Card><Text>Loading...</Text></Card>;
  }

  return (
    <Card>
      <Text variant="h2">{player.name}</Text>
      <Text variant="body">{player.position}</Text>
      <Text variant="caption">Matches: {player.matchesPlayed}</Text>
      
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button onPress={onEdit} variant="secondary">
          Edit
        </Button>
        <Button onPress={onDelete} variant="outline">
          Delete
        </Button>
      </View>
    </Card>
  );
};

export default PlayerCard;
```

## Container Components

### Characteristics
- Concerned with how things work
- Provide data and behavior to presentational components
- Connect to Redux or other state management
- Call API services
- Handle business logic
- Usually generated using higher-order components or hooks

### Example with Hooks

```javascript
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import PlayerCard from './PlayerCard';
import { selectPlayerById } from '@/redux/selectors/playerSelectors';
import { deletePlayer, updatePlayer } from '@/redux/actions/playerActions';

/**
 * Container component that provides data and behavior to PlayerCard
 * @param {Object} props
 * @param {string} props.playerId - ID of the player to display
 */
const PlayerCardContainer = ({ playerId }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Get data from Redux store
  const player = useSelector(state => selectPlayerById(state, playerId));
  const loading = useSelector(state => state.players.loading);
  
  // Handle edit action
  const handleEdit = useCallback(() => {
    navigation.navigate('EditPlayer', { playerId });
  }, [navigation, playerId]);
  
  // Handle delete action
  const handleDelete = useCallback(() => {
    dispatch(deletePlayer(playerId));
  }, [dispatch, playerId]);
  
  // Pass data and callbacks to presentational component
  return (
    <PlayerCard
      player={player}
      onEdit={handleEdit}
      onDelete={handleDelete}
      loading={loading}
    />
  );
};

export default PlayerCardContainer;
```

### Example with Higher-Order Component

```javascript
import { connect } from 'react-redux';
import PlayerCard from './PlayerCard';
import { selectPlayerById } from '@/redux/selectors/playerSelectors';
import { deletePlayer } from '@/redux/actions/playerActions';

const mapStateToProps = (state, ownProps) => ({
  player: selectPlayerById(state, ownProps.playerId),
  loading: state.players.loading,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onEdit: () => {
    // Navigate to edit screen
  },
  onDelete: () => {
    dispatch(deletePlayer(ownProps.playerId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayerCard);
```

## When to Use This Pattern

### Use Presentational Components When:
- Component is purely visual
- Component needs to be reused with different data sources
- Component should be easily testable in isolation
- Component doesn't need to know about Redux or API calls

### Use Container Components When:
- Component needs to fetch or manipulate data
- Component needs to connect to Redux store
- Component handles complex business logic
- Component orchestrates multiple presentational components

## File Organization

### Option 1: Separate Files
```
components/
├── PlayerCard/
│   ├── PlayerCard.js              # Presentational
│   ├── PlayerCardContainer.js     # Container
│   ├── PlayerCard.test.js         # Tests for presentational
│   ├── PlayerCardContainer.test.js # Tests for container
│   └── index.js                   # Export container by default
```

### Option 2: Same File
```
components/
├── PlayerCard/
│   ├── PlayerCard.js              # Both presentational and container
│   ├── PlayerCard.test.js
│   └── index.js
```

## Testing Strategy

### Testing Presentational Components
```javascript
import { render, fireEvent } from '@testing-library/react-native';
import PlayerCard from './PlayerCard';

describe('PlayerCard', () => {
  const mockPlayer = {
    name: 'John Doe',
    position: 'Forward',
    matchesPlayed: 10,
  };
  
  it('renders player information', () => {
    const { getByText } = render(
      <PlayerCard player={mockPlayer} onEdit={() => {}} onDelete={() => {}} />
    );
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Forward')).toBeTruthy();
    expect(getByText('Matches: 10')).toBeTruthy();
  });
  
  it('calls onEdit when edit button is pressed', () => {
    const onEdit = jest.fn();
    const { getByText } = render(
      <PlayerCard player={mockPlayer} onEdit={onEdit} onDelete={() => {}} />
    );
    
    fireEvent.press(getByText('Edit'));
    expect(onEdit).toHaveBeenCalled();
  });
});
```

### Testing Container Components
```javascript
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PlayerCardContainer from './PlayerCardContainer';

const mockStore = configureStore([]);

describe('PlayerCardContainer', () => {
  it('passes correct data to presentational component', () => {
    const store = mockStore({
      players: {
        byId: {
          '1': { id: '1', name: 'John Doe', position: 'Forward' },
        },
        loading: false,
      },
    });
    
    const { getByText } = render(
      <Provider store={store}>
        <PlayerCardContainer playerId="1" />
      </Provider>
    );
    
    expect(getByText('John Doe')).toBeTruthy();
  });
});
```

## Migration Guide

### Step 1: Identify Components to Split
Look for components that:
- Mix UI rendering with data fetching
- Have complex Redux connections
- Are difficult to test

### Step 2: Extract Presentational Component
1. Create new file for presentational component
2. Move JSX and styling
3. Replace Redux/API calls with props
4. Add PropTypes or TypeScript types

### Step 3: Create Container Component
1. Create container component file
2. Add Redux connections or hooks
3. Add business logic
4. Pass data and callbacks to presentational component

### Step 4: Update Tests
1. Test presentational component with mock data
2. Test container component with mock store
3. Ensure coverage is maintained

## Best Practices

1. **Keep Presentational Components Pure**: No side effects, no API calls
2. **Use PropTypes or TypeScript**: Document expected props
3. **Memoize Callbacks**: Use `useCallback` to prevent unnecessary re-renders
4. **Memoize Selectors**: Use `reselect` for derived data
5. **Keep Containers Thin**: Minimal logic, mostly data passing
6. **Test Both Separately**: Unit test presentational, integration test container
7. **Default Export Container**: Export container by default from index.js

## Common Pitfalls

### ❌ Don't: Mix concerns in one component
```javascript
const PlayerCard = ({ playerId }) => {
  const [player, setPlayer] = useState(null);
  
  useEffect(() => {
    fetch(`/api/players/${playerId}`)
      .then(res => res.json())
      .then(setPlayer);
  }, [playerId]);
  
  return <Card><Text>{player?.name}</Text></Card>;
};
```

### ✅ Do: Separate concerns
```javascript
// Presentational
const PlayerCard = ({ player }) => (
  <Card><Text>{player.name}</Text></Card>
);

// Container
const PlayerCardContainer = ({ playerId }) => {
  const player = useSelector(state => selectPlayerById(state, playerId));
  return <PlayerCard player={player} />;
};
```

## Related Patterns

- **Hooks Pattern**: Modern alternative using custom hooks
- **Render Props**: Alternative composition pattern
- **Higher-Order Components**: Legacy pattern for containers
- **Compound Components**: For complex component APIs

## Further Reading

- [React Documentation: Presentational and Container Components](https://reactjs.org/docs/thinking-in-react.html)
- [Redux Documentation: Usage with React](https://redux.js.org/tutorials/fundamentals/part-5-ui-react)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
