export type NotificationPayload = {
  type?: string;
  orderId?: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};

export class NotificationHandler {
  static parseNotification(data: unknown): NotificationPayload | null {
    if (!data || typeof data !== 'object') return null;

    const payload = data as NotificationPayload;
    return {
      type: payload.type,
      orderId: payload.orderId,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
    };
  }

  static getRouteForPayload(payload: NotificationPayload) {
    if (payload.type === 'NEW_ORDER' || payload.orderId) {
      return 'OrderDetail';
    }

    return 'Home';
  }
}
