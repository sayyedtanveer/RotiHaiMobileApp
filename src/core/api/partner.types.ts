export type PartnerOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'accepted_by_chef'
  | 'preparing'
  | 'prepared'
  | 'accepted_by_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | string;

export type PartnerOrderItem = {
  id: string;
  name: string;
  price: number;
  hotelPrice?: number | null;
  quantity: number;
  specialInstructions?: string | null;
};

/** Sanitized by GET /api/partner/orders; customer contact and address are omitted by the backend. */
export type PartnerOrder = {
  id: string;
  customerName: string;
  items: PartnerOrderItem[];
  status: PartnerOrderStatus;
  paymentStatus: 'pending' | 'pending_verification' | 'paid' | 'confirmed' | string;
  createdAt: string | Date;
  partnerTotal?: number;
  total?: number;
  requiresChefConfirmation?: boolean;
  isReassigned?: boolean;
  deliveryTime?: string | null;
  deliveryDate?: string | null;
  deliverySlotId?: string | null;
  assignedTo?: string | null;
  deliveryPersonName?: string | null;
};

export type PartnerDashboardMetrics = {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
};

export type PartnerRotiSettings = {
  prepareWindowHours?: number;
};

export type PartnerProduct = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  hotelPrice?: number | null;
  isAvailable: boolean;
  fulfillmentMode?: 'inherit' | 'instant' | 'preorder' | string;
  image?: string | null;
};

export type PartnerProfile = {
  id: string;
  username: string;
  email: string;
  profilePictureUrl?: string | null;
  chefId: string;
  chefName: string;
  lastLoginAt?: string | null;
  createdAt?: string | null;
};

export type PartnerIncomeReport = {
  totalIncome: number;
  thisMonth: number;
  lastMonth: number;
  monthlyBreakdown: {
    month: string;
    orders: number;
    revenue: number;
    avgOrderValue: number;
  }[];
  orderBreakdown: {
    orderId: string;
    customerName: string;
    createdAt: string | Date;
    orderIncome: number;
    status: string;
  }[];
};

export type PartnerChefStatus = {
  name?: string;
  isActive?: boolean;
  isCurrentlyOpen?: boolean;
  autoScheduleEnabled?: boolean;
  openingTime?: string | null;
  closingTime?: string | null;
  currentScheduleStatus?: string;
  nextOpeningTime?: string | null;
};

export type PartnerPreorderSettings = {
  nextDayPreorderOpensAt: string;
  lunchEnabled?: boolean;
  lunchMinNoticeHours?: number;
  dinnerEnabled?: boolean;
  dinnerMinNoticeHours?: number;
};
