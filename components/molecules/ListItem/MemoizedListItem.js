/**
 * MemoizedListItem - Performance-optimized list item component
 * 
 * Uses React.memo with custom comparison to prevent unnecessary re-renders
 * Ideal for use in large lists with OptimizedFlatList
 */

import React, { memo, useCallback } from 'react';
import ListItem from './ListItem';

/**
 * Custom comparison function for React.memo
 * Only re-renders if relevant props have changed
 */
const arePropsEqual = (prevProps, nextProps) => {
  // Compare primitive props
  if (
    prevProps.title !== nextProps.title ||
    prevProps.subtitle !== nextProps.subtitle ||
    prevProps.rightText !== nextProps.rightText ||
    prevProps.disabled !== nextProps.disabled ||
    prevProps.divider !== nextProps.divider
  ) {
    return false;
  }

  // Compare icon props (shallow comparison)
  if (prevProps.leftIcon !== nextProps.leftIcon) {
    return false;
  }
  if (prevProps.rightIcon !== nextProps.rightIcon) {
    return false;
  }

  // Compare onPress function reference
  // Note: For best performance, wrap onPress in useCallback in parent component
  if (prevProps.onPress !== nextProps.onPress) {
    return false;
  }

  // Compare style objects (shallow comparison)
  if (prevProps.style !== nextProps.style) {
    return false;
  }

  // If all checks pass, props are equal - skip re-render
  return true;
};

/**
 * Memoized ListItem component
 */
const MemoizedListItem = memo(ListItem, arePropsEqual);

MemoizedListItem.displayName = 'MemoizedListItem';

export default MemoizedListItem;
