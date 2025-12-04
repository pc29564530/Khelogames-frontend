# Component Organization

This directory follows the **Atomic Design** methodology for organizing React Native components.

## Structure

```
components/
├── atoms/           # Basic building blocks
├── molecules/       # Simple combinations of atoms
├── organisms/       # Complex components
├── form/           # Specialized form components
├── modals/         # Modal dialogs and overlays
└── index.js        # Central export point
```

## Atomic Design Principles

### Atoms
Basic building blocks that can't be broken down further without losing their meaning.

**Examples:**
- `Button` - Interactive button component
- `Text` - Styled text component
- `Input` - Form input field
- `Icon` - Icon wrapper
- `Spinner` - Loading spinner
- `Skeleton` - Skeleton loading placeholder

**Location:** `components/atoms/`

**Import:**
```javascript
import { Button, Text, Input } from '@/components/atoms';
// or
import Button from '@/components/atoms/Button/Button';
```

### Molecules
Simple combinations of atoms that form functional units.

**Examples:**
- `Card` - Container with consistent styling
- `FormField` - Input with label and error message
- `ListItem` - Reusable list item component
- `EmptyState` - Empty state with icon and message
- `AnimatedModal` - Modal with animations

**Location:** `components/molecules/`

**Import:**
```javascript
import { Card, FormField, ListItem } from '@/components/molecules';
// or
import Card from '@/components/molecules/Card/Card';
```

### Organisms
Complex components composed of molecules and atoms that form distinct sections of the interface.

**Examples:**
- `CricketScoreCard` - Complete cricket scoring interface
- `PlayerStats` - Player statistics display
- `ThreadItems` - Social thread list
- `ErrorBoundary` - Error handling wrapper

**Location:** `components/organisms/`

**Import:**
```javascript
import { CricketScoreCard, PlayerStats } from '@/components/organisms';
```

### Forms
Specialized form components for different use cases.

**Examples:**
- `StandardIncidentForm` - Standard incident form
- `SubstitutionIncidentForm` - Player substitution form
- `PeriodIncidentForm` - Period-based incident form

**Location:** `components/form/`

**Import:**
```javascript
import { StandardIncidentForm } from '@/components/form';
```

### Modals
Modal dialogs and overlay components.

**Examples:**
- `StatusModal` - Status display modal
- Cricket-specific modals (in `modals/cricket/`)
- Football-specific modals (in `modals/football/`)

**Location:** `components/modals/`

**Import:**
```javascript
import { StatusModal } from '@/components/modals';
```

## Container vs Presentational Components

### Presentational Components
- Focus on how things look
- Receive data and callbacks via props
- Rarely have their own state (only UI state)
- Written as functional components

**Example:**
```javascript
// Presentational Component
const PlayerCard = ({ player, onPress }) => (
  <Card onPress={onPress}>
    <Text>{player.name}</Text>
    <Text>{player.stats}</Text>
  </Card>
);
```

### Container Components
- Focus on how things work
- Connect to Redux or other state management
- Provide data and behavior to presentational components
- Handle business logic

**Example:**
```javascript
// Container Component
const PlayerCardContainer = ({ playerId }) => {
  const player = useSelector(state => selectPlayerById(state, playerId));
  const dispatch = useDispatch();
  
  const handlePress = () => {
    dispatch(viewPlayerDetails(playerId));
  };
  
  return <PlayerCard player={player} onPress={handlePress} />;
};
```

## Import Guidelines

### Recommended: Named imports from index
```javascript
import { Button, Text, Card, EmptyState } from '@/components';
```

### Alternative: Direct imports for specific components
```javascript
import Button from '@/components/atoms/Button/Button';
import Card from '@/components/molecules/Card/Card';
```

### Avoid: Importing from root component files
```javascript
// ❌ Don't do this
import Button from '@/components/Button';

// ✅ Do this instead
import { Button } from '@/components';
```

## Component File Structure

Each component should follow this structure:

```
ComponentName/
├── ComponentName.js          # Main component file
├── ComponentName.styles.js   # Styles (if using StyleSheet)
├── ComponentName.test.js     # Tests
├── index.js                  # Re-export
└── README.md                 # Documentation (optional)
```

## Best Practices

1. **Single Responsibility**: Each component should do one thing well
2. **Composition over Inheritance**: Build complex UIs by composing simple components
3. **Props over State**: Prefer props for data flow, use state only for UI state
4. **Accessibility**: Always include accessibility props (accessibilityLabel, accessibilityRole, etc.)
5. **Performance**: Use React.memo for expensive components, useCallback for callbacks
6. **Testing**: Write tests for all components, focusing on user interactions
7. **Documentation**: Add JSDoc comments for complex components

## Migration Notes

Components are gradually being migrated to this structure. Some legacy components may still exist in the root `components/` directory. These will be moved to the appropriate atomic design category over time.

## Related Documentation

- [Atoms Documentation](./atoms/README.md)
- [Molecules Documentation](./molecules/README.md)
- [Design System](../theme/README.md)
- [Testing Guide](../__tests__/README.md)
