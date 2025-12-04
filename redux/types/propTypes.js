/**
 * PropTypes definitions for Redux state and common data structures
 * These can be imported and used across components for type checking
 */

import PropTypes from 'prop-types';

/**
 * User PropTypes
 */
export const UserPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  email: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  avatar: PropTypes.string,
  bio: PropTypes.string,
  followersCount: PropTypes.number,
  followingCount: PropTypes.number,
  createdAt: PropTypes.string,
});

/**
 * Player PropTypes
 */
export const PlayerPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  position: PropTypes.string,
  jerseyNumber: PropTypes.number,
  avatar: PropTypes.string,
  stats: PropTypes.object,
  teamId: PropTypes.string,
});

/**
 * Team PropTypes
 */
export const TeamPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  logo: PropTypes.string,
  sport: PropTypes.oneOf(['cricket', 'football']).isRequired,
  players: PropTypes.arrayOf(PlayerPropType),
  captainId: PropTypes.string,
  coachName: PropTypes.string,
});

/**
 * Match PropTypes
 */
export const MatchPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  homeTeam: TeamPropType.isRequired,
  awayTeam: TeamPropType.isRequired,
  sport: PropTypes.oneOf(['cricket', 'football']).isRequired,
  status: PropTypes.oneOf(['scheduled', 'live', 'completed', 'cancelled']).isRequired,
  startTime: PropTypes.string,
  venue: PropTypes.string,
  score: PropTypes.object,
  tournamentId: PropTypes.string,
});

/**
 * Cricket Score PropTypes
 */
export const CricketScorePropType = PropTypes.shape({
  runs: PropTypes.number.isRequired,
  wickets: PropTypes.number.isRequired,
  overs: PropTypes.number.isRequired,
  balls: PropTypes.number,
  extras: PropTypes.shape({
    wides: PropTypes.number,
    noBalls: PropTypes.number,
    byes: PropTypes.number,
    legByes: PropTypes.number,
  }),
});

/**
 * Football Score PropTypes
 */
export const FootballScorePropType = PropTypes.shape({
  goals: PropTypes.number.isRequired,
  penalties: PropTypes.number,
  yellowCards: PropTypes.number,
  redCards: PropTypes.number,
});

/**
 * Tournament PropTypes
 */
export const TournamentPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  sport: PropTypes.oneOf(['cricket', 'football']).isRequired,
  format: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  teams: PropTypes.arrayOf(TeamPropType),
  matches: PropTypes.arrayOf(MatchPropType),
  status: PropTypes.oneOf(['upcoming', 'ongoing', 'completed']),
});

/**
 * Club PropTypes
 */
export const ClubPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  logo: PropTypes.string,
  description: PropTypes.string,
  sport: PropTypes.oneOf(['cricket', 'football']),
  membersCount: PropTypes.number,
  createdBy: PropTypes.string,
  createdAt: PropTypes.string,
});

/**
 * Community PropTypes
 */
export const CommunityPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  avatar: PropTypes.string,
  membersCount: PropTypes.number,
  postsCount: PropTypes.number,
  isPrivate: PropTypes.bool,
  createdBy: PropTypes.string,
  createdAt: PropTypes.string,
});

/**
 * Thread PropTypes
 */
export const ThreadPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  content: PropTypes.string.isRequired,
  author: UserPropType.isRequired,
  communityId: PropTypes.string,
  likesCount: PropTypes.number,
  commentsCount: PropTypes.number,
  media: PropTypes.arrayOf(PropTypes.string),
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string,
});

/**
 * Comment PropTypes
 */
export const CommentPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  author: UserPropType.isRequired,
  threadId: PropTypes.string.isRequired,
  parentId: PropTypes.string,
  likesCount: PropTypes.number,
  createdAt: PropTypes.string.isRequired,
});

/**
 * Redux State PropTypes
 */

/**
 * Auth State
 */
