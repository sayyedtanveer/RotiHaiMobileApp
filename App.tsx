import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';

import { AuthManager } from './src/core/auth/AuthManager';
import { TokenManager } from './src/core/auth/TokenManager';
import { AppProviders } from './src/core/providers/AppProviders';
import { PartnerWebSocketManager } from './src/core/websocket/PartnerWebSocketManager';
import { PartnerAppNavigator } from './src/presentation/partner/navigation/PartnerAppNavigator';
import { AuthScreen } from './src/presentation/partner/screens/AuthScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const restore = async () => {
      try {
        const session = await AuthManager.restoreSession();
        setIsAuthenticated(Boolean(session?.accessToken));
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      PartnerWebSocketManager.getInstance().disconnect();
      return;
    }

    let cancelled = false;
    TokenManager.getSession().then((session) => {
      if (!cancelled && session?.accessToken) {
        PartnerWebSocketManager.getInstance().connect(session.accessToken);
      }
    });

    return () => {
      cancelled = true;
      PartnerWebSocketManager.getInstance().disconnect();
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1f9d68" />
        <Text style={styles.loadingText}>Loading RotiHai</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <AppProviders>
        <NavigationContainer>
          {isAuthenticated ? (
            <PartnerAppNavigator onLoggedOut={() => setIsAuthenticated(false)} />
          ) : (
            <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />
          )}
        </NavigationContainer>
      </AppProviders>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
