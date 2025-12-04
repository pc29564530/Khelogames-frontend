/**
 * Deep Linking Configuration
 * 
 * Configures deep linking for the application to handle:
 * - Match details (cricket and football)
 * - Player profiles
 * - Tournament pages
 * - Club pages
 * - Community pages
 * - User profiles
 * 
 * Requirements: 7.3
 */

/**
 * URL prefixes for deep linking
 * These should match your app's URL scheme and domain
 */
const prefixes = [
  'khelogames://',
  'https://khelogames.com',
  'https://*.khelogames.com',
];

/**
 * Deep linking configuration
 * Maps URL paths to screen names and parameters
 */
const deepLinkingConfig = {
  prefixes,
  config: {
    screens: {
      // Authenticated screens
      DrawerNavigation: {
        screens: {
          HomeScreen: {
            screens: {
              BottomTab: {
                screens: {
                  Home: 'home',
                  Matches: 'matches',
                  Community: 'community',
                  Tournament: 'tournaments',
                  Club: 'clubs',
                },
              },
            },
          },
        },
      },
      
      // Match screens
      CricketMatchPage: {
        path: 'match/cricket/:matchId',
        parse: {
          matchId: (matchId) => `${matchId}`,
        },
      },
      FootballMatchPage: {
        path: 'match/football/:matchId',
        parse: {
          matchId: (matchId) => `${matchId}`,
        },
      },
      
      // Player profile
      PlayerProfile: {
        path: 'player/:playerId',
        parse: {
          playerId: (playerId) => `${playerId}`,
        },
      },
      
      // Tournament
      TournamentPage: {
        path: 'tournament/:tournamentId',
        parse: {
          tournamentId: (tournamentId) => `${tournamentId}`,
        },
      },
      
      // Club
      ClubPage: {
        path: 'club/:clubId',
        parse: {
          clubId: (clubId) => `${clubId}`,
        },
      },
      
      // Community
      CommunityPage: {
        path: 'community/:communityId',
        parse: {
          communityId: (communityId) => `${communityId}`,
        },
      },
      
      // User profile
      Profile: {
        path: 'profile/:userId',
        parse: {
          userId: (userId) => `${userId}`,
        },
      },
      
      // Thread/Post
      ThreadComment: {
        path: 'thread/:threadId',
        parse: {
          threadId: (threadId) => `${threadId}`,
        },
      },
      
      // Authentication screens
      SignIn: 'signin',
      SignUp: 'signup',
      
      // Fallback for unmatched routes
      NotFound: '*',
    },
  },
};

/**
 * Helper function to generate deep links
 */
export const generateDeepLink = (screen, params = {}) => {
  const baseUrl = prefixes[0]; // Use app scheme as default
  
  switch (screen) {
    case 'CricketMatchPage':
      return `${baseUrl}match/cricket/${params.matchId}`;
    case 'FootballMatchPage':
      return `${baseUrl}match/football/${params.matchId}`;
    case 'PlayerProfile':
      return `${baseUrl}player/${params.playerId}`;
    case 'TournamentPage':
      return `${baseUrl}tournament/${params.tournamentId}`;
    case 'ClubPage':
      return `${baseUrl}club/${params.clubId}`;
    case 'CommunityPage':
      return `${baseUrl}community/${params.communityId}`;
    case 'Profile':
      return `${baseUrl}profile/${params.userId}`;
    case 'ThreadComment':
      return `${baseUrl}thread/${params.threadId}`;
    default:
      return baseUrl;
  }
};

/**
 * Helper function to parse deep link URL
 */
export const parseDeepLink = (url) => {
  if (!url) return null;
  
  // Remove prefix
  let path = url;
  prefixes.forEach(prefix => {
    if (url.startsWith(prefix)) {
      path = url.replace(prefix, '');
    }
  });
  
  // Parse path segments
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 0) {
    return { screen: 'Home', params: {} };
  }
  
  // Match patterns
  const [type, id] = segments;
  
  switch (type) {
    case 'match':
      const [sport, matchId] = segments.slice(1);
      return {
        screen: sport === 'cricket' ? 'CricketMatchPage' : 'FootballMatchPage',
        params: { matchId },
      };
    case 'player':
      return { screen: 'PlayerProfile', params: { playerId: id } };
    case 'tournament':
      return { screen: 'TournamentPage', params: { tournamentId: id } };
    case 'club':
      return { screen: 'ClubPage', params: { clubId: id } };
    case 'community':
      return { screen: 'CommunityPage', params: { communityId: id } };
    case 'profile':
      return { screen: 'Profile', params: { userId: id } };
    case 'thread':
      return { screen: 'ThreadComment', params: { threadId: id } };
    case 'signin':
      return { screen: 'SignIn', params: {} };
    case 'signup':
      return { screen: 'SignUp', params: {} };
    default:
      return { screen: 'Home', params: {} };
  }
};

/**
 * Handle incoming deep link
 */
export const handleDeepLink = (url, navigation) => {
  const parsed = parseDeepLink(url);
  if (parsed && navigation) {
    navigation.navigate(parsed.screen, parsed.params);
  }
};

/**
 * Get initial URL for deep linking
 */
export const getInitialURL = async () => {
  // Check if app was opened from a deep link
  const { Linking } = require('react-native');
  const url = await Linking.getInitialURL();
  return url;
};

/**
 * Subscribe to deep link events
 */
export const subscribeToDeepLinks = (callback) => {
  const { Linking } = require('react-native');
  
  const handleUrl = ({ url }) => {
    callback(url);
  };
  
  // Add event listener
  const subscription = Linking.addEventListener('url', handleUrl);
  
  // Return cleanup function
  return () => {
    subscription?.remove();
  };
};

export default deepLinkingConfig;
