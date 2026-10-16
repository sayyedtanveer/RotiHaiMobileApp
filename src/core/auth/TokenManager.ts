import { secureStore } from '../storage/secureStore';
import { AuthSession } from './auth.types';

const SESSION_KEY = 'rotihai_session';

export class TokenManager {
  static async saveSession(session: AuthSession) {
    await secureStore.setItem(SESSION_KEY, JSON.stringify(session));
  }

  static async getSession(): Promise<AuthSession | null> {
    const raw = await secureStore.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }

  static async clearSession() {
    await secureStore.removeItem(SESSION_KEY);
  }

  static getAuthorizationHeader(token: string) {
    return `Bearer ${token}`;
  }
}
