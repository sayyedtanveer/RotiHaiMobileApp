import { ENV } from './env';

export const appConfig = {
  apiBaseUrl: ENV.API_BASE_URL,
  wsBaseUrl: ENV.WS_BASE_URL,
  appEnv: ENV.APP_ENV,
  partnerApi: {
    login: '/api/partner/auth/login',
    refresh: '/api/partner/auth/refresh',
    dashboard: '/api/partner/dashboard/metrics',
    orders: '/api/partner/orders',
    products: '/api/partner/products',
    profile: '/api/partner/profile',
    subscriptions: '/api/partner/subscriptions',
    incomeReport: '/api/partner/income-report',
  },
};
