# Design System Documentation

## Overview

This design system provides a comprehensive set of theme tokens and reusable components for the Khelogames application. It follows atomic design principles and ensures consistency across the entire application.

## Theme Configuration

### Colors

The color palette includes:
- **Primary colors**: Main brand colors for primary actions
- **Secondary colors**: Accent colors for secondary actions
- **Background colors**: Page and surface backgrounds
- **Semantic colors**: Success, error, warning, and info states
- **Text colors**: Primary, secondary, disabled, and hint text
- **Sport-specific colors**: Cricket and football theme colors

```javascript
import { colors } from '../theme';

// Usage
backgroundColor: colors.primary.main
color: colors.text.primary
```

### Typography

Typography scale with predefined variants:
- Headings: h1, h2, h3, h4, h5, h6
- Body text: body1, body2
- Subtitles: subtitle1, subtitle2
- Special: button, caption, overline

```javascript
import { typography } from '../theme';

// Usage
fontSize: typography.fontSize.md
fontWeight: typography.fontWeight.bold
```

### Spacing

8px grid system for consistent spacing:
- Base unit: 8px
- Scale: xxs (4px), xs (8px), sm (12px), md (16px), lg (24px), xl (32px), xxl (40px), xxxl (48px)

```javascript
import { spacing } from '../theme';

// Usage
padding: spacing.md
margin: spacing.lg
```

### Shadows

Elevation levels for depth:
- none, sm, md, lg, xl
- Component-specific: button, card, fab, modal

```javascript
import { shadows } from '../theme';

// Usage
...shadows.md
```

### Border Radius

Consistent corner rounding:
- none (0), sm (4px), md (8px), lg (12px), xl (16px), full (9999px)

```javascript
import { borderRadius } from '../theme';

// Usage
borderRadius: borderRadius.md
```

## Atomic Components

### Button

Versatile button component with multiple variants and sizes.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean
- `icon`: ReactNode
- `onPress`: function (required)
- `accessibilityLabel`: string (required)

**Example:**
```javascript
import { Button } from './components/atoms';

<Button
  variant="primary"
  size="md"
  onPress={handleSubmit}
  accessibilityLabel="Submit form"
>
  Submit
</Button>
```

### Text

Typography component with semantic variants.

**Props:**
- `variant`: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'button' | 'caption' | 'overline'
- `color`: string
- `align`: 'left' | 'center' | 'right' | 'justify'
- `numberOfLines`: number
- `accessibilityLabel`: string

**Example:**
```javascript
import { Text } from './components/atoms';

<Text variant="h1">Welcome</Text>
<Text variant="body1" color={colors.text.secondary}>
  Description text
</Text>
```

### Input

Text input with validation states.

**Props:**
- `value`: string (required)
- `onChangeText`: function (required)
- `placeholder`: string
- `error`: boolean
- `errorMessage`: string
- `disabled`: boolean
- `multiline`: boolean
- `secureTextEntry`: boolean
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `accessibilityLabel`: string

**Example:**
```javascript
import { Input } from './components/atoms';

<Input
  value={email}
  onChangeText={setEmail}
  placeholder="Enter email"
  error={hasError}
  errorMessage="Invalid email"
  keyboardType="email-address"
  accessibilityLabel="Email input"
/>
```

### Icon

Icon wrapper with consistent sizing.

**Props:**
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `color`: string
- `accessibilityLabel`: string

**Example:**
```javascript
import { Icon } from './components/atoms';

<Icon size="md" color={colors.primary.main} accessibilityLabel="Home icon">
  {/* Your icon component */}
</Icon>
```

## Molecular Components

### Card

Container component with elevation and padding.

**Props:**
- `elevation`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `onPress`: function (makes card touchable)
- `accessibilityLabel`: string

**Example:**
```javascript
import { Card } from './components/molecules';

<Card elevation="md" padding="md">
  <Text variant="h3">Card Title</Text>
  <Text variant="body1">Card content</Text>
</Card>
```

### FormField

Complete form field with label and error handling.

**Props:**
- `label`: string
- `value`: string (required)
- `onChangeText`: function (required)
- `error`: boolean
- `errorMessage`: string
- `helperText`: string
- `required`: boolean
- All Input props

**Example:**
```javascript
import { FormField } from './components/molecules';

<FormField
  label="Username"
  value={username}
  onChangeText={setUsername}
  placeholder="Enter username"
  required={true}
  helperText="Choose a unique username"
  error={hasError}
  errorMessage="Username is required"
/>
```

### ListItem

Flexible list item component.

**Props:**
- `title`: string (required)
- `subtitle`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- `rightText`: string
- `onPress`: function
- `disabled`: boolean
- `divider`: boolean
- `accessibilityLabel`: string

**Example:**
```javascript
import { ListItem } from './components/molecules';

<ListItem
  title="Match Details"
  subtitle="View complete match information"
  rightText="View"
  onPress={handlePress}
  accessibilityLabel="View match details"
/>
```

## Usage with Theme Hook

```javascript
import { useTheme } from '../hooks/useTheme';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background.default }}>
      <Text style={{ color: theme.colors.text.primary }}>
        Hello World
      </Text>
    </View>
  );
};
```

## Accessibility Guidelines

All components follow WCAG 2.1 AA standards:

1. **Touch Targets**: Minimum 44x44 points for all interactive elements
2. **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
3. **Accessibility Labels**: Required for all interactive components
4. **Screen Reader Support**: Proper roles and hints for assistive technologies
5. **Focus Management**: Clear focus indicators and logical tab order

## Best Practices

1. **Use theme tokens**: Always use theme values instead of hardcoded colors/spacing
2. **Consistent components**: Use atomic/molecular components instead of custom implementations
3. **Accessibility first**: Always provide accessibility labels and hints
4. **Semantic variants**: Use appropriate typography variants for content hierarchy
5. **Responsive design**: Use spacing scale for consistent layouts across screen sizes

## Example Implementation

See `components/DesignSystemExample.js` for a complete demonstration of all components.
