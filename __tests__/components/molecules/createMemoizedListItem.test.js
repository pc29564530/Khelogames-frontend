import React from 'react';
import { View, Text as RNText } from 'react-native';
import { render } from '@testing-library/react-native';
import {
  createMemoizedListItem,
  createItemComparison,
  createPropsComparison,
} from '../../../components/molecules/ListItem/createMemoizedListItem';
import { mockTournament, mockCricketMatch } from '../../utils/mockDataFactories';

describe('createMemoizedListItem Memoization Tests', () => {
  describe('Basic Memoization', () => {
    it('should create a memoized component', () => {
      const BaseComponent = ({ item }) => (
        <View testID={`item-${item.id}`}>
          <RNText>{item.name}</RNText>
        </View>
      );

      const MemoizedComponent = createMemoizedListItem(BaseComponent);
      
      expect(MemoizedComponent).toBeDefined();
      expect(MemoizedComponent.displayName).toBe('Memoized(BaseComponent)');
    });

    it('should set custom display name', () => {
      const BaseComponent = ({ item }) => <RNText>{item.name}</RNText>;
      
      const MemoizedComponent = createMemoizedListItem(
        BaseComponent,
        undefined,
        'CustomMemoizedItem'
      );
      
      expect(MemoizedComponent.displayName).toBe('CustomMemoizedItem');
    });

    it('should prevent re-renders when props are equal', () => {
      const renderSpy = jest.fn();
      const BaseComponent = ({ item }) => {
        renderSpy();
        return <RNText>{item.name}</RNText>;
      };

      const MemoizedComponent = createMemoizedListItem(BaseComponent);
      const item = mockTournament();
      
      const { rerender } = render(<MemoizedComponent item={item} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<MemoizedComponent item={item} />);
      
      // Should not trigger re-render
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should re-render when props change', () => {
      const renderSpy = jest.fn();
      const BaseComponent = ({ item }) => {
        renderSpy();
        return <RNText>{item.name}</RNText>;
      };

      const MemoizedComponent = createMemoizedListItem(BaseComponent);
      const item1 = mockTournament();
      const item2 = mockTournament();
      
      const { rerender } = render(<MemoizedComponent item={item1} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with different props
      rerender(<MemoizedComponent item={item2} />);
      
      // Should trigger re-render
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Custom Comparison Functions', () => {
    it('should use custom comparison function', () => {
      const renderSpy = jest.fn();
      const BaseComponent = ({ item }) => {
        renderSpy();
        return <RNText>{item.name}</RNText>;
      };

      // Only compare IDs
      const compareById = (prev, next) => prev.item.id === next.item.id;
      
      const MemoizedComponent = createMemoizedListItem(BaseComponent, compareById);
      const item = mockTournament();
      
      const { rerender } = render(<MemoizedComponent item={item} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same ID but different name
      const updatedItem = { ...item, name: 'Updated Name' };
      rerender(<MemoizedComponent item={updatedItem} />);
      
      // Should not re-render because ID is the same
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should re-render when custom comparison returns false', () => {
      const renderSpy = jest.fn();
      const BaseComponent = ({ item }) => {
        renderSpy();
        return <RNText>{item.name}</RNText>;
      };

      const compareById = (prev, next) => prev.item.id === next.item.id;
      
      const MemoizedComponent = createMemoizedListItem(BaseComponent, compareById);
      const item1 = mockTournament();
      const item2 = mockTournament(); // Different ID
      
      const { rerender } = render(<MemoizedComponent item={item1} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with different ID
      rerender(<MemoizedComponent item={item2} />);
      
      // Should re-render
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('createItemComparison', () => {
    it('should create comparison function for items with ID', () => {
      const compareItem = createItemComparison('item', 'id');
      
      const item1 = mockTournament();
      const item2 = { ...item1 };
      
      const props1 = { item: item1 };
      const props2 = { item: item2 };
      
      // Same ID should return true
      expect(compareItem(props1, props2)).toBe(true);
    });

    it('should detect changes in additional keys', () => {
      const compareItem = createItemComparison('match', 'id', ['score', 'status']);
      
      const match = mockCricketMatch();
      const props1 = { match };
      const props2 = { match: { ...match, score: { home: 100, away: 50 } } };
      
      // Different score should return false
      expect(compareItem(props1, props2)).toBe(false);
    });

    it('should handle same reference optimization', () => {
      const compareItem = createItemComparison('item', 'id');
      
      const item = mockTournament();
      const props1 = { item };
      const props2 = { item }; // Same reference
      
      // Same reference should return true immediately
      expect(compareItem(props1, props2)).toBe(true);
    });

    it('should handle null/undefined items', () => {
      const compareItem = createItemComparison('item', 'id');
      
      const props1 = { item: null };
      const props2 = { item: mockTournament() };
      
      // One null should return false
      expect(compareItem(props1, props2)).toBe(false);
    });

    it('should compare other props besides item', () => {
      const compareItem = createItemComparison('item', 'id');
      
      const item1 = mockTournament();
      const item2 = { ...item1 }; // Different reference, same ID
      const onPress1 = () => {};
      const onPress2 = () => {};
      
      // When items have same ID but different references, other props matter
      const props1 = { item: item1, onPress: onPress1, index: 0 };
      const props2 = { item: item2, onPress: onPress2, index: 0 };
      
      // Different function references should return false
      expect(compareItem(props1, props2)).toBe(false);
      
      // Same function reference should return true
      const props3 = { item: item1, onPress: onPress1, index: 0 };
      const props4 = { item: item2, onPress: onPress1, index: 0 };
      expect(compareItem(props3, props4)).toBe(true);
    });

    it('should handle items with same ID but different additional keys', () => {
      const compareItem = createItemComparison('tournament', 'id', ['status']);
      
      const tournament = mockTournament({ status: 'upcoming' });
      const props1 = { tournament };
      const props2 = { tournament: { ...tournament, status: 'ongoing' } };
      
      // Different status should return false
      expect(compareItem(props1, props2)).toBe(false);
    });
  });

  describe('createPropsComparison', () => {
    it('should create comparison function for specific props', () => {
      const compareProps = createPropsComparison(['title', 'subtitle']);
      
      const props1 = { title: 'Title', subtitle: 'Subtitle', extra: 'data' };
      const props2 = { title: 'Title', subtitle: 'Subtitle', extra: 'different' };
      
      // Should only compare specified keys
      expect(compareProps(props1, props2)).toBe(true);
    });

    it('should detect changes in specified props', () => {
      const compareProps = createPropsComparison(['title', 'subtitle']);
      
      const props1 = { title: 'Title', subtitle: 'Subtitle' };
      const props2 = { title: 'Title', subtitle: 'Different' };
      
      // Different subtitle should return false
      expect(compareProps(props1, props2)).toBe(false);
    });

    it('should handle empty keys array', () => {
      const compareProps = createPropsComparison([]);
      
      const props1 = { title: 'Title' };
      const props2 = { title: 'Different' };
      
      // No keys to compare should return true
      expect(compareProps(props1, props2)).toBe(true);
    });
  });

  describe('Memoization Performance', () => {
    it('should prevent unnecessary re-renders in list context', () => {
      const renderSpy = jest.fn();
      const BaseComponent = ({ item, index }) => {
        renderSpy(item.id);
        return (
          <View testID={`item-${index}`}>
            <RNText>{item.name}</RNText>
          </View>
        );
      };

      const compareItem = createItemComparison('item', 'id', ['name']);
      const MemoizedComponent = createMemoizedListItem(BaseComponent, compareItem);
      
      const items = [
        mockTournament({ id: '1', name: 'Tournament 1' }),
        mockTournament({ id: '2', name: 'Tournament 2' }),
        mockTournament({ id: '3', name: 'Tournament 3' }),
      ];
      
      const { rerender } = render(
        <View>
          {items.map((item, index) => (
            <MemoizedComponent key={item.id} item={item} index={index} />
          ))}
        </View>
      );
      
      expect(renderSpy).toHaveBeenCalledTimes(3);
      
      // Update only the second item
      const updatedItems = [
        items[0],
        { ...items[1], name: 'Updated Tournament 2' },
        items[2],
      ];
      
      rerender(
        <View>
          {updatedItems.map((item, index) => (
            <MemoizedComponent key={item.id} item={item} index={index} />
          ))}
        </View>
      );
      
      // Should only re-render the changed item
      expect(renderSpy).toHaveBeenCalledTimes(4); // 3 initial + 1 update
    });

    it('should handle rapid prop changes efficiently', () => {
      const renderSpy = jest.fn();
      const BaseComponent = ({ item }) => {
        renderSpy();
        return <RNText>{item.name}</RNText>;
      };

      const MemoizedComponent = createMemoizedListItem(BaseComponent);
      const item = mockTournament();
      
      const { rerender } = render(<MemoizedComponent item={item} />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Multiple re-renders with same props
      for (let i = 0; i < 10; i++) {
        rerender(<MemoizedComponent item={item} />);
      }
      
      // Should still only render once
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should optimize list with mixed updates', () => {
      const renderSpy = jest.fn();
      const BaseComponent = ({ item }) => {
        renderSpy(item.id);
        return <RNText>{item.name}</RNText>;
      };

      const compareItem = createItemComparison('item', 'id', ['name']);
      const MemoizedComponent = createMemoizedListItem(BaseComponent, compareItem);
      
      const items = Array.from({ length: 100 }, (_, i) => 
        mockTournament({ id: `${i}`, name: `Tournament ${i}` })
      );
      
      const { rerender } = render(
        <View>
          {items.map(item => (
            <MemoizedComponent key={item.id} item={item} />
          ))}
        </View>
      );
      
      const initialRenderCount = renderSpy.mock.calls.length;
      
      // Update only 5 items out of 100
      const updatedItems = items.map((item, i) => 
        i < 5 ? { ...item, name: `Updated ${i}` } : item
      );
      
      rerender(
        <View>
          {updatedItems.map(item => (
            <MemoizedComponent key={item.id} item={item} />
          ))}
        </View>
      );
      
      // Should only re-render the 5 updated items
      expect(renderSpy).toHaveBeenCalledTimes(initialRenderCount + 5);
    });
  });
});
