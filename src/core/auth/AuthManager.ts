import { apiClient } from '../api/ApiClient';
import { TokenManager } from './TokenManager';
import { AuthSession, LoginRequest, LoginResponse } from './auth.types';

export class AuthManager {
  static async login(credentials: LoginRequest): Promise<AuthSession> {
    const response = await apiClient.post<LoginResponse>('/api/partner/auth/login', credentials);

    const session: AuthSession = {
      accessToken: response.accessToken,
      partnerId: response.user?.partnerId,
      chefId: response.user?.chefId,
      username: response.user?.username,
      isAuthenticated: true,
      expiresAt: Date.now() + 1000 * 60 * 90,
    };

    await TokenManager.saveSession(session);
    return session;
  }

  static async restoreSession(): Promise<AuthSession | null> {
    const session = await TokenManager.getSession();
    if (!session?.accessToken) return null;

    return session;
  }

  static async logout() {
    await TokenManager.clearSession();
  }

  static async refreshToken() {
    const session = await TokenManager.getSession();
    if (!session?.accessToken) {
      throw new Error('No active session to refresh');
    }

    const response = await apiClient.post<{ accessToken: string }>('/api/partner/auth/refresh');

    const nextSession: AuthSession = {
      ...session,
      accessToken: response.accessToken,
      expiresAt: Date.now() + 1000 * 60 * 90,
      isAuthenticated: true,
    };

    await TokenManager.saveSession(nextSession);
    return nextSession;
  }
}
