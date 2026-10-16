import { AuthSession } from './auth.types';
import { TokenManager } from './TokenManager';

export class SessionManager {
  static async restoreSession(): Promise<AuthSession | null> {
    const session = await TokenManager.getSession();
    if (!session?.accessToken) return null;

    return session;
  }

  static async isSessionValid(session: AuthSession | null) {
    if (!session?.accessToken) return false;

    if (!session.expiresAt) return true;
    return Date.now() < session.expiresAt;
  }
}
