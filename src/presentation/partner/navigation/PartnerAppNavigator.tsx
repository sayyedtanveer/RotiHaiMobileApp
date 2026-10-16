import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { PartnerHomeScreen } from '../screens/PartnerHomeScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { MenuScreen } from '../screens/MenuScreen';
import { EarningsScreen } from '../screens/EarningsScreen';
import { PartnerMoreScreen } from '../screens/PartnerMoreScreen';

const Tab = createBottomTabNavigator();

export function PartnerAppNavigator({ onLoggedOut }: { onLoggedOut: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1f9d68',
        tabBarInactiveTintColor: '#7d7d7d',
      }}
    >
      <Tab.Screen name="Home" component={PartnerHomeScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="More">
        {() => <PartnerMoreScreen onLoggedOut={onLoggedOut} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
