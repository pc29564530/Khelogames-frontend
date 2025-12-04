# Animation Components Guide

This guide covers all animation components implemented for Task 19: Polish UI with animations and micro-interactions.

## Overview

The application now includes comprehensive animation support across all interactive elements:

- **Button Press Animations**: Scale effects with haptic feedback
- **List Animations**: Enter/exit animations and swipe actions
- **Modal Animations**: Slide, fade, and scale transitions
- **Score Animations**: Celebration effects for goals/wickets
- **Stat Animations**: Smooth number transitions

## Components

### 1. Button Component (Enhanced)

**Location**: `components/atoms/Button/Button.js`

**Features**:
- Scale animation on press (0.95x scale down, then back to 1x)
- Haptic feedback (10ms vibration)
- Rotating loading spinner animation
- Configurable animation enable/disable

**Usage**:
```javascript
import { Button } from './components/atoms';

<Button
  variant="primary"
  size="md"
  onPress={handlePress}
  loading={isLoading}
  enableHaptic={true}        // Enable haptic feedback (default: true)
  enableAnimation={true}      // Enable press animation (default: true)
  accessibilityLabel="Submit"
>
  Submit
</Button>
```

**Props**:
- `enableHaptic` (boolean): Enable/disable haptic feedback
- `enableAnimation` (boolean): Enable/disable press animation
- All existing Button props remain unchanged

---

### 2. AnimatedListItem

**Location**: `components/molecules/AnimatedListItem/AnimatedListItem.js`

**Features**:
- Fade-in animation on mount
- Slide-up animation on mount
- Staggered animation based on index
- Swipe gesture support with left/right actions
- Spring-back animation when swipe threshold not met

**Usage**:
```javascript
import { AnimatedListItem } from './components/molecules';

<AnimatedListItem
  index={index}
  swipeEnabled={true}
  onSwipeLeft={() => console.log('Delete')}
  onSwipeRight={() => console.log('Archive')}
  animateOnMount={true}
  delay={0}  // Optional custom delay
>
  <YourListItemContent />
</AnimatedListItem>
```

**Props**:
- `index` (number): Item index for staggered animation
- `onSwipeLeft` (function): Callback when swiped left
- `onSwipeRight` (function): Callback when swiped right
- `swipeEnabled` (boolean): Enable swipe gestures
- `animateOnMount` (boolean): Enable entrance animation
- `delay` (number): Custom animation delay in ms

---

### 3. OptimizedFlatList (Enhanced)

**Location**: `components/molecules/OptimizedFlatList/OptimizedFlatList.js`

**Features**:
- Animated pull-to-refresh indicator
- Rotating refresh animation
- All existing optimization features preserved

**Usage**:
```javascript
import { OptimizedFlatList } from './components/molecules';

<OptimizedFlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  onRefresh={handleRefresh}
  refreshing={isRefreshing}
  animateItems={true}  // Enable item animations
/>
```

**New Props**:
- `animateItems` (boolean): Enable item entrance animations

---

### 4. AnimatedModal

**Location**: `components/molecules/AnimatedModal/AnimatedModal.js`

**Features**:
- Three animation types: slide, fade, scale
- Three position options: bottom, center, top
- Animated backdrop with configurable opacity
- Keyboard avoiding behavior
- Close on backdrop press (configurable)

**Usage**:
```javascript
import { AnimatedModal } from './components/molecules';

// Slide up from bottom (bottom sheet)
<AnimatedModal
  visible={isVisible}
  onClose={handleClose}
  animationType="slide"
  position="bottom"
  backdropOpacity={0.5}
  closeOnBackdropPress={true}
>
  <YourModalContent />
</AnimatedModal>

// Fade in at center (dialog)
<AnimatedModal
  visible={isVisible}
  onClose={handleClose}
  animationType="fade"
  position="center"
>
  <YourModalContent />
</AnimatedModal>

// Scale up at center (alert)
<AnimatedModal
  visible={isVisible}
  onClose={handleClose}
  animationType="scale"
  position="center"
>
  <YourModalContent />
</AnimatedModal>
```

**Props**:
- `visible` (boolean, required): Modal visibility
- `onClose` (function, required): Close handler
- `animationType` ('slide' | 'fade' | 'scale'): Animation type
- `position` ('bottom' | 'center' | 'top'): Modal position
- `backdropOpacity` (number): Backdrop opacity (0-1)
- `closeOnBackdropPress` (boolean): Close on backdrop tap

---

### 5. AnimatedOverlay

**Location**: `components/molecules/AnimatedOverlay/AnimatedOverlay.js`

**Features**:
- Smooth fade in/out animation
- Configurable opacity and color
- Optional press handler

**Usage**:
```javascript
import { AnimatedOverlay } from './components/molecules';

<AnimatedOverlay
  visible={showOverlay}
  onPress={handleOverlayPress}
  opacity={0.5}
  color="#000000"
/>
```

**Props**:
- `visible` (boolean, required): Overlay visibility
- `onPress` (function): Press handler
- `opacity` (number): Target opacity (0-1)
- `color` (string): Overlay color

---

