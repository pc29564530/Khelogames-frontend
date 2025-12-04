import { NETWORK } from '../types/actionConstants';

/**
 * Initial network state
 */
const initialState = {
  isOnline: true,
  connectionType: null,
  connectionQuality: 'excellent', // excellent, good, poor, offline
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  reconnectAttempts: 0,
  queuedRequestsCount: 0,
};

/**
 * Network reducer
 * Manages network connectivity state
 */
const networkReducers = (state = initialState, action) => {
  switch (action.type) {
    case NETWORK.SET_ONLINE_STATUS:
      return {
        ...state,
        isOnline: action.payload.isOnline,
        lastConnectedAt: action.payload.isOnline ? Date.now() : state.lastConnectedAt,
        lastDisconnectedAt: !action.payload.isOnline ? Date.now() : state.lastDisconnectedAt,
        reconnectAttempts: action.payload.isOnline ? 0 : state.reconnectAttempts,
      };

    case NETWORK.SET_CONNECTION_TYPE:
      return {
        ...state,
        connectionType: action.payload.connectionType,
      };

    case NETWORK.SET_CONNECTION_QUALITY:
      return {
        ...state,
        connectionQuality: action.payload.quality,
      };

    case NETWORK.INCREMENT_RECONNECT_ATTEMPTS:
      return {
        ...state,
        reconnectAttempts: state.reconnectAttempts + 1,
      };

    case NETWORK.RESET_RECONNECT_ATTEMPTS:
      return {
        ...state,
        reconnectAttempts: 0,
      };

    case NETWORK.SET_QUEUED_REQUESTS_COUNT:
      return {
        ...state,
        queuedRequestsCount: action.payload.count,
      };

    case NETWORK.RESET_NETWORK_STATE:
      return initialState;

    default:
      return state;
  }
};

export default networkReducers;
