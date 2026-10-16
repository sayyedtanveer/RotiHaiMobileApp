import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { partnerApi } from '../../../core/api/partnerApi';
import { PartnerOrder, PartnerRotiSettings } from '../../../core/api/partner.types';
import { PartnerWebSocketManager } from '../../../core/websocket/PartnerWebSocketManager';

type OrderFilter = 'all' | 'new' | 'active' | 'scheduled';

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'Needs action' },
  { key: 'active', label: 'Active' },
  { key: 'scheduled', label: 'Scheduled' },
];

const ACTIVE_STATUSES = new Set([
  'accepted_by_chef',
  'preparing',
  'prepared',
  'accepted_by_delivery',
  'out_for_delivery',
]);

function statusLabel(status: string) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCreatedAt(value: string | Date) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
}

function canAcceptOrder(order: PartnerOrder, rotiSettings: PartnerRotiSettings | null) {
  if (!order.deliveryTime) return true;
  if (!order.deliveryDate) return false;

  const [year, month, day] = order.deliveryDate.split('-').map(Number);
  const [hours, minutes] = order.deliveryTime.split(':').map(Number);
  if ([year, month, day, hours, minutes].some((part) => Number.isNaN(part))) return false;

  const deliveryAt = new Date(year, month - 1, day, hours, minutes).getTime();
  const prepareWindowHours = rotiSettings?.prepareWindowHours ?? 2;
  return Date.now() >= deliveryAt - prepareWindowHours * 60 * 60 * 1000;
}

