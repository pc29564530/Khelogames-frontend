import { useState, useCallback, useRef, useEffect } from 'react';
import { mergePaginatedData, DEFAULT_PAGE_SIZE, DEFAULT_INITIAL_PAGE } from '../services/paginationService';

/**
 * usePagination Hook
 * 
 * Manages pagination state and provides methods for loading data
 * Supports both traditional pagination and infinite scroll
 * 
 * @param {function} fetchFunction - Function to fetch paginated data
 * @param {object} options - Configuration options
 * @returns {object} Pagination state and methods
 */
const usePagination = (fetchFunction, options = {}) => {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    initialPage = DEFAULT_INITIAL_PAGE,
    keyField = 'id',
    autoLoad = true,
    dependencies = [],
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const isMountedRef = useRef(true);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Load data for a specific page
   */
  const loadPage = useCallback(
    async (page, append = false) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      const isFirstPage = page === initialPage;
      
      if (isFirstPage && !append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);

      try {
        const response = await fetchFunction(page, pageSize);
        
        if (!isMountedRef.current) return;

        const newData = response.data || [];
        const pagination = response.pagination || {};

        if (append) {
          setData(prevData => mergePaginatedData(prevData, newData, keyField));
        } else {
          setData(newData);
        }

        setCurrentPage(page);
        setHasMore(pagination.hasMore ?? (newData.length === pageSize));
      } catch (err) {
        if (!isMountedRef.current) return;
        
        console.error('Failed to load page:', err);
        setError(err);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setLoadingMore(false);
          isLoadingRef.current = false;
        }
      }
    },
    [fetchFunction, pageSize, initialPage, keyField]
  );

  /**
   * Load next page (for infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingRef.current) return;
    
    const nextPage = currentPage + 1;
    await loadPage(nextPage, true);
  }, [currentPage, hasMore, loadPage]);

  /**
   * Refresh data (reload first page)
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(initialPage);
    setHasMore(true);
    
    try {
      await loadPage(initialPage, false);
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [initialPage, loadPage]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setData([]);
    setCurrentPage(initialPage);
    setHasMore(true);
    setError(null);
    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  }, [initialPage]);

  /**
   * Load initial data
   */
  useEffect(() => {
    if (autoLoad) {
      loadPage(initialPage, false);
    }
  }, [autoLoad, ...dependencies]);

  return {
    // Data
    data,
    
    // Loading states
    loading,
    refreshing,
    loadingMore,
    
    // Pagination state
    currentPage,
    hasMore,
    error,
    
    // Methods
    loadMore,
    refresh,
    reset,
    loadPage,
  };
};

export default usePagination;
