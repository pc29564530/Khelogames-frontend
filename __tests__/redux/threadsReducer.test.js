/**
 * Threads Reducer Tests
 * Tests threads state management including likes
 * Requirements: 5.1
 */

import threadsReducers from '../../redux/reducers/threadsReducers';
import * as actionTypes from '../../redux/types/actionTypes';

describe('Threads Reducer', () => {
  const initialState = {
    threads: [],
  };

  const mockThread = {
    id: 1,
    title: 'Test Thread',
    content: 'Test content',
    like_count: 10,
  };

  const mockThread2 = {
    id: 2,
    title: 'Test Thread 2',
    content: 'Test content 2',
    like_count: 5,
  };

  it('should return initial state', () => {
    const state = threadsReducers(undefined, {});
    expect(state).toEqual(initialState);
  });

  describe('SET_THREADS', () => {
    it('should set threads array', () => {
      const threads = [mockThread, mockThread2];
      const action = {
        type: actionTypes.SET_THREADS,
        payload: threads,
      };
      const state = threadsReducers(initialState, action);

      expect(state.threads).toEqual(threads);
      expect(state.threads).toHaveLength(2);
    });

    it('should replace existing threads', () => {
      const currentState = {
        threads: [mockThread],
      };
      const newThreads = [mockThread2];
      const action = {
        type: actionTypes.SET_THREADS,
        payload: newThreads,
      };
      const state = threadsReducers(currentState, action);

      expect(state.threads).toEqual(newThreads);
      expect(state.threads).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const currentState = {
        threads: [mockThread],
      };
      const action = {
        type: actionTypes.SET_THREADS,
        payload: [],
      };
      const state = threadsReducers(currentState, action);

      expect(state.threads).toEqual([]);
    });
  });

  describe('ADD_THREADS', () => {
    it('should add thread to empty array', () => {
      const action = {
        type: actionTypes.ADD_THREADS,
        payload: mockThread,
      };
      const state = threadsReducers(initialState, action);

      expect(state.threads).toHaveLength(1);
      expect(state.threads[0]).toEqual(mockThread);
    });

    it('should append thread to existing array', () => {
      const currentState = {
        threads: [mockThread],
      };
      const action = {
        type: actionTypes.ADD_THREADS,
        payload: mockThread2,
      };
      const state = threadsReducers(currentState, action);

      expect(state.threads).toHaveLength(2);
      expect(state.threads).toContainEqual(mockThread);
      expect(state.threads).toContainEqual(mockThread2);
    });
  });

  describe('SET_LIKES', () => {
    it('should update like count for specific thread', () => {
      const currentState = {
        threads: [mockThread, mockThread2],
      };
      const action = {
        type: actionTypes.SET_LIKES,
        payload: {
          threadId: 1,
          newLikesCount: 15,
        },
      };
      const state = threadsReducers(currentState, action);

      const updatedThread = state.threads.find(t => t.id === 1);
      expect(updatedThread.like_count).toBe(15);
    });

    it('should not affect other threads', () => {
      const currentState = {
        threads: [mockThread, mockThread2],
      };
      const action = {
        type: actionTypes.SET_LIKES,
        payload: {
          threadId: 1,
          newLikesCount: 15,
        },
      };
      const state = threadsReducers(currentState, action);

      const otherThread = state.threads.find(t => t.id === 2);
      expect(otherThread.like_count).toBe(5);
    });

    it('should handle non-existent thread id', () => {
      const currentState = {
        threads: [mockThread],
      };
      const action = {
        type: actionTypes.SET_LIKES,
        payload: {
          threadId: 999,
          newLikesCount: 20,
        },
      };
      const state = threadsReducers(currentState, action);

      expect(state.threads).toEqual(currentState.threads);
    });

    it('should handle zero likes', () => {
      const currentState = {
        threads: [mockThread],
      };
      const action = {
        type: actionTypes.SET_LIKES,
        payload: {
          threadId: 1,
          newLikesCount: 0,
        },
      };
      const state = threadsReducers(currentState, action);

      const updatedThread = state.threads.find(t => t.id === 1);
      expect(updatedThread.like_count).toBe(0);
    });

    it('should preserve other thread properties', () => {
      const currentState = {
        threads: [mockThread],
      };
      const action = {
        type: actionTypes.SET_LIKES,
        payload: {
          threadId: 1,
          newLikesCount: 15,
        },
      };
      const state = threadsReducers(currentState, action);

      const updatedThread = state.threads.find(t => t.id === 1);
      expect(updatedThread.title).toBe(mockThread.title);
      expect(updatedThread.content).toBe(mockThread.content);
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const originalState = { threads: [mockThread] };
      const action = {
        type: actionTypes.ADD_THREADS,
        payload: mockThread2,
      };
      
      threadsReducers(originalState, action);

      expect(originalState.threads).toHaveLength(1);
      expect(originalState.threads).toEqual([mockThread]);
    });

    it('should not mutate threads array when updating likes', () => {
      const originalThreads = [mockThread, mockThread2];
      const currentState = {
        threads: originalThreads,
      };
      const action = {
        type: actionTypes.SET_LIKES,
        payload: {
          threadId: 1,
          newLikesCount: 15,
        },
      };
      
      threadsReducers(currentState, action);

      expect(originalThreads[0].like_count).toBe(10);
    });
  });

  describe('Unknown Actions', () => {
    it('should return current state for unknown action', () => {
      const currentState = {
        threads: [mockThread],
      };
      const action = {
        type: 'UNKNOWN_ACTION',
        payload: {},
      };
      const state = threadsReducers(currentState, action);

      expect(state).toEqual(currentState);
    });
  });
});
