module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    'expo-secure-store',
    'expo-status-bar',
    'expo-notifications',
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: process.env.APP_ENV !== 'production',
        },
      },
    ],
  ],
  android: {
    ...config.android,
    package: 'com.rotihai.partner',
  },
});
