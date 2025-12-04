# Animations Quick Reference

Quick reference guide for using animation components in the Khelogames application.

## Import Statements

```javascript
// Atoms
import {
  Button,
  AnimatedScore,
  CelebrationAnimation,
  AnimatedStat,
} from './components/atoms';

// Molecules
import {
  AnimatedListItem,
  AnimatedModal,
  AnimatedOverlay,
  OptimizedFlatList,
} from './components/molecules';
```

## Common Use Cases

### 1. Animated Button
```javascript
<Button
  variant="primary"
  onPress={handlePress}
  loading={isLoading}
  enableHaptic={true}
  enableAnimation={true}
  accessibilityLabel="Submit"
>
  Submit
</Button>
```

### 2. List with Animated Items
```javascript
<OptimizedFlatList
  data={items}
  renderItem={({ item, index }) => (
    <AnimatedListItem
      index={index}
      swipeEnabled={true}
      onSwipeLeft={() => handleDelete(item)}
      onSwipeRight={() => handleArchive(item)}
    >
      <YourListItem item={item} />
    </AnimatedListItem>
  )}
  keyExtractor={(item) => item.id}
  onRefresh={handleRefresh}
  refreshing={isRefreshing}
/>
```

### 3. Bottom Sheet Modal
```javascript
const [visible, setVisible] = useState(false);

<AnimatedModal
  visible={visible}
  onClose={() => setVisible(false)}
  animationType="slide"
  position="bottom"
>
  <Text>Modal Content</Text>
  <Button onPress={() => setVisible(false)}>Close</Button>
</AnimatedModal>
```

### 4. Dialog Modal
```javascript
<AnimatedModal
  visible={showDialog}
  onClose={() => setShowDialog(false)}
  animationType="scale"
  position="center"
>
  <Text>Are you sure?</Text>
  <Button onPress={handleConfirm}>Confirm</Button>
</AnimatedModal>
```

### 5. Live Score Display
```javascript
const [score, setScore] = useState(0);
const [prevScore, setPrevScore] = useState(0);

const updateScore = (newScore) => {
  setPrevScore(score);
  setScore(newScore);
};

<AnimatedScore
  score={score}
  previousScore={prevScore}
  size="lg"
  enableCelebration={true}
/>
```

### 6. Goal Celebration
```javascript
const [showCelebration, setShowCelebration] = useState(false);

const handleGoal = () => {
  updateScore(score + 1);
  setShowCelebration(true);
};

<CelebrationAnimation
  visible={showCelebration}
  onComplete={() => setShowCelebration(false)}
  type="goal"
  intensity="medium"
/>
```

### 7. Stat Counter
```javascript
const [stat, setStat] = useState(0);
const [prevStat, setPrevStat] = useState(0);

const updateStat = (newValue) => {
  setPrevStat(stat);
  setStat(newValue);
};

<AnimatedStat
  value={stat}
  previousValue={prevStat}
  duration={500}
  decimals={0}
  suffix=" pts"
  size="md"
/>
```

### 8. Overlay
```javascript
<AnimatedOverlay
  visible={showOverlay}
  onPress={() => setShowOverlay(false)}
  opacity={0.5}
/>
```

## Animation Types

### Modal Animations
- **slide**: Bottom sheet style (slides up from bottom)
- **fade**: Smooth opacity transition (center)
- **scale**: Gentle scale-up (center, dialog style)

### Celebration Types
- **goal**: Green particles (football/soccer)
- **wicket**: Red particles (cricket)
- **milestone**: Orange particles (achievements)

### Intensity Levels
- **low**: 100px particle spread
- **medium**: 150px particle spread
- **high**: 200px particle spread

## Props Quick Reference

### Button
- `enableHaptic`: boolean (default: true)
- `enableAnimation`: boolean (default: true)

### AnimatedListItem
- `index`: number (for stagger)
- `swipeEnabled`: boolean
- `onSwipeLeft`: function
- `onSwipeRight`: function
- `animateOnMount`: boolean (default: true)

### AnimatedModal
- `visible`: boolean (required)
- `onClose`: function (required)
- `animationType`: 'slide' | 'fade' | 'scale'
- `position`: 'bottom' | 'center' | 'top'
- `backdropOpacity`: number (0-1)
- `closeOnBackdropPress`: boolean

### AnimatedScore
- `score`: number | string (required)
- `previousScore`: number | string
- `size`: 'sm' | 'md' | 'lg'
- `enableCelebration`: boolean
- `enableHaptic`: boolean

### CelebrationAnimation
- `visible`: boolean (required)
- `onComplete`: function
- `type`: 'goal' | 'wicket' | 'milestone'
- `intensity`: 'low' | 'medium' | 'high'

### AnimatedStat
- `value`: number (required)
- `previousValue`: number
- `duration`: number (ms)
- `decimals`: number
- `prefix`: string
- `suffix`: string

## Performance Tips

1. **Use Native Driver**: All animations use native driver by default
2. **Memoize Callbacks**: Use `useCallback` for swipe handlers
3. **Limit Particles**: Keep celebration particles under 30
4. **Disable When Needed**: Disable animations for accessibility
5. **Test on Device**: Always test animations on real devices

## Accessibility

All animation components support:
- Configurable enable/disable
- Screen reader compatibility
- Proper accessibility labels
- Haptic feedback (optional)

To disable animations globally:
```javascript
<Button enableAnimation={false} enableHaptic={false} />
<AnimatedScore enableCelebration={false} enableHaptic={false} />
```

## Common Patterns

### Score Update Flow
```javascript
const [score, setScore] = useState(0);
const [prevScore, setPrevScore] = useState(0);
const [showCelebration, setShowCelebration] = useState(false);

const handleScoreUpdate = (newScore) => {
  setPrevScore(score);
  setScore(newScore);
  
  if (newScore > score) {
    setShowCelebration(true);
  }
};

return (
  <>
    <AnimatedScore
      score={score}
      previousScore={prevScore}
      enableCelebration={true}
    />
    <CelebrationAnimation
      visible={showCelebration}
      onComplete={() => setShowCelebration(false)}
      type="goal"
    />
  </>
);
```

### Modal with Form
```javascript
const [visible, setVisible] = useState(false);
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  await submitForm();
  setLoading(false);
  setVisible(false);
};

return (
  <AnimatedModal
    visible={visible}
    onClose={() => setVisible(false)}
    animationType="slide"
    position="bottom"
  >
    <FormFields />
    <Button
      onPress={handleSubmit}
      loading={loading}
      enableAnimation={true}
    >
      Submit
    </Button>
  </AnimatedModal>
);
```

## Troubleshooting

### Animation Not Working
- Check `useNativeDriver` is true
- Verify animation values are initialized
- Ensure component is mounted

### Haptic Not Working
- Test on physical device (not simulator)
- Check device haptic settings
- Verify Vibration permission

### Performance Issues
- Reduce particle count in celebrations
- Disable animations on low-end devices
- Use `shouldComponentUpdate` or `React.memo`

## See Also

- [Full Documentation](./ANIMATIONS_README.md)
- [Example Implementation](./AnimationsExample.js)
- [Task Summary](../docs/TASK_19_ANIMATIONS_SUMMARY.md)
