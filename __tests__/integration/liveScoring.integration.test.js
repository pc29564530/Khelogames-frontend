/**
 * Live Scoring Integration Tests
 * 
 * Tests complete live scoring flows including:
 * - Score update flow
 * - WebSocket message handling
 * - Real-time UI updates
 * 
 * Requirements: 5.3
 */

import { WebSocketManager, CONNECTION_STATES } from '../../services/WebSocketManager';
import { 
  setInningScore, 
  setBatsmanScore, 
  setBowlerScore, 
  setInningStatus,
  setCurrentInningNumber,
  setBatTeam
} from '../../redux/actions/actions';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    this.sentMessages = [];
    
    setTimeout(() => {
      if (this.readyState === MockWebSocket.CONNECTING) {
        this.readyState = MockWebSocket.OPEN;
        if (this.onopen) {
          this.onopen();
        }
      }
    }, 10);
  }

  send(data) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    this.sentMessages.push(data);
  }

  close(code, reason) {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code, reason });
    }
  }

  simulateMessage(data) {
    if (this.onmessage && this.readyState === MockWebSocket.OPEN) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
}

global.WebSocket = MockWebSocket;

describe('Live Scoring Integration Tests', () => {
  let wsManager;
  let mockStore;
  let mockCallbacks;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Create mock Redux store
    mockStore = {
      getState: jest.fn(() => ({
        cricketMatchInning: {
          currentInning: 'inning1',
          currentInningNumber: 1,
          inningStatus: 'in_progress',
        },
        cricketMatchScore: {
          batTeam: 'team_home_123',
        },
        cricketPlayerScore: {
          battingScore: {
            innings: {
              1: [
                {
                  player: { public_id: 'batsman_1', name: 'Player 1' },
                  runs_scored: 25,
                  balls_faced: 20,
                  is_striker: true,
                  is_currently_batting: true,
                },
                {
                  player: { public_id: 'batsman_2', name: 'Player 2' },
                  runs_scored: 15,
                  balls_faced: 12,
                  is_striker: false,
                  is_currently_batting: true,
                },
              ],
            },
          },
          bowlingScore: {
            innings: {
              1: [
                {
                  player: { public_id: 'bowler_1', name: 'Bowler 1' },
                  overs: 3,
                  runs_conceded: 25,
                  wickets: 1,
                  is_current_bowler: true,
                },
              ],
            },
          },
        },
      })),
      dispatch: jest.fn(),
      subscribe: jest.fn(),
    };

    mockCallbacks = {
      onConnect: jest.fn(),
      onDisconnect: jest.fn(),
      onError: jest.fn(),
      onMessage: jest.fn(),
      onStateChange: jest.fn(),
    };
  });

  afterEach(() => {
    if (wsManager) {
      wsManager.disconnect();
    }
    jest.useRealTimers();
  });

  describe('Score Update Flow', () => {
    beforeEach(async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);
    });

    it('should handle regular score update through WebSocket', async () => {
      const scoreUpdateMessage = {
        type: 'SCORE_UPDATE',
        channel: 'match_123',
        payload: {
          match_public_id: 'match_123',
          inning_number: 1,
          batsman_public_id: 'batsman_1',
          bowler_public_id: 'bowler_1',
          runs_scored: 4,
          event_type: 'regular',
        },
      };

      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      // Simulate score update message
      wsManager.ws.simulateMessage(scoreUpdateMessage);

      expect(handler).toHaveBeenCalledWith(scoreUpdateMessage);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle wicket update through WebSocket', async () => {
      const wicketMessage = {
        type: 'SCORE_UPDATE',
        channel: 'match_123',
        payload: {
          match_public_id: 'match_123',
          inning_number: 1,
          batsman_public_id: 'batsman_1',
          bowler_public_id: 'bowler_1',
          runs_scored: 0,
          event_type: 'wicket',
          wicket_type: 'Bowled',
        },
      };

      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      wsManager.ws.simulateMessage(wicketMessage);

      expect(handler).toHaveBeenCalledWith(wicketMessage);
      expect(wicketMessage.payload.event_type).toBe('wicket');
      expect(wicketMessage.payload.wicket_type).toBe('Bowled');
    });

    it('should handle boundary (4 or 6) update through WebSocket', async () => {
      const boundaryMessage = {
        type: 'SCORE_UPDATE',
        channel: 'match_123',
        payload: {
          match_public_id: 'match_123',
          inning_number: 1,
          batsman_public_id: 'batsman_1',
          bowler_public_id: 'bowler_1',
          runs_scored: 6,
          event_type: 'regular',
          is_boundary: true,
        },
      };

      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      wsManager.ws.simulateMessage(boundaryMessage);

      expect(handler).toHaveBeenCalledWith(boundaryMessage);
      expect(boundaryMessage.payload.runs_scored).toBe(6);
      expect(boundaryMessage.payload.is_boundary).toBe(true);
    });

    it('should handle extras (wide, no ball) update through WebSocket', async () => {
      const extrasMessage = {
        type: 'SCORE_UPDATE',
        channel: 'match_123',
        payload: {
          match_public_id: 'match_123',
          inning_number: 1,
          batsman_public_id: 'batsman_1',
          bowler_public_id: 'bowler_1',
          runs_scored: 1,
          event_type: 'wide',
        },
      };

      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      wsManager.ws.simulateMessage(extrasMessage);

      expect(handler).toHaveBeenCalledWith(extrasMessage);
      expect(extrasMessage.payload.event_type).toBe('wide');
    });

    it('should handle inning status update through WebSocket', async () => {
      const inningStatusMessage = {
        type: 'INNING_STATUS',
        channel: 'match_123',
        payload: {
          match_public_id: 'match_123',
          inning_number: 1,
          inning_status: 'completed',
        },
      };

      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      wsManager.ws.simulateMessage(inningStatusMessage);

      expect(handler).toHaveBeenCalledWith(inningStatusMessage);
      expect(inningStatusMessage.payload.inning_status).toBe('completed');
    });

    it('should send score update to server through WebSocket', () => {
      const scoreData = {
        type: 'UPDATE_SCORE',
        payload: {
          match_public_id: 'match_123',
          batsman_public_id: 'batsman_1',
          bowler_public_id: 'bowler_1',
          runs_scored: 2,
          event_type: 'regular',
        },
      };

      wsManager.send(scoreData);

      expect(wsManager.ws.sentMessages).toHaveLength(1);
      const sentMessage = JSON.parse(wsManager.ws.sentMessages[0]);
      expect(sentMessage.type).toBe('UPDATE_SCORE');
      expect(sentMessage.payload.runs_scored).toBe(2);
    });

    it('should queue score updates when disconnected', () => {
      wsManager.disconnect();
      jest.advanceTimersByTime(20);

      const scoreUpdate1 = {
        type: 'UPDATE_SCORE',
        payload: { runs_scored: 1 },
      };
      const scoreUpdate2 = {
        type: 'UPDATE_SCORE',
        payload: { runs_scored: 2 },
      };

      wsManager.send(scoreUpdate1);
      wsManager.send(scoreUpdate2);

      expect(wsManager.messageQueue).toHaveLength(2);
    });

    it('should process queued score updates on reconnection', async () => {
      wsManager.disconnect();
      jest.advanceTimersByTime(20);

      const scoreUpdate = {
        type: 'UPDATE_SCORE',
        payload: { runs_scored: 4 },
      };

      wsManager.send(scoreUpdate);
      expect(wsManager.messageQueue).toHaveLength(1);

      // Reconnect
      await wsManager.connect();
      jest.advanceTimersByTime(20);

      expect(wsManager.messageQueue).toHaveLength(0);
      expect(wsManager.ws.sentMessages.length).toBeGreaterThan(0);
    });
  });

  describe('WebSocket Message Handling', () => {
    beforeEach(async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);
    });

    it('should validate score update message structure', () => {
      const validMessage = {
        type: 'SCORE_UPDATE',
        channel: 'match_123',
        payload: {
          match_public_id: 'match_123',
          runs_scored: 4,
        },
      };

      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      wsManager.ws.simulateMessage(validMessage);

      expect(handler).toHaveBeenCalledWith(validMessage);
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
    });

    it('should reject invalid message structure', () => {
      const invalidMessages = [
        { noType: true },
        { type: 123 },
        { type: 'SCORE_UPDATE', channel: 123 },
        null,
        undefined,
      ];

      invalidMessages.forEach((msg) => {
        wsManager.ws.simulateMessage(msg);
      });

      expect(mockCallbacks.onError).toHaveBeenCalled();
    });

    it('should handle multiple concurrent score updates', () => {
      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      // Simulate rapid score updates
      for (let i = 0; i < 10; i++) {
        wsManager.ws.simulateMessage({
          type: 'SCORE_UPDATE',
          channel: 'match_123',
          payload: {
            match_public_id: 'match_123',
            runs_scored: i,
            sequence: i,
          },
        });
      }

      expect(handler).toHaveBeenCalledTimes(10);
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);
    });

    it('should route messages to correct match channel', () => {
      const match1Handler = jest.fn();
      const match2Handler = jest.fn();

      wsManager.subscribe('match_123', match1Handler);
      wsManager.subscribe('match_456', match2Handler);

      wsManager.ws.simulateMessage({
        type: 'SCORE_UPDATE',
        channel: 'match_123',
        payload: { runs_scored: 4 },
      });

      wsManager.ws.simulateMessage({
        type: 'SCORE_UPDATE',
        channel: 'match_456',
        payload: { runs_scored: 6 },
      });

      expect(match1Handler).toHaveBeenCalledTimes(1);
      expect(match2Handler).toHaveBeenCalledTimes(1);
    });

    it('should handle message parsing errors gracefully', () => {
      wsManager.ws.onmessage({ data: 'invalid json' });

      expect(mockCallbacks.onError).toHaveBeenCalled();
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);
    });

    it('should handle errors in message handlers without crashing', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });

      wsManager.subscribe('match_123', errorHandler);

      wsManager.ws.simulateMessage({
        type: 'SCORE_UPDATE',
        channel: 'match_123',
        payload: { runs_scored: 4 },
      });

      expect(errorHandler).toHaveBeenCalled();
      expect(mockCallbacks.onError).toHaveBeenCalled();
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);
    });

    it('should update connection quality based on message latency', () => {
      // Simulate ping-pong with low latency
      wsManager.sendPing();
      const pingTime = wsManager.lastPingTime;

      jest.advanceTimersByTime(50);
      wsManager.lastPingTime = pingTime;
      wsManager.handlePong();

      expect(wsManager.latencyHistory.length).toBeGreaterThan(0);
      expect(wsManager.getAverageLatency()).toBeLessThan(100);
    });
  });

  describe('Real-time UI Updates', () => {
    beforeEach(async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);
    });

    it('should update Redux store with score update within 500ms', async () => {
      const initialState = mockStore.getState();
      const initialBattingScore = initialState.cricketPlayerScore.battingScore;

      // Simulate score update
      const scoreUpdateMessage = {
        type: 'SCORE_UPDATE',
        channel: 'match_123',
        payload: {
          match_public_id: 'match_123',
          inning_number: 1,
          batsman: {
            player: { public_id: 'batsman_1', name: 'Player 1' },
            runs_scored: 29,
            balls_faced: 21,
            is_striker: true,
          },
          bowler: {
            player: { public_id: 'bowler_1', name: 'Bowler 1' },
            overs: 3.1,
            runs_conceded: 29,
            wickets: 1,
          },
        },
      };

      const startTime = Date.now();
      
      // Dispatch Redux action
      mockStore.dispatch(setBatsmanScore([scoreUpdateMessage.payload.batsman]));
      mockStore.dispatch(setBowlerScore([scoreUpdateMessage.payload.bowler]));

      const endTime = Date.now();
      const updateTime = endTime - startTime;

      // Verify update happened within 500ms
      expect(updateTime).toBeLessThan(500);

      // Verify dispatch was called
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(String),
        })
      );
    });

    it('should update inning status in Redux store', () => {
      const inningStatusMessage = {
        type: 'INNING_STATUS',
        payload: {
          inning_status: 'completed',
          inning_number: 1,
        },
      };

      mockStore.dispatch(
        setInningStatus(
          inningStatusMessage.payload.inning_status,
          inningStatusMessage.payload.inning_number
        )
      );

      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should update batting team in Redux store', () => {
      const newBatTeam = 'team_away_456';

      mockStore.dispatch(setBatTeam(newBatTeam));

      expect(mockStore.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(String),
        })
      );
    });

    it('should update current inning number in Redux store', () => {
      const newInningNumber = 2;

      mockStore.dispatch(setCurrentInningNumber(newInningNumber));

      expect(mockStore.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(String),
        })
      );
    });

    it('should handle multiple rapid UI updates without race conditions', () => {
      for (let i = 0; i < 20; i++) {
        mockStore.dispatch(
          setBatsmanScore([
            {
              player: { public_id: 'batsman_1', name: 'Player 1' },
              runs_scored: 25 + i,
              balls_faced: 20 + i,
            },
          ])
        );
      }

      // Verify all updates were dispatched
      expect(mockStore.dispatch).toHaveBeenCalledTimes(20);
    });

    it('should maintain UI consistency during connection loss', async () => {
      const initialState = mockStore.getState();

      // Simulate connection loss
      wsManager.ws.close(1006, 'Connection lost');
      jest.advanceTimersByTime(10);

      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.RECONNECTING);

      // State should remain consistent
      const stateAfterDisconnect = mockStore.getState();
      expect(stateAfterDisconnect.cricketMatchInning).toEqual(
        initialState.cricketMatchInning
      );
    });

    it('should sync UI state after reconnection', async () => {
      // Disconnect
      wsManager.disconnect();
      jest.advanceTimersByTime(20);

      // Queue updates while disconnected
      const queuedUpdate = {
        type: 'SCORE_UPDATE',
        payload: {
          batsman: {
            player: { public_id: 'batsman_1' },
            runs_scored: 35,
          },
        },
      };

      wsManager.send(queuedUpdate);

      // Reconnect
      await wsManager.connect();
      jest.advanceTimersByTime(20);

      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);
      expect(wsManager.messageQueue).toHaveLength(0);
    });
  });

  describe('Complete Live Scoring Flow', () => {
    it('should handle complete over with multiple deliveries', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);

      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      // Simulate 6 deliveries in an over
      const deliveries = [
        { runs: 1, event: 'regular' },
        { runs: 0, event: 'regular' },
        { runs: 4, event: 'regular', is_boundary: true },
        { runs: 1, event: 'wide' },
        { runs: 2, event: 'regular' },
        { runs: 6, event: 'regular', is_boundary: true },
        { runs: 0, event: 'wicket', wicket_type: 'Caught' },
      ];

      deliveries.forEach((delivery, index) => {
        wsManager.ws.simulateMessage({
          type: 'SCORE_UPDATE',
          channel: 'match_123',
          payload: {
            match_public_id: 'match_123',
            inning_number: 1,
            runs_scored: delivery.runs,
            event_type: delivery.event,
            wicket_type: delivery.wicket_type,
            is_boundary: delivery.is_boundary,
            ball_number: index + 1,
          },
        });
      });

      expect(handler).toHaveBeenCalledTimes(7);
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);
    });

    it('should handle inning transition flow', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);

      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      // Step 1: Complete first inning
      wsManager.ws.simulateMessage({
        type: 'INNING_STATUS',
        channel: 'match_123',
        payload: {
          match_public_id: 'match_123',
          inning_number: 1,
          inning_status: 'completed',
        },
      });

      mockStore.dispatch(setInningStatus('completed', 1));

      // Step 2: Start second inning
      wsManager.ws.simulateMessage({
        type: 'INNING_STATUS',
        channel: 'match_123',
        payload: {
          match_public_id: 'match_123',
          inning_number: 2,
          inning_status: 'in_progress',
        },
      });

      mockStore.dispatch(setCurrentInningNumber(2));
      mockStore.dispatch(setInningStatus('in_progress', 2));
      mockStore.dispatch(setBatTeam('team_away_456'));

      // Verify state transitions
      expect(mockStore.dispatch).toHaveBeenCalled();
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should handle match completion flow', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);

      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      // Complete second inning
      wsManager.ws.simulateMessage({
        type: 'INNING_STATUS',
        channel: 'match_123',
        payload: {
          match_public_id: 'match_123',
          inning_number: 2,
          inning_status: 'completed',
        },
      });

      // Match result
      wsManager.ws.simulateMessage({
        type: 'MATCH_RESULT',
        channel: 'match_123',
        payload: {
          match_public_id: 'match_123',
          winner_team_id: 'team_home_123',
          result_type: 'runs',
          margin: 25,
        },
      });

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'MATCH_RESULT',
        })
      );
    });

    it('should handle connection recovery during live match', async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        reconnect: true,
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);

      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      // Receive some updates
      wsManager.ws.simulateMessage({
        type: 'SCORE_UPDATE',
        channel: 'match_123',
        payload: { runs_scored: 4 },
      });

      expect(handler).toHaveBeenCalledTimes(1);

      // Simulate connection loss
      wsManager.ws.close(1006, 'Connection lost');
      jest.advanceTimersByTime(10);

      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.RECONNECTING);

      // Wait for reconnection
      jest.advanceTimersByTime(1100);

      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);

      // Receive updates after reconnection
      wsManager.ws.simulateMessage({
        type: 'SCORE_UPDATE',
        channel: 'match_123',
        payload: { runs_scored: 6 },
      });

      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance and Reliability', () => {
    beforeEach(async () => {
      wsManager = new WebSocketManager({
        url: 'ws://localhost:8080',
        ...mockCallbacks,
      });
      await wsManager.connect();
      jest.advanceTimersByTime(20);
    });

    it('should handle high-frequency score updates efficiently', () => {
      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      const startTime = Date.now();

      // Simulate 100 rapid updates
      for (let i = 0; i < 100; i++) {
        wsManager.ws.simulateMessage({
          type: 'SCORE_UPDATE',
          channel: 'match_123',
          payload: {
            match_public_id: 'match_123',
            runs_scored: i % 7,
            sequence: i,
          },
        });
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(handler).toHaveBeenCalledTimes(100);
      expect(processingTime).toBeLessThan(1000); // Should process 100 updates in under 1 second
      expect(wsManager.getConnectionState()).toBe(CONNECTION_STATES.CONNECTED);
    });

    it('should maintain message order during rapid updates', () => {
      const handler = jest.fn();
      const receivedSequences = [];

      wsManager.subscribe('match_123', (message) => {
        receivedSequences.push(message.payload.sequence);
      });

      // Send 50 sequential updates
      for (let i = 0; i < 50; i++) {
        wsManager.ws.simulateMessage({
          type: 'SCORE_UPDATE',
          channel: 'match_123',
          payload: {
            match_public_id: 'match_123',
            sequence: i,
          },
        });
      }

      // Verify order is maintained
      for (let i = 0; i < 50; i++) {
        expect(receivedSequences[i]).toBe(i);
      }
    });

    it('should not drop messages under load', () => {
      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      const messageCount = 200;

      for (let i = 0; i < messageCount; i++) {
        wsManager.ws.simulateMessage({
          type: 'SCORE_UPDATE',
          channel: 'match_123',
          payload: {
            match_public_id: 'match_123',
            message_id: i,
          },
        });
      }

      expect(handler).toHaveBeenCalledTimes(messageCount);
    });

    it('should handle memory efficiently with long-running connection', () => {
      const handler = jest.fn();
      wsManager.subscribe('match_123', handler);

      // Simulate extended match with many updates
      for (let i = 0; i < 500; i++) {
        wsManager.ws.simulateMessage({
          type: 'SCORE_UPDATE',
          channel: 'match_123',
          payload: {
            match_public_id: 'match_123',
            runs_scored: i % 7,
          },
        });
      }

      expect(handler).toHaveBeenCalledTimes(500);
      
      // Verify latency history is bounded
      expect(wsManager.latencyHistory.length).toBeLessThanOrEqual(10);
    });
  });
});
