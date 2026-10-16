export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.1.10:5000',
  WS_BASE_URL: process.env.EXPO_PUBLIC_WS_BASE_URL ?? 'ws://192.168.1.10:5000',
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
};

export const isDevelopment = ENV.APP_ENV === 'development';
