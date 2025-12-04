import networkReducers from '../../redux/reducers/networkReducers';
import { NETWORK } from '../../redux/types/actionConstants';

describe('Network Reducer', () => {
  const initialState = {
    isOnline: true,
    connectionType: null,
    connectionQuality: 'excellent',
    lastConnectedAt: null,
    lastDisconnectedAt: null,
    reconnectAttempts: 0,
    queuedRequestsCount: 0,
  };

  it('should return initial state', () => {
    expect(networkReducers(undefined, {})).toEqual(initialState);
  });

  it('should handle SET_ONLINE_STATUS when going offline', () => {
    const action = {
      type: NETWORK.SET_ONLINE_STATUS,
      payload: { isOnline: false },
    };

    const state = networkReducers(initialState, action);

    expect(state.isOnline).toBe(false);
    expect(state.lastDisconnectedAt).toBeTruthy();
    expect(state.lastConnectedAt).toBeNull();
  });

  it('should handle SET_ONLINE_STATUS when going online', () => {
    const offlineState = {
      ...initialState,
      isOnline: false,
      reconnectAttempts: 3,
    };

    const action = {
      type: NETWORK.SET_ONLINE_STATUS,
      payload: { isOnline: true },
    };

    const state = networkReducers(offlineState, action);

    expect(state.isOnline).toBe(true);
    expect(state.lastConnectedAt).toBeTruthy();
    expect(state.reconnectAttempts).toBe(0);
  });

  it('should handle SET_CONNECTION_TYPE', () => {
    const action = {
      type: NETWORK.SET_CONNECTION_TYPE,
      payload: { connectionType: 'wifi' },
    };

    const state = networkReducers(initialState, action);

    expect(state.connectionType).toBe('wifi');
  });

  it('should handle SET_CONNECTION_QUALITY', () => {
    const action = {
      type: NETWORK.SET_CONNECTION_QUALITY,
      payload: { quality: 'poor' },
    };

    const state = networkReducers(initialState, action);

    expect(state.connectionQuality).toBe('poor');
  });

  it('should handle INCREMENT_RECONNECT_ATTEMPTS', () => {
    const action = {
      type: NETWORK.INCREMENT_RECONNECT_ATTEMPTS,
    };

    let state = networkReducers(initialState, action);
    expect(state.reconnectAttempts).toBe(1);

    state = networkReducers(state, action);
    expect(state.reconnectAttempts).toBe(2);
  });

  it('should handle RESET_RECONNECT_ATTEMPTS', () => {
    const stateWithAttempts = {
      ...initialState,
      reconnectAttempts: 5,
    };

    const action = {
      type: NETWORK.RESET_RECONNECT_ATTEMPTS,
    };

    const state = networkReducers(stateWithAttempts, action);

    expect(state.reconnectAttempts).toBe(0);
  });

  it('should handle SET_QUEUED_REQUESTS_COUNT', () => {
    const action = {
      type: NETWORK.SET_QUEUED_REQUESTS_COUNT,
      payload: { count: 5 },
    };

    const state = networkReducers(initialState, action);

    expect(state.queuedRequestsCount).toBe(5);
  });

  it('should handle RESET_NETWORK_STATE', () => {
    const modifiedState = {
      isOnline: false,
      connectionType: 'cellular',
      connectionQuality: 'poor',
      lastConnectedAt: 123456,
      lastDisconnectedAt: 789012,
      reconnectAttempts: 3,
      queuedRequestsCount: 5,
    };

    const action = {
      type: NETWORK.RESET_NETWORK_STATE,
    };

    const state = networkReducers(modifiedState, action);

    expect(state).toEqual(initialState);
  });
});
