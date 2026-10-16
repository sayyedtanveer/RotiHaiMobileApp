export type PartnerSubscription = {
  id: string;
  status: 'active' | 'paused' | string;
  planName?: string | null;
  planFrequency?: 'daily' | 'weekly' | 'monthly' | string | null;
  planItems?: { id?: string; name: string; quantity: number }[] | null;
  nextDeliveryDate?: string | Date | null;
  nextDeliveryTime?: string | null;
  remainingDeliveries?: number;
  totalDeliveries?: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};

export type PartnerSubscriptionDeliveryLog = {
  id: string;
  date: string | Date;
  time?: string | null;
  status: string;
  notes?: string | null;
};
