/**
 * Analytics Middleware
 * Tracks user actions and events for analytics
 */

/**
 * Analytics event types
 */
const ANALYTICS_EVENTS = {
  // User actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_SIGNUP: 'user_signup',
  
  // Match actions
  MATCH_CREATED: 'match_created',
  MATCH_VIEWED: 'match_viewed',
  MATCH_SCORE_UPDATED: 'match_score_updated',
  
  // Social actions
  THREAD_CREATED: 'thread_created',
  COMMENT_ADDED: 'comment_added',
  USER_FOLLOWED: 'user_followed',
  
  // Tournament actions
  TOURNAMENT_CREATED: 'tournament_created',
  TOURNAMENT_VIEWED: 'tournament_viewed',
  
  // Error events
  ERROR_OCCURRED: 'error_occurred',
};

/**
 * Maps Redux action types to analytics events
 */
const ACTION_TO_EVENT_MAP = {
  'AUTH/SET_AUTHENTICATED': (action) => {
    if (action.payload === true) {
      return { event: ANALYTICS_EVENTS.USER_LOGIN };
    }
    return null;
  },
  
  'AUTH/LOGOUT': () => ({
    event: ANALYTICS_EVENTS.USER_LOGOUT,
  }),
  
  'USER/CREATE': () => ({
    event: ANALYTICS_EVENTS.USER_SIGNUP,
  }),
  
  'MATCHES/SET': (action) => ({
    event: ANALYTICS_EVENTS.MATCH_CREATED,
    properties: {
      sport: action.payload?.sport,
      match_type: action.payload?.match_type,
    },
  }),
  
  'MATCHES/GET_SINGLE': (action) => ({
    event: ANALYTICS_EVENTS.MATCH_VIEWED,
    properties: {
      match_id: action.payload?.id,
    },
  }),
  
  'CRICKET/UPDATE_INNING_SCORE': () => ({
    event: ANALYTICS_EVENTS.MATCH_SCORE_UPDATED,
    properties: {
      sport: 'cricket',
    },
  }),
  
  'FOOTBALL/SET_SCORE': () => ({
    event: ANALYTICS_EVENTS.MATCH_SCORE_UPDATED,
    properties: {
      sport: 'football',
    },
  }),
  
  'THREADS/ADD': () => ({
    event: ANALYTICS_EVENTS.THREAD_CREATED,
  }),
  
  'COMMENTS/ADD': () => ({
    event: ANALYTICS_EVENTS.COMMENT_ADDED,
  }),
  
  'USER/FOLLOW': (action) => ({
    event: ANALYTICS_EVENTS.USER_FOLLOWED,
    properties: {
      followed_user_id: action.payload?.userId,
    },
  }),
  
  'TOURNAMENTS/ADD': (action) => ({
    event: ANALYTICS_EVENTS.TOURNAMENT_CREATED,
    properties: {
      sport: action.payload?.sport,
      tournament_type: action.payload?.type,
    },
  }),
  
  'ERROR/GLOBAL': (action) => ({
    event: ANALYTICS_EVENTS.ERROR_OCCURRED,
    properties: {
      error_type: action.payload?.type,
      error_message: action.payload?.message,
    },
  }),
};

/**
 * Analytics service interface
 * Replace with your actual analytics service (Firebase, Amplitude, etc.)
 */
class AnalyticsService {
  static trackEvent(eventName, properties = {}) {
    if (__DEV__) {
      console.log('📊 Analytics Event:', eventName, properties);
    }
    
    // TODO: Integrate with actual analytics service
    // Example: Firebase Analytics
    // analytics().logEvent(eventName, properties);
    
    // Example: Amplitude
    // amplitude.track(eventName, properties);
  }
  
  static setUserId(userId) {
    if (__DEV__) {
      console.log('👤 Analytics User ID:', userId);
    }
    
    // TODO: Set user ID in analytics service
    // analytics().setUserId(userId);
  }
  
  static setUserProperties(properties) {
    if (__DEV__) {
      console.log('👤 Analytics User Properties:', properties);
    }
    
    // TODO: Set user properties in analytics service
    // analytics().setUserProperties(properties);
  }
}

/**
 * Analytics middleware
 * Tracks Redux actions as analytics events
 */
const analyticsMiddleware = (store) => (next) => (action) => {
  // Execute action first
  const result = next(action);
  
  try {
    // Check if action should be tracked
    const eventMapper = ACTION_TO_EVENT_MAP[action.type];
    
    if (eventMapper) {
      const eventData = eventMapper(action);
      
      if (eventData) {
        const { event, properties = {} } = eventData;
        
        // Add common properties
        const enrichedProperties = {
          ...properties,
          timestamp: Date.now(),
          action_type: action.type,
        };
        
        // Track event
        AnalyticsService.trackEvent(event, enrichedProperties);
      }
    }
    
    // Track user identification
    if (action.type === 'USER/SET' && action.payload?.id) {
      AnalyticsService.setUserId(action.payload.id);
      AnalyticsService.setUserProperties({
        username: action.payload.username,
        created_at: action.payload.created_at,
      });
    }
  } catch (error) {
    // Don't break the app if analytics fails
    console.error('Analytics middleware error:', error);
  }
  
  return result;
};

/**
 * Screen view tracking middleware
 * Tracks navigation events as screen views
 */
export const screenViewMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Track navigation actions (React Navigation)
  if (action.type?.includes('Navigation/')) {
    try {
      const routeName = action.payload?.routeName || action.payload?.name;
      
      if (routeName) {
        AnalyticsService.trackEvent('screen_view', {
          screen_name: routeName,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Screen view tracking error:', error);
    }
  }
  
  return result;
};

export { ANALYTICS_EVENTS, AnalyticsService };
export default analyticsMiddleware;
