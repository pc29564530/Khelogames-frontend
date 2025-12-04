import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, View, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { Text } from '../../atoms';

/**
 * OptimizedFlatList - A performance-optimized FlatList component
 * 
 * Features:
 * - Optimized rendering with proper configuration
 * - Pull-to-refresh functionality
 * - Pagination support with loading indicators
 * - Fixed-height item optimization via getItemLayout
 * - Configurable window size and render batch size
 * 
 * @component
 */
const OptimizedFlatList = ({
  data,
  renderItem,
  keyExtractor,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  loading = false,
  itemHeight,
  estimatedItemSize,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  windowSize = 10,
  maxToRenderPerBatch = 10,
  updateCellsBatchingPeriod = 50,
  removeClippedSubviews = true,
  initialNumToRender = 10,
  contentContainerStyle,
  style,
  testID,
  ...otherProps
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /**
   * Optimized getItemLayout for fixed-height items
   * Significantly improves scrolling performance by allowing FlatList
   * to skip measurement of items
   */
  const getItemLayout = useCallback(
    (data, index) => {
      if (!itemHeight) return undefined;
      
      return {
        length: itemHeight,
        offset: itemHeight * index,
        index,
      };
    },
    [itemHeight]
  );

  /**
   * Handle end reached with loading state management
   */
  const handleEndReached = useCallback(() => {
    if (onEndReached && !isLoadingMore && !loading) {
      setIsLoadingMore(true);
      Promise.resolve(onEndReached()).finally(() => {
        setIsLoadingMore(false);
      });
    }
  }, [onEndReached, isLoadingMore, loading]);

  /**
   * Render footer with loading indicator for pagination
   */
  const renderFooter = useCallback(() => {
    if (ListFooterComponent) {
      return ListFooterComponent;
    }

    if (isLoadingMore) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#FF6B35" />
        </View>
      );
    }

    return null;
  }, [isLoadingMore, ListFooterComponent]);

  /**
   * Pull-to-refresh control
   */
  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#FF6B35"
      colors={['#FF6B35']}
    />
  ) : undefined;

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      // Performance optimizations
      getItemLayout={itemHeight ? getItemLayout : undefined}
      windowSize={windowSize}
      maxToRenderPerBatch={maxToRenderPerBatch}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
      removeClippedSubviews={removeClippedSubviews}
      initialNumToRender={initialNumToRender}
      // Pagination
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={renderFooter}
      // Pull to refresh
      refreshControl={refreshControl}
      // Components
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      // Styling
      contentContainerStyle={contentContainerStyle}
      style={style}
      // Testing
      testID={testID}
      // Other props
      {...otherProps}
    />
  );
};

OptimizedFlatList.propTypes = {
  /** Array of data to render */
  data: PropTypes.array.isRequired,
  /** Function to render each item */
  renderItem: PropTypes.func.isRequired,
  /** Function to extract unique key for each item */
  keyExtractor: PropTypes.func.isRequired,
  /** Callback when user pulls to refresh */
  onRefresh: PropTypes.func,
  /** Callback when user scrolls near end of list */
  onEndReached: PropTypes.func,
  /** Threshold for triggering onEndReached (0-1) */
  onEndReachedThreshold: PropTypes.number,
  /** Whether refresh is in progress */
  refreshing: PropTypes.bool,
  /** Whether initial load is in progress */
  loading: PropTypes.bool,
  /** Fixed height of each item (enables getItemLayout optimization) */
  itemHeight: PropTypes.number,
  /** Estimated item size for better scroll performance */
  estimatedItemSize: PropTypes.number,
  /** Component to show when list is empty */
  ListEmptyComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  /** Component to show at top of list */
  ListHeaderComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  /** Component to show at bottom of list */
  ListFooterComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  /** Number of items outside viewport to keep rendered */
  windowSize: PropTypes.number,
  /** Maximum items to render per batch */
  maxToRenderPerBatch: PropTypes.number,
  /** Delay between render batches (ms) */
  updateCellsBatchingPeriod: PropTypes.number,
  /** Remove views outside viewport from native view hierarchy */
  removeClippedSubviews: PropTypes.bool,
  /** Number of items to render initially */
  initialNumToRender: PropTypes.number,
  /** Style for content container */
  contentContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Style for FlatList */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Test ID for testing */
  testID: PropTypes.string,
};

export default OptimizedFlatList;
