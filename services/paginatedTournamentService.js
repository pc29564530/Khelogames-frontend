import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../constants/ApiConstants";
import { withPagination, createPaginationParams } from './paginationService';

/**
 * Paginated Tournament Services
 * 
 * Enhanced tournament services with pagination support
 */

/**
 * Get tournaments by sport with pagination
 * 
 * @param {object} params - Request parameters
 * @param {object} params.axiosInstance - Axios instance
 * @param {object} params.game - Game object with id and name
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Promise<object>} Paginated response
 */
export const getTournamentsBySportPaginated = async ({ axiosInstance, game }, page = 1, limit = 20) => {
  try {
    const authToken = await AsyncStorage.getItem('AcessToken');
    const paginationParams = createPaginationParams(page, limit);
    
    const response = await axiosInstance.get(
      `${BASE_URL}/${game.name}/getTournamentsBySport/${game.id}`,
      {
        params: {
          page: paginationParams.page,
          limit: paginationParams.limit,
        },
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const tournaments = response.data?.tournament || response.data || [];
    const total = response.data?.total || tournaments.length;
    
    return {
      data: tournaments,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        hasMore: tournaments.length === limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (err) {
    console.error("Unable to fetch tournaments:", err);
    throw err;
  }
};

/**
 * Get teams by tournament with pagination
 * 
 * @param {object} params - Request parameters
 * @param {string} params.tournamentPublicID - Tournament public ID
 * @param {object} params.game - Game object
 * @param {object} params.axiosInstance - Axios instance
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>} Paginated response
 */
export const getTeamsByTournamentPaginated = async (
  { tournamentPublicID, game, axiosInstance },
  page = 1,
  limit = 20
) => {
  try {
    const authToken = await AsyncStorage.getItem('AccessToken');
    const paginationParams = createPaginationParams(page, limit);
    
    const response = await axiosInstance.get(
      `${BASE_URL}/${game.name}/getTournamentTeam/${tournamentPublicID}`,
      {
        params: {
          page: paginationParams.page,
          limit: paginationParams.limit,
        },
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const teams = response.data || [];
    
    return {
      data: teams,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: teams.length,
        hasMore: teams.length === limit,
      },
    };
  } catch (err) {
    console.error("Unable to fetch teams:", err);
    throw err;
  }
};

/**
 * Get teams by sport with pagination
 * 
 * @param {object} params - Request parameters
 * @param {object} params.game - Game object
 * @param {object} params.axiosInstance - Axios instance
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>} Paginated response
 */
export const getTeamsBySportPaginated = async (
  { game, axiosInstance },
  page = 1,
  limit = 20
) => {
  try {
    const authToken = await AsyncStorage.getItem('AccessToken');
    const paginationParams = createPaginationParams(page, limit);
    
    const response = await axiosInstance.get(
      `${BASE_URL}/${game.name}/getTeamsBySport/${game.id}`,
      {
        params: {
          page: paginationParams.page,
          limit: paginationParams.limit,
        },
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const teams = response.data || [];
    
    return {
      data: teams,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: teams.length,
        hasMore: teams.length === limit,
      },
    };
  } catch (err) {
    console.error("Unable to fetch teams by sport:", err);
    throw err;
  }
};

// Export wrapped versions for backward compatibility
export const getTournamentsBySportWithPagination = withPagination(getTournamentsBySportPaginated);
export const getTeamsByTournamentWithPagination = withPagination(getTeamsByTournamentPaginated);
export const getTeamsBySportWithPagination = withPagination(getTeamsBySportPaginated);
