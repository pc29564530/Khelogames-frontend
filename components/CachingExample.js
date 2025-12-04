import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useApiCache, useCacheManager, usePrefetch } from '../hooks/useApiCache';
import { useOffline } from '../hooks/useOffline';
import { useTheme } from '../hooks/useTheme';

/**
 * Caching Example Component
 * 
 * Demonstrates the caching system features:
 * - API response caching with different strategies
 * - Offline data access
 * - Cache management
 * - Prefetching
 */
const CachingExample = () => {
  const theme = useTheme();

  // Example 1: Cache-first strategy for static data
  const {
    data: tournaments,
    loading: tournamentsLoading,
    error: tournamentsError,
    refetch: refetchTournaments,
  } = useApiCache(
    { url: '/tournaments', method: 'GET' },
    {
      strategy: 'cache-first',
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      enabled: true,
    }
  );

  // Example 2: Stale-while-revalidate for dynamic data
  const {
    data: matches,
    loading: matchesLoading,
    error: matchesError,
    refetch: refetchMatches,
  } = useApiCache(
    { url: '/matches/upcoming', method: 'GET' },
    {
      strategy: 'stale-while-revalidate',
      ttl: 5 * 60 * 1000, // 5 minutes
      enabled: true,
    }
  );

  // Cache management
  const { invalidate, clearAll, getStats } = useCacheManager();

  // Prefetching
  const { prefetch, batchPrefetch } = usePrefetch();

  // Offline functionality
  const {
    isOnline,
    isOffline,
    syncQueueCount,
    prefetchCriticalData,
    syncData,
  } = useOffline();

  // Prefetch critical data on mount
  useEffect(() => {
    if (isOnline) {
      prefetchCriticalData();
    }
  }, [isOnline, prefetchCriticalData]);

  const handleInvalidateMatches = async () => {
    await invalidate('/matches');
    refetchMatches();
  };

  const handleClearCache = async () => {
    await clearAll();
    refetchTournaments();
    refetchMatches();
  };

  const handleShowStats = async () => {
    const stats = await getStats();
    console.log('Cache Statistics:', stats);
    alert(`Cache Stats:\nTotal Entries: ${stats.total.entries}\nTotal Size: ${stats.total.sizeMB}MB`);
  };

  const handlePrefetch = async () => {
    await batchPrefetch([
      { url: '/tournaments', method: 'GET' },
      { url: '/matches/upcoming', method: 'GET' },
      { url: '/teams', method: 'GET' },
    ]);
    alert('Data prefetched successfully!');
  };

  const handleSync = async () => {
    const results = await syncData();
    alert(`Synced ${results.successful}/${results.total} actions`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Caching System Demo
        </Text>

        {/* Network Status */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Network Status
          </Text>
          <Text style={[styles.cardText, { color: theme.colors.text.secondary }]}>
            Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
          </Text>
          {syncQueueCount > 0 && (
            <Text style={[styles.cardText, { color: theme.colors.text.secondary }]}>
              Pending Actions: {syncQueueCount}
            </Text>
          )}
          {!isOnline && syncQueueCount > 0 && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={handleSync}
            >
              <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
                Sync Now
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cache-First Example */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Cache-First Strategy
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.colors.text.secondary }]}>
            Tournaments (24h TTL)
          </Text>
          {tournamentsLoading && (
            <Text style={[styles.cardText, { color: theme.colors.text.secondary }]}>
              Loading...
            </Text>
          )}
          {tournamentsError && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              Error: {tournamentsError.message}
            </Text>
          )}
          {tournaments && (
            <Text style={[styles.cardText, { color: theme.colors.text.secondary }]}>
              Loaded {Array.isArray(tournaments) ? tournaments.length : 0} tournaments
            </Text>
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.secondary }]}
            onPress={refetchTournaments}
          >
            <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
              Force Refresh
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stale-While-Revalidate Example */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Stale-While-Revalidate
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.colors.text.secondary }]}>
            Upcoming Matches (5m TTL)
          </Text>
          {matchesLoading && (
            <Text style={[styles.cardText, { color: theme.colors.text.secondary }]}>
              Loading...
            </Text>
          )}
          {matchesError && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              Error: {matchesError.message}
            </Text>
          )}
          {matches && (
            <Text style={[styles.cardText, { color: theme.colors.text.secondary }]}>
              Loaded {Array.isArray(matches) ? matches.length : 0} matches
            </Text>
          )}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.secondary }]}
            onPress={handleInvalidateMatches}
          >
            <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
              Invalidate & Refresh
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cache Management */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Cache Management
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleShowStats}
            >
              <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
                Show Stats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: theme.colors.primary }]}
              onPress={handlePrefetch}
            >
              <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
                Prefetch Data
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.error }]}
            onPress={handleClearCache}
          >
            <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
              Clear All Cache
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CachingExample;
