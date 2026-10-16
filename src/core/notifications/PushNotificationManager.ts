import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

import { apiClient } from '../api/ApiClient';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class PushNotificationManager {
  static async requestPermission() {
    if (!Device.isDevice) {
      return false;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  static async getToken() {
    if (!Device.isDevice) {
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  }

  static async registerToken() {
    const token = await this.getToken();
    if (!token) return null;

    try {
      await apiClient.post('/api/partner/push-token', {
        token,
        platform: Platform.OS,
      });
    } catch (error) {
      console.warn('Push token registration failed:', error);
    }

    return token;
  }

  static async unregisterToken() {
    try {
      await apiClient.post('/api/push/unsubscribe');
    } catch (error) {
      console.warn('Unregister push token failed:', error);
    }
  }
}
