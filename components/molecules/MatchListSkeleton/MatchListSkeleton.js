/**
 * MatchListSkeleton component
 * Skeleton screen for match list loading state
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Skeleton } from '../../atoms';
import theme from '../../../theme';

const MatchListSkeleton = ({ count = 3, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.matchCard}>
          {/* Match header */}
          <View style={styles.header}>
            <Skeleton width={120} height={16} variant="text" />
            <Skeleton width={60} height={20} borderRadius={theme.borderRadius.sm} />
          </View>

          {/* Teams */}
          <View style={styles.teamsContainer}>
            {/* Home team */}
            <View style={styles.team}>
              <Skeleton width={40} height={40} variant="circle" />
              <View style={styles.teamInfo}>
                <Skeleton width={100} height={16} variant="text" style={styles.teamName} />
                <Skeleton width={40} height={24} variant="text" />
              </View>
            </View>

            {/* VS divider */}
            <Skeleton width={30} height={16} variant="text" />

            {/* Away team */}
            <View style={styles.team}>
              <View style={styles.teamInfo}>
                <Skeleton width={100} height={16} variant="text" style={styles.teamName} />
                <Skeleton width={40} height={24} variant="text" />
              </View>
              <Skeleton width={40} height={40} variant="circle" />
            </View>
          </View>

          {/* Match footer */}
          <View style={styles.footer}>
            <Skeleton width={80} height={14} variant="text" />
            <Skeleton width={100} height={14} variant="text" />
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
  matchCard: {
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamInfo: {
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  teamName: {
    marginBottom: theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
});

MatchListSkeleton.propTypes = {
  count: PropTypes.number,
  testID: PropTypes.string,
};

export default MatchListSkeleton;
