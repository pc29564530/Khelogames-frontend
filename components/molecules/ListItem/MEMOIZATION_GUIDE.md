# List Item Memoization Guide

This guide explains how to optimize list rendering performance using memoization techniques.

## Why Memoization Matters

In large lists, React re-renders all visible items whenever the parent component updates. Memoization prevents unnecessary re-renders by comparing props and only re-rendering when relevant data changes.

**Performance Impact:**
- Without memoization: 1000 items × 16ms = 16 seconds of wasted rendering
- With memoization: Only changed items re-render

## Quick Start

### 1. Use MemoizedListItem

For simple list items, use the pre-built `MemoizedListItem`:

```javascript
import { MemoizedListItem } from '../components/molecules/ListItem';

const MyList = ({ items }) => {
  const handlePress = useCallback((item) => {
    navigation.navigate('Detail', { item });
  }, [navigation]);

  return (
    <OptimizedFlatList
      data={items}
      renderItem={({ item }) => (
        <MemoizedListItem
          title={item.name}
          subtitle={item.description}
          onPress={() => handlePress(item)}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};
```

### 2. Use Domain-Specific Memoized Components

For complex list items, use specialized components:

```javascript
import MemoizedTournamentListItem from '../components/molecules/ListItem/MemoizedTournamentListItem';

const TournamentList = ({ tournaments }) => {
  const handlePress = useCallback((tournament) => {
    navigation.navigate('TournamentPage', { tournament });
  }, [navigation]);

  return (
    <OptimizedFlatList
      data={tournaments}
      renderItem={({ item }) => (
        <MemoizedTournamentListItem
          tournament={item}
          onPress={() => handlePress(item)}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};
```

## Creating Custom Memoized Components

### Method 1: Using createMemoizedListItem

```javascript
import { createMemoizedListItem, createItemComparison } from './createMemoizedListItem';

// Your custom component
const MatchCard = ({ match, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>{match.homeTeam} vs {match.awayTeam}</Text>
    <Text>Score: {match.score.home} - {match.score.away}</Text>
  </TouchableOpacity>
);

// Create memoized version
const MemoizedMatchCard = createMemoizedListItem(
  MatchCard,
  createItemComparison('match', 'id', ['score', 'status']),
  'MemoizedMatchCard'
);

export default MemoizedMatchCard;
```

### Method 2: Manual React.memo

```javascript
import React, { memo } from 'react';

const PlayerCard = ({ player, onPress }) => (
  // Component implementation
);

const MemoizedPlayerCard = memo(
  PlayerCard,
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    // Return false if props changed (re-render)
    return (
      prevProps.player.id === nextProps.player.id &&
      prevProps.player.stats === nextProps.player.stats &&
      prevProps.onPress === nextProps.onPress
    );
  }
);

export default MemoizedPlayerCard;
```

## Critical Rules for Maximum Performance

### 1. Wrap Event Handlers in useCallback

❌ **Bad** - Creates new function on every render:
```javascript
<MemoizedListItem
  onPress={() => handlePress(item)}
/>
```

✅ **Good** - Stable function reference:
```javascript
const handlePress = useCallback((item) => {
  navigation.navigate('Detail', { item });
}, [navigation]);

<MemoizedListItem
  onPress={() => handlePress(item)}
/>
```

### 2. Avoid Inline Objects and Arrays

❌ **Bad** - New object on every render:
```javascript
<MemoizedListItem
  style={{ marginBottom: 10 }}
/>
```

✅ **Good** - Stable reference:
```javascript
const styles = StyleSheet.create({
  item: { marginBottom: 10 }
});

<MemoizedListItem
  style={styles.item}
/>
```

### 3. Use Stable Keys

❌ **Bad** - Index as key:
```javascript
keyExtractor={(item, index) => index.toString()}
```

✅ **Good** - Unique, stable ID:
```javascript
keyExtractor={(item) => item.id.toString()}
```

### 4. Memoize Derived Data

❌ **Bad** - Recalculates on every render:
```javascript
const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));
```

✅ **Good** - Memoized calculation:
```javascript
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);
```

## Comparison Function Patterns

### Pattern 1: Compare by ID Only
Best for items that rarely change:
```javascript
(prev, next) => prev.item.id === next.item.id
```

### Pattern 2: Compare ID + Specific Fields
Best for items with frequently updated fields:
```javascript
(prev, next) => (
  prev.item.id === next.item.id &&
  prev.item.score === next.item.score &&
  prev.item.status === next.item.status
)
```

### Pattern 3: Deep Comparison
Use sparingly - can be expensive:
```javascript
import isEqual from 'lodash/isEqual';

(prev, next) => isEqual(prev.item, next.item)
```

## Testing Memoization

### Visual Testing with React DevTools Profiler

1. Open React DevTools
2. Go to Profiler tab
3. Start recording
4. Scroll through list
5. Check which components re-rendered

### Programmatic Testing

```javascript
import { render } from '@testing-library/react-native';

test('does not re-render when props unchanged', () => {
  const { rerender } = render(
    <MemoizedMatchCard match={mockMatch} onPress={jest.fn()} />
  );
  
  const firstRender = // capture render count
  
  rerender(<MemoizedMatchCard match={mockMatch} onPress={jest.fn()} />);
  
  const secondRender = // capture render count
  
  expect(secondRender).toBe(firstRender); // Should not increase
});
```

## Performance Checklist

- [ ] List items wrapped in React.memo
- [ ] Event handlers wrapped in useCallback
- [ ] Styles defined outside component or in StyleSheet
- [ ] Derived data memoized with useMemo
- [ ] Stable, unique keys for list items
- [ ] Custom comparison function for complex items
- [ ] No inline objects or arrays in props
- [ ] Parent component optimized to prevent unnecessary updates

## Common Pitfalls

### Pitfall 1: Over-Memoization
Don't memoize everything - it has overhead. Only memoize:
- List items in large lists
- Expensive computations
- Components that re-render frequently

### Pitfall 2: Incorrect Comparison
```javascript
// ❌ This will always re-render
(prev, next) => prev.item !== next.item // Compares references

// ✅ Compare actual values
(prev, next) => prev.item.id === next.item.id
```

### Pitfall 3: Forgetting Dependencies
```javascript
// ❌ Missing dependency
const handlePress = useCallback(() => {
  navigation.navigate('Detail', { item });
}, []); // Should include 'item'

// ✅ Correct dependencies
const handlePress = useCallback(() => {
  navigation.navigate('Detail', { item });
}, [item, navigation]);
```

## Related Documentation

- [OptimizedFlatList README](../OptimizedFlatList/README.md)
- [React.memo Documentation](https://react.dev/reference/react/memo)
- [useCallback Hook](https://react.dev/reference/react/useCallback)
- [useMemo Hook](https://react.dev/reference/react/useMemo)
