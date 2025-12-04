/**
 * Performance Monitor Example
 * Demonstrates how to use performance monitoring in the application
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import usePerformanceTracking, {
  useApiPerformanceTracking,
  usePerformanceMetrics,
} from '../hooks/usePerformanceTracking';
import performanceMonitor from '../services/performanceMonitor';

const PerformanceMonitorExample = () => {
  // Track this screen's performance
  const { markInteractive, getAverageLoadTime } = usePerformanceTracking(
    'PerformanceMonitorExample',
    { autoTrack: true }
  );

  const { trackRequest, getSlowEndpoints } = useApiPerformanceTracking();
  const { getAllMetrics, getPerformanceSummary, getMemoryUsage } = usePerformanceMetrics();

  const [metrics, setMetrics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoading(false);
      
      // Mark screen as interactive after data loads
      markInteractive();
    };

    loadData();
  }, [markInteractive]);

  const handleSimulateApiCall = async () => {
    const endpoints = [
      '/api/matches',
      '/api/tournaments',
      '/api/players/:id',
      '/api/teams',
    ];

    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const request = trackRequest(randomEndpoint);

    // Simulate API call with random delay
    const delay = Math.random() * 3000 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    request.end(true);

    alert(`API call to ${randomEndpoint} completed in ${Math.round(delay)}ms`);
  };

  const handleViewMetrics = () => {
    const allMetrics = getAllMetrics();
    setMetrics(allMetrics);
  };

  const handleViewSummary = () => {
    const perfSummary = getPerformanceSummary();
    setSummary(perfSummary);
  };

  const handleCheckMemory = () => {
    const memoryUsage = getMemoryUsage();
    alert(`Current memory usage: ${memoryUsage.toFixed(2)} MB`);
  };

  const handleViewSlowEndpoints = () => {
    const slowEndpoints = getSlowEndpoints(1000);
    if (slowEndpoints.length === 0) {
      alert('No slow endpoints detected');
    } else {
      const message = slowEndpoints
        .map(
          (ep, idx) =>
            `${idx + 1}. ${ep.endpoint}\n   Avg: ${ep.averageResponseTime}ms (${ep.requestCount} requests)`
        )
        .join('\n\n');
      alert(`Slow Endpoints:\n\n${message}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Performance Monitor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Monitor</Text>
        <Text style={styles.subtitle}>
          Track screen load times, API performance, and memory usage
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Screen Performance</Text>
        <Text style={styles.description}>
          This screen is automatically tracked. Average load time:{' '}
          {getAverageLoadTime() || 'N/A'}ms
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Performance Testing</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSimulateApiCall}
          accessibilityLabel="Simulate API call"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Simulate API Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleViewSlowEndpoints}
          accessibilityLabel="View slow endpoints"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>View Slow Endpoints</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleViewMetrics}
          accessibilityLabel="View all metrics"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>View All Metrics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleViewSummary}
          accessibilityLabel="View performance summary"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>View Summary</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Memory Monitoring</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleCheckMemory}
          accessibilityLabel="Check memory usage"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Check Memory Usage</Text>
        </TouchableOpacity>
      </View>

      {metrics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metrics Data</Text>
          <ScrollView style={styles.metricsContainer}>
            <Text style={styles.metricsText}>
              {JSON.stringify(metrics, null, 2)}
            </Text>
          </ScrollView>
        </View>
      )}

      {summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Screens Tracked: {summary.totalScreensTracked}
            </Text>
            <Text style={styles.summaryText}>
              Endpoints Tracked: {summary.totalEndpointsTracked}
            </Text>
            <Text style={styles.summaryText}>
              Slow Screens: {summary.slowScreens.length}
            </Text>
            <Text style={styles.summaryText}>
              Slow Endpoints: {summary.slowEndpoints.length}
            </Text>
            <Text style={styles.summaryText}>
              Memory Usage: {summary.currentMemoryUsage.toFixed(2)} MB
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usage Instructions</Text>
        <Text style={styles.instructions}>
          1. Use usePerformanceTracking hook in screens to track load times{'\n'}
          2. Use useApiPerformanceTracking to manually track API calls{'\n'}
          3. API calls are automatically tracked with Axios interceptor{'\n'}
          4. Memory usage is monitored every 30 seconds{'\n'}
          5. View metrics and summaries to identify performance issues
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  metricsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    maxHeight: 300,
  },
  metricsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default PerformanceMonitorExample;
