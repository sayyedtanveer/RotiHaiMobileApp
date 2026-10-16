import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';

import { partnerApi } from '../../../core/api/partnerApi';
import { PartnerDashboardMetrics } from '../../../core/api/partner.types';

export function PartnerHomeScreen() {
  const [data, setData] = useState<PartnerDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const metrics = await partnerApi.getDashboardMetrics();
        setData(metrics);
      } catch (error) {
        Alert.alert('Dashboard error', error instanceof Error ? error.message : 'Unable to load metrics');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1f9d68" />
        <Text style={styles.loadingText}>Loading dashboard</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Partner Dashboard</Text>
      <Text style={styles.title}>Today&apos;s overview</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>Orders</Text>
          <Text style={styles.value}>{data?.totalOrders ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Pending</Text>
          <Text style={styles.value}>{data?.pendingOrders ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Revenue</Text>
          <Text style={styles.value}>₹{data?.totalRevenue ?? 0}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dashboard status</Text>
        <Text style={styles.emptyText}>Connected to backend partner routes.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.8,
    color: '#1f9d68',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flexBasis: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    color: '#666',
    fontSize: 13,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
});
