const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '') ?? '';
const configuredWebSocketUrl = process.env.EXPO_PUBLIC_WS_BASE_URL?.trim().replace(/\/+$/, '');

export const ENV = {
  API_BASE_URL: apiBaseUrl,
  WS_BASE_URL: configuredWebSocketUrl || apiBaseUrl.replace(/^http/, 'ws'),
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
};

export const isDevelopment = ENV.APP_ENV === 'development';
