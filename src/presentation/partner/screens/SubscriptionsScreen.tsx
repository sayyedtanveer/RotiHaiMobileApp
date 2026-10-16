import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { partnerApi } from '../../../core/api/partnerApi';
import { PartnerSubscription, PartnerSubscriptionDeliveryLog } from '../../../core/api/subscription.types';

function dateLabel(value?: string | Date | null) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleDateString();
}

export function SubscriptionsScreen() {
  const [subscriptions, setSubscriptions] = useState<PartnerSubscription[]>([]);
  const [logsBySubscription, setLogsBySubscription] = useState<Record<string, PartnerSubscriptionDeliveryLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingLogsId, setLoadingLogsId] = useState<string | null>(null);

  const loadSubscriptions = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      setSubscriptions(await partnerApi.getSubscriptions());
    } catch (error) {
      Alert.alert('Subscriptions error', error instanceof Error ? error.message : 'Unable to load subscriptions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadSubscriptions();
  }, []);

  const toggleHistory = async (subscription: PartnerSubscription) => {
    if (expandedId === subscription.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(subscription.id);
    if (logsBySubscription[subscription.id]) return;

    setLoadingLogsId(subscription.id);
    try {
      const logs = await partnerApi.getSubscriptionLogs(subscription.id);
      setLogsBySubscription((current) => ({ ...current, [subscription.id]: logs }));
    } catch (error) {
      Alert.alert('Delivery history error', error instanceof Error ? error.message : 'Unable to load delivery history');
    } finally {
      setLoadingLogsId(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadSubscriptions(true)} tintColor="#1f9d68" />}
    >
      <Text style={styles.eyebrow}>PARTNER WORKSPACE</Text>
      <Text style={styles.title}>Subscriptions</Text>
      <Text style={styles.body}>Active and paused plans assigned to your kitchen.</Text>

      {loading ? <ActivityIndicator color="#1f9d68" /> : subscriptions.length ? subscriptions.map((subscription) => (
        <View key={subscription.id} style={styles.card}>
          <View style={styles.headingRow}>
            <View style={styles.headingText}>
              <Text style={styles.planName}>{subscription.planName || 'Meal subscription'}</Text>
              <Text style={styles.body}>{subscription.planFrequency || 'Plan'}</Text>
            </View>
            <View style={[styles.statusBadge, subscription.status === 'active' ? styles.active : styles.paused]}>
              <Text style={styles.statusText}>{subscription.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next delivery</Text>
            <Text style={styles.infoValue}>{dateLabel(subscription.nextDeliveryDate)}{subscription.nextDeliveryTime ? ` · ${subscription.nextDeliveryTime}` : ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Deliveries remaining</Text>
            <Text style={styles.infoValue}>{subscription.remainingDeliveries ?? '—'} / {subscription.totalDeliveries ?? '—'}</Text>
          </View>
          {subscription.planItems?.length ? (
            <View style={styles.items}>
              {subscription.planItems.map((item, index) => (
                <Text key={`${item.id ?? item.name}-${index}`} style={styles.itemText}>{item.name} × {item.quantity}</Text>
              ))}
            </View>
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => void toggleHistory(subscription)} style={styles.historyButton}>
            <Text style={styles.historyText}>{expandedId === subscription.id ? 'Hide delivery history' : 'View delivery history'}</Text>
          </Pressable>
          {expandedId === subscription.id && (
            <View style={styles.historyList}>
              {loadingLogsId === subscription.id ? <ActivityIndicator color="#1f9d68" /> : (logsBySubscription[subscription.id] ?? []).length ?
                logsBySubscription[subscription.id].map((log) => (
                  <View key={log.id} style={styles.logRow}>
                    <View style={styles.headingText}>
                      <Text style={styles.infoValue}>{dateLabel(log.date)}{log.time ? ` · ${log.time}` : ''}</Text>
                      {log.notes ? <Text style={styles.body}>{log.notes}</Text> : null}
                    </View>
                    <Text style={styles.logStatus}>{log.status.replaceAll('_', ' ')}</Text>
                  </View>
                )) : <Text style={styles.body}>No delivery history found.</Text>}
            </View>
          )}
        </View>
      )) : (
        <View style={styles.emptyCard}>
          <Text style={styles.planName}>No active or paused subscriptions</Text>
          <Text style={styles.body}>New subscriptions assigned to your kitchen will appear here.</Text>
        </View>
      )}
      <Text style={styles.footer}>Subscription pause and resume controls are not available in the Partner API. Statuses are displayed as returned by RotiHai.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  content: { padding: 20, paddingBottom: 36, gap: 14 },
  eyebrow: { fontSize: 11, letterSpacing: 0.8, color: '#1f9d68', fontWeight: '800' },
  title: { fontSize: 30, fontWeight: '700', color: '#111', marginTop: -8 },
  body: { color: '#667085', fontSize: 13, lineHeight: 18 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, elevation: 1 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  headingText: { flex: 1, gap: 4 },
  planName: { color: '#111827', fontSize: 16, fontWeight: '800' },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  active: { backgroundColor: '#e8f5ee' },
  paused: { backgroundColor: '#fff2d8' },
  statusText: { color: '#344054', fontSize: 10, fontWeight: '800' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  infoLabel: { color: '#667085', fontSize: 12 },
  infoValue: { color: '#344054', fontSize: 12, fontWeight: '700' },
  items: { gap: 5, backgroundColor: '#f8faf9', padding: 10, borderRadius: 10 },
  itemText: { color: '#475467', fontSize: 12 },
  historyButton: { borderTopWidth: 1, borderColor: '#eef0f2', paddingTop: 10 },
  historyText: { color: '#16794d', fontSize: 13, fontWeight: '800' },
  historyList: { gap: 10 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingVertical: 8, borderTopWidth: 1, borderColor: '#f2f4f7' },
  logStatus: { color: '#344054', fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 8 },
  footer: { color: '#667085', fontSize: 11, lineHeight: 16 },
});
