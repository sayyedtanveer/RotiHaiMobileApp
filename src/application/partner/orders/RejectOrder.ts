import { partnerApi } from '../../core/api/partnerApi';

export class RejectOrder {
  static async execute(orderId: string, reason?: string) {
    return partnerApi.rejectOrder(orderId, reason);
  }
}
