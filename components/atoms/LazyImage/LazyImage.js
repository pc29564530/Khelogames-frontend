import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import OptimizedImage from '../OptimizedImage';

/**
 * LazyImage component that loads images only when they're about to enter the viewport
 * Implements intersection observer pattern for React Native
 * Supports priority loading for above-the-fold images
 * 
 * @component
 * @example
 * <LazyImage
 *   source={{ uri: 'https://example.com/image.jpg' }}
 *   placeholder={require('./placeholder.png')}
 *   priority="high"
 *   threshold={0.5}
 * />
 */
const LazyImage = ({
  source,
  placeholder,
  priority = 'normal',
  threshold = 0.1,
  rootMargin = 100,
  eager = false,
  onVisible,
  style,
  ...otherProps
}) => {
  const [isVisible, setIsVisible] = useState(eager || priority === 'high');
  const [shouldLoad, setShouldLoad] = useState(eager || priority === 'high');
  const viewRef = useRef(null);
  const measureIntervalRef = useRef(null);

  useEffect(() => {
    // If eager loading or high priority, load immediately
    if (eager || priority === 'high') {
      setShouldLoad(true);
      return;
    }

    // Start measuring visibility
    startVisibilityCheck();

    return () => {
      if (measureIntervalRef.current) {
        clearInterval(measureIntervalRef.current);
      }
    };
  }, [eager, priority]);

  /**
   * Start checking if component is visible in viewport
   */
  const startVisibilityCheck = () => {
    // Check visibility every 500ms
    measureIntervalRef.current = setInterval(() => {
      checkVisibility();
    }, 500);
  };

  /**
   * Check if component is visible in viewport
   */
  const checkVisibility = () => {
    if (!viewRef.current) return;

    viewRef.current.measure((x, y, width, height, pageX, pageY) => {
      const windowHeight = Dimensions.get('window').height;
      const windowWidth = Dimensions.get('window').width;

      // Calculate if element is in viewport with root margin
      const isInViewport =
        pageY + height + rootMargin >= 0 &&
        pageY - rootMargin <= windowHeight &&
        pageX + width + rootMargin >= 0 &&
        pageX - rootMargin <= windowWidth;

      if (isInViewport && !isVisible) {
        setIsVisible(true);
        setShouldLoad(true);
        
        // Stop checking once visible
        if (measureIntervalRef.current) {
          clearInterval(measureIntervalRef.current);
        }

        if (onVisible) {
          onVisible();
        }
      }
    });
  };

  /**
   * Handle layout to trigger initial visibility check
   */
  const handleLayout = () => {
    if (!isVisible) {
      checkVisibility();
    }
  };

  return (
    <View
      ref={viewRef}
      style={[styles.container, style]}
      onLayout={handleLayout}
    >
      {shouldLoad ? (
        <OptimizedImage
          source={source}
          placeholder={placeholder}
          priority={priority}
          style={styles.image}
          {...otherProps}
        />
      ) : (
        // Show placeholder while waiting to load
        placeholder && (
          <OptimizedImage
            source={placeholder}
            style={styles.image}
            {...otherProps}
          />
        )
      )}
    </View>
  );
};

LazyImage.propTypes = {
  /** Image source - can be URI object or require() */
  source: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string,
    }),
    PropTypes.number,
  ]).isRequired,

  /** Low-quality placeholder shown while loading */
  placeholder: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string,
    }),
    PropTypes.number,
  ]),

  /** Loading priority: 'low', 'normal', or 'high' */
  priority: PropTypes.oneOf(['low', 'normal', 'high']),

  /** Threshold for visibility (0-1, percentage of element visible) */
  threshold: PropTypes.number,

  /** Root margin in pixels (how far before viewport to start loading) */
  rootMargin: PropTypes.number,

  /** Load immediately without lazy loading */
  eager: PropTypes.bool,

  /** Callback when image becomes visible */
  onVisible: PropTypes.func,

  /** Custom styles */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default LazyImage;
