import { partnerApi } from '../../../core/api/partnerApi';

export class UpdateOrderStatus {
  static async execute(orderId: string, status: 'preparing' | 'prepared') {
    return partnerApi.updateOrderStatus(orderId, status);
  }
}
