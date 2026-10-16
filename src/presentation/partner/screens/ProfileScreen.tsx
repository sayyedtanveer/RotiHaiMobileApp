import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';

import { AuthManager } from '../../../core/auth/AuthManager';
import { PartnerProfile } from '../../../core/api/partner.types';
import { partnerApi } from '../../../core/api/partnerApi';

export function ProfileScreen({ onLoggedOut }: { onLoggedOut: () => void }) {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    partnerApi.getProfile()
      .then((data) => {
        if (mounted) setProfile(data);
      })
      .catch((error: unknown) => {
        if (mounted) {
          Alert.alert('Profile error', error instanceof Error ? error.message : 'Unable to load profile');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await AuthManager.logout();
      onLoggedOut();
    } catch (error) {
      console.warn(error);
      Alert.alert('Logout failed', 'Unable to clear the saved session. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {loading ? (
        <ActivityIndicator color="#1f9d68" />
      ) : profile ? (
        <View style={styles.profileCard}>
          <Text style={styles.chefName}>{profile.chefName || 'Partner account'}</Text>
          <Text style={styles.body}>Username: {profile.username}</Text>
          <Text style={styles.body}>Email: {profile.email}</Text>
          <Text style={styles.body}>Chef ID: {profile.chefId}</Text>
        </View>
      ) : (
        <Text style={styles.body}>Profile information is unavailable.</Text>
      )}

      <Pressable style={[styles.button, loggingOut && styles.disabledButton]} onPress={handleLogout} disabled={loggingOut}>
        <Text style={styles.buttonText}>{loggingOut ? 'Logging out…' : 'Logout'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  body: {
    color: '#666',
    fontSize: 16,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    gap: 8,
    marginBottom: 20,
  },
  chefName: {
    color: '#111',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#d73f3f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.55,
  },
});
