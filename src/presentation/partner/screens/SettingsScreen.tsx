import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PartnerChefStatus, PartnerPreorderSettings } from '../../../core/api/partner.types';
import { partnerApi } from '../../../core/api/partnerApi';

export function SettingsScreen() {
  const [chefStatus, setChefStatus] = useState<PartnerChefStatus | null>(null);
  const [preorderSettings, setPreorderSettings] = useState<PartnerPreorderSettings | null>(null);
  const [openingTime, setOpeningTime] = useState('22:00');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [chef, preorder] = await Promise.all([
        partnerApi.getChefStatus(),
        partnerApi.getPreorderSettings(),
      ]);
      setChefStatus(chef);
      setPreorderSettings(preorder);
      setOpeningTime(preorder.nextDayPreorderOpensAt || '22:00');
    } catch (error) {
      Alert.alert('Settings error', error instanceof Error ? error.message : 'Unable to load partner settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const updateRestaurant = async (action: 'open_now' | 'close_for_today') => {
    setBusy(true);
    try {
      setChefStatus(await partnerApi.updateChefStatus(action));
    } catch (error) {
      Alert.alert('Restaurant status not changed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const confirmRestaurantAction = (action: 'open_now' | 'close_for_today') => {
    const closing = action === 'close_for_today';
    Alert.alert(
      closing ? 'Close for today?' : 'Open restaurant now?',
      closing ? 'Customers will not be able to place new orders until the restaurant opens again.' : 'This clears today’s manual close override and opens the restaurant if its schedule allows.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: closing ? 'Close today' : 'Open now', onPress: () => void updateRestaurant(action) },
      ],
    );
  };

  const savePreorderTime = async () => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(openingTime)) {
      Alert.alert('Invalid time', 'Enter the time in 24-hour HH:MM format.');
      return;
    }
    setBusy(true);
    try {
      setPreorderSettings(await partnerApi.updatePreorderOpeningTime(openingTime));
      Alert.alert('Saved', 'Next-day pre-order opening time updated.');
    } catch (error) {
      Alert.alert('Setting not saved', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color="#1f9d68" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>PARTNER WORKSPACE</Text>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Restaurant status</Text>
        <Text style={[styles.status, chefStatus?.isCurrentlyOpen ? styles.open : styles.closed]}>
          {chefStatus?.isCurrentlyOpen ? 'OPEN NOW' : 'CLOSED'}
        </Text>
        {chefStatus?.autoScheduleEnabled && chefStatus.nextOpeningTime && !chefStatus.isCurrentlyOpen ? (
          <Text style={styles.body}>Next opening: {chefStatus.nextOpeningTime}</Text>
        ) : null}
        <Text style={styles.body}>Status follows the backend schedule and manual override.</Text>
        <View style={styles.buttons}>
          <Pressable disabled={busy} onPress={() => confirmRestaurantAction('open_now')} style={[styles.openButton, busy && styles.disabled]}>
            <Text style={styles.openButtonText}>Open now</Text>
          </Pressable>
          <Pressable disabled={busy} onPress={() => confirmRestaurantAction('close_for_today')} style={[styles.closeButton, busy && styles.disabled]}>
            <Text style={styles.closeButtonText}>Close today</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Next-day pre-orders</Text>
        <Text style={styles.body}>Choose when tomorrow’s menu becomes available to customers.</Text>
        <View style={styles.timeRow}>
          <TextInput
            accessibilityLabel="Next-day pre-order opening time"
            value={openingTime}
            onChangeText={setOpeningTime}
            placeholder="22:00"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            style={styles.input}
          />
          <Pressable disabled={busy || openingTime === preorderSettings?.nextDayPreorderOpensAt} onPress={() => void savePreorderTime()} style={[styles.saveButton, (busy || openingTime === preorderSettings?.nextDayPreorderOpensAt) && styles.disabled]}>
            <Text style={styles.saveButtonText}>{busy ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>
        <Text style={styles.helper}>24-hour format, for example 22:00.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 24,
    gap: 14,
  },
  loading: { flex: 1, backgroundColor: '#f7f7f7', alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: 11, letterSpacing: 0.8, color: '#1f9d68', fontWeight: '800' },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111',
    marginTop: -8,
  },
  body: {
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
  },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 12, elevation: 1 },
  sectionTitle: { color: '#111827', fontSize: 17, fontWeight: '800' },
  status: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6, fontSize: 12, fontWeight: '800', overflow: 'hidden' },
  open: { backgroundColor: '#e8f5ee', color: '#16794d' },
  closed: { backgroundColor: '#fff0ef', color: '#b42318' },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 2 },
  openButton: { flex: 1, backgroundColor: '#1f9d68', borderRadius: 11, padding: 13, alignItems: 'center' },
  openButtonText: { color: '#fff', fontWeight: '800' },
  closeButton: { flex: 1, borderWidth: 1, borderColor: '#d92d20', borderRadius: 11, padding: 13, alignItems: 'center' },
  closeButtonText: { color: '#b42318', fontWeight: '800' },
  timeRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#d0d5dd', borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12, color: '#101828', fontSize: 16 },
  saveButton: { backgroundColor: '#1f9d68', borderRadius: 11, paddingHorizontal: 18, paddingVertical: 14 },
  saveButtonText: { color: '#fff', fontWeight: '800' },
  helper: { color: '#98a2b3', fontSize: 11 },
  disabled: { opacity: 0.45 },
});
