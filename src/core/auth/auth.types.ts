export type AuthSession = {
  accessToken: string;
  partnerId?: string;
  chefId?: string;
  username?: string;
  expiresAt?: number;
  isAuthenticated: boolean;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user?: {
    partnerId?: string;
    chefId?: string;
    username?: string;
  };
};

export type ApiErrorShape = {
  message: string;
  status?: number;
  code?: string;
};
