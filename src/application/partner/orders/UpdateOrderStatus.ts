import { partnerApi } from '../../core/api/partnerApi';

export class UpdateOrderStatus {
  static async execute(orderId: string, status: string) {
    return partnerApi.updateOrderStatus(orderId, status);
  }
}
