import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import PropTypes from 'prop-types';
import { useTheme } from '../../../hooks/useTheme';

/**
 * OptimizedImage component using react-native-fast-image for better performance
 * Supports progressive loading, caching strategies, and error handling
 * 
 * @component
 * @example
 * <OptimizedImage
 *   source={{ uri: 'https://example.com/image.jpg' }}
 *   placeholder={require('./placeholder.png')}
 *   cachePolicy="memory-disk"
 *   priority="high"
 * />
 */
const OptimizedImage = ({
  source,
  placeholder,
  cachePolicy = 'memory-disk',
  resizeMode = 'cover',
  priority = 'normal',
  style,
  onLoad,
  onError,
  accessibilityLabel,
  testID,
  showLoadingIndicator = true,
  fallbackSource,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSource, setImageSource] = useState(source);

  // Map cache policy to FastImage priority
  const getCachePriority = () => {
    const priorityMap = {
      low: FastImage.priority.low,
      normal: FastImage.priority.normal,
      high: FastImage.priority.high,
    };
    return priorityMap[priority] || FastImage.priority.normal;
  };

  // Map cache policy to FastImage cache control
  const getCacheControl = () => {
    const cacheMap = {
      'memory': FastImage.cacheControl.web,
      'disk': FastImage.cacheControl.immutable,
      'memory-disk': FastImage.cacheControl.cacheOnly,
    };
    return cacheMap[cachePolicy] || FastImage.cacheControl.immutable;
  };

  // Map resize mode to FastImage resize mode
  const getResizeMode = () => {
    const resizeModeMap = {
      cover: FastImage.resizeMode.cover,
      contain: FastImage.resizeMode.contain,
      stretch: FastImage.resizeMode.stretch,
      center: FastImage.resizeMode.center,
    };
    return resizeModeMap[resizeMode] || FastImage.resizeMode.cover;
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
    if (onLoad) {
      onLoad();
    }
  };

  const handleError = (errorEvent) => {
    setLoading(false);
    setError(true);
    
    // Try fallback source if available
    if (fallbackSource && imageSource !== fallbackSource) {
      setImageSource(fallbackSource);
      setError(false);
      setLoading(true);
      return;
    }

    if (onError) {
      onError(new Error('Failed to load image'));
    }
  };

  const handleLoadStart = () => {
    setLoading(true);
  };

  // If error and no fallback, show placeholder or nothing
  if (error) {
    if (placeholder) {
      return (
        <FastImage
          source={placeholder}
          style={[styles.image, style]}
          resizeMode={getResizeMode()}
          accessible={true}
          accessibilityLabel={accessibilityLabel || 'Image placeholder'}
          testID={testID}
        />
      );
    }
    return (
      <View 
        style={[styles.errorContainer, style, { backgroundColor: theme.colors.surface }]}
        accessible={true}
        accessibilityLabel="Image failed to load"
        testID={testID}
      />
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Show placeholder while loading if provided */}
      {loading && placeholder && (
        <FastImage
          source={placeholder}
          style={[styles.image, styles.placeholder]}
          resizeMode={getResizeMode()}
        />
      )}

      {/* Show loading indicator if no placeholder */}
      {loading && !placeholder && showLoadingIndicator && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={theme.colors.primary}
          />
        </View>
      )}

      {/* Main image */}
      <FastImage
        source={imageSource}
        style={[styles.image, loading && styles.hidden]}
        resizeMode={getResizeMode()}
        priority={getCachePriority()}
        cache={getCacheControl()}
        onLoad={handleLoad}
        onError={handleError}
        onLoadStart={handleLoadStart}
        accessible={true}
        accessibilityLabel={accessibilityLabel || 'Image'}
        testID={testID}
      />
    </View>
  );
};

OptimizedImage.propTypes = {
  /** Image source - can be URI object or require() */
  source: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string,
      headers: PropTypes.object,
      priority: PropTypes.string,
      cache: PropTypes.string,
    }),
    PropTypes.number, // for require()
  ]).isRequired,
  
  /** Low-quality placeholder shown while loading */
  placeholder: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string,
    }),
    PropTypes.number,
  ]),
  
  /** Fallback source if main source fails */
  fallbackSource: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string,
    }),
    PropTypes.number,
  ]),
  
  /** Cache policy: 'memory', 'disk', or 'memory-disk' */
  cachePolicy: PropTypes.oneOf(['memory', 'disk', 'memory-disk']),
  
  /** How to resize the image */
  resizeMode: PropTypes.oneOf(['cover', 'contain', 'stretch', 'center']),
  
  /** Loading priority: 'low', 'normal', or 'high' */
  priority: PropTypes.oneOf(['low', 'normal', 'high']),
  
  /** Custom styles */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  
  /** Callback when image loads successfully */
  onLoad: PropTypes.func,
  
  /** Callback when image fails to load */
  onError: PropTypes.func,
  
  /** Accessibility label */
  accessibilityLabel: PropTypes.string,
  
  /** Test ID for testing */
  testID: PropTypes.string,
  
  /** Show loading indicator when no placeholder */
  showLoadingIndicator: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hidden: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OptimizedImage;
