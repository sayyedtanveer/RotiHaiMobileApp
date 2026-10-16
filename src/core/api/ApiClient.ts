import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

import { ENV } from '../config/env';
import { ApiError } from '../errors/ApiError';
import { TokenManager } from '../auth/TokenManager';

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      const session = await TokenManager.getSession();
      if (session?.accessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = TokenManager.getAuthorizationHeader(session.accessToken);
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const status = error.response?.status;
        const message = typeof error.response?.data === 'object' && error.response?.data
          ? (error.response.data as { message?: string }).message ?? 'Request failed'
          : error.message;

        if (status === 401) {
          throw new ApiError(message, status, 'UNAUTHORIZED');
        }

        if (status === 403) {
          throw new ApiError(message, status, 'FORBIDDEN');
        }

        if (status === 404) {
          throw new ApiError(message, status, 'NOT_FOUND');
        }

        if (status && status >= 500) {
          throw new ApiError(message, status, 'SERVER_ERROR');
        }

        throw new ApiError(message, status, 'REQUEST_ERROR');
      },
    );
  }

  get instance() {
    return this.client;
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
