/**
 * Pagination Service
 * 
 * Provides utilities for implementing pagination and infinite scroll
 * across different API endpoints
 */

/**
 * Default pagination configuration
 */
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_INITIAL_PAGE = 1;

/**
 * Create pagination parameters for API requests
 * 
 * @param {number} page - Current page number (1-indexed)
 * @param {number} pageSize - Number of items per page
 * @returns {object} Pagination parameters
 */
export const createPaginationParams = (page = DEFAULT_INITIAL_PAGE, pageSize = DEFAULT_PAGE_SIZE) => {
  return {
    page,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
};

/**
 * Parse pagination metadata from API response
 * 
 * @param {object} response - API response object
 * @returns {object} Pagination metadata
 */
export const parsePaginationMeta = (response) => {
  const { data, total, page, limit, hasMore } = response;
  
  return {
    currentPage: page || DEFAULT_INITIAL_PAGE,
    pageSize: limit || DEFAULT_PAGE_SIZE,
    totalItems: total || data?.length || 0,
    hasMore: hasMore !== undefined ? hasMore : (data?.length === limit),
    totalPages: total && limit ? Math.ceil(total / limit) : null,
  };
};

/**
 * Paginated API request wrapper
 * 
 * @param {function} apiCall - API call function
 * @param {object} params - Request parameters
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @returns {Promise<object>} Response with data and pagination metadata
 */
export const paginatedRequest = async (apiCall, params = {}, page = DEFAULT_INITIAL_PAGE, pageSize = DEFAULT_PAGE_SIZE) => {
  try {
    const paginationParams = createPaginationParams(page, pageSize);
    const response = await apiCall({
      ...params,
      ...paginationParams,
    });

    // Handle different response formats
    const data = response.data || response;
    const items = Array.isArray(data) ? data : data.items || data.results || [];
    
    return {
      data: items,
      pagination: parsePaginationMeta({
        data: items,
        total: data.total || data.count,
        page,
        limit: pageSize,
        hasMore: data.hasMore,
      }),
    };
  } catch (error) {
    console.error('Pagination request failed:', error);
    throw error;
  }
};

/**
 * Infinite scroll state manager
 * 
 * Manages state for infinite scroll implementation
 */
export class InfiniteScrollManager {
  constructor(initialPageSize = DEFAULT_PAGE_SIZE) {
    this.currentPage = DEFAULT_INITIAL_PAGE;
    this.pageSize = initialPageSize;
    this.hasMore = true;
    this.isLoading = false;
    this.data = [];
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.currentPage = DEFAULT_INITIAL_PAGE;
    this.hasMore = true;
    this.isLoading = false;
    this.data = [];
  }

  /**
   * Load next page
   * 
   * @param {function} fetchFunction - Function to fetch data
   * @returns {Promise<array>} New items
   */
  async loadMore(fetchFunction) {
    if (!this.hasMore || this.isLoading) {
      return [];
    }

    this.isLoading = true;

    try {
      const response = await fetchFunction(this.currentPage, this.pageSize);
      const newItems = response.data || [];
      
      this.data = [...this.data, ...newItems];
      this.currentPage += 1;
      this.hasMore = response.pagination?.hasMore ?? (newItems.length === this.pageSize);
      
      return newItems;
    } catch (error) {
      console.error('Failed to load more items:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Refresh data (load first page)
   * 
   * @param {function} fetchFunction - Function to fetch data
   * @returns {Promise<array>} Fresh items
   */
  async refresh(fetchFunction) {
    this.reset();
    return this.loadMore(fetchFunction);
  }

  /**
   * Get current state
   */
  getState() {
    return {
      data: this.data,
      currentPage: this.currentPage,
      hasMore: this.hasMore,
      isLoading: this.isLoading,
    };
  }
}

/**
 * Create paginated version of an API service function
 * 
 * @param {function} serviceFunction - Original service function
 * @returns {function} Paginated service function
 */
export const withPagination = (serviceFunction) => {
  return async (params, page = DEFAULT_INITIAL_PAGE, pageSize = DEFAULT_PAGE_SIZE) => {
    return paginatedRequest(serviceFunction, params, page, pageSize);
  };
};

/**
 * Merge paginated results (for infinite scroll)
 * 
 * @param {array} existingData - Current data
 * @param {array} newData - New data to append
 * @param {string} keyField - Unique key field (default: 'id')
 * @returns {array} Merged data without duplicates
 */
export const mergePaginatedData = (existingData = [], newData = [], keyField = 'id') => {
  const existingKeys = new Set(existingData.map(item => item[keyField]));
  const uniqueNewData = newData.filter(item => !existingKeys.has(item[keyField]));
  return [...existingData, ...uniqueNewData];
};

/**
 * Calculate if should load more based on scroll position
 * 
 * @param {number} distanceFromEnd - Distance from end in pixels
 * @param {number} threshold - Threshold distance to trigger load
 * @returns {boolean} Whether to load more
 */
export const shouldLoadMore = (distanceFromEnd, threshold = 100) => {
  return distanceFromEnd < threshold;
};
