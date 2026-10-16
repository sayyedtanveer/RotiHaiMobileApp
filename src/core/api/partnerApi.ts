import { apiClient } from './ApiClient';
import { PartnerChefStatus, PartnerDashboardMetrics, PartnerIncomeReport, PartnerOrder, PartnerPreorderSettings, PartnerProduct, PartnerProfile, PartnerRotiSettings } from './partner.types';
import { PartnerSubscription, PartnerSubscriptionDeliveryLog } from './subscription.types';

export const partnerApi = {
  async getDashboardMetrics() {
    return apiClient.get<PartnerDashboardMetrics>('/api/partner/dashboard/metrics');
  },

  async getOrders() {
    return apiClient.get<PartnerOrder[]>('/api/partner/orders');
  },

  async acceptOrder(orderId: string) {
    return apiClient.post<PartnerOrder>(`/api/partner/orders/${orderId}/accept`);
  },

  async rejectOrder(orderId: string, reason: string) {
    return apiClient.post<PartnerOrder>(`/api/partner/orders/${orderId}/reject`, { reason });
  },

  async updateOrderStatus(orderId: string, status: 'preparing' | 'prepared') {
    return apiClient.patch<PartnerOrder>(`/api/partner/orders/${orderId}/status`, { status });
  },

  async getRotiSettings() {
    return apiClient.get<PartnerRotiSettings>('/api/roti-settings');
  },

  async getProducts() {
    return apiClient.get<PartnerProduct[]>('/api/partner/products');
  },

  async setProductAvailability(productId: string, isAvailable: boolean) {
    return apiClient.patch<PartnerProduct>(`/api/partner/products/${productId}/availability`, { isAvailable });
  },

  async setProductFulfillmentMode(productId: string, fulfillmentMode: 'inherit' | 'instant' | 'preorder') {
    return apiClient.patch<PartnerProduct>(`/api/partner/products/${productId}/fulfillment-mode`, { fulfillmentMode });
  },

  async getProfile() {
    return apiClient.get<PartnerProfile>('/api/partner/profile');
  },

  async getChefStatus() {
    return apiClient.get<PartnerChefStatus>('/api/partner/chef');
  },

  async updateChefStatus(manualAction: 'open_now' | 'close_for_today') {
    return apiClient.patch<PartnerChefStatus>('/api/partner/chef/status', { manualAction });
  },

  async getPreorderSettings() {
    return apiClient.get<PartnerPreorderSettings>('/api/partner/preorder-settings');
  },

  async updatePreorderOpeningTime(nextDayPreorderOpensAt: string) {
    return apiClient.patch<PartnerPreorderSettings>('/api/partner/preorder-settings', { nextDayPreorderOpensAt });
  },

  async getSubscriptions() {
    return apiClient.get<PartnerSubscription[]>('/api/partner/subscriptions');
  },

  async getSubscriptionLogs(subscriptionId: string) {
    return apiClient.get<PartnerSubscriptionDeliveryLog[]>(`/api/partner/subscriptions/${subscriptionId}/logs`);
  },

  async getIncomeReport() {
    return apiClient.get<PartnerIncomeReport>('/api/partner/income-report');
  },
};
