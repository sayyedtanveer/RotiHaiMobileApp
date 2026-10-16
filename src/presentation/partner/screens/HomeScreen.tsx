import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Partner Home</Text>
      <Text style={styles.title}>Today&apos;s overview</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.label}>Orders</Text>
          <Text style={styles.value}>12</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Pending</Text>
          <Text style={styles.value}>5</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Revenue</Text>
          <Text style={styles.value}>₹2,450</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Incoming orders</Text>
        <Text style={styles.emptyText}>No new orders currently.</Text>
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
