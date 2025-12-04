# OptimizedFlatList Component

A performance-optimized FlatList component with built-in pagination, pull-to-refresh, and rendering optimizations.

## Features

- **Performance Optimizations**: Configured with optimal `windowSize`, `maxToRenderPerBatch`, and `removeClippedSubviews`
- **Fixed-Height Optimization**: Supports `getItemLayout` for fixed-height items to skip measurement
- **Pull-to-Refresh**: Built-in refresh control with customizable callback
- **Pagination**: Automatic loading indicators and end-reached handling
- **Flexible**: Supports all standard FlatList props

## Usage

### Basic Usage

```javascript
import OptimizedFlatList from '../components/molecules/OptimizedFlatList';

const MyScreen = () => {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Fetch fresh data
    await fetchData();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    // Load more data
    await fetchMoreData();
  };

  return (
    <OptimizedFlatList
      data={data}
      renderItem={({ item }) => <ItemComponent item={item} />}
      keyExtractor={(item) => item.id.toString()}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
    />
  );
};
```

### With Fixed-Height Items (Best Performance)

```javascript
<OptimizedFlatList
  data={matches}
  renderItem={({ item }) => <MatchCard match={item} />}
  keyExtractor={(item) => item.id.toString()}
  itemHeight={120} // Fixed height enables getItemLayout optimization
  onRefresh={handleRefresh}
  refreshing={refreshing}
/>
```

### With Empty State

```javascript
<OptimizedFlatList
  data={tournaments}
  renderItem={({ item }) => <TournamentCard tournament={item} />}
  keyExtractor={(item) => item.id.toString()}
  ListEmptyComponent={
    <EmptyState
      icon="trophy"
      title="No Tournaments"
      message="Create your first tournament to get started"
      actionLabel="Create Tournament"
      onAction={() => navigation.navigate('CreateTournament')}
    />
  }
/>
```

### With Custom Configuration

```javascript
<OptimizedFlatList
  data={players}
  renderItem={({ item }) => <PlayerCard player={item} />}
  keyExtractor={(item) => item.id.toString()}
  windowSize={5} // Smaller window for memory optimization
  maxToRenderPerBatch={5} // Render fewer items per batch
  initialNumToRender={15} // Render more items initially
  onEndReached={loadMorePlayers}
  onEndReachedThreshold={0.3} // Trigger earlier
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `array` | **required** | Array of data to render |
| `renderItem` | `function` | **required** | Function to render each item |
| `keyExtractor` | `function` | **required** | Function to extract unique key |
| `onRefresh` | `function` | `undefined` | Callback when user pulls to refresh |
| `onEndReached` | `function` | `undefined` | Callback when scrolling near end |
| `onEndReachedThreshold` | `number` | `0.5` | Threshold for triggering onEndReached (0-1) |
| `refreshing` | `boolean` | `false` | Whether refresh is in progress |
| `loading` | `boolean` | `false` | Whether initial load is in progress |
| `itemHeight` | `number` | `undefined` | Fixed height of items (enables optimization) |
| `ListEmptyComponent` | `element\|function` | `undefined` | Component when list is empty |
| `ListHeaderComponent` | `element\|function` | `undefined` | Component at top of list |
| `ListFooterComponent` | `element\|function` | `undefined` | Component at bottom of list |
| `windowSize` | `number` | `10` | Items outside viewport to keep rendered |
| `maxToRenderPerBatch` | `number` | `10` | Maximum items per render batch |
| `updateCellsBatchingPeriod` | `number` | `50` | Delay between batches (ms) |
| `removeClippedSubviews` | `boolean` | `true` | Remove off-screen views |
| `initialNumToRender` | `number` | `10` | Items to render initially |

## Performance Tips

1. **Use `itemHeight` when possible**: If all items have the same height, provide `itemHeight` to enable `getItemLayout` optimization
2. **Adjust `windowSize`**: Smaller values use less memory, larger values provide smoother scrolling
3. **Optimize `renderItem`**: Use `React.memo` on item components to prevent unnecessary re-renders
4. **Use `keyExtractor` properly**: Ensure keys are stable and unique
5. **Implement pagination**: Use `onEndReached` to load data in chunks rather than all at once

## Testing

```javascript
import { render, fireEvent } from '@testing-library/react-native';
import OptimizedFlatList from './OptimizedFlatList';

test('renders list items', () => {
  const data = [{ id: '1', name: 'Item 1' }];
  const { getByText } = render(
    <OptimizedFlatList
      data={data}
      renderItem={({ item }) => <Text>{item.name}</Text>}
      keyExtractor={(item) => item.id}
    />
  );
  
  expect(getByText('Item 1')).toBeTruthy();
});
```

## Related Components

- `EmptyState` - For empty list states
- `Skeleton` - For loading states
- `ListItem` - Pre-built list item component
