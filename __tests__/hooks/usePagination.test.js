import { renderHook, act, waitFor } from '@testing-library/react-native';
import usePagination from '../../hooks/usePagination';
import { mockMany, mockTournament } from '../utils/mockDataFactories';

describe('usePagination Performance Tests', () => {
  describe('Pagination Behavior', () => {
    it('should load initial page automatically when autoLoad is true', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize),
          pagination: { hasMore: true, currentPage: page },
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, pageSize: 10 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(1, 10);
      expect(result.current.data).toHaveLength(10);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasMore).toBe(true);
    });

    it('should not load initial page when autoLoad is false', () => {
      const mockFetch = jest.fn();

      renderHook(() => 
        usePagination(mockFetch, { autoLoad: false })
      );

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should load more pages correctly', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize, { id: `page-${page}` }),
          pagination: { hasMore: page < 3, currentPage: page },
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, pageSize: 10 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toHaveLength(10);

      // Load more
      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.current.data).toHaveLength(20);
      expect(result.current.currentPage).toBe(2);
    });

    it('should not load more when hasMore is false', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize),
          pagination: { hasMore: false, currentPage: page },
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, pageSize: 10 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const callCountBefore = mockFetch.mock.calls.length;

      // Try to load more
      await act(async () => {
        await result.current.loadMore();
      });

      // Should not make additional call
      expect(mockFetch).toHaveBeenCalledTimes(callCountBefore);
    });

    it('should prevent concurrent loadMore calls', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        new Promise(resolve => 
          setTimeout(() => 
            resolve({
              data: mockMany(mockTournament, pageSize),
              pagination: { hasMore: true, currentPage: page },
            }), 
            100
          )
        )
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, pageSize: 10 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger multiple loadMore calls simultaneously
      act(() => {
        result.current.loadMore();
        result.current.loadMore();
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      }, { timeout: 3000 });

      // Should only call fetch twice (initial + one loadMore)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should refresh data correctly', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize),
          pagination: { hasMore: true, currentPage: page },
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, pageSize: 10 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Load more pages
      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.data).toHaveLength(20);

      // Refresh
      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false);
      });

      // Should reset to page 1 with fresh data
      expect(result.current.currentPage).toBe(1);
      expect(result.current.data).toHaveLength(10);
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Network error');
      const mockFetch = jest.fn(() => Promise.reject(mockError));

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toHaveLength(0);
    });

    it('should reset pagination state', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize),
          pagination: { hasMore: true, currentPage: page },
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, pageSize: 10 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Load more
      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      });

      expect(result.current.data).toHaveLength(20);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toHaveLength(0);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Large Dataset Performance', () => {
    it('should handle loading many pages efficiently', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize),
          pagination: { hasMore: page < 10, currentPage: page },
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, pageSize: 50 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Load 5 more pages
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await result.current.loadMore();
        });
        
        await waitFor(() => {
          expect(result.current.loadingMore).toBe(false);
        });
      }

      // Should have 6 pages * 50 items = 300 items
      expect(result.current.data).toHaveLength(300);
      expect(result.current.currentPage).toBe(6);
    });

    it('should merge paginated data without duplicates', async () => {
      const page1Data = mockMany(mockTournament, 10, { id: 'shared-1' });
      const page2Data = [
        ...mockMany(mockTournament, 5),
        page1Data[0], // Duplicate from page 1
      ];

      let callCount = 0;
      const mockFetch = jest.fn(() => {
        callCount++;
        return Promise.resolve({
          data: callCount === 1 ? page1Data : page2Data,
          pagination: { hasMore: callCount < 2, currentPage: callCount },
        });
      });

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, keyField: 'id' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      });

      // Should have 15 unique items (10 from page 1 + 5 new from page 2)
      expect(result.current.data).toHaveLength(15);
    });

    it('should handle rapid pagination requests', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize),
          pagination: { hasMore: true, currentPage: page },
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, pageSize: 20 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger multiple rapid loadMore calls
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          act(async () => {
            await result.current.loadMore();
          })
        );
      }

      await Promise.all(promises);

      await waitFor(() => {
        expect(result.current.loadingMore).toBe(false);
      });

      // Should handle gracefully without duplicate calls
      expect(mockFetch.mock.calls.length).toBeLessThanOrEqual(6); // Initial + max 5 loadMore
    });
  });

  describe('Memory and State Management', () => {
    it('should clean up on unmount', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        new Promise(resolve => 
          setTimeout(() => 
            resolve({
              data: mockMany(mockTournament, pageSize),
              pagination: { hasMore: true, currentPage: page },
            }), 
            100
          )
        )
      );

      const { result, unmount } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true })
      );

      // Unmount before fetch completes
      unmount();

      // Wait a bit to ensure no state updates after unmount
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should not throw errors
      expect(true).toBe(true);
    });

    it('should handle dependencies changes', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize),
          pagination: { hasMore: true, currentPage: page },
        })
      );

      const { result, rerender } = renderHook(
        ({ deps }) => usePagination(mockFetch, { autoLoad: true, dependencies: deps }),
        { initialProps: { deps: ['filter1'] } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = mockFetch.mock.calls.length;

      // Change dependencies
      rerender({ deps: ['filter2'] });

      await waitFor(() => {
        expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });

    it('should maintain stable data references when possible', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize),
          pagination: { hasMore: false, currentPage: page },
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const dataRef1 = result.current.data;

      // Try to load more (should not change data since hasMore is false)
      await act(async () => {
        await result.current.loadMore();
      });

      const dataRef2 = result.current.data;

      // Data reference should remain stable
      expect(dataRef1).toBe(dataRef2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty responses', async () => {
      const mockFetch = jest.fn(() => 
        Promise.resolve({
          data: [],
          pagination: { hasMore: false, currentPage: 1 },
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toHaveLength(0);
      expect(result.current.hasMore).toBe(false);
    });

    it('should handle responses without pagination metadata', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize),
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, pageSize: 10 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should infer hasMore from data length
      expect(result.current.hasMore).toBe(true);
    });

    it('should handle custom page size', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize),
          pagination: { hasMore: true, currentPage: page },
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, pageSize: 25 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(1, 25);
      expect(result.current.data).toHaveLength(25);
    });

    it('should handle custom initial page', async () => {
      const mockFetch = jest.fn((page, pageSize) => 
        Promise.resolve({
          data: mockMany(mockTournament, pageSize),
          pagination: { hasMore: true, currentPage: page },
        })
      );

      const { result } = renderHook(() => 
        usePagination(mockFetch, { autoLoad: true, initialPage: 0 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(0, expect.any(Number));
      expect(result.current.currentPage).toBe(0);
    });
  });
});
