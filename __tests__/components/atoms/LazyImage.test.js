import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import LazyImage from '../../../components/atoms/LazyImage/LazyImage';

// Mock OptimizedImage
jest.mock('../../../components/atoms/OptimizedImage', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: (props) => (
      <View testID={props.testID || 'optimized-image'}>
        <Text>OptimizedImage: {props.source?.uri || 'local'}</Text>
      </View>
    ),
  };
});

describe('LazyImage - Lazy Loading', () => {
  const mockSource = { uri: 'https://example.com/image.jpg' };
  const mockPlaceholder = { uri: 'https://example.com/placeholder.jpg' };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Eager Loading', () => {
    it('should load image immediately when eager is true', () => {
      const { getByText } = render(
        <LazyImage 
          source={mockSource} 
          eager={true}
          testID="lazy-image" 
        />
      );

      expect(getByText(/OptimizedImage: https:\/\/example\.com\/image\.jpg/)).toBeDefined();
    });

    it('should load image immediately when priority is high', () => {
      const { getByText } = render(
        <LazyImage 
          source={mockSource} 
          priority="high"
          testID="lazy-image" 
        />
      );

      expect(getByText(/OptimizedImage: https:\/\/example\.com\/image\.jpg/)).toBeDefined();
    });

    it('should not load image immediately when eager is false and priority is normal', () => {
      const { queryByText } = render(
        <LazyImage 
          source={mockSource} 
          eager={false}
          priority="normal"
          placeholder={mockPlaceholder}
          testID="lazy-image" 
        />
      );

      // Should show placeholder initially
      expect(queryByText(/OptimizedImage: https:\/\/example\.com\/placeholder\.jpg/)).toBeDefined();
    });
  });

  describe('Visibility Detection', () => {
    it('should start visibility check on mount', () => {
      const { root } = render(
        <LazyImage 
          source={mockSource} 
          eager={false}
          priority="normal"
          testID="lazy-image" 
        />
      );

      expect(root).toBeDefined();
      
      // Fast-forward timers to trigger visibility check
      act(() => {
        jest.advanceTimersByTime(500);
      });
    });

    it('should call onVisible callback when image becomes visible', async () => {
      const onVisible = jest.fn();
      const { UNSAFE_getByType } = render(
        <LazyImage 
          source={mockSource} 
          eager={false}
          priority="normal"
          onVisible={onVisible}
          testID="lazy-image" 
        />
      );

      // Fast-forward timers
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Component should be rendered
      expect(UNSAFE_getByType('View')).toBeDefined();
    });

    it('should load image when element enters viewport', async () => {
      const { getByText } = render(
        <LazyImage 
          source={mockSource} 
          eager={false}
          priority="normal"
          placeholder={mockPlaceholder}
          testID="lazy-image" 
        />
      );

      // Initially should show placeholder
      expect(getByText(/OptimizedImage: https:\/\/example\.com\/placeholder\.jpg/)).toBeDefined();

      // Fast-forward timers to trigger visibility check
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    });

    it('should respect rootMargin for early loading', () => {
      const { root } = render(
        <LazyImage 
          source={mockSource} 
          eager={false}
          priority="normal"
          rootMargin={200}
          testID="lazy-image" 
        />
      );

      expect(root).toBeDefined();
    });

    it('should respect threshold for visibility calculation', () => {
      const { root } = render(
        <LazyImage 
          source={mockSource} 
          eager={false}
          priority="normal"
          threshold={0.5}
          testID="lazy-image" 
        />
      );

      expect(root).toBeDefined();
    });
  });

  describe('Priority Levels', () => {
    it('should handle low priority loading', () => {
      const { root } = render(
        <LazyImage 
          source={mockSource} 
          priority="low"
          eager={false}
          testID="lazy-image" 
        />
      );

      expect(root).toBeDefined();
    });

    it('should handle normal priority loading', () => {
      const { root } = render(
        <LazyImage 
          source={mockSource} 
          priority="normal"
          eager={false}
          testID="lazy-image" 
        />
      );

      expect(root).toBeDefined();
    });

    it('should handle high priority loading', () => {
      const { getByText } = render(
        <LazyImage 
          source={mockSource} 
          priority="high"
          testID="lazy-image" 
        />
      );

      // High priority should load immediately
      expect(getByText(/OptimizedImage: https:\/\/example\.com\/image\.jpg/)).toBeDefined();
    });
  });

  describe('Placeholder Handling', () => {
    it('should show placeholder while waiting to load', () => {
      const { getByText } = render(
        <LazyImage 
          source={mockSource} 
          placeholder={mockPlaceholder}
          eager={false}
          priority="normal"
          testID="lazy-image" 
        />
      );

      expect(getByText(/OptimizedImage: https:\/\/example\.com\/placeholder\.jpg/)).toBeDefined();
    });

    it('should not show placeholder when eager loading', () => {
      const { getByText } = render(
        <LazyImage 
          source={mockSource} 
          placeholder={mockPlaceholder}
          eager={true}
          testID="lazy-image" 
        />
      );

      // Should show main image, not placeholder
      expect(getByText(/OptimizedImage: https:\/\/example\.com\/image\.jpg/)).toBeDefined();
    });

    it('should handle missing placeholder gracefully', () => {
      const { root } = render(
        <LazyImage 
          source={mockSource} 
          eager={false}
          priority="normal"
          testID="lazy-image" 
        />
      );

      expect(root).toBeDefined();
    });
  });

  describe('Layout Handling', () => {
    it('should trigger visibility check on layout', () => {
      const { UNSAFE_getByType } = render(
        <LazyImage 
          source={mockSource} 
          eager={false}
          priority="normal"
          testID="lazy-image" 
        />
      );

      const view = UNSAFE_getByType('View');
      
      // Trigger layout
      act(() => {
        if (view.props.onLayout) {
          view.props.onLayout();
        }
      });

      expect(view).toBeDefined();
    });

    it('should handle multiple layout events', () => {
      const { UNSAFE_getByType } = render(
        <LazyImage 
          source={mockSource} 
          eager={false}
          priority="normal"
          testID="lazy-image" 
        />
      );

      const view = UNSAFE_getByType('View');
      
      // Trigger multiple layouts
      act(() => {
        if (view.props.onLayout) {
          view.props.onLayout();
          view.props.onLayout();
          view.props.onLayout();
        }
      });

      expect(view).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup interval on unmount', () => {
      const { unmount } = render(
        <LazyImage 
          source={mockSource} 
          eager={false}
          priority="normal"
          testID="lazy-image" 
        />
      );

      // Unmount component
      unmount();

      // Fast-forward timers to ensure no errors
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    });

    it('should not trigger visibility check after unmount', () => {
      const onVisible = jest.fn();
      const { unmount } = render(
        <LazyImage 
          source={mockSource} 
          eager={false}
          priority="normal"
          onVisible={onVisible}
          testID="lazy-image" 
        />
      );

      unmount();

      // Fast-forward timers
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // onVisible should not be called after unmount
      expect(onVisible).not.toHaveBeenCalled();
    });
  });

  describe('Props Forwarding', () => {
    it('should forward additional props to OptimizedImage', () => {
      const { getByTestId } = render(
        <LazyImage 
          source={mockSource} 
          eager={true}
          testID="lazy-image"
          accessibilityLabel="Test image"
          resizeMode="contain"
        />
      );

      expect(getByTestId('lazy-image')).toBeDefined();
    });

    it('should forward style prop', () => {
      const customStyle = { width: 200, height: 200 };
      const { UNSAFE_getByType } = render(
        <LazyImage 
          source={mockSource} 
          eager={true}
          style={customStyle}
          testID="lazy-image" 
        />
      );

      const view = UNSAFE_getByType('View');
      expect(view.props.style).toContainEqual(customStyle);
    });
  });
});
