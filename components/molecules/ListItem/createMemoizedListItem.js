/**
 * createMemoizedListItem - Factory for creating memoized list item components
 * 
 * Creates a memoized version of any list item component with custom comparison logic
 * Useful for creating domain-specific list items (MatchListItem, TournamentListItem, etc.)
 */

import React, { memo } from 'react';

/**
 * Default comparison function
 * Compares all props shallowly
 */
const defaultArePropsEqual = (prevProps, nextProps) => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
};

/**
 * Create a memoized list item component
 * 
 * @param {React.Component} Component - Component to memoize
 * @param {function} arePropsEqual - Custom comparison function (optional)
 * @param {string} displayName - Display name for debugging (optional)
 * @returns {React.Component} Memoized component
 * 
 * @example
 * const MemoizedMatchCard = createMemoizedListItem(
 *   MatchCard,
 *   (prev, next) => prev.match.id === next.match.id && prev.match.score === next.match.score,
 *   'MemoizedMatchCard'
 * );
 */
export const createMemoizedListItem = (
  Component,
  arePropsEqual = defaultArePropsEqual,
  displayName
) => {
  const MemoizedComponent = memo(Component, arePropsEqual);
  
  if (displayName) {
    MemoizedComponent.displayName = displayName;
  } else if (Component.displayName || Component.name) {
    MemoizedComponent.displayName = `Memoized(${Component.displayName || Component.name})`;
  }

  return MemoizedComponent;
};

/**
 * Create comparison function for item with ID
 * Useful for list items that represent data entities
 * 
 * @param {string} itemKey - Key of the item prop (default: 'item')
 * @param {string} idKey - Key of the ID field (default: 'id')
 * @param {array} additionalKeys - Additional keys to compare
 * @returns {function} Comparison function
 * 
 * @example
 * const compareMatchItem = createItemComparison('match', 'id', ['score', 'status']);
 * const MemoizedMatchCard = createMemoizedListItem(MatchCard, compareMatchItem);
 */
export const createItemComparison = (
  itemKey = 'item',
  idKey = 'id',
  additionalKeys = []
) => {
  return (prevProps, nextProps) => {
    const prevItem = prevProps[itemKey];
    const nextItem = nextProps[itemKey];

    // If items are the same reference, no need to re-render
    if (prevItem === nextItem) {
      return true;
    }

    // If one is null/undefined and the other isn't, re-render
    if (!prevItem || !nextItem) {
      return false;
    }

    // Compare IDs
    if (prevItem[idKey] !== nextItem[idKey]) {
      return false;
    }

    // Compare additional keys
    for (const key of additionalKeys) {
      if (prevItem[key] !== nextItem[key]) {
        return false;
      }
    }

    // Compare other props (excluding the item)
    const prevKeys = Object.keys(prevProps).filter(k => k !== itemKey);
    const nextKeys = Object.keys(nextProps).filter(k => k !== itemKey);

    if (prevKeys.length !== nextKeys.length) {
      return false;
    }

    for (const key of prevKeys) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }

    return true;
  };
};

/**
 * Create comparison function for simple props
 * Compares only specified prop keys
 * 
 * @param {array} keys - Keys to compare
 * @returns {function} Comparison function
 * 
 * @example
 * const compareProps = createPropsComparison(['title', 'subtitle', 'onPress']);
 * const MemoizedItem = createMemoizedListItem(Item, compareProps);
 */
export const createPropsComparison = (keys) => {
  return (prevProps, nextProps) => {
    for (const key of keys) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    return true;
  };
};

export default createMemoizedListItem;
