import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function OrdersDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order details</Text>
      <Text style={styles.body}>This screen will show the current backend order detail flow.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#111',
  },
  body: {
    color: '#666',
    fontSize: 16,
  },
});
