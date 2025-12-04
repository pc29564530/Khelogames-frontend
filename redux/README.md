# Redux State Management

This directory contains the Redux state management implementation for the Khelogames application, optimized for performance, maintainability, and developer experience.

## Directory Structure

```
redux/
├── actions/          # Action creators
├── reducers/         # State reducers
├── selectors/        # Memoized selectors
├── middleware/       # Custom middleware
├── types/            # Action type constants
├── utils/            # Redux utilities
└── store.js          # Store configuration
```

## Key Features

### 1. Memoized Selectors (Reselect)

Selectors are organized by feature domain and use memoization to prevent unnecessary recalculations.

**Usage:**
```javascript
import { selectIsAuthenticated, selectCurrentUser } from 'redux/selectors';

const MyComponent = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  
  // ...
};
```

**Available Selector Modules:**
- `authSelectors` - Authentication state
- `userSelectors` - User profile and social data
- `matchesSelectors` - Match data with complex nested structures
- `tournamentSelectors` - Tournament data
- `cricketSelectors` - Cricket-specific match data
- `footballSelectors` - Football-specific match data
- `validationSelectors` - Form validation errors
- `loadingSelectors` - Loading states

**Benefits:**
- Prevents unnecessary re-renders
- Computes derived data efficiently
- Improves component performance

### 2. Optimized Reducers (Immer)

Reducers use Immer for immutable state updates with mutable syntax.

**Example:**
```javascript
import { produce } from 'immer';

const reducer = (state = initialState, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'UPDATE_USER':
        // Mutate draft directly - Immer handles immutability
        draft.user.name = action.payload.name;
        break;
    }
  });
};
```

**Benefits:**
- Simpler, more readable code
- Automatic immutability
- Better performance for complex updates

### 3. Action Batching

Batch multiple actions into a single dispatch to reduce re-renders.

**Usage:**
```javascript
import { batchActions, batchCricketScoreUpdate } from 'redux/utils/actionBatching';

// Batch multiple actions
dispatch(batchActions([
  { type: 'ACTION_1', payload: data1 },
  { type: 'ACTION_2', payload: data2 },
]));

// Use pre-built batching helpers
dispatch(batchCricketScoreUpdate(
  battingUpdate,
  bowlingUpdate,
  inningUpdate
));
```

**Available Batching Helpers:**
- `batchCricketScoreUpdate` - Batch cricket score updates
- `batchMatchUpdate` - Batch match status and score
- `batchUserProfileUpdate` - Batch user profile changes
- `batchLoadingStates` - Batch loading state changes

### 4. Middleware

#### Error Handling Middleware

Catches and handles errors in actions and reducers.

**Features:**
- Catches async action errors
- Handles network errors specifically
- Dispatches error actions for UI handling
- Logs errors for debugging

#### Logging Middleware (Development Only)

Logs actions and state changes with detailed information.

**Features:**
- Collapsible log groups
- State diff visualization
- Performance timing
- Action filtering
- Action history tracking

**Configuration:**
```javascript
import { createLoggerMiddleware } from 'redux/middleware';

const logger = createLoggerMiddleware({
  collapsed: true,
  diff: true,
  actionFilter: ['NOISY_ACTION'],
});
```

#### Analytics Middleware

Tracks user actions for analytics.

**Features:**
- Automatic event tracking
- User identification
- Screen view tracking
- Custom event mapping

**Integration:**
```javascript
// Update AnalyticsService in analyticsMiddleware.js
class AnalyticsService {
  static trackEvent(eventName, properties) {
    // Your analytics service (Firebase, Amplitude, etc.)
    analytics().logEvent(eventName, properties);
  }
}
```

#### Performance Middleware

Monitors action performance and logs slow actions.

**Configuration:**
```javascript
import { performanceMiddleware } from 'redux/middleware';

// Log actions taking longer than 100ms
const perfMiddleware = performanceMiddleware(100);
```

## Best Practices

### 1. Use Selectors

Always use selectors instead of accessing state directly:

```javascript
// ❌ Bad
const user = useSelector(state => state.user.user);

// ✅ Good
const user = useSelector(selectCurrentUser);
```

### 2. Batch Related Updates

When updating multiple related pieces of state:

