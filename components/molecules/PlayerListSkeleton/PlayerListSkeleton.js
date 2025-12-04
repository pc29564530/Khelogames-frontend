/**
 * PlayerListSkeleton component
 * Skeleton screen for player list loading state
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Skeleton } from '../../atoms';
import theme from '../../../theme';

const PlayerListSkeleton = ({ count = 5, testID }) => {
  return (
    <View style={styles.container} testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.playerItem}>
          {/* Player avatar */}
          <Skeleton width={50} height={50} variant="circle" />

          {/* Player info */}
          <View style={styles.info}>
            <Skeleton width={120} height={16} variant="text" style={styles.name} />
            <Skeleton width={80} height={14} variant="text" />
          </View>

          {/* Player stats */}
          <View style={styles.stats}>
            <Skeleton width={40} height={14} variant="text" />
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
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.default,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.card,
  },
  info: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  name: {
    marginBottom: theme.spacing.xs,
  },
  stats: {
    alignItems: 'flex-end',
  },
});

PlayerListSkeleton.propTypes = {
  count: PropTypes.number,
  testID: PropTypes.string,
};

export default PlayerListSkeleton;
