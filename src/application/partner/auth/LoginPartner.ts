import { AuthManager } from '../../core/auth/AuthManager';

export class LoginPartner {
  static async execute(username: string, password: string) {
    return AuthManager.login({ username, password });
  }
}
