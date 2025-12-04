/**
 * usePerformanceTracking Hook Tests
 * Tests for performance tracking hooks
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  usePerformanceTracking,
  useApiPerformanceTracking,
  usePerformanceMetrics,
} from '../../hooks/usePerformanceTracking';
import performanceMonitor from '../../services/performanceMonitor';

// Mock the performance monitor
jest.mock('../../services/performanceMonitor', () => ({
  markScreenLoadStart: jest.fn(),
  markScreenInteractive: jest.fn(),
  getAverageScreenLoadTime: jest.fn(() => 500),
  markApiRequestStart: jest.fn(),
  markApiRequestEnd: jest.fn(),
  getAverageApiResponseTime: jest.fn(() => 200),
  getSlowEndpoints: jest.fn(() => []),
  getAllMetrics: jest.fn(() => ({
    screenLoadTime: {},
    apiResponseTime: {},
    memoryUsage: 100,
  })),
  getPerformanceSummary: jest.fn(() => ({
    totalScreensTracked: 5,
    totalEndpointsTracked: 10,
    slowScreens: [],
    slowEndpoints: [],
    currentMemoryUsage: 100,
  })),
  getMemoryUsage: jest.fn(() => 100),
  resetMetrics: jest.fn(),
}));

describe('usePerformanceTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should mark screen load start on mount', () => {
    renderHook(() => usePerformanceTracking('TestScreen'));

    expect(performanceMonitor.markScreenLoadStart).toHaveBeenCalledWith('TestScreen');
  });

  it('should mark screen interactive after render', async () => {
    renderHook(() => usePerformanceTracking('TestScreen'));

    // Fast-forward past the 100ms delay
    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(performanceMonitor.markScreenInteractive).toHaveBeenCalledWith('TestScreen');
    });
  });

  it('should not auto-track when autoTrack is false', () => {
    renderHook(() => usePerformanceTracking('TestScreen', { autoTrack: false }));

    expect(performanceMonitor.markScreenLoadStart).not.toHaveBeenCalled();
  });

  it('should not track interactive when trackInteractive is false', async () => {
    renderHook(() => usePerformanceTracking('TestScreen', { trackInteractive: false }));

    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(performanceMonitor.markScreenInteractive).not.toHaveBeenCalled();
    });
  });

  it('should provide markInteractive function', () => {
    const { result } = renderHook(() => usePerformanceTracking('TestScreen', { autoTrack: false }));

    act(() => {
      result.current.markInteractive();
    });

    expect(performanceMonitor.markScreenInteractive).toHaveBeenCalledWith('TestScreen');
  });

  it('should only mark interactive once', async () => {
    const { result } = renderHook(() => usePerformanceTracking('TestScreen'));

    // Wait for auto-mark
    act(() => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(performanceMonitor.markScreenInteractive).toHaveBeenCalledTimes(1);
    });

    // Try to mark again manually
    act(() => {
      result.current.markInteractive();
    });

    // Should still be called only once
    expect(performanceMonitor.markScreenInteractive).toHaveBeenCalledTimes(1);
  });

  it('should provide getAverageLoadTime function', () => {
    const { result } = renderHook(() => usePerformanceTracking('TestScreen'));

    const avgLoadTime = result.current.getAverageLoadTime();

    expect(performanceMonitor.getAverageScreenLoadTime).toHaveBeenCalledWith('TestScreen');
    expect(avgLoadTime).toBe(500);
  });

  it('should clean up on unmount', () => {
    const { unmount } = renderHook(() => usePerformanceTracking('TestScreen'));

    unmount();

    // Verify cleanup doesn't cause errors
    expect(performanceMonitor.markScreenLoadStart).toHaveBeenCalledTimes(1);
  });

  it('should handle screen name changes', () => {
    const { rerender } = renderHook(
      ({ screenName }) => usePerformanceTracking(screenName),
      { initialProps: { screenName: 'Screen1' } }
    );

    expect(performanceMonitor.markScreenLoadStart).toHaveBeenCalledWith('Screen1');

    rerender({ screenName: 'Screen2' });

    expect(performanceMonitor.markScreenLoadStart).toHaveBeenCalledWith('Screen2');
  });
});

describe('useApiPerformanceTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should track API request', () => {
    const { result } = renderHook(() => useApiPerformanceTracking());

    const tracker = result.current.trackRequest('/api/users');

    expect(performanceMonitor.markApiRequestStart).toHaveBeenCalledWith(
      '/api/users',
      expect.stringContaining('req_')
    );
    expect(tracker).toHaveProperty('requestId');
    expect(tracker).toHaveProperty('end');
  });

  it('should end API request tracking', () => {
    const { result } = renderHook(() => useApiPerformanceTracking());

    const tracker = result.current.trackRequest('/api/users');
    tracker.end(true);

    expect(performanceMonitor.markApiRequestEnd).toHaveBeenCalledWith(
      tracker.requestId,
      true
    );
  });

  it('should track failed API request', () => {
    const { result } = renderHook(() => useApiPerformanceTracking());

    const tracker = result.current.trackRequest('/api/error');
    tracker.end(false);

    expect(performanceMonitor.markApiRequestEnd).toHaveBeenCalledWith(
      tracker.requestId,
      false
    );
  });

  it('should generate unique request IDs', () => {
    const { result } = renderHook(() => useApiPerformanceTracking());

    const tracker1 = result.current.trackRequest('/api/users');
    const tracker2 = result.current.trackRequest('/api/users');

    expect(tracker1.requestId).not.toBe(tracker2.requestId);
  });

  it('should provide getAverageResponseTime function', () => {
    const { result } = renderHook(() => useApiPerformanceTracking());

    const avgTime = result.current.getAverageResponseTime('/api/users');

    expect(performanceMonitor.getAverageApiResponseTime).toHaveBeenCalledWith('/api/users');
    expect(avgTime).toBe(200);
  });

  it('should provide getSlowEndpoints function', () => {
    const { result } = renderHook(() => useApiPerformanceTracking());

    const slowEndpoints = result.current.getSlowEndpoints(2000);

    expect(performanceMonitor.getSlowEndpoints).toHaveBeenCalledWith(2000);
    expect(slowEndpoints).toEqual([]);
  });

  it('should use default threshold for getSlowEndpoints', () => {
    const { result } = renderHook(() => useApiPerformanceTracking());

    result.current.getSlowEndpoints();

    expect(performanceMonitor.getSlowEndpoints).toHaveBeenCalledWith(2000);
  });
});

describe('usePerformanceMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide getAllMetrics function', () => {
    const { result } = renderHook(() => usePerformanceMetrics());

    const metrics = result.current.getAllMetrics();

    expect(performanceMonitor.getAllMetrics).toHaveBeenCalled();
    expect(metrics).toHaveProperty('screenLoadTime');
    expect(metrics).toHaveProperty('apiResponseTime');
    expect(metrics).toHaveProperty('memoryUsage');
  });

  it('should provide getPerformanceSummary function', () => {
    const { result } = renderHook(() => usePerformanceMetrics());

    const summary = result.current.getPerformanceSummary();

    expect(performanceMonitor.getPerformanceSummary).toHaveBeenCalled();
    expect(summary).toHaveProperty('totalScreensTracked');
    expect(summary).toHaveProperty('totalEndpointsTracked');
    expect(summary).toHaveProperty('slowScreens');
    expect(summary).toHaveProperty('slowEndpoints');
  });

  it('should provide getMemoryUsage function', () => {
    const { result } = renderHook(() => usePerformanceMetrics());

    const memoryUsage = result.current.getMemoryUsage();

    expect(performanceMonitor.getMemoryUsage).toHaveBeenCalled();
    expect(memoryUsage).toBe(100);
  });

  it('should provide resetMetrics function', () => {
    const { result } = renderHook(() => usePerformanceMetrics());

    act(() => {
      result.current.resetMetrics();
    });

    expect(performanceMonitor.resetMetrics).toHaveBeenCalled();
  });

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => usePerformanceMetrics());

    const firstGetAllMetrics = result.current.getAllMetrics;
    const firstGetSummary = result.current.getPerformanceSummary;

    rerender();

    expect(result.current.getAllMetrics).toBe(firstGetAllMetrics);
    expect(result.current.getPerformanceSummary).toBe(firstGetSummary);
  });
});
