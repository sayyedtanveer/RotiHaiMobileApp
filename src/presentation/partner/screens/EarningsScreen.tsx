import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PartnerIncomeReport } from '../../../core/api/partner.types';
import { partnerApi } from '../../../core/api/partnerApi';

export function EarningsScreen() {
  const [report, setReport] = useState<PartnerIncomeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReport = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      setReport(await partnerApi.getIncomeReport());
    } catch (error) {
      Alert.alert('Earnings error', error instanceof Error ? error.message : 'Unable to load income report');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadReport(true)} tintColor="#1f9d68" />}
    >
      <Text style={styles.eyebrow}>PARTNER WORKSPACE</Text>
      <Text style={styles.title}>Earnings</Text>
      {loading ? <ActivityIndicator color="#1f9d68" /> : report ? (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.label}>Total partner income</Text>
            <Text style={styles.total}>₹{report.totalIncome ?? 0}</Text>
            <View style={styles.monthRow}>
              <View style={styles.monthCard}>
                <Text style={styles.label}>This month</Text>
                <Text style={styles.monthValue}>₹{report.thisMonth ?? 0}</Text>
              </View>
              <View style={styles.monthCard}>
                <Text style={styles.label}>Last month</Text>
                <Text style={styles.monthValue}>₹{report.lastMonth ?? 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last six months</Text>
            {(report.monthlyBreakdown ?? []).map((month) => (
              <View key={month.month} style={styles.row}>
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle}>{month.month}</Text>
                  <Text style={styles.label}>{month.orders} orders · Avg ₹{month.avgOrderValue}</Text>
                </View>
                <Text style={styles.rowAmount}>₹{month.revenue}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent income</Text>
            {(report.orderBreakdown ?? []).slice(0, 20).map((order) => (
              <View key={order.orderId} style={styles.row}>
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle}>Order #{order.orderId.slice(0, 8)}</Text>
                  <Text style={styles.label}>{order.customerName} · {new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.rowAmount}>₹{order.orderIncome}</Text>
              </View>
            ))}
            {!report.orderBreakdown?.length && <Text style={styles.body}>No confirmed orders yet.</Text>}
          </View>
          <Text style={styles.disclaimer}>Income values come from confirmed-payment orders and use the partner item price returned by RotiHai.</Text>
        </>
      ) : (
        <View style={styles.section}>
          <Text style={styles.body}>Income report is unavailable. Pull down to retry.</Text>
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
  summaryCard: { backgroundColor: '#145b3e', borderRadius: 18, padding: 20, gap: 15 },
  label: { color: '#667085', fontSize: 12 },
  total: { color: '#fff', fontSize: 34, fontWeight: '800' },
  monthRow: { flexDirection: 'row', gap: 10 },
  monthCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', padding: 12, borderRadius: 12, gap: 6 },
  monthValue: { color: '#fff', fontSize: 17, fontWeight: '800' },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 16, gap: 12 },
  sectionTitle: { color: '#111827', fontSize: 17, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 9, borderTopWidth: 1, borderColor: '#f0f1f2' },
  rowMain: { flex: 1, gap: 4 },
  rowTitle: { color: '#344054', fontSize: 13, fontWeight: '700' },
  rowAmount: { color: '#16794d', fontSize: 14, fontWeight: '800' },
  disclaimer: { color: '#667085', fontSize: 12, lineHeight: 17 },
});