export const AuthStatePropType = PropTypes.shape({
  user: UserPropType,
  token: PropTypes.string,
  refreshToken: PropTypes.string,
  isAuthenticated: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
});

/**
 * Loading State
 */
export const LoadingStatePropType = PropTypes.shape({
  global: PropTypes.bool,
  matches: PropTypes.bool,
  tournaments: PropTypes.bool,
  players: PropTypes.bool,
  clubs: PropTypes.bool,
  communities: PropTypes.bool,
  threads: PropTypes.bool,
});

/**
 * Error State
 */
export const ErrorStatePropType = PropTypes.shape({
  global: PropTypes.shape({
    message: PropTypes.string,
    type: PropTypes.oneOf(['network', 'validation', 'server', 'unknown']),
    timestamp: PropTypes.number,
  }),
  network: PropTypes.shape({
    isOnline: PropTypes.bool.isRequired,
    quality: PropTypes.oneOf(['excellent', 'good', 'poor', 'offline']),
  }),
  validation: PropTypes.objectOf(
    PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string))
  ),
});

/**
 * Network State
 */
export const NetworkStatePropType = PropTypes.shape({
  isConnected: PropTypes.bool.isRequired,
  type: PropTypes.string,
  isInternetReachable: PropTypes.bool,
  quality: PropTypes.oneOf(['excellent', 'good', 'poor', 'offline']),
});

/**
 * WebSocket State
 */
export const WebSocketStatePropType = PropTypes.shape({
  connected: PropTypes.bool.isRequired,
  connecting: PropTypes.bool.isRequired,
  error: PropTypes.string,
  lastMessage: PropTypes.object,
  subscriptions: PropTypes.arrayOf(PropTypes.string),
});

/**
 * Pagination PropTypes
 */
export const PaginationPropType = PropTypes.shape({
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  total: PropTypes.number,
  hasMore: PropTypes.bool.isRequired,
});

/**
 * API Response PropTypes
 */
export const ApiResponsePropType = PropTypes.shape({
  data: PropTypes.any,
  error: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  success: PropTypes.bool,
});

/**
 * Navigation PropTypes
 */
export const NavigationPropType = PropTypes.shape({
  navigate: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  setParams: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
});

export const RoutePropType = PropTypes.shape({
  key: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  params: PropTypes.object,
});

/**
 * Theme PropTypes
 */
export const ThemePropType = PropTypes.shape({
  colors: PropTypes.shape({
    primary: PropTypes.string.isRequired,
    secondary: PropTypes.string.isRequired,
    background: PropTypes.string.isRequired,
    surface: PropTypes.string.isRequired,
    error: PropTypes.string.isRequired,
    success: PropTypes.string.isRequired,
    warning: PropTypes.string.isRequired,
    text: PropTypes.shape({
      primary: PropTypes.string.isRequired,
      secondary: PropTypes.string.isRequired,
      disabled: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  typography: PropTypes.shape({
    fontFamily: PropTypes.shape({
      regular: PropTypes.string.isRequired,
      medium: PropTypes.string.isRequired,
      bold: PropTypes.string.isRequired,
    }).isRequired,
    fontSize: PropTypes.shape({
      xs: PropTypes.number.isRequired,
      sm: PropTypes.number.isRequired,
      md: PropTypes.number.isRequired,
      lg: PropTypes.number.isRequired,
      xl: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  spacing: PropTypes.shape({
    xs: PropTypes.number.isRequired,
    sm: PropTypes.number.isRequired,
    md: PropTypes.number.isRequired,
    lg: PropTypes.number.isRequired,
    xl: PropTypes.number.isRequired,
  }).isRequired,
});

/**
 * Style PropTypes
 */
export const StylePropType = PropTypes.oneOfType([
  PropTypes.object,
  PropTypes.array,
  PropTypes.number,
]);

/**
 * Children PropTypes
 */
export const ChildrenPropType = PropTypes.oneOfType([
  PropTypes.node,
  PropTypes.arrayOf(PropTypes.node),
]);
