import { ENV } from '../config/env';

export type PartnerWebSocketEvent = {
  type?: string;
  data?: unknown;
  message?: string;
};

export class PartnerWebSocketManager {
  private static instance: PartnerWebSocketManager | null = null;
  private socket: WebSocket | null = null;
  private listeners = new Set<(event: PartnerWebSocketEvent) => void>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private token: string | null = null;
  private manuallyDisconnected = false;
  private reconnectAttempts = 0;

  static getInstance() {
    if (!this.instance) {
      this.instance = new PartnerWebSocketManager();
    }
    return this.instance;
  }

  connect(token: string) {
    if (this.socket?.readyState === WebSocket.OPEN && this.token === token) return;

    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.manuallyDisconnected = false;
    this.token = token;
    this.openSocket();
  }

  subscribe(listener: (event: PartnerWebSocketEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private openSocket() {
    if (!this.token || this.manuallyDisconnected) return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;

    const baseUrl = ENV.WS_BASE_URL.replace(/\/$/, '');
    const url = `${baseUrl}/ws?type=chef&token=${encodeURIComponent(this.token)}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      console.log('Partner websocket connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(String(event.data)) as PartnerWebSocketEvent;
        this.listeners.forEach((listener) => listener(parsed));
      } catch (error) {
        console.warn('Ignoring invalid partner websocket event', error);
      }
    };

    this.socket.onerror = (event) => {
      console.warn('Partner websocket error:', event);
    };

    this.socket.onclose = () => {
      console.log('Partner websocket closed');
      this.socket = null;
      this.scheduleReconnect();
    };
  }

  disconnect() {
    this.manuallyDisconnected = true;
    this.token = null;
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.close();
    this.socket = null;
  }

  private scheduleReconnect() {
    if (this.manuallyDisconnected || !this.token || this.reconnectTimer) return;

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000);
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket();
    }, delay);
  }
}
