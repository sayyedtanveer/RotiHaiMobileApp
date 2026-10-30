module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: 'com.rotihai.partner',
    usesCleartextTraffic: process.env.APP_ENV !== 'production',
  },
});
