export type PartnerDashboardMetrics = {
  totalOrders?: number;
  pendingOrders?: number;
  revenue?: number;
  completedOrders?: number;
};

export type PartnerOrder = {
  id: string;
  status: string;
  customerName?: string;
  total?: number;
  requiresChefConfirmation?: boolean;
  createdAt?: string;
  paymentStatus?: string;
};

export type PartnerProduct = {
  id: string;
  name: string;
  isAvailable?: boolean;
  fulfillmentMode?: 'inherit' | 'instant' | 'preorder';
};

export type PartnerProfile = {
  id?: string;
  username?: string;
  restaurantName?: string;
  phone?: string;
};
