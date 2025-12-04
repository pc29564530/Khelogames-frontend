/**
 * Match Creation Integration Tests
 * 
 * Tests complete match creation flows including:
 * - Cricket match creation flow
 * - Football match creation flow
 * - Match validation
 * 
 * Requirements: 5.3
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/ApiConstants';
import { mockTournament, mockApiResponse, mockApiError } from '../utils/mockDataFactories';

// Mock dependencies
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');

describe('Match Creation Integration Tests', () => {
  const mockAuthToken = 'mock_auth_token_12345';
  
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(mockAuthToken);
  });

  describe('Cricket Match Creation Flow', () => {
    it('should complete full cricket match creation flow with valid data', async () => {
      // Setup: Create tournament and teams
      const tournament = mockTournament({
        sport: 'cricket',
        public_id: 'tournament_123',
      });

      const homeTeam = {
        public_id: 'team_home_123',
        name: 'Mumbai Indians',
        short_name: 'MI',
      };

      const awayTeam = {
        public_id: 'team_away_456',
        name: 'Chennai Super Kings',
        short_name: 'CSK',
      };

      // Setup: Match creation data
      const matchData = {
        tournament_public_id: tournament.public_id,
        home_team_public_id: homeTeam.public_id,
        away_team_public_id: awayTeam.public_id,
        start_timestamp: new Date('2024-12-01T14:00:00Z'),
        end_timestamp: new Date('2024-12-01T18:00:00Z'),
        type: 'team',
        status_code: 'not_started',
        result: null,
        stage: 'Group',
        knockout_level_id: null,
        match_format: 'T20',
      };

      // Mock successful API response
      const createdMatch = {
        id: 'match_789',
        public_id: 'match_pub_789',
        ...matchData,
        created_at: new Date().toISOString(),
      };

      axios.post.mockResolvedValue(mockApiResponse(createdMatch));

      // Execute: Get auth token and create cricket match
      const authToken = await AsyncStorage.getItem('AccessToken');
      const response = await axios.post(
        `${BASE_URL}/cricket/createTournamentMatch`,
        matchData,
        {
          headers: {
            'Authorization': `bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Verify: Match created successfully
      expect(response.data).toEqual(createdMatch);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('AccessToken');
      expect(axios.post).toHaveBeenCalledWith(
        `${BASE_URL}/cricket/createTournamentMatch`,
        matchData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `bearer ${mockAuthToken}`,
          }),
        })
      );
    });

    it('should create cricket match with knockout stage and level', async () => {
      // Setup: Knockout match data
      const matchData = {
        tournament_public_id: 'tournament_123',
        home_team_public_id: 'team_home_123',
        away_team_public_id: 'team_away_456',
        start_timestamp: new Date('2024-12-15T14:00:00Z'),
        end_timestamp: null,
        type: 'team',
        status_code: 'not_started',
        result: null,
        stage: 'Knockout',
        knockout_level_id: 4, // Semi-final
        match_format: 'ODI',
      };

      const createdMatch = {
        id: 'match_knockout_123',
        ...matchData,
      };

      axios.post.mockResolvedValue(mockApiResponse(createdMatch));

      // Execute: Create knockout match
      const response = await axios.post(
        `${BASE_URL}/cricket/createTournamentMatch`,
        matchData,
        {
          headers: {
            'Authorization': `bearer ${mockAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Verify: Knockout match created with level
      expect(response.data).toEqual(createdMatch);
      expect(response.data.stage).toBe('Knockout');
      expect(response.data.knockout_level_id).toBe(4);
      expect(response.data.match_format).toBe('ODI');
    });

    it('should create cricket match with different formats (T20, ODI, Test)', async () => {
      const formats = ['T20', 'ODI', 'Test'];

      for (const format of formats) {
        // Setup: Match data with specific format
        const matchData = {
          tournament_public_id: 'tournament_123',
          home_team_public_id: 'team_home_123',
          away_team_public_id: 'team_away_456',
          start_timestamp: new Date('2024-12-01T14:00:00Z'),
          type: 'team',
          status_code: 'not_started',
          stage: 'League',
          match_format: format,
        };

        const createdMatch = {
          id: `match_${format}_123`,
          ...matchData,
        };

        axios.post.mockResolvedValue(mockApiResponse(createdMatch));

        // Execute: Create match with format
        const response = await axios.post(
          `${BASE_URL}/cricket/createTournamentMatch`,
          matchData,
          {
            headers: {
              'Authorization': `bearer ${mockAuthToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Verify: Match created with correct format
        expect(response.data.match_format).toBe(format);
      }
    });

    it('should handle cricket match creation validation errors', async () => {
      // Setup: Invalid match data (missing required fields)
      const invalidMatchData = {
        tournament_public_id: 'tournament_123',
        // Missing home_team_public_id
        away_team_public_id: 'team_away_456',
        start_timestamp: new Date('2024-12-01T14:00:00Z'),
        type: 'team',
        status_code: 'not_started',
      };

      // Mock validation error response
      const validationError = mockApiError('Validation failed: home_team_public_id is required', 400);
      axios.post.mockRejectedValue(validationError);

      // Execute & Verify: Validation error thrown
      await expect(
        axios.post(
          `${BASE_URL}/cricket/createTournamentMatch`,
          invalidMatchData,
          {
            headers: {
              'Authorization': `bearer ${mockAuthToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: {
            message: expect.stringContaining('Validation failed'),
          },
        },
      });
    });

    it('should handle cricket match creation with same team error', async () => {
      // Setup: Invalid match data (same team for home and away)
      const invalidMatchData = {
        tournament_public_id: 'tournament_123',
        home_team_public_id: 'team_123',
        away_team_public_id: 'team_123', // Same as home team
        start_timestamp: new Date('2024-12-01T14:00:00Z'),
        type: 'team',
        status_code: 'not_started',
        stage: 'Group',
      };

      // Mock validation error
      const validationError = mockApiError('Home team and away team cannot be the same', 400);
      axios.post.mockRejectedValue(validationError);

      // Execute & Verify: Validation error thrown
      await expect(
        axios.post(
          `${BASE_URL}/cricket/createTournamentMatch`,
          invalidMatchData,
          {
            headers: {
              'Authorization': `bearer ${mockAuthToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 400,
        },
      });
    });
  });

  describe('Football Match Creation Flow', () => {
    it('should complete full football match creation flow with valid data', async () => {
      // Setup: Create tournament and teams
      const tournament = mockTournament({
        sport: 'football',
        public_id: 'tournament_football_123',
      });

      const homeTeam = {
        public_id: 'team_home_football_123',
        name: 'Manchester United',
        short_name: 'MUN',
      };

      const awayTeam = {
        public_id: 'team_away_football_456',
        name: 'Liverpool FC',
        short_name: 'LIV',
      };

      // Setup: Match creation data
      const matchData = {
        tournament_public_id: tournament.public_id,
        home_team_public_id: homeTeam.public_id,
        away_team_public_id: awayTeam.public_id,
        start_timestamp: new Date('2024-12-05T19:00:00Z'),
        end_timestamp: new Date('2024-12-05T21:00:00Z'),
        type: 'team',
        status_code: 'not_started',
        result: null,
        stage: 'League',
        knockout_level_id: null,
      };

      // Mock successful API response
      const createdMatch = {
        id: 'match_football_789',
        public_id: 'match_football_pub_789',
        ...matchData,
        created_at: new Date().toISOString(),
      };

      axios.post.mockResolvedValue(mockApiResponse(createdMatch));

      // Execute: Create football match
      const response = await axios.post(
        `${BASE_URL}/football/createTournamentMatch`,
        matchData,
        {
          headers: {
            'Authorization': `bearer ${mockAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Verify: Match created successfully
      expect(response.data).toEqual(createdMatch);
      expect(axios.post).toHaveBeenCalledWith(
        `${BASE_URL}/football/createTournamentMatch`,
        matchData,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `bearer ${mockAuthToken}`,
          }),
        })
      );
    });

    it('should create football match with knockout stage', async () => {
      // Setup: Knockout match data
      const matchData = {
        tournament_public_id: 'tournament_football_123',
        home_team_public_id: 'team_home_123',
        away_team_public_id: 'team_away_456',
        start_timestamp: new Date('2024-12-20T18:00:00Z'),
        type: 'team',
        status_code: 'not_started',
        result: null,
        stage: 'Knockout',
        knockout_level_id: 5, // Final
      };

      const createdMatch = {
        id: 'match_football_final_123',
        ...matchData,
      };

      axios.post.mockResolvedValue(mockApiResponse(createdMatch));

      // Execute: Create knockout match
      const response = await axios.post(
        `${BASE_URL}/football/createTournamentMatch`,
        matchData,
        {
          headers: {
            'Authorization': `bearer ${mockAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Verify: Knockout match created
      expect(response.data).toEqual(createdMatch);
      expect(response.data.stage).toBe('Knockout');
      expect(response.data.knockout_level_id).toBe(5);
    });

    it('should handle football match creation validation errors', async () => {
      // Setup: Invalid match data (missing start time)
      const invalidMatchData = {
        tournament_public_id: 'tournament_football_123',
        home_team_public_id: 'team_home_123',
        away_team_public_id: 'team_away_456',
        // Missing start_timestamp
        type: 'team',
        status_code: 'not_started',
        stage: 'Group',
      };

      // Mock validation error response
      const validationError = mockApiError('Validation failed: start_timestamp is required', 400);
      axios.post.mockRejectedValue(validationError);

      // Execute & Verify: Validation error thrown
      await expect(
        axios.post(
          `${BASE_URL}/football/createTournamentMatch`,
          invalidMatchData,
          {
            headers: {
              'Authorization': `bearer ${mockAuthToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 400,
          data: {
            message: expect.stringContaining('Validation failed'),
          },
        },
      });
    });

    it('should handle football match creation with unauthorized error', async () => {
      // Setup: Valid match data but invalid token
      const matchData = {
        tournament_public_id: 'tournament_football_123',
        home_team_public_id: 'team_home_123',
        away_team_public_id: 'team_away_456',
        start_timestamp: new Date('2024-12-05T19:00:00Z'),
        type: 'team',
        status_code: 'not_started',
        stage: 'League',
      };

      // Mock unauthorized error
      const authError = mockApiError('Unauthorized', 401);
      axios.post.mockRejectedValue(authError);

      // Execute & Verify: Unauthorized error thrown
      await expect(
        axios.post(
          `${BASE_URL}/football/createTournamentMatch`,
          matchData,
          {
            headers: {
              'Authorization': `bearer invalid_token`,
              'Content-Type': 'application/json',
            },
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 401,
        },
      });
    });
  });

  describe('Match Validation', () => {
    it('should validate required fields for match creation', async () => {
      const requiredFields = [
        'tournament_public_id',
        'home_team_public_id',
        'away_team_public_id',
        'start_timestamp',
        'type',
        'stage',
      ];

      for (const field of requiredFields) {
        // Setup: Create match data missing one required field
        const incompleteData = {
          tournament_public_id: 'tournament_123',
          home_team_public_id: 'team_home_123',
          away_team_public_id: 'team_away_456',
          start_timestamp: new Date('2024-12-01T14:00:00Z'),
          type: 'team',
          status_code: 'not_started',
          stage: 'Group',
        };

        // Remove the field being tested
        delete incompleteData[field];

        // Mock validation error
        const validationError = mockApiError(`Validation failed: ${field} is required`, 400);
        axios.post.mockRejectedValue(validationError);

        // Execute & Verify: Validation error for missing field
        await expect(
          axios.post(
            `${BASE_URL}/cricket/createTournamentMatch`,
            incompleteData,
            {
              headers: {
                'Authorization': `bearer ${mockAuthToken}`,
                'Content-Type': 'application/json',
              },
            }
          )
        ).rejects.toMatchObject({
          response: {
            status: 400,
          },
        });
      }
    });

    it('should validate match type is valid', async () => {
      const validTypes = ['team', 'individual', 'double'];

      for (const type of validTypes) {
        // Setup: Match data with valid type
        const matchData = {
          tournament_public_id: 'tournament_123',
          home_team_public_id: 'team_home_123',
          away_team_public_id: 'team_away_456',
          start_timestamp: new Date('2024-12-01T14:00:00Z'),
          type: type,
          status_code: 'not_started',
          stage: 'Group',
        };

        const createdMatch = {
          id: `match_${type}_123`,
          ...matchData,
        };

        axios.post.mockResolvedValue(mockApiResponse(createdMatch));

        // Execute: Create match with valid type
        const response = await axios.post(
          `${BASE_URL}/cricket/createTournamentMatch`,
          matchData,
          {
            headers: {
              'Authorization': `bearer ${mockAuthToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Verify: Match created with correct type
        expect(response.data.type).toBe(type);
      }
    });

    it('should validate stage is valid', async () => {
      const validStages = ['Group', 'Knockout', 'League'];

      for (const stage of validStages) {
        // Setup: Match data with valid stage
        const matchData = {
          tournament_public_id: 'tournament_123',
          home_team_public_id: 'team_home_123',
          away_team_public_id: 'team_away_456',
          start_timestamp: new Date('2024-12-01T14:00:00Z'),
          type: 'team',
          status_code: 'not_started',
          stage: stage,
        };

        const createdMatch = {
          id: `match_${stage}_123`,
          ...matchData,
        };

        axios.post.mockResolvedValue(mockApiResponse(createdMatch));

        // Execute: Create match with valid stage
        const response = await axios.post(
          `${BASE_URL}/cricket/createTournamentMatch`,
          matchData,
          {
            headers: {
              'Authorization': `bearer ${mockAuthToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Verify: Match created with correct stage
        expect(response.data.stage).toBe(stage);
      }
    });

    it('should validate start time is in the future', async () => {
      // Setup: Match data with past start time
      const pastMatchData = {
        tournament_public_id: 'tournament_123',
        home_team_public_id: 'team_home_123',
        away_team_public_id: 'team_away_456',
        start_timestamp: new Date('2020-01-01T14:00:00Z'), // Past date
        type: 'team',
        status_code: 'not_started',
        stage: 'Group',
      };

      // Mock validation error
      const validationError = mockApiError('Start time must be in the future', 400);
      axios.post.mockRejectedValue(validationError);

      // Execute & Verify: Validation error for past date
      await expect(
        axios.post(
          `${BASE_URL}/cricket/createTournamentMatch`,
          pastMatchData,
          {
            headers: {
              'Authorization': `bearer ${mockAuthToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 400,
        },
      });
    });

    it('should validate end time is after start time', async () => {
      // Setup: Match data with end time before start time
      const invalidTimeData = {
        tournament_public_id: 'tournament_123',
        home_team_public_id: 'team_home_123',
        away_team_public_id: 'team_away_456',
        start_timestamp: new Date('2024-12-01T18:00:00Z'),
        end_timestamp: new Date('2024-12-01T14:00:00Z'), // Before start time
        type: 'team',
        status_code: 'not_started',
        stage: 'Group',
      };

      // Mock validation error
      const validationError = mockApiError('End time must be after start time', 400);
      axios.post.mockRejectedValue(validationError);

      // Execute & Verify: Validation error for invalid time range
      await expect(
        axios.post(
          `${BASE_URL}/cricket/createTournamentMatch`,
          invalidTimeData,
          {
            headers: {
              'Authorization': `bearer ${mockAuthToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 400,
        },
      });
    });

    it('should validate knockout stage requires knockout level', async () => {
      // Setup: Knockout match without level
      const knockoutWithoutLevel = {
        tournament_public_id: 'tournament_123',
        home_team_public_id: 'team_home_123',
        away_team_public_id: 'team_away_456',
        start_timestamp: new Date('2024-12-01T14:00:00Z'),
        type: 'team',
        status_code: 'not_started',
        stage: 'Knockout',
        knockout_level_id: null, // Missing level for knockout
      };

      // Mock validation error
      const validationError = mockApiError('Knockout stage requires knockout_level_id', 400);
      axios.post.mockRejectedValue(validationError);

      // Execute & Verify: Validation error for missing knockout level
      await expect(
        axios.post(
          `${BASE_URL}/cricket/createTournamentMatch`,
          knockoutWithoutLevel,
          {
            headers: {
              'Authorization': `bearer ${mockAuthToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 400,
        },
      });
    });

    it('should validate teams belong to the tournament', async () => {
      // Setup: Match with team not in tournament
      const invalidTeamData = {
        tournament_public_id: 'tournament_123',
        home_team_public_id: 'team_not_in_tournament',
        away_team_public_id: 'team_away_456',
        start_timestamp: new Date('2024-12-01T14:00:00Z'),
        type: 'team',
        status_code: 'not_started',
        stage: 'Group',
      };

      // Mock validation error
      const validationError = mockApiError('Team does not belong to this tournament', 400);
      axios.post.mockRejectedValue(validationError);

      // Execute & Verify: Validation error for invalid team
      await expect(
        axios.post(
          `${BASE_URL}/cricket/createTournamentMatch`,
          invalidTeamData,
          {
            headers: {
              'Authorization': `bearer ${mockAuthToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      ).rejects.toMatchObject({
        response: {
          status: 400,
        },
      });
    });
  });

  describe('Complete Match Creation Lifecycle', () => {
    it('should handle complete cricket match creation from tournament to match', async () => {
      // Step 1: Create tournament
      const tournament = mockTournament({
        sport: 'cricket',
        public_id: 'tournament_lifecycle_123',
      });

      axios.post.mockResolvedValueOnce(mockApiResponse(tournament));

      const tournamentResponse = await axios.post(
        `${BASE_URL}/cricket/createTournament`,
        {
          name: tournament.name,
          sport: 'cricket',
          format: 'knockout',
        },
        {
          headers: {
            'Authorization': `bearer ${mockAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      expect(tournamentResponse.data.public_id).toBe(tournament.public_id);

      // Step 2: Add teams to tournament
      const homeTeam = { public_id: 'team_home_lifecycle_123', name: 'Team A' };
      const awayTeam = { public_id: 'team_away_lifecycle_456', name: 'Team B' };

      axios.post.mockResolvedValueOnce(mockApiResponse({ success: true }));
      axios.post.mockResolvedValueOnce(mockApiResponse({ success: true }));

      await axios.post(
        `${BASE_URL}/cricket/addTeamToTournament`,
        {
          tournament_public_id: tournament.public_id,
          team_public_id: homeTeam.public_id,
        },
        {
          headers: {
            'Authorization': `bearer ${mockAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await axios.post(
        `${BASE_URL}/cricket/addTeamToTournament`,
        {
          tournament_public_id: tournament.public_id,
          team_public_id: awayTeam.public_id,
        },
        {
          headers: {
            'Authorization': `bearer ${mockAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Step 3: Create match
      const matchData = {
        tournament_public_id: tournament.public_id,
        home_team_public_id: homeTeam.public_id,
        away_team_public_id: awayTeam.public_id,
        start_timestamp: new Date('2024-12-01T14:00:00Z'),
        type: 'team',
        status_code: 'not_started',
        stage: 'Knockout',
        knockout_level_id: 5,
        match_format: 'T20',
      };

      const createdMatch = {
        id: 'match_lifecycle_789',
        ...matchData,
      };

      axios.post.mockResolvedValueOnce(mockApiResponse(createdMatch));

      const matchResponse = await axios.post(
        `${BASE_URL}/cricket/createTournamentMatch`,
        matchData,
        {
          headers: {
            'Authorization': `bearer ${mockAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Verify: Complete lifecycle successful
      expect(matchResponse.data.id).toBe('match_lifecycle_789');
      expect(matchResponse.data.tournament_public_id).toBe(tournament.public_id);
      expect(matchResponse.data.home_team_public_id).toBe(homeTeam.public_id);
      expect(matchResponse.data.away_team_public_id).toBe(awayTeam.public_id);
      expect(axios.post).toHaveBeenCalledTimes(4); // Tournament + 2 teams + match
    });

    it('should handle complete football match creation from tournament to match', async () => {
      // Step 1: Create tournament
      const tournament = mockTournament({
        sport: 'football',
        public_id: 'tournament_football_lifecycle_123',
      });

      axios.post.mockResolvedValueOnce(mockApiResponse(tournament));

      const tournamentResponse = await axios.post(
        `${BASE_URL}/football/createTournament`,
        {
          name: tournament.name,
          sport: 'football',
          format: 'league',
        },
        {
          headers: {
            'Authorization': `bearer ${mockAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      expect(tournamentResponse.data.public_id).toBe(tournament.public_id);

      // Step 2: Create match
      const matchData = {
        tournament_public_id: tournament.public_id,
        home_team_public_id: 'team_home_football_123',
        away_team_public_id: 'team_away_football_456',
        start_timestamp: new Date('2024-12-05T19:00:00Z'),
        type: 'team',
        status_code: 'not_started',
        stage: 'League',
      };

      const createdMatch = {
        id: 'match_football_lifecycle_789',
        ...matchData,
      };

      axios.post.mockResolvedValueOnce(mockApiResponse(createdMatch));

      const matchResponse = await axios.post(
        `${BASE_URL}/football/createTournamentMatch`,
        matchData,
        {
          headers: {
            'Authorization': `bearer ${mockAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Verify: Complete lifecycle successful
      expect(matchResponse.data.id).toBe('match_football_lifecycle_789');
      expect(matchResponse.data.tournament_public_id).toBe(tournament.public_id);
      expect(axios.post).toHaveBeenCalledTimes(2); // Tournament + match
    });
  });
});
