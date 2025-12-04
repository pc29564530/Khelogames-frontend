import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OptimizedFlatList from './OptimizedFlatList';
import usePagination from '../../../hooks/usePagination';
import { getTournamentsBySportPaginated } from '../../../services/paginatedTournamentService';
import EmptyState from '../EmptyState';
import { Card } from '../Card';
import { Spinner } from '../../atoms';

/**
 * Example: OptimizedFlatList with Pagination
 * 
 * Demonstrates how to use OptimizedFlatList with the usePagination hook
 * for infinite scroll functionality
 */
const OptimizedFlatListExample = ({ axiosInstance, game, navigation }) => {
  // Use pagination hook
  const {
    data: tournaments,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
  } = usePagination(
    async (page, pageSize) => {
      return getTournamentsBySportPaginated(
        { axiosInstance, game },
        page,
        pageSize
      );
    },
    {
      pageSize: 20,
      autoLoad: true,
      dependencies: [game?.id], // Reload when game changes
    }
  );

  /**
   * Render individual tournament item
   */
  const renderTournament = ({ item }) => {
    const startDate = item.start_timestamp
      ? new Date(item.start_timestamp * 1000).toLocaleDateString()
      : "TBD";

    return (
      <Card
        style={styles.card}
        onPress={() => navigation.navigate('TournamentPage', { tournament: item })}
      >
        <View style={styles.cardContent}>
          <View style={styles.tournamentInfo}>
            <Text style={styles.tournamentName}>{item.name}</Text>
            <View style={styles.metaInfo}>
              {item.season && (
                <Text style={styles.metaText}>Season {item.season}</Text>
              )}
              {item.country && (
                <Text style={styles.metaText}>{item.country}</Text>
              )}
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>
                {item.status || "not_started"}
              </Text>
            </View>
            <Text style={styles.dateText}>{startDate}</Text>
          </View>
        </View>
      </Card>
    );
  };

  /**
   * Get status badge style
   */
  const getStatusStyle = (status) => {
    switch (status) {
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

  /**
   * Show loading spinner for initial load
   */
  if (loading && tournaments.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <OptimizedFlatList
      data={tournaments}
      renderItem={renderTournament}
      keyExtractor={(item) => item.public_id?.toString() || item.id?.toString()}
      // Pagination
      onEndReached={hasMore ? loadMore : undefined}
      onEndReachedThreshold={0.5}
      // Pull to refresh
      onRefresh={refresh}
      refreshing={refreshing}
      // Performance optimization
      itemHeight={120} // Fixed height for better performance
      windowSize={10}
      maxToRenderPerBatch={10}
      // Empty state
      ListEmptyComponent={
        <EmptyState
          icon="trophy"
          title="No Tournaments"
          message="Create your first tournament to get started"
          actionLabel="Create Tournament"
          onAction={() => navigation.navigate('CreateTournament')}
        />
      }
      // Styling
      contentContainerStyle={styles.listContent}
      testID="tournaments-list"
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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

export default OptimizedFlatListExample;
