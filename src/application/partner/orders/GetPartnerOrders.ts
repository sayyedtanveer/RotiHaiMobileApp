import { partnerApi } from '../../core/api/partnerApi';

export class GetPartnerOrders {
  static async execute() {
    return partnerApi.getOrders();
  }
}
