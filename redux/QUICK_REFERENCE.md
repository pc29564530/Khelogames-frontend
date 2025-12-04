# Redux Quick Reference Guide

## Using Selectors

### Import Selectors
```javascript
import { 
  selectCurrentUser,
  selectIsAuthenticated,
  selectLiveMatches 
} from 'redux/selectors';
```

### Use in Components
```javascript
const MyComponent = () => {
  const user = useSelector(selectCurrentUser);
  const isAuth = useSelector(selectIsAuthenticated);
  const liveMatches = useSelector(selectLiveMatches);
  
  // Component only re-renders when these values change
};
```

### Selectors with Parameters
```javascript
import { selectMatchById } from 'redux/selectors';

const MatchDetail = ({ matchId }) => {
  const match = useSelector(state => selectMatchById(state, matchId));
};
```

## Action Batching

### Basic Batching
```javascript
import { batchActions } from 'redux/utils/actionBatching';

dispatch(batchActions([
  { type: 'ACTION_1', payload: data1 },
  { type: 'ACTION_2', payload: data2 },
  { type: 'ACTION_3', payload: data3 },
]));
```

### Pre-built Helpers
```javascript
import { 
  batchCricketScoreUpdate,
  batchMatchUpdate,
  batchUserProfileUpdate 
} from 'redux/utils/actionBatching';

// Cricket score update
dispatch(batchCricketScoreUpdate(
  battingUpdate,
  bowlingUpdate,
  inningUpdate
));

// Match update
dispatch(batchMatchUpdate(
  matchId,
  { status_code: 'in_progress' },
  { home_score: 2, away_score: 1 }
));

// User profile update
dispatch(batchUserProfileUpdate({
  avatar: newAvatar,
  fullName: newName,
  description: newBio
}));
```

## Action Constants

### Import Constants
```javascript
import { AUTH, USER, MATCHES, CRICKET } from 'redux/types/actionConstants';
```

### Use in Actions
```javascript
dispatch({ type: AUTH.LOGIN, payload: credentials });
dispatch({ type: USER.SET, payload: userData });
dispatch({ type: MATCHES.SET_STATUS, payload: { matchId, status } });
dispatch({ type: CRICKET.UPDATE_BATSMAN_SCORE, payload: score });
```

## Creating Custom Selectors

### Simple Selector
```javascript
import { createSelector } from 'reselect';

const selectUserState = state => state.user;

export const selectUserEmail = createSelector(
  [selectUserState],
  (user) => user.email
);
```

### Derived Selector
```javascript
import { createSelector } from 'reselect';
import { selectAllMatches } from './matchesSelectors';

export const selectUpcomingMatches = createSelector(
  [selectAllMatches],
  (matches) => matches.filter(m => m.status === 'upcoming')
);
```

### Selector with Parameters
```javascript
export const selectMatchesBySport = createSelector(
  [selectAllMatches, (_, sportId) => sportId],
  (matches, sportId) => matches.filter(m => m.sport_id === sportId)
);

// Usage
const cricketMatches = useSelector(state => 
  selectMatchesBySport(state, 'cricket')
);
```

## Writing Reducers with Immer

### Basic Pattern
```javascript
import { produce } from 'immer';

const reducer = (state = initialState, action) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'UPDATE_USER':
        draft.user.name = action.payload.name;
        draft.user.email = action.payload.email;
        break;
        
      case 'ADD_ITEM':
        draft.items.push(action.payload);
        break;
        
      case 'REMOVE_ITEM':
        const index = draft.items.findIndex(i => i.id === action.payload);
        draft.items.splice(index, 1);
        break;
    }
  });
};
```

### Nested Updates
```javascript
return produce(state, (draft) => {
  draft.matches.forEach(stage => {
    if (stage.league_stage) {
      stage.league_stage.forEach(match => {
        if (match.id === matchId) {
          match.status = newStatus;
        }
      });
    }
  });
});
```

## Debugging

### Access Action History
```javascript
// In browser console (development only)
window.__REDUX_ACTION_HISTORY__
```

### Enable Detailed Logging
```javascript
// In redux/middleware/index.js
import { createLoggerMiddleware } from './loggingMiddleware';

const logger = createLoggerMiddleware({
  collapsed: false,  // Expand all logs
  diff: true,        // Show state diffs
  actionFilter: [],  // Don't filter any actions
});
```

### Monitor Performance
```javascript
// Slow actions are automatically logged in development
// Look for: ⚠️ Slow action detected: ACTION_TYPE took XXXms
```

## Common Patterns

### Loading States
```javascript
import { selectIsOperationLoading } from 'redux/selectors';

const MyComponent = () => {
  const isLoading = useSelector(state => 
    selectIsOperationLoading(state, 'fetchMatches')
  );
  
  if (isLoading) return <Spinner />;
  // ...
};
```

### Form Validation
```javascript
import { selectFormErrors, selectIsFormValid } from 'redux/selectors';

const MyForm = () => {
  const errors = useSelector(state => selectFormErrors(state, 'loginForm'));
  const isValid = useSelector(state => selectIsFormValid(state, 'loginForm'));
  
  // ...
};
```

### Conditional Rendering
```javascript
import { selectIsAuthenticated, selectAuthLoading } from 'redux/selectors';

const App = () => {
  const isAuth = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  
  if (loading) return <Splash />;
  if (!isAuth) return <Login />;
  return <MainApp />;
};
```

## Best Practices

1. ✅ Always use selectors instead of direct state access
2. ✅ Batch related actions together
3. ✅ Use organized action constants
4. ✅ Create derived selectors for computed data
5. ✅ Use Immer for complex state updates
6. ✅ Let middleware handle errors
7. ✅ Monitor performance in development
8. ✅ Keep selectors pure and simple

## Anti-Patterns

1. ❌ Don't access state directly: `state.user.user`
2. ❌ Don't create objects in selectors: `{ ...user }`
3. ❌ Don't dispatch multiple related actions separately
4. ❌ Don't mutate state without Immer
5. ❌ Don't ignore error handling
6. ❌ Don't create selectors with side effects
7. ❌ Don't use string literals for action types

## Need Help?

- See `redux/README.md` for comprehensive documentation
- Check `docs/TASK_15_REDUX_OPTIMIZATION_SUMMARY.md` for implementation details
- Review selector files in `redux/selectors/` for examples
- Look at middleware files in `redux/middleware/` for advanced patterns
