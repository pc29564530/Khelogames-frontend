/**
 * Redux Action Type Constants
 * Organized by feature domain for better maintainability
 */

// ============================================================================
// Authentication Actions
// ============================================================================
export const AUTH = {
  SEND_OTP: 'AUTH/SEND_OTP',
  VERIFY_OTP: 'AUTH/VERIFY_OTP',
  SET_AUTHENTICATED: 'AUTH/SET_AUTHENTICATED',
  CHECK_EXPIRE_TIME: 'AUTH/CHECK_EXPIRE_TIME',
  LOGOUT: 'AUTH/LOGOUT',
};

// ============================================================================
// User Actions
// ============================================================================
export const USER = {
  CREATE: 'USER/CREATE',
  SET: 'USER/SET',
  GET_PROFILE: 'USER/GET_PROFILE',
  SET_PROFILE: 'USER/SET_PROFILE',
  FOLLOW: 'USER/FOLLOW',
  UNFOLLOW: 'USER/UNFOLLOW',
  IS_FOLLOWING: 'USER/IS_FOLLOWING',
  GET_FOLLOWING: 'USER/GET_FOLLOWING',
  GET_FOLLOWERS: 'USER/GET_FOLLOWERS',
  SET_PROFILE_AVATAR: 'USER/SET_PROFILE_AVATAR',
  SET_AUTH_PROFILE_PUBLIC_ID: 'USER/SET_AUTH_PROFILE_PUBLIC_ID',
};

// ============================================================================
// Profile Edit Actions
// ============================================================================
export const PROFILE_EDIT = {
  SET_FULL_NAME: 'PROFILE_EDIT/SET_FULL_NAME',
  SET_DESCRIPTION: 'PROFILE_EDIT/SET_DESCRIPTION',
  SET_AVATAR: 'PROFILE_EDIT/SET_AVATAR',
};

// ============================================================================
// Mobile Number Actions
// ============================================================================
export const MOBILE = {
  SET_NUMBER: 'MOBILE/SET_NUMBER',
  SET_VERIFIED: 'MOBILE/SET_VERIFIED',
};

// ============================================================================
// Thread Actions
// ============================================================================
export const THREADS = {
  SET: 'THREADS/SET',
  ADD: 'THREADS/ADD',
  SET_LIKES: 'THREADS/SET_LIKES',
  TOGGLE_LIKES: 'THREADS/TOGGLE_LIKES',
};

// ============================================================================
// Comment Actions
// ============================================================================
export const COMMENTS = {
  SET: 'COMMENTS/SET',
  ADD: 'COMMENTS/ADD',
  SET_TEXT: 'COMMENTS/SET_TEXT',
};

// ============================================================================
// Community Actions
// ============================================================================
export const COMMUNITY = {
  GET: 'COMMUNITY/GET',
  ADD: 'COMMUNITY/ADD',
  GET_JOINED: 'COMMUNITY/GET_JOINED',
  ADD_JOINED: 'COMMUNITY/ADD_JOINED',
};

// ============================================================================
// Match Actions
// ============================================================================
export const MATCHES = {
  GET: 'MATCHES/GET',
  SET: 'MATCHES/SET',
  GET_SINGLE: 'MATCHES/GET_SINGLE',
  SET_STATUS: 'MATCHES/SET_STATUS',
  SET_SUB_STATUS: 'MATCHES/SET_SUB_STATUS',
  GET_CRICKET: 'MATCHES/GET_CRICKET',
  GET_FOOTBALL: 'MATCHES/GET_FOOTBALL',
};

// ============================================================================
// Cricket Match Actions
// ============================================================================
export const CRICKET = {
  // Score actions
  ADD_SCORE: 'CRICKET/ADD_SCORE',
  GET_BATTING_SCORE: 'CRICKET/GET_BATTING_SCORE',
  GET_BOWLING_SCORE: 'CRICKET/GET_BOWLING_SCORE',
  GET_WICKET_FALLEN: 'CRICKET/GET_WICKET_FALLEN',
  ADD_WICKET_FALLEN: 'CRICKET/ADD_WICKET_FALLEN',
  
  // Player actions
  ADD_BATSMAN: 'CRICKET/ADD_BATSMAN',
  ADD_BOWLER: 'CRICKET/ADD_BOWLER',
  UPDATE_BATSMAN_SCORE: 'CRICKET/UPDATE_BATSMAN_SCORE',
  UPDATE_BOWLER_SCORE: 'CRICKET/UPDATE_BOWLER_SCORE',
  SET_CURRENT_BATSMAN: 'CRICKET/SET_CURRENT_BATSMAN',
  SET_CURRENT_BOWLER: 'CRICKET/SET_CURRENT_BOWLER',
  GET_PLAYER_SCORE: 'CRICKET/GET_PLAYER_SCORE',
  ADD_PLAYER_SCORE: 'CRICKET/ADD_PLAYER_SCORE',
  GET_HOME_PLAYER: 'CRICKET/GET_HOME_PLAYER',
  GET_AWAY_PLAYER: 'CRICKET/GET_AWAY_PLAYER',
  
  // Inning actions
  GET_INNING_SCORE: 'CRICKET/GET_INNING_SCORE',
  UPDATE_INNING_SCORE: 'CRICKET/UPDATE_INNING_SCORE',
  SET_CURRENT_INNING: 'CRICKET/SET_CURRENT_INNING',
  SET_CURRENT_INNING_NUMBER: 'CRICKET/SET_CURRENT_INNING_NUMBER',
  SET_INNING_STATUS: 'CRICKET/SET_INNING_STATUS',
  SET_INNING_COMPLETED: 'CRICKET/SET_INNING_COMPLETED',
  SET_END_INNING: 'CRICKET/SET_END_INNING',
  INITIALIZE_NEW_INNING: 'CRICKET/INITIALIZE_NEW_INNING',
  
  // Toss and format
  SET_TOSS: 'CRICKET/SET_TOSS',
  SET_BAT_TEAM: 'CRICKET/SET_BAT_TEAM',
  SET_MATCH_FORMAT: 'CRICKET/SET_MATCH_FORMAT',
  
  // Squad
  GET_MATCH_SQUAD: 'CRICKET/GET_MATCH_SQUAD',
  SET_MATCH_SQUAD: 'CRICKET/SET_MATCH_SQUAD',
};

