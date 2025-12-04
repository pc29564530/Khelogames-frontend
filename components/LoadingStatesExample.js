/**
 * LoadingStatesExample component
 * Demonstrates usage of all loading state components
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Button, Text, Skeleton, Spinner, ProgressBar } from './atoms';
import {
  MatchListSkeleton,
  TournamentListSkeleton,
  PlayerListSkeleton,
} from './molecules';
import theme from '../theme';

const LoadingStatesExample = () => {
  const [progress, setProgress] = useState(0.3);
  const [showSkeletons, setShowSkeletons] = useState(true);

  const incrementProgress = () => {
    setProgress((prev) => Math.min(prev + 0.1, 1));
  };

  const resetProgress = () => {
    setProgress(0);
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="h1" style={styles.title}>
        Loading States Examples
      </Text>

      {/* Skeleton Components */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>
          Skeleton Components
        </Text>
        
        <Text variant="body1" style={styles.description}>
          Basic Skeleton Variants:
        </Text>
        
        <View style={styles.skeletonRow}>
          <Skeleton width={100} height={20} variant="rect" />
          <Skeleton width={50} height={50} variant="circle" />
          <Skeleton width={150} height={16} variant="text" />
        </View>

        <Text variant="body1" style={styles.description}>
          Custom Skeleton:
        </Text>
        <Skeleton width="100%" height={100} borderRadius={theme.borderRadius.lg} />
      </View>

      {/* Spinner Components */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>
          Spinner Components
        </Text>
        
        <Text variant="body1" style={styles.description}>
          Different Sizes:
        </Text>
        
        <View style={styles.spinnerRow}>
          <View style={styles.spinnerItem}>
            <Spinner size="xs" />
            <Text variant="caption" style={styles.label}>XS</Text>
          </View>
          <View style={styles.spinnerItem}>
            <Spinner size="sm" />
            <Text variant="caption" style={styles.label}>SM</Text>
          </View>
          <View style={styles.spinnerItem}>
            <Spinner size="md" />
            <Text variant="caption" style={styles.label}>MD</Text>
          </View>
          <View style={styles.spinnerItem}>
            <Spinner size="lg" />
            <Text variant="caption" style={styles.label}>LG</Text>
          </View>
          <View style={styles.spinnerItem}>
            <Spinner size="xl" />
            <Text variant="caption" style={styles.label}>XL</Text>
          </View>
        </View>

        <Text variant="body1" style={styles.description}>
          Custom Colors:
        </Text>
        
        <View style={styles.spinnerRow}>
          <Spinner size="lg" color={theme.colors.primary.main} />
          <Spinner size="lg" color={theme.colors.secondary.main} />
          <Spinner size="lg" color={theme.colors.success.main} />
          <Spinner size="lg" color={theme.colors.error.main} />
        </View>
      </View>

      {/* ProgressBar Components */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>
          ProgressBar Components
        </Text>
        
        <Text variant="body1" style={styles.description}>
          Determinate Progress ({Math.round(progress * 100)}%):
        </Text>
        <ProgressBar progress={progress} />
        
        <View style={styles.buttonRow}>
          <Button
            variant="outline"
            size="sm"
            onPress={incrementProgress}
            accessibilityLabel="Increment progress"
            style={styles.button}
          >
            +10%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={resetProgress}
            accessibilityLabel="Reset progress"
            style={styles.button}
          >
            Reset
          </Button>
        </View>

        <Text variant="body1" style={styles.description}>
          Indeterminate Progress:
        </Text>
        <ProgressBar indeterminate />

        <Text variant="body1" style={styles.description}>
          Custom Height and Color:
        </Text>
        <ProgressBar
          progress={0.7}
          height={8}
          color={theme.colors.success.main}
        />
      </View>

      {/* Skeleton Screens */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>
          Skeleton Screens
        </Text>
        
        <Button
          variant="outline"
          size="sm"
          onPress={() => setShowSkeletons(!showSkeletons)}
          accessibilityLabel="Toggle skeleton screens"
          style={styles.toggleButton}
        >
          {showSkeletons ? 'Hide' : 'Show'} Skeletons
        </Button>

        {showSkeletons && (
          <>
            <Text variant="body1" style={styles.description}>
              Match List Skeleton:
            </Text>
            <MatchListSkeleton count={2} />

            <Text variant="body1" style={styles.description}>
              Tournament List Skeleton:
            </Text>
            <TournamentListSkeleton count={2} />

            <Text variant="body1" style={styles.description}>
              Player List Skeleton:
            </Text>
            <PlayerListSkeleton count={3} />
          </>
        )}
      </View>

      {/* Button Loading States */}
      <View style={styles.section}>
        <Text variant="h2" style={styles.sectionTitle}>
          Button Loading States
        </Text>
        
        <Text variant="body1" style={styles.description}>
          Buttons with loading prop:
        </Text>
        
        <Button
          variant="primary"
          loading
          onPress={() => {}}
          accessibilityLabel="Loading button"
          style={styles.button}
        >
          Submit
        </Button>

        <Button
          variant="secondary"
          loading
          onPress={() => {}}
          accessibilityLabel="Loading button"
          style={styles.button}
        >
          Save
        </Button>

        <Button
          variant="outline"
          loading
          onPress={() => {}}
          accessibilityLabel="Loading button"
          style={styles.button}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  title: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  description: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.secondary,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  spinnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  spinnerItem: {
    alignItems: 'center',
  },
  label: {
    marginTop: theme.spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  button: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  toggleButton: {
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
  },
});

export default LoadingStatesExample;
