import { partnerApi } from '../../core/api/partnerApi';

export class AcceptOrder {
  static async execute(orderId: string) {
    return partnerApi.acceptOrder(orderId);
  }
}