```javascript
// ❌ Bad - Multiple dispatches
dispatch(updateBatsman(data));
dispatch(updateBowler(data));
dispatch(updateInning(data));

// ✅ Good - Single batched dispatch
dispatch(batchCricketScoreUpdate(
  batsmanData,
  bowlerData,
  inningData
));
```

### 3. Use Action Constants

Use organized action constants from `types/actionConstants.js`:

```javascript
import { AUTH, USER, MATCHES } from 'redux/types/actionConstants';

dispatch({ type: AUTH.LOGIN, payload: credentials });
dispatch({ type: USER.SET, payload: userData });
dispatch({ type: MATCHES.GET, payload: matches });
```

### 4. Leverage Memoization

Create derived selectors for computed data:

```javascript
import { createSelector } from 'reselect';

export const selectActiveMatches = createSelector(
  [selectAllMatches],
  (matches) => matches.filter(m => m.status === 'active')
);
```

### 5. Handle Errors Gracefully

Let middleware handle errors, but provide fallbacks:

```javascript
const fetchData = () => async (dispatch) => {
  try {
    dispatch({ type: LOADING.SET, payload: 'fetchData' });
    const data = await api.getData();
    dispatch({ type: DATA.SET, payload: data });
  } catch (error) {
    // Middleware will handle error logging and UI notification
    // Just ensure loading state is cleared
    dispatch({ type: LOADING.CLEAR, payload: 'fetchData' });
  }
};
```

## Migration Guide

### Migrating to Memoized Selectors

1. Replace direct state access with selectors:
```javascript
// Before
const user = useSelector(state => state.user.user);

// After
import { selectCurrentUser } from 'redux/selectors';
const user = useSelector(selectCurrentUser);
```

2. Create custom selectors for derived data:
```javascript
// Before
const activeMatches = useSelector(state => 
  state.matches.matches.filter(m => m.status === 'active')
);

// After
import { selectActiveMatches } from 'redux/selectors';
const activeMatches = useSelector(selectActiveMatches);
```

### Migrating to Immer Reducers

1. Use the optimized reducer versions:
```javascript
// In reducers/index.js
import matchesReducer from './matchesReducers.optimized';
import validationReducer from './validationReducers.optimized';
```

2. Or update existing reducers to use Immer:
```javascript
import { produce } from 'immer';

const reducer = (state = initialState, action) => {
  return produce(state, (draft) => {
    // Mutate draft directly
  });
};
```

## Performance Tips

1. **Use Shallow Equality**: Most selectors use shallow equality by default
2. **Avoid Creating New Objects**: Selectors should return the same reference when data hasn't changed
3. **Batch Updates**: Use action batching for related updates
4. **Monitor Performance**: Use performance middleware to identify slow actions
5. **Lazy Load**: Only load reducers and selectors when needed

## Debugging

### Action History

In development, access action history via browser console:
```javascript
window.__REDUX_ACTION_HISTORY__
```

### Redux DevTools

The store is configured with Redux DevTools in development:
- Time-travel debugging
- Action replay
- State inspection
- Performance monitoring

### Logging

Enable detailed logging:
```javascript
import { createLoggerMiddleware } from 'redux/middleware';

const logger = createLoggerMiddleware({
  collapsed: false,  // Expand all logs
  diff: true,        // Show state diffs
});
```

## Testing

### Testing Selectors

```javascript
import { selectCurrentUser } from 'redux/selectors';

test('selectCurrentUser returns user from state', () => {
  const state = {
    user: { user: { id: 1, name: 'Test' } }
  };
  
  expect(selectCurrentUser(state)).toEqual({ id: 1, name: 'Test' });
});
```

### Testing Reducers

```javascript
import reducer from './myReducer';

test('handles action correctly', () => {
  const initialState = { count: 0 };
  const action = { type: 'INCREMENT' };
  
  const newState = reducer(initialState, action);
  
  expect(newState.count).toBe(1);
});
```

### Testing Middleware

```javascript
import errorMiddleware from './errorMiddleware';

test('catches errors and dispatches error action', () => {
  const store = mockStore();
  const next = jest.fn();
  const action = { type: 'TEST' };
  
  errorMiddleware(store)(next)(action);
  
  expect(next).toHaveBeenCalledWith(action);
});
```

## Resources

- [Redux Documentation](https://redux.js.org/)
- [Reselect Documentation](https://github.com/reduxjs/reselect)
- [Immer Documentation](https://immerjs.github.io/immer/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