// ============================================================================
// Football Match Actions
// ============================================================================
export const FOOTBALL = {
  // Score actions
  ADD_SCORE: 'FOOTBALL/ADD_SCORE',
  SET_SCORE: 'FOOTBALL/SET_SCORE',
  GET_SCORE: 'FOOTBALL/GET_SCORE',
  
  // Player actions
  GET_PLAYER_SCORE: 'FOOTBALL/GET_PLAYER_SCORE',
  ADD_PLAYER_SCORE: 'FOOTBALL/ADD_PLAYER_SCORE',
  
  // Incidents
  ADD_INCIDENT: 'FOOTBALL/ADD_INCIDENT',
  GET_INCIDENTS: 'FOOTBALL/GET_INCIDENTS',
  RESET_INCIDENTS: 'FOOTBALL/RESET_INCIDENTS',
};

// ============================================================================
// Tournament Actions
// ============================================================================
export const TOURNAMENTS = {
  GET_BY_SPORT: 'TOURNAMENTS/GET_BY_SPORT',
  GET_BY_ID: 'TOURNAMENTS/GET_BY_ID',
  ADD: 'TOURNAMENTS/ADD',
  SET_STANDING: 'TOURNAMENTS/SET_STANDING',
  SET_GROUP: 'TOURNAMENTS/SET_GROUP',
  ADD_GROUP: 'TOURNAMENTS/ADD_GROUP',
  ADD_TEAM_GROUP: 'TOURNAMENTS/ADD_TEAM_GROUP',
  ADD_ENTITIES: 'TOURNAMENTS/ADD_ENTITIES',
  GET_ENTITIES: 'TOURNAMENTS/GET_ENTITIES',
};

// ============================================================================
// Sport Actions
// ============================================================================
export const SPORTS = {
  SET_GAMES: 'SPORTS/SET_GAMES',
  SET_GAME: 'SPORTS/SET_GAME',
};

// ============================================================================
// Club Actions
// ============================================================================
export const CLUBS = {
  CREATE: 'CLUBS/CREATE',
  GET: 'CLUBS/GET',
};

// ============================================================================
// Team Actions
// ============================================================================
export const TEAMS = {
  SET: 'TEAMS/SET',
  GET: 'TEAMS/GET',
  GET_BY_SPORT: 'TEAMS/GET_BY_SPORT',
  GET_PLAYERS: 'TEAMS/GET_PLAYERS',
  SET_PLAYER: 'TEAMS/SET_PLAYER',
};

// ============================================================================
// Validation Actions
// ============================================================================
export const VALIDATION = {
  SET_ERROR: 'VALIDATION/SET_ERROR',
  CLEAR_ERROR: 'VALIDATION/CLEAR_ERROR',
  CLEAR_FORM_ERRORS: 'VALIDATION/CLEAR_FORM_ERRORS',
  CLEAR_ALL_ERRORS: 'VALIDATION/CLEAR_ALL_ERRORS',
};

// ============================================================================
// Loading Actions
// ============================================================================
export const LOADING = {
  SET: 'LOADING/SET',
  CLEAR: 'LOADING/CLEAR',
  CLEAR_ALL: 'LOADING/CLEAR_ALL',
};

// ============================================================================
// Network Actions
// ============================================================================
export const NETWORK = {
  SET_ONLINE_STATUS: 'NETWORK/SET_ONLINE_STATUS',
  SET_CONNECTION_TYPE: 'NETWORK/SET_CONNECTION_TYPE',
  SET_CONNECTION_QUALITY: 'NETWORK/SET_CONNECTION_QUALITY',
  INCREMENT_RECONNECT_ATTEMPTS: 'NETWORK/INCREMENT_RECONNECT_ATTEMPTS',
  RESET_RECONNECT_ATTEMPTS: 'NETWORK/RESET_RECONNECT_ATTEMPTS',
  SET_QUEUED_REQUESTS_COUNT: 'NETWORK/SET_QUEUED_REQUESTS_COUNT',
  RESET_NETWORK_STATE: 'NETWORK/RESET_NETWORK_STATE',
};

// ============================================================================
// Batch Actions
// ============================================================================
export const BATCH_ACTIONS = 'BATCH_ACTIONS';
