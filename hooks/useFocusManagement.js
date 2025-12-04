/**
 * useFocusManagement hook
 * Provides utilities for managing focus state and keyboard navigation
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';

/**
 * Hook for managing focus state of an element
 * @returns {Object} - { isFocused, onFocus, onBlur, focusRef }
 */
export const useFocusState = () => {
  const [isFocused, setIsFocused] = useState(false);
  const focusRef = useRef(null);

  const onFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const setFocus = useCallback(() => {
    if (focusRef.current) {
      const reactTag = findNodeHandle(focusRef.current);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }
  }, []);

  return {
    isFocused,
    onFocus,
    onBlur,
    focusRef,
    setFocus,
  };
};

/**
 * Hook for managing focus trap in modals
 * Ensures focus stays within the modal when open
 * @param {boolean} isOpen - Whether the modal is open
 * @returns {Object} - { trapRef, restoreFocus }
 */
export const useFocusTrap = (isOpen) => {
  const trapRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = findNodeHandle(document?.activeElement);

      // Set focus to the trap container
      if (trapRef.current) {
        const reactTag = findNodeHandle(trapRef.current);
        if (reactTag) {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
      }
    }

    return () => {
      // Cleanup handled by restoreFocus
    };
  }, [isOpen]);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      AccessibilityInfo.setAccessibilityFocus(previousFocusRef.current);
      previousFocusRef.current = null;
    }
  }, []);

  return {
    trapRef,
    restoreFocus,
  };
};

/**
 * Hook for managing focus order in a list of elements
 * @param {number} itemCount - Number of items in the list
 * @returns {Object} - Focus management utilities
 */
export const useFocusOrder = (itemCount) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemRefs = useRef([]);

  const setItemRef = useCallback((index, ref) => {
    itemRefs.current[index] = ref;
  }, []);

  const focusItem = useCallback((index) => {
    if (index >= 0 && index < itemCount && itemRefs.current[index]) {
      const reactTag = findNodeHandle(itemRefs.current[index]);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
        setFocusedIndex(index);
      }
    }
  }, [itemCount]);

  const focusNext = useCallback(() => {
    const nextIndex = Math.min(focusedIndex + 1, itemCount - 1);
    focusItem(nextIndex);
  }, [focusedIndex, itemCount, focusItem]);

  const focusPrevious = useCallback(() => {
    const prevIndex = Math.max(focusedIndex - 1, 0);
    focusItem(prevIndex);
  }, [focusedIndex, focusItem]);

  const focusFirst = useCallback(() => {
    focusItem(0);
  }, [focusItem]);

  const focusLast = useCallback(() => {
    focusItem(itemCount - 1);
  }, [itemCount, focusItem]);

  return {
    focusedIndex,
    setItemRef,
    focusItem,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
  };
};

/**
 * Hook for announcing messages to screen readers
 * @returns {Function} - announce function
 */
export const useScreenReaderAnnouncement = () => {
  const announce = useCallback((message, options = {}) => {
    const { delay = 0 } = options;

    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(message);
    }, delay);
  }, []);

  return announce;
};

/**
 * Hook for checking if screen reader is enabled
 * @returns {boolean} - Whether screen reader is enabled
 */
export const useScreenReaderEnabled = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkScreenReader = async () => {
      try {
        const enabled = await AccessibilityInfo.isScreenReaderEnabled();
        if (mounted) {
          setIsEnabled(enabled);
        }
      } catch (error) {
        console.error('Error checking screen reader status:', error);
      }
    };

    checkScreenReader();

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        if (mounted) {
          setIsEnabled(enabled);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return isEnabled;
};

/**
 * Hook for managing keyboard navigation
 * @param {Object} config - Configuration object
 * @returns {Object} - Keyboard navigation handlers
 */
export const useKeyboardNavigation = (config = {}) => {
  const {
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
  } = config;

  const handleKeyPress = useCallback((event) => {
    const { key } = event.nativeEvent;

    switch (key) {
      case 'Enter':
        onEnter?.();
        break;
      case 'Escape':
        onEscape?.();
        break;
      case 'ArrowUp':
        onArrowUp?.();
        break;
      case 'ArrowDown':
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        onArrowRight?.();
        break;
      case 'Tab':
        onTab?.();
        break;
      default:
        break;
    }
  }, [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab]);

  return {
    onKeyPress: handleKeyPress,
  };
};

export default {
  useFocusState,
  useFocusTrap,
  useFocusOrder,
  useScreenReaderAnnouncement,
  useScreenReaderEnabled,
  useKeyboardNavigation,
};
