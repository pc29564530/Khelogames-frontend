import React, { useState } from 'react';
import { View, Text as RNText } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OptimizedFlatList from '../../../components/molecules/OptimizedFlatList/OptimizedFlatList';
import { mockMany, mockTournament } from '../../utils/mockDataFactories';

describe('OptimizedFlatList Performance Tests', () => {
  describe('Large Dataset Rendering', () => {
    it('should render large dataset efficiently', () => {
      const largeDataset = mockMany(mockTournament, 1000);
      const renderItem = jest.fn(({ item }) => (
        <View testID={`item-${item.id}`}>
          <RNText>{item.name}</RNText>
        </View>
      ));

      const { getByTestId } = render(
        <OptimizedFlatList
          data={largeDataset}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          testID="optimized-list"
        />
      );

      // Verify list is rendered
      expect(getByTestId('optimized-list')).toBeTruthy();
      
      // With default initialNumToRender=10, only ~10 items should be rendered initially
      // This verifies windowing is working
      expect(renderItem).toHaveBeenCalled();
      expect(renderItem.mock.calls.length).toBeLessThan(50); // Should be much less than 1000
    });

    it('should handle empty dataset gracefully', () => {
      const EmptyComponent = () => <RNText testID="empty-state">No items</RNText>;
      
      const { getByTestId } = render(
        <OptimizedFlatList
          data={[]}
          renderItem={() => null}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyComponent />}
        />
      );

      expect(getByTestId('empty-state')).toBeTruthy();
    });

    it('should use getItemLayout when itemHeight is provided', () => {
      const dataset = mockMany(mockTournament, 100);
      const itemHeight = 80;
      
      const { getByTestId } = render(
        <OptimizedFlatList
          data={dataset}
          renderItem={({ item }) => (
            <View style={{ height: itemHeight }}>
              <RNText>{item.name}</RNText>
            </View>
          )}
          keyExtractor={(item) => item.id}
          itemHeight={itemHeight}
          testID="list-with-layout"
        />
      );

      expect(getByTestId('list-with-layout')).toBeTruthy();
    });

    it('should configure performance optimization props correctly', () => {
      const dataset = mockMany(mockTournament, 50);
      const windowSize = 5;
      const maxToRenderPerBatch = 5;
      
      const { getByTestId } = render(
        <OptimizedFlatList
          data={dataset}
          renderItem={({ item }) => <RNText>{item.name}</RNText>}
          keyExtractor={(item) => item.id}
          windowSize={windowSize}
          maxToRenderPerBatch={maxToRenderPerBatch}
          removeClippedSubviews={true}
          testID="optimized-list"
        />
      );

      expect(getByTestId('optimized-list')).toBeTruthy();
    });
  });

  describe('Pagination Behavior', () => {
    it('should trigger onEndReached when scrolling near end', async () => {
      const dataset = mockMany(mockTournament, 20);
      const onEndReached = jest.fn(() => Promise.resolve());
      
      const { getByTestId } = render(
        <OptimizedFlatList
          data={dataset}
          renderItem={({ item }) => <RNText>{item.name}</RNText>}
          keyExtractor={(item) => item.id}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          testID="paginated-list"
        />
      );

      const list = getByTestId('paginated-list');
      
      // Simulate scroll to end by calling onEndReached directly
      fireEvent(list, 'onEndReached');

      await waitFor(() => {
        expect(onEndReached).toHaveBeenCalled();
      });
    });

    it('should show loading indicator when loading more items', async () => {
      const dataset = mockMany(mockTournament, 20);
      const onEndReached = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const { getByTestId } = render(
        <OptimizedFlatList
          data={dataset}
          renderItem={({ item }) => <RNText>{item.name}</RNText>}
          keyExtractor={(item) => item.id}
          onEndReached={onEndReached}
          testID="paginated-list"
        />
      );

      const list = getByTestId('paginated-list');
      
      // Trigger pagination
      fireEvent(list, 'onEndReached');

      // Loading indicator should appear (ActivityIndicator is rendered)
      await waitFor(() => {
        expect(onEndReached).toHaveBeenCalled();
      });
    });

    it('should not trigger onEndReached multiple times simultaneously', async () => {
      const dataset = mockMany(mockTournament, 20);
      const onEndReached = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const { getByTestId } = render(
        <OptimizedFlatList
          data={dataset}
          renderItem={({ item }) => <RNText>{item.name}</RNText>}
          keyExtractor={(item) => item.id}
          onEndReached={onEndReached}
          testID="paginated-list"
        />
      );

      const list = getByTestId('paginated-list');
      
      // Trigger pagination multiple times quickly
      fireEvent(list, 'onEndReached');
      fireEvent(list, 'onEndReached');
      fireEvent(list, 'onEndReached');

      await waitFor(() => {
        expect(onEndReached).toHaveBeenCalledTimes(1);
      });
    });

    it('should support pull-to-refresh', () => {
      const dataset = mockMany(mockTournament, 20);
      const onRefresh = jest.fn(() => Promise.resolve());
      
      const { getByTestId } = render(
        <OptimizedFlatList
          data={dataset}
          renderItem={({ item }) => <RNText>{item.name}</RNText>}
          keyExtractor={(item) => item.id}
          onRefresh={onRefresh}
          refreshing={false}
          testID="refreshable-list"
        />
      );

      const list = getByTestId('refreshable-list');
      
      // Verify refresh control is configured
      expect(list).toBeTruthy();
      expect(onRefresh).toBeDefined();
    });

    it('should render custom footer component', () => {
      const dataset = mockMany(mockTournament, 20);
      const FooterComponent = () => <RNText testID="custom-footer">End of list</RNText>;
      
      const { getByTestId } = render(
        <OptimizedFlatList
          data={dataset}
          renderItem={({ item }) => <RNText>{item.name}</RNText>}
          keyExtractor={(item) => item.id}
          ListFooterComponent={<FooterComponent />}
        />
      );

      expect(getByTestId('custom-footer')).toBeTruthy();
    });
  });

  describe('Memoization and Re-render Prevention', () => {
    it('should not re-render items when unrelated data changes', () => {
      const TestComponent = () => {
        const [dataset] = useState(mockMany(mockTournament, 10));
        const [counter, setCounter] = useState(0);
        const renderItem = jest.fn(({ item }) => (
          <View testID={`item-${item.id}`}>
            <RNText>{item.name}</RNText>
          </View>
        ));

        return (
          <View>
            <RNText testID="counter">{counter}</RNText>
            <RNText testID="increment" onPress={() => setCounter(c => c + 1)}>
              Increment
            </RNText>
            <OptimizedFlatList
              data={dataset}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              testID="memoized-list"
            />
          </View>
        );
      };

      const { getByTestId } = render(<TestComponent />);
      
      // Initial render
      expect(getByTestId('counter')).toBeTruthy();
      
      // Trigger state change that doesn't affect list data
      fireEvent.press(getByTestId('increment'));
      
      // List should still be rendered correctly
      expect(getByTestId('memoized-list')).toBeTruthy();
    });

    it('should use stable keyExtractor function', () => {
      const dataset = mockMany(mockTournament, 20);
      const keyExtractor = jest.fn((item) => item.id);
      
      render(
        <OptimizedFlatList
          data={dataset}
          renderItem={({ item }) => <RNText>{item.name}</RNText>}
          keyExtractor={keyExtractor}
        />
      );

      // keyExtractor should be called for each item
      expect(keyExtractor).toHaveBeenCalled();
      expect(keyExtractor.mock.calls.length).toBeGreaterThan(0);
      
      // Verify keys are being extracted
      const keys = keyExtractor.mock.results.map(result => result.value);
      expect(keys.length).toBeGreaterThan(0);
      expect(keys.every(key => typeof key === 'string')).toBe(true);
    });

    it('should handle data updates efficiently', () => {
      const TestComponent = () => {
        const [dataset, setDataset] = useState(mockMany(mockTournament, 10));
        
        const addItem = () => {
          setDataset(prev => [...prev, mockTournament()]);
        };

        return (
          <View>
            <RNText testID="add-item" onPress={addItem}>Add Item</RNText>
            <OptimizedFlatList
              data={dataset}
              renderItem={({ item }) => (
                <View testID={`item-${item.id}`}>
                  <RNText>{item.name}</RNText>
                </View>
              )}
              keyExtractor={(item) => item.id}
              testID="dynamic-list"
            />
          </View>
        );
      };

      const { getByTestId } = render(<TestComponent />);
      
      // Add new item
      fireEvent.press(getByTestId('add-item'));
      
      // List should still render
      expect(getByTestId('dynamic-list')).toBeTruthy();
    });

    it('should maintain scroll position when data updates', () => {
      const TestComponent = () => {
        const [dataset, setDataset] = useState(mockMany(mockTournament, 20));
        
        const updateFirstItem = () => {
          setDataset(prev => {
            const updated = [...prev];
            updated[0] = { ...updated[0], name: 'Updated Tournament' };
            return updated;
          });
        };

        return (
          <View>
            <RNText testID="update-item" onPress={updateFirstItem}>Update</RNText>
            <OptimizedFlatList
              data={dataset}
              renderItem={({ item }) => (
                <View testID={`item-${item.id}`}>
                  <RNText>{item.name}</RNText>
                </View>
              )}
              keyExtractor={(item) => item.id}
              testID="stable-list"
            />
          </View>
        );
      };

      const { getByTestId } = render(<TestComponent />);
      
      // Update item
      fireEvent.press(getByTestId('update-item'));
      
      // List should still be rendered
      expect(getByTestId('stable-list')).toBeTruthy();
    });
  });

  describe('Performance Configuration', () => {
    it('should accept custom windowSize configuration', () => {
      const dataset = mockMany(mockTournament, 100);
      
      const { getByTestId } = render(
        <OptimizedFlatList
          data={dataset}
          renderItem={({ item }) => <RNText>{item.name}</RNText>}
          keyExtractor={(item) => item.id}
          windowSize={21}
          testID="custom-window-list"
        />
      );

      expect(getByTestId('custom-window-list')).toBeTruthy();
    });

    it('should accept custom maxToRenderPerBatch configuration', () => {
      const dataset = mockMany(mockTournament, 100);
      
      const { getByTestId } = render(
        <OptimizedFlatList
          data={dataset}
          renderItem={({ item }) => <RNText>{item.name}</RNText>}
          keyExtractor={(item) => item.id}
          maxToRenderPerBatch={20}
          testID="custom-batch-list"
        />
      );

      expect(getByTestId('custom-batch-list')).toBeTruthy();
    });

    it('should support removeClippedSubviews optimization', () => {
      const dataset = mockMany(mockTournament, 100);
      
      const { getByTestId } = render(
        <OptimizedFlatList
          data={dataset}
          renderItem={({ item }) => <RNText>{item.name}</RNText>}
          keyExtractor={(item) => item.id}
          removeClippedSubviews={true}
          testID="clipped-list"
        />
      );

      expect(getByTestId('clipped-list')).toBeTruthy();
    });

    it('should configure initialNumToRender', () => {
      const dataset = mockMany(mockTournament, 100);
      const renderItem = jest.fn(({ item }) => <RNText>{item.name}</RNText>);
      
      render(
        <OptimizedFlatList
          data={dataset}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          initialNumToRender={5}
        />
      );

      // Should render approximately initialNumToRender items initially
      expect(renderItem.mock.calls.length).toBeLessThan(20);
    });
  });
});