export function OrdersScreen() {
  const [orders, setOrders] = useState<PartnerOrder[]>([]);
  const [rotiSettings, setRotiSettings] = useState<PartnerRotiSettings | null>(null);
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<PartnerOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadOrders = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setLoadError('');

    try {
      const [orderResult, settingsResult] = await Promise.allSettled([
        partnerApi.getOrders(),
        partnerApi.getRotiSettings(),
      ]);

      if (orderResult.status === 'rejected') throw orderResult.reason;
      const sortedOrders = [...orderResult.value].sort(
        (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
      );
      setOrders(sortedOrders);

      if (settingsResult.status === 'fulfilled') setRotiSettings(settingsResult.value);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load partner orders.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    const unsubscribe = PartnerWebSocketManager.getInstance().subscribe((event) => {
      if (['new_order', 'order_update', 'PAYMENT_INITIATED'].includes(event.type ?? '')) {
        void loadOrders(true);
      }
    });
    const pollingTimer = setInterval(() => void loadOrders(true), 120_000);

    return () => {
      unsubscribe();
      clearInterval(pollingTimer);
    };
  }, []);

  const visibleOrders = useMemo(() => orders.filter((order) => {
    if (filter === 'new') return order.status === 'confirmed' || order.status === 'pending';
    if (filter === 'active') return ACTIVE_STATUSES.has(order.status);
    if (filter === 'scheduled') return Boolean(order.deliveryTime || order.deliveryDate);
    return true;
  }), [filter, orders]);

  const runOrderAction = async (order: PartnerOrder, action: 'accept' | 'ready') => {
    setBusyOrderId(order.id);
    try {
      if (action === 'accept') await partnerApi.acceptOrder(order.id);
      else await partnerApi.updateOrderStatus(order.id, 'prepared');
      await loadOrders(true);
    } catch (error) {
      Alert.alert(
        action === 'accept' ? 'Could not accept order' : 'Could not update order',
        error instanceof Error ? error.message : 'The backend rejected this action. Please try again.',
      );
    } finally {
      setBusyOrderId(null);
    }
  };

  const confirmAccept = (order: PartnerOrder) => {
    Alert.alert('Accept this order?', `Order #${order.id.slice(0, 8)} will be accepted and moved into preparation.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => void runOrderAction(order, 'accept') },
    ]);
  };

  const submitRejection = async () => {
    if (!rejectingOrder || !rejectionReason.trim()) {
      Alert.alert('Reason required', 'Enter a reason before rejecting this order.');
      return;
    }

    const order = rejectingOrder;
    setBusyOrderId(order.id);
    try {
      await partnerApi.rejectOrder(order.id, rejectionReason.trim());
      setRejectingOrder(null);
      setRejectionReason('');
      await loadOrders(true);
    } catch (error) {
      Alert.alert('Could not reject order', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusyOrderId(null);
    }
  };

  const renderOrder = (order: PartnerOrder) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const canTakeAction = order.status === 'confirmed' && order.paymentStatus === 'confirmed';
    const isExpanded = expandedOrderId === order.id;
    const isBusy = busyOrderId === order.id;
    const scheduledAndLocked = canTakeAction && order.deliveryTime && !canAcceptOrder(order, rotiSettings);
    const canMarkReady = order.status === 'accepted_by_chef' || order.status === 'accepted_by_delivery';

    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeading}>
          <View style={styles.orderHeadingText}>
            <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
            <Text style={styles.muted}>{formatCreatedAt(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, order.status === 'confirmed' ? styles.pendingBadge : styles.activeBadge]}>
            <Text style={styles.statusText}>{statusLabel(order.status)}</Text>
          </View>
        </View>

        <Text style={styles.customerName}>{order.customerName || 'Customer'}</Text>
        <Text style={styles.muted}>{items.length} {items.length === 1 ? 'item' : 'items'} · Payment {statusLabel(order.paymentStatus)}</Text>

        {order.requiresChefConfirmation && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>Late pre-order · chef confirmation required</Text>
          </View>
        )}
        {order.isReassigned && <Text style={styles.reassigned}>This order was reassigned to you.</Text>}
        {(order.deliveryDate || order.deliveryTime) && (
          <Text style={styles.schedule}>
            Scheduled: {[order.deliveryDate, order.deliveryTime].filter(Boolean).join(' · ')}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => setExpandedOrderId(isExpanded ? null : order.id)}
          style={styles.detailsButton}
        >
          <Text style={styles.detailsButtonText}>{isExpanded ? 'Hide items' : 'View items'}</Text>
          <Text style={styles.total}>₹{order.partnerTotal ?? 0}</Text>
        </Pressable>

        {isExpanded && (
          <View style={styles.itemsList}>
            {items.map((item, index) => (
              <View key={`${item.id}-${index}`} style={styles.itemRow}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name} × {item.quantity}</Text>
                  {item.specialInstructions ? <Text style={styles.instructions}>{item.specialInstructions}</Text> : null}
                </View>
                <Text style={styles.itemPrice}>₹{(item.hotelPrice ?? item.price ?? 0) * item.quantity}</Text>
              </View>
            ))}
          </View>
        )}

        {canTakeAction && (
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              disabled={isBusy || Boolean(scheduledAndLocked)}
              onPress={() => confirmAccept(order)}
              style={[styles.primaryButton, (isBusy || scheduledAndLocked) && styles.disabledButton]}
            >
              <Text style={styles.primaryButtonText}>
                {isBusy ? 'Working…' : scheduledAndLocked ? 'Scheduled · locked' : 'Accept order'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isBusy}
              onPress={() => {
                setRejectingOrder(order);
                setRejectionReason('');
              }}
              style={[styles.rejectButton, isBusy && styles.disabledButton]}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </Pressable>
          </View>
        )}

        {scheduledAndLocked && (
          <Text style={styles.lockHint}>
            Acceptance opens {rotiSettings?.prepareWindowHours ?? 2} hours before the scheduled delivery time.
          </Text>
        )}
        {order.status === 'confirmed' && order.paymentStatus !== 'confirmed' && (
          <Text style={styles.lockHint}>Waiting for payment confirmation before partner actions are available.</Text>
        )}
        {order.status === 'accepted_by_chef' && !order.assignedTo && (
          <Text style={styles.lockHint}>Accepted · waiting for a delivery partner.</Text>
        )}
        {canMarkReady && (
          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={() => Alert.alert('Mark order ready?', 'This updates the order through the partner API.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Mark ready', onPress: () => void runOrderAction(order, 'ready') },
            ])}
            style={[styles.readyButton, isBusy && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>{isBusy ? 'Updating…' : 'Mark ready'}</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadOrders(true)} tintColor="#1f9d68" />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PARTNER WORKSPACE</Text>
            <Text style={styles.title}>Orders</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => void loadOrders(true)} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((option) => (
            <Pressable
              key={option.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: filter === option.key }}
              onPress={() => setFilter(option.key)}
              style={[styles.filterChip, filter === option.key && styles.filterChipSelected]}
            >
              <Text style={[styles.filterText, filter === option.key && styles.filterTextSelected]}>{option.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#1f9d68" />
            <Text style={styles.stateText}>Loading your orders…</Text>
          </View>
        ) : loadError ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>Orders couldn’t load</Text>
            <Text style={styles.stateText}>{loadError}</Text>
            <Pressable onPress={() => void loadOrders()} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : visibleOrders.length ? (
          <View style={styles.orderList}>{visibleOrders.map(renderOrder)}</View>
        ) : (
          <View style={styles.stateCard}>
            <Text style={styles.stateTitle}>No orders here yet</Text>
            <Text style={styles.stateText}>Pull down to refresh or choose another filter.</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={Boolean(rejectingOrder)}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectingOrder(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject order</Text>
            <Text style={styles.stateText}>Provide a reason for order #{rejectingOrder?.id.slice(0, 8)}.</Text>
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Reason for rejection"
              multiline
              maxLength={500}
              textAlignVertical="top"
              style={styles.reasonInput}
            />
            <View style={styles.actionRow}>
              <Pressable onPress={() => setRejectingOrder(null)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={busyOrderId === rejectingOrder?.id || !rejectionReason.trim()}
                onPress={() => void submitRejection()}
                style={[styles.rejectButton, (!rejectionReason.trim() || busyOrderId === rejectingOrder?.id) && styles.disabledButton]}
              >
                <Text style={styles.rejectButtonText}>{busyOrderId === rejectingOrder?.id ? 'Rejecting…' : 'Confirm reject'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8f5' },
  content: { padding: 20, paddingBottom: 36, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: '#1f9d68', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#111827', fontSize: 30, fontWeight: '800', marginTop: 3 },
  refreshButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#e5f4ec' },
  refreshText: { color: '#16794d', fontWeight: '700' },
  filterRow: { gap: 8, paddingVertical: 2 },
  filterChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  filterChipSelected: { backgroundColor: '#1f9d68', borderColor: '#1f9d68' },
  filterText: { color: '#515b66', fontSize: 13, fontWeight: '700' },
  filterTextSelected: { color: '#fff' },
  orderList: { gap: 12 },
  orderCard: { padding: 16, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#edf0ed', gap: 9, elevation: 1 },
  orderHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  orderHeadingText: { flex: 1, gap: 3 },
  orderId: { color: '#111827', fontSize: 16, fontWeight: '800' },
  muted: { color: '#667085', fontSize: 12 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pendingBadge: { backgroundColor: '#fff2d8' },
  activeBadge: { backgroundColor: '#e8f5ee' },
  statusText: { color: '#333', fontSize: 11, fontWeight: '800' },
  customerName: { color: '#1d2939', fontSize: 15, fontWeight: '700' },
  notice: { alignSelf: 'flex-start', backgroundColor: '#fff4e5', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  noticeText: { color: '#9a4d00', fontSize: 12, fontWeight: '700' },
  reassigned: { color: '#175cd3', fontSize: 12, fontWeight: '700' },
  schedule: { color: '#a14e00', fontSize: 13, fontWeight: '700' },
  detailsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderColor: '#eef0f2' },
  detailsButtonText: { color: '#16794d', fontWeight: '700', fontSize: 13 },
  total: { color: '#111827', fontWeight: '800', fontSize: 16 },
  itemsList: { gap: 10, paddingVertical: 5 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  itemDetails: { flex: 1, gap: 3 },
  itemName: { color: '#344054', fontSize: 13, fontWeight: '600' },
  instructions: { color: '#9a4d00', fontSize: 12, fontStyle: 'italic' },
  itemPrice: { color: '#344054', fontSize: 13, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 9, marginTop: 3 },
  primaryButton: { backgroundColor: '#1f9d68', borderRadius: 11, paddingVertical: 13, paddingHorizontal: 14, alignItems: 'center', flex: 1 },
  primaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  rejectButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d92d20', borderRadius: 11, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  rejectButtonText: { color: '#b42318', fontSize: 13, fontWeight: '800' },
  readyButton: { backgroundColor: '#1f9d68', borderRadius: 11, paddingVertical: 13, alignItems: 'center' },
  disabledButton: { opacity: 0.45 },
  lockHint: { color: '#667085', fontSize: 12, lineHeight: 17 },
  stateContainer: { paddingVertical: 56, alignItems: 'center', gap: 12 },
  stateCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', gap: 12 },
  stateTitle: { color: '#1d2939', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  stateText: { color: '#667085', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 22, backgroundColor: 'rgba(16, 24, 40, 0.5)' },
  modalCard: { backgroundColor: '#fff', borderRadius: 18, padding: 20, gap: 14 },
  modalTitle: { color: '#111827', fontSize: 20, fontWeight: '800' },
  reasonInput: { minHeight: 100, borderWidth: 1, borderColor: '#d0d5dd', borderRadius: 12, padding: 12, color: '#111827' },
  cancelButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 11, backgroundColor: '#f2f4f7' },
  cancelButtonText: { color: '#344054', fontWeight: '700' },
});