### 6. AnimatedScore

**Location**: `components/atoms/AnimatedScore/AnimatedScore.js`

**Features**:
- Scale animation on score change
- Color pulse for score increases
- Bounce animation for celebration
- Haptic feedback on score increase
- Configurable celebration intensity

**Usage**:
```javascript
import { AnimatedScore } from './components/atoms';

const [score, setScore] = useState(0);
const [previousScore, setPreviousScore] = useState(0);

const handleScoreChange = (newScore) => {
  setPreviousScore(score);
  setScore(newScore);
};

<AnimatedScore
  score={score}
  previousScore={previousScore}
  size="lg"
  color="#000000"
  celebrationColor="#4CAF50"
  enableCelebration={true}
  enableHaptic={true}
/>
```

**Props**:
- `score` (number | string, required): Current score
- `previousScore` (number | string): Previous score for animation
- `size` ('sm' | 'md' | 'lg'): Display size
- `color` (string): Default text color
- `celebrationColor` (string): Color during celebration
- `enableCelebration` (boolean): Enable celebration animation
- `enableHaptic` (boolean): Enable haptic feedback

---

### 7. CelebrationAnimation

**Location**: `components/atoms/CelebrationAnimation/CelebrationAnimation.js`

**Features**:
- Particle burst animation
- Configurable celebration type (goal, wicket, milestone)
- Three intensity levels (low, medium, high)
- Haptic feedback pattern
- Auto-dismiss after completion

**Usage**:
```javascript
import { CelebrationAnimation } from './components/atoms';

const [showCelebration, setShowCelebration] = useState(false);

const handleGoal = () => {
  setShowCelebration(true);
};

<CelebrationAnimation
  visible={showCelebration}
  onComplete={() => setShowCelebration(false)}
  type="goal"
  intensity="medium"
  enableHaptic={true}
/>
```

**Props**:
- `visible` (boolean, required): Animation visibility
- `onComplete` (function): Callback when animation completes
- `type` ('goal' | 'wicket' | 'milestone'): Celebration type
- `intensity` ('low' | 'medium' | 'high'): Animation intensity
- `enableHaptic` (boolean): Enable haptic feedback

---

### 8. AnimatedStat

**Location**: `components/atoms/AnimatedStat/AnimatedStat.js`

**Features**:
- Smooth number counting animation
- Support for decimal values
- Configurable duration and easing
- Optional prefix/suffix

**Usage**:
```javascript
import { AnimatedStat } from './components/atoms';

const [stat, setStat] = useState(0);
const [previousStat, setPreviousStat] = useState(0);

const handleStatChange = (newStat) => {
  setPreviousStat(stat);
  setStat(newStat);
};

<AnimatedStat
  value={stat}
  previousValue={previousStat}
  duration={500}
  decimals={1}
  prefix="$"
  suffix=" USD"
  size="md"
/>
```

**Props**:
- `value` (number, required): Current value
- `previousValue` (number): Previous value for animation
- `duration` (number): Animation duration in ms
- `decimals` (number): Number of decimal places
- `prefix` (string): Text before value
- `suffix` (string): Text after value
- `size` ('sm' | 'md' | 'lg'): Display size

---

## Animation Configuration

All animations use the centralized theme configuration:

**Location**: `theme/animations.js`

```javascript
const animations = {
  duration: {
    fastest: 100,
    fast: 200,
    normal: 300,
    slow: 400,
    slowest: 500,
  },
  spring: {
    gentle: { tension: 120, friction: 14 },
    standard: { tension: 170, friction: 26 },
    snappy: { tension: 210, friction: 20 },
    bouncy: { tension: 180, friction: 12 },
  },
};
```

## Best Practices

### 1. Performance
- Use `useNativeDriver: true` whenever possible
- Avoid animating layout properties (width, height, padding)
- Prefer transform and opacity animations
- Memoize animation values with `useRef`

### 2. Accessibility
- Provide option to disable animations for users with motion sensitivity
- Ensure animations don't interfere with screen readers
- Keep haptic feedback subtle (10-20ms)
- Maintain accessibility labels during animations

### 3. User Experience
- Keep animations fast (200-300ms for most interactions)
- Use spring animations for natural feel
- Provide visual feedback for all interactions
- Don't overuse celebration animations

### 4. Testing
- Test animations on low-end devices
- Verify animations work with reduced motion settings
- Test haptic feedback on devices that support it
- Ensure animations don't block user interactions

## Example Implementation

See `components/AnimationsExample.js` for a complete demonstration of all animation components.

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 1.2**: Smooth transitions and animations for navigation, modal presentations, and interactive elements
- **Requirement 1.4**: Visual feedback for all user interactions including button presses, form submissions, and gestures
- **Requirement 6.2**: Real-time UI updates within 500 milliseconds for score changes

## Related Documentation

- [Design System Implementation](../docs/DESIGN_SYSTEM_IMPLEMENTATION.md)
- [Performance Monitoring](../docs/PERFORMANCE_MONITORING_README.md)
- [Accessibility Guide](../docs/ACCESSIBILITY_GUIDE.md)
