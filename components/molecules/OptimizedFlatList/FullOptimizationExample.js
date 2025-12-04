/**
 * Full Optimization Example
 * 
 * Demonstrates all list optimization techniques working together:
 * - OptimizedFlatList with proper configuration
 * - Pagination with usePagination hook
 * - Memoized list items
 * - useCallback for event handlers
 * - useMemo for derived data
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import OptimizedFlatList from './OptimizedFlatList';
import { MemoizedTournamentListItem } from '../ListItem';
import usePagination from '../../../hooks/usePagination';
import { getTournamentsBySportPaginated } from '../../../services/paginatedTournamentService';
import EmptyState from '../EmptyState';
import { Spinner } from '../../atoms';

const FullOptimizationExample = ({ axiosInstance, game, navigation }) => {
  const [filter, setFilter] = useState('all');

  // Pagination hook
  const {
    data: tournaments,
    loading,
    refreshing,
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
      dependencies: [game?.id],
    }
  );

  // Memoize filtered data to avoid recalculation on every render
  const filteredTournaments = useMemo(() => {
    if (filter === 'all') return tournaments;
    return tournaments.filter(t => t.status === filter);
  }, [tournaments, filter]);

  // Memoize event handler to maintain stable reference
  const handleTournamentPress = useCallback(
    (tournament) => {
      navigation.navigate('TournamentPage', { tournament });
    },
    [navigation]
  );

  // Memoize render function with stable reference
  const renderTournament = useCallback(
    ({ item }) => (
      <MemoizedTournamentListItem
        tournament={item}
        onPress={() => handleTournamentPress(item)}
      />
    ),
    [handleTournamentPress]
  );

  // Memoize key extractor
  const keyExtractor = useCallback(
    (item) => item.public_id?.toString() || item.id?.toString(),
    []
  );

  // Memoize empty component
  const emptyComponent = useMemo(
    () => (
      <EmptyState
        icon="trophy"
        title="No Tournaments"
        message="Create your first tournament to get started"
        actionLabel="Create Tournament"
        onAction={() => navigation.navigate('CreateTournament')}
      />
    ),
    [navigation]
  );

  if (loading && tournaments.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <OptimizedFlatList
      data={filteredTournaments}
      renderItem={renderTournament}
      keyExtractor={keyExtractor}
      // Performance optimizations
      itemHeight={120}
      windowSize={10}
      maxToRenderPerBatch={10}
      removeClippedSubviews={true}
      initialNumToRender={10}
      // Pagination
      onEndReached={hasMore ? loadMore : undefined}
      onEndReachedThreshold={0.5}
      // Pull to refresh
      onRefresh={refresh}
      refreshing={refreshing}
      // Empty state
      ListEmptyComponent={emptyComponent}
      // Styling
      contentContainerStyle={styles.listContent}
      testID="optimized-tournaments-list"
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
});

export default FullOptimizationExample;
