/**
 * TournamentListSkeleton component
 * Skeleton screen for tournament list loading state
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Skeleton } from '../../atoms';
import theme from '../../../theme';

const TournamentListSkeleton = ({ count = 3, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.tournamentCard}>
          {/* Tournament image */}
          <Skeleton width="100%" height={150} borderRadius={theme.borderRadius.lg} />

          {/* Tournament info */}
          <View style={styles.info}>
            <Skeleton width="80%" height={20} variant="text" style={styles.title} />
            <Skeleton width="60%" height={16} variant="text" style={styles.subtitle} />
            
            {/* Stats row */}
            <View style={styles.statsRow}>
              <Skeleton width={60} height={14} variant="text" />
              <Skeleton width={60} height={14} variant="text" />
              <Skeleton width={60} height={14} variant="text" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  tournamentCard: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  info: {
    padding: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
});

TournamentListSkeleton.propTypes = {
  count: PropTypes.number,
  testID: PropTypes.string,
};

export default TournamentListSkeleton;
