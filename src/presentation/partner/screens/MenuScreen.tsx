import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { PartnerProduct } from '../../../core/api/partner.types';
import { partnerApi } from '../../../core/api/partnerApi';

export function MenuScreen() {
  const [products, setProducts] = useState<PartnerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);

  const loadProducts = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      setProducts(await partnerApi.getProducts());
    } catch (error) {
      Alert.alert('Menu error', error instanceof Error ? error.message : 'Unable to load menu items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const updateAvailability = async (product: PartnerProduct, isAvailable: boolean) => {
    setBusyProductId(product.id);
    try {
      const updated = await partnerApi.setProductAvailability(product.id, isAvailable);
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, ...updated } : item));
    } catch (error) {
      Alert.alert('Availability not changed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusyProductId(null);
    }
  };

  const updateFulfillmentMode = async (product: PartnerProduct) => {
    const modes = ['inherit', 'instant', 'preorder'] as const;
    const currentIndex = modes.indexOf((product.fulfillmentMode ?? 'inherit') as typeof modes[number]);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setBusyProductId(product.id);
    try {
      const updated = await partnerApi.setProductFulfillmentMode(product.id, nextMode);
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, ...updated } : item));
    } catch (error) {
      Alert.alert('Mode not changed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusyProductId(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadProducts(true)} tintColor="#1f9d68" />}
    >
      <Text style={styles.eyebrow}>PARTNER WORKSPACE</Text>
      <Text style={styles.title}>Menu</Text>
      <Text style={styles.body}>Availability and fulfillment changes are saved by the partner API.</Text>

      {loading ? (
        <ActivityIndicator color="#1f9d68" />
      ) : products.length ? (
        products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productNameContainer}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.price}>₹{product.hotelPrice ?? product.price}</Text>
              </View>
              <Switch
                value={product.isAvailable}
                onValueChange={(value) => void updateAvailability(product, value)}
                disabled={busyProductId === product.id}
                trackColor={{ false: '#d0d5dd', true: '#9bd8b6' }}
                thumbColor={product.isAvailable ? '#1f9d68' : '#f4f4f5'}
                accessibilityLabel={`Set ${product.name} ${product.isAvailable ? 'unavailable' : 'available'}`}
              />
            </View>
            {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
            <View style={styles.productFooter}>
              <Text style={[styles.availability, product.isAvailable ? styles.available : styles.unavailable]}>
                {product.isAvailable ? 'Available' : 'Unavailable'}
              </Text>
              <Text style={styles.modeLabel}>Fulfillment</Text>
              <Text
                accessibilityRole="button"
                onPress={() => void updateFulfillmentMode(product)}
                style={styles.modeButton}
              >
                {product.fulfillmentMode ?? 'inherit'} · tap to change
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.productName}>No menu items found</Text>
          <Text style={styles.body}>Pull down to refresh or contact admin to add items to your menu.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  content: { padding: 20, paddingBottom: 36, gap: 14 },
  eyebrow: { fontSize: 11, letterSpacing: 0.8, color: '#1f9d68', fontWeight: '800' },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111',
    marginTop: -8,
  },
  body: {
    color: '#666',
    fontSize: 16,
  },
  productCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10, elevation: 1 },
  productHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  productNameContainer: { flex: 1, gap: 4 },
  productName: { color: '#111827', fontSize: 16, fontWeight: '800' },
  price: { color: '#667085', fontSize: 13, fontWeight: '600' },
  description: { color: '#667085', fontSize: 13, lineHeight: 18 },
  productFooter: { borderTopWidth: 1, borderColor: '#eef0f2', paddingTop: 10, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  availability: { fontSize: 12, fontWeight: '800', marginRight: 'auto' },
  available: { color: '#16794d' },
  unavailable: { color: '#b42318' },
  modeLabel: { color: '#667085', fontSize: 12 },
  modeButton: { color: '#16794d', fontSize: 12, fontWeight: '800' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 8 },
});
