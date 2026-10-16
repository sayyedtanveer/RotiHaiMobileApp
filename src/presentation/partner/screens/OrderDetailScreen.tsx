import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export function OrderDetailScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Order #RH10245</Text>
      <Text style={styles.badge}>Late Pre-order</Text>
      <Text style={styles.badgeSecondary}>Chef Confirmation Required</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Customer</Text>
        <Text style={styles.value}>Asha Patel</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.value}>₹450</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>Confirmed</Text>
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
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
  },
  badge: {
    backgroundColor: '#fff4d6',
    color: '#8a5b00',
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '700',
    overflow: 'hidden',
  },
  badgeSecondary: {
    backgroundColor: '#e8f6ee',
    color: '#166b4f',
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '700',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
  },
  label: {
    color: '#666',
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: '#111',
    fontSize: 18,
    fontWeight: '700',
  },
});
