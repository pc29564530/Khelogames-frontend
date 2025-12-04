/**
 * AnimationsExample - Demonstration of animation components
 * 
 * This file showcases all the animation components created for Task 19:
 * - Button press animations with haptic feedback
 * - List item animations with swipe actions
 * - Modal and overlay animations
 * - Score update animations with celebrations
 * 
 * @component
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text as RNText,
} from 'react-native';
import {
  Button,
  AnimatedScore,
  CelebrationAnimation,
  AnimatedStat,
} from './atoms';
import {
  AnimatedListItem,
  AnimatedModal,
  AnimatedOverlay,
  OptimizedFlatList,
} from './molecules';
import theme from '../theme';

const AnimationsExample = () => {
  // Button animation states
  const [buttonLoading, setButtonLoading] = useState(false);

  // List animation states
  const [listData] = useState([
    { id: '1', title: 'Item 1', description: 'Swipe left or right' },
    { id: '2', title: 'Item 2', description: 'Swipe left or right' },
    { id: '3', title: 'Item 3', description: 'Swipe left or right' },
  ]);

  // Modal animation states
  const [slideModalVisible, setSlideModalVisible] = useState(false);
  const [fadeModalVisible, setFadeModalVisible] = useState(false);
  const [scaleModalVisible, setScaleModalVisible] = useState(false);

  // Score animation states
  const [score, setScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Stat animation states
  const [statValue, setStatValue] = useState(0);
  const [previousStatValue, setPreviousStatValue] = useState(0);

  const handleButtonPress = () => {
    setButtonLoading(true);
    setTimeout(() => setButtonLoading(false), 2000);
  };

  const handleScoreIncrease = () => {
    setPreviousScore(score);
    setScore(score + 1);
    setShowCelebration(true);
  };

  const handleStatIncrease = () => {
    setPreviousStatValue(statValue);
    setStatValue(statValue + 10);
  };

  const renderListItem = ({ item, index }) => (
    <AnimatedListItem
      index={index}
      swipeEnabled={true}
      onSwipeLeft={() => console.log('Swiped left:', item.title)}
      onSwipeRight={() => console.log('Swiped right:', item.title)}
      style={styles.listItem}
    >
      <View style={styles.listItemContent}>
        <RNText style={styles.listItemTitle}>{item.title}</RNText>
        <RNText style={styles.listItemDescription}>{item.description}</RNText>
      </View>
    </AnimatedListItem>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Section 1: Button Animations */}
      <View style={styles.section}>
        <RNText style={styles.sectionTitle}>Button Press Animations</RNText>
        <RNText style={styles.sectionDescription}>
          Buttons with scale animation and haptic feedback
        </RNText>
        
        <View style={styles.buttonRow}>
          <Button
            variant="primary"
            size="md"
            onPress={handleButtonPress}
            loading={buttonLoading}
            accessibilityLabel="Primary button with animation"
            style={styles.button}
          >
            Press Me
          </Button>

          <Button
            variant="secondary"
            size="md"
            onPress={() => console.log('Secondary pressed')}
            accessibilityLabel="Secondary button"
            style={styles.button}
          >
            Secondary
          </Button>
        </View>
      </View>

      {/* Section 2: List Animations */}
      <View style={styles.section}>
        <RNText style={styles.sectionTitle}>List Item Animations</RNText>
        <RNText style={styles.sectionDescription}>
          Items fade in and slide up. Swipe left or right for actions.
        </RNText>
        
        <OptimizedFlatList
          data={listData}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          scrollEnabled={false}
        />
      </View>

      {/* Section 3: Modal Animations */}
      <View style={styles.section}>
        <RNText style={styles.sectionTitle}>Modal Animations</RNText>
        <RNText style={styles.sectionDescription}>
          Different animation types for modals
        </RNText>
        
        <View style={styles.buttonRow}>
          <Button
            variant="outline"
            size="sm"
            onPress={() => setSlideModalVisible(true)}
            accessibilityLabel="Show slide modal"
            style={styles.button}
          >
            Slide Up
          </Button>

          <Button
            variant="outline"
            size="sm"
            onPress={() => setFadeModalVisible(true)}
            accessibilityLabel="Show fade modal"
            style={styles.button}
          >
            Fade
          </Button>

          <Button
            variant="outline"
            size="sm"
            onPress={() => setScaleModalVisible(true)}
            accessibilityLabel="Show scale modal"
            style={styles.button}
          >
            Scale
          </Button>
        </View>
      </View>

      {/* Section 4: Score Animations */}
      <View style={styles.section}>
        <RNText style={styles.sectionTitle}>Score Update Animations</RNText>
        <RNText style={styles.sectionDescription}>
          Animated score with celebration effects
        </RNText>
        
        <View style={styles.scoreContainer}>
          <AnimatedScore
            score={score}
            previousScore={previousScore}
            size="lg"
            enableCelebration={true}
            testID="animated-score"
          />
        </View>

        <Button
          variant="primary"
          size="md"
          onPress={handleScoreIncrease}
          accessibilityLabel="Increase score"
          style={styles.centerButton}
        >
          Score Goal! 🎉
        </Button>
      </View>

      {/* Section 5: Stat Animations */}
      <View style={styles.section}>
        <RNText style={styles.sectionTitle}>Stat Transition Animations</RNText>
        <RNText style={styles.sectionDescription}>
          Smooth counting animation for statistics
        </RNText>
        
        <View style={styles.statContainer}>
          <AnimatedStat
            value={statValue}
            previousValue={previousStatValue}
            duration={1000}
            decimals={0}
            suffix=" pts"
            size="lg"
            testID="animated-stat"
          />
        </View>

        <Button
          variant="secondary"
          size="md"
          onPress={handleStatIncrease}
          accessibilityLabel="Increase stat"
          style={styles.centerButton}
        >
          Add 10 Points
        </Button>
      </View>

      {/* Modals */}
      <AnimatedModal
        visible={slideModalVisible}
        onClose={() => setSlideModalVisible(false)}
        animationType="slide"
        position="bottom"
      >
        <RNText style={styles.modalTitle}>Slide Up Modal</RNText>
        <RNText style={styles.modalText}>
          This modal slides up from the bottom with a spring animation.
        </RNText>
        <Button
          variant="primary"
          size="md"
          onPress={() => setSlideModalVisible(false)}
          accessibilityLabel="Close modal"
          style={styles.modalButton}
        >
          Close
        </Button>
      </AnimatedModal>

      <AnimatedModal
        visible={fadeModalVisible}
        onClose={() => setFadeModalVisible(false)}
        animationType="fade"
        position="center"
      >
        <RNText style={styles.modalTitle}>Fade Modal</RNText>
        <RNText style={styles.modalText}>
          This modal fades in at the center of the screen.
        </RNText>
        <Button
          variant="primary"
          size="md"
          onPress={() => setFadeModalVisible(false)}
          accessibilityLabel="Close modal"
          style={styles.modalButton}
        >
          Close
        </Button>
      </AnimatedModal>

      <AnimatedModal
        visible={scaleModalVisible}
        onClose={() => setScaleModalVisible(false)}
        animationType="scale"
        position="center"
      >
        <RNText style={styles.modalTitle}>Scale Modal</RNText>
        <RNText style={styles.modalText}>
          This modal scales up from the center with a gentle spring.
        </RNText>
        <Button
          variant="primary"
          size="md"
          onPress={() => setScaleModalVisible(false)}
          accessibilityLabel="Close modal"
          style={styles.modalButton}
        >
          Close
        </Button>
      </AnimatedModal>

      {/* Celebration Animation */}
      <CelebrationAnimation
        visible={showCelebration}
        onComplete={() => setShowCelebration(false)}
        type="goal"
        intensity="medium"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  button: {
    marginVertical: theme.spacing.xs,
    minWidth: 120,
  },
  centerButton: {
    alignSelf: 'center',
    marginTop: theme.spacing.md,
  },
  list: {
    maxHeight: 300,
  },
  listItem: {
    marginVertical: theme.spacing.xs,
  },
  listItemContent: {
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.card,
  },
  listItemTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  listItemDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.card,
  },
  statContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.card,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  modalText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  modalButton: {
    marginTop: theme.spacing.md,
  },
});

export default AnimationsExample;
