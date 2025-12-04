/**
 * MemoizedTournamentListItem - Optimized tournament list item
 */

import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const TournamentListItem = ({ tournament, onPress }) => {
  const startDate = tournament.start_timestamp
    ? new Date(tournament.start_timestamp * 1000).toLocaleDateString()
    : "TBD";

  const getStatusStyle = () => {
    switch (tournament.status) {
      case 'live':
        return styles.statusLive;
      case 'finished':
        return styles.statusFinished;
      case 'not_started':
        return styles.statusNotStarted;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <FontAwesome name="trophy" size={32} color="gold" style={styles.icon} />
        
        <View style={styles.info}>
          <Text style={styles.name}>{tournament.name}</Text>
          <View style={styles.meta}>
            {tournament.season && (
              <Text style={styles.metaText}>Season {tournament.season}</Text>
            )}
            {tournament.country && (
              <Text style={styles.metaText}>{tournament.country}</Text>
            )}
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, getStatusStyle()]}>
            <Text style={styles.statusText}>
              {tournament.status || "not_started"}
            </Text>
          </View>
          <Text style={styles.dateText}>{startDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusLive: {
    backgroundColor: '#D1FAE5',
  },
  statusFinished: {
    backgroundColor: '#FEE2E2',
  },
  statusNotStarted: {
    backgroundColor: '#FEF3C7',
  },
  statusDefault: {
    backgroundColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

TournamentListItem.propTypes = {
  tournament: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    public_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    status: PropTypes.string,
    season: PropTypes.string,
    country: PropTypes.string,
    start_timestamp: PropTypes.number,
  }).isRequired,
  onPress: PropTypes.func,
};

// Memoize with custom comparison
const MemoizedTournamentListItem = memo(
  TournamentListItem,
  (prevProps, nextProps) => {
    return (
      prevProps.tournament.id === nextProps.tournament.id &&
      prevProps.tournament.status === nextProps.tournament.status &&
      prevProps.onPress === nextProps.onPress
    );
  }
);

MemoizedTournamentListItem.displayName = 'MemoizedTournamentListItem';

export default MemoizedTournamentListItem;
