import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProfileScreen } from './ProfileScreen';
import { SettingsScreen } from './SettingsScreen';
import { SubscriptionsScreen } from './SubscriptionsScreen';

type MoreSection = 'profile' | 'subscriptions' | 'settings';

const SECTIONS: { key: MoreSection; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'settings', label: 'Settings' },
];

export function PartnerMoreScreen({ onLoggedOut }: { onLoggedOut: () => void }) {
  const [section, setSection] = useState<MoreSection>('profile');

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionBar}>
        {SECTIONS.map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: section === item.key }}
            onPress={() => setSection(item.key)}
            style={[styles.sectionButton, section === item.key && styles.sectionButtonSelected]}
          >
            <Text style={[styles.sectionText, section === item.key && styles.sectionTextSelected]}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.content}>
        {section === 'profile' ? <ProfileScreen onLoggedOut={onLoggedOut} /> : null}
        {section === 'subscriptions' ? <SubscriptionsScreen /> : null}
        {section === 'settings' ? <SettingsScreen /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  sectionBar: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 14, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  sectionButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#f2f4f7' },
  sectionButtonSelected: { backgroundColor: '#e5f4ec' },
  sectionText: { color: '#667085', fontSize: 12, fontWeight: '700' },
  sectionTextSelected: { color: '#16794d' },
  content: { flex: 1 },
});
