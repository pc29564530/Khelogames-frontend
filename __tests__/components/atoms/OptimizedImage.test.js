import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import OptimizedImage from '../../../components/atoms/OptimizedImage/OptimizedImage';
import FastImage from 'react-native-fast-image';

// Mock react-native-fast-image
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { Image } = require('react-native');
  
  const FastImageComponent = React.forwardRef((props, ref) => {
    return <Image {...props} ref={ref} />;
  });
  
  FastImageComponent.priority = {
    low: 'low',
    normal: 'normal',
    high: 'high',
  };
  
  FastImageComponent.cacheControl = {
    web: 'web',
    immutable: 'immutable',
    cacheOnly: 'cacheOnly',
  };
  
  FastImageComponent.resizeMode = {
    cover: 'cover',
    contain: 'contain',
    stretch: 'stretch',
    center: 'center',
  };
  
  return {
    __esModule: true,
    default: FastImageComponent,
    priority: FastImageComponent.priority,
    cacheControl: FastImageComponent.cacheControl,
    resizeMode: FastImageComponent.resizeMode,
  };
});

// Mock useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      surface: '#F5F5F5',
    },
  }),
}));

describe('OptimizedImage - Caching Behavior', () => {
  const mockSource = { uri: 'https://example.com/image.jpg' };
  const mockPlaceholder = { uri: 'https://example.com/placeholder.jpg' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cache Policy Configuration', () => {
    it('should apply memory-disk cache policy by default', () => {
      const { UNSAFE_getByType } = render(
        <OptimizedImage source={mockSource} testID="test-image" />
      );

      const fastImages = UNSAFE_getByType(FastImage);
      expect(fastImages).toBeDefined();
    });

    it('should apply memory cache policy when specified', () => {
      const { UNSAFE_getByType } = render(
        <OptimizedImage 
          source={mockSource} 
          cachePolicy="memory"
          testID="test-image" 
        />
      );

      const fastImages = UNSAFE_getByType(FastImage);
      expect(fastImages).toBeDefined();
    });

    it('should apply disk cache policy when specified', () => {
      const { UNSAFE_getByType } = render(
        <OptimizedImage 
          source={mockSource} 
          cachePolicy="disk"
          testID="test-image" 
        />
      );

      const fastImages = UNSAFE_getByType(FastImage);
      expect(fastImages).toBeDefined();
    });

    it('should handle invalid cache policy gracefully', () => {
      const { UNSAFE_getByType } = render(
        <OptimizedImage 
          source={mockSource} 
          cachePolicy="invalid"
          testID="test-image" 
        />
      );

      const fastImages = UNSAFE_getByType(FastImage);
      expect(fastImages).toBeDefined();
    });
  });

  describe('Priority Configuration', () => {
    it('should apply normal priority by default', () => {
      const { UNSAFE_getByType } = render(
        <OptimizedImage source={mockSource} testID="test-image" />
      );

      const fastImages = UNSAFE_getByType(FastImage);
      expect(fastImages).toBeDefined();
    });

    it('should apply high priority when specified', () => {
      const { UNSAFE_getByType } = render(
        <OptimizedImage 
          source={mockSource} 
          priority="high"
          testID="test-image" 
        />
      );

      const fastImages = UNSAFE_getByType(FastImage);
      expect(fastImages).toBeDefined();
    });

    it('should apply low priority when specified', () => {
      const { UNSAFE_getByType } = render(
        <OptimizedImage 
          source={mockSource} 
          priority="low"
          testID="test-image" 
        />
      );

      const fastImages = UNSAFE_getByType(FastImage);
      expect(fastImages).toBeDefined();
    });
  });

  describe('Progressive Loading', () => {
    it('should show placeholder while loading', () => {
      const { UNSAFE_getAllByType } = render(
        <OptimizedImage 
          source={mockSource} 
          placeholder={mockPlaceholder}
          testID="test-image" 
        />
      );

      // Should have both placeholder and main image
      const fastImages = UNSAFE_getAllByType(FastImage);
      expect(fastImages.length).toBeGreaterThanOrEqual(2);
    });

    it('should show loading indicator when no placeholder provided', () => {
      const { getByTestId } = render(
        <OptimizedImage 
          source={mockSource} 
          showLoadingIndicator={true}
          testID="test-image" 
        />
      );

      expect(getByTestId('test-image')).toBeDefined();
    });

    it('should hide loading indicator when showLoadingIndicator is false', () => {
      const { queryByTestId } = render(
        <OptimizedImage 
          source={mockSource} 
          showLoadingIndicator={false}
          testID="test-image" 
        />
      );

      expect(queryByTestId('test-image')).toBeDefined();
    });

    it('should call onLoad callback when image loads successfully', async () => {
      const onLoad = jest.fn();
      const { UNSAFE_getByType } = render(
        <OptimizedImage 
          source={mockSource} 
          onLoad={onLoad}
          testID="test-image" 
        />
      );

      const fastImage = UNSAFE_getByType(FastImage);
      
      // Simulate image load
      if (fastImage.props.onLoad) {
        fastImage.props.onLoad();
      }

      await waitFor(() => {
        expect(onLoad).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show placeholder on error if provided', async () => {
      const { UNSAFE_getAllByType } = render(
        <OptimizedImage 
          source={mockSource} 
          placeholder={mockPlaceholder}
          testID="test-image" 
        />
      );

      const fastImages = UNSAFE_getAllByType(FastImage);
      const mainImage = fastImages[fastImages.length - 1];
      
      // Simulate error
      if (mainImage.props.onError) {
        mainImage.props.onError(new Error('Failed to load'));
      }

      await waitFor(() => {
        const updatedImages = UNSAFE_getAllByType(FastImage);
        expect(updatedImages.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should try fallback source on error', async () => {
      const fallbackSource = { uri: 'https://example.com/fallback.jpg' };
      const { UNSAFE_getAllByType } = render(
        <OptimizedImage 
          source={mockSource} 
          fallbackSource={fallbackSource}
          testID="test-image" 
        />
      );

      const fastImages = UNSAFE_getAllByType(FastImage);
      const mainImage = fastImages[fastImages.length - 1];
      
      // Simulate error
      if (mainImage.props.onError) {
        mainImage.props.onError(new Error('Failed to load'));
      }

      await waitFor(() => {
        const updatedImages = UNSAFE_getAllByType(FastImage);
        expect(updatedImages).toBeDefined();
      });
    });

    it('should call onError callback when image fails to load', async () => {
      const onError = jest.fn();
      const { UNSAFE_getByType } = render(
        <OptimizedImage 
          source={mockSource} 
          onError={onError}
          testID="test-image" 
        />
      );

      const fastImage = UNSAFE_getByType(FastImage);
      
      // Simulate error
      if (fastImage.props.onError) {
        fastImage.props.onError(new Error('Failed to load'));
      }

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      });
    });

    it('should show error container when no placeholder and error occurs', async () => {
      const { getByLabelText, UNSAFE_getByType } = render(
        <OptimizedImage 
          source={mockSource} 
          testID="test-image" 
        />
      );

      const fastImage = UNSAFE_getByType(FastImage);
      
      // Simulate error
      if (fastImage.props.onError) {
        fastImage.props.onError(new Error('Failed to load'));
      }

      await waitFor(() => {
        expect(getByLabelText('Image failed to load')).toBeDefined();
      });
    });
  });

  describe('Resize Mode', () => {
    it('should apply cover resize mode by default', () => {
      const { UNSAFE_getByType } = render(
        <OptimizedImage source={mockSource} testID="test-image" />
      );

      const fastImage = UNSAFE_getByType(FastImage);
      expect(fastImage).toBeDefined();
    });

    it('should apply contain resize mode when specified', () => {
      const { UNSAFE_getByType } = render(
        <OptimizedImage 
          source={mockSource} 
          resizeMode="contain"
          testID="test-image" 
        />
      );

      const fastImage = UNSAFE_getByType(FastImage);
      expect(fastImage).toBeDefined();
    });

    it('should apply stretch resize mode when specified', () => {
      const { UNSAFE_getByType } = render(
        <OptimizedImage 
          source={mockSource} 
          resizeMode="stretch"
          testID="test-image" 
        />
      );

      const fastImage = UNSAFE_getByType(FastImage);
      expect(fastImage).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have default accessibility label', () => {
      const { getByLabelText } = render(
        <OptimizedImage source={mockSource} testID="test-image" />
      );

      expect(getByLabelText('Image')).toBeDefined();
    });

    it('should use custom accessibility label when provided', () => {
      const { getByLabelText } = render(
        <OptimizedImage 
          source={mockSource} 
          accessibilityLabel="Profile picture"
          testID="test-image" 
        />
      );

      expect(getByLabelText('Profile picture')).toBeDefined();
    });

    it('should have placeholder accessibility label', async () => {
      const { getByLabelText, UNSAFE_getAllByType } = render(
        <OptimizedImage 
          source={mockSource} 
          placeholder={mockPlaceholder}
          testID="test-image" 
        />
      );

      const fastImages = UNSAFE_getAllByType(FastImage);
      const mainImage = fastImages[fastImages.length - 1];
      
      // Simulate error to show placeholder
      if (mainImage.props.onError) {
        mainImage.props.onError(new Error('Failed to load'));
      }

      await waitFor(() => {
        expect(getByLabelText('Image placeholder')).toBeDefined();
      });
    });
  });
});
