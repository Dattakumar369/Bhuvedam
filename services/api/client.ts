import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { API_CONFIG } from '@/constants/app';
import { notifyAuthFailure } from '@/services/api/authFailure';
import type { ApiError } from '@/types/api';
import { logApiFailure } from '@/utils/logger';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

function isAuthPath(url?: string): boolean {
  if (!url) return false;
  return url.includes('/api/auth/');
}

export function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_CONFIG.baseUrl,
    timeout: API_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      if (isAuthPath(config.url)) {
        config.timeout = API_CONFIG.authTimeout;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config;

      if (error.response?.status === 401) {
        setAuthToken(null);
        notifyAuthFailure();
      }

      if (
        originalRequest &&
        !originalRequest.headers['X-Retry'] &&
        shouldRetry(error, originalRequest.url)
      ) {
        originalRequest.headers['X-Retry'] = 'true';
        await delay(API_CONFIG.retryDelay);
        return client(originalRequest);
      }

      const data = error.response?.data as {
        code?: string;
        errors?: Record<string, string[]>;
        retryAfterSec?: number;
      } | undefined;

      const apiError: ApiError = {
        message: data?.code ?? 'API error',
        statusCode: error.response?.status ?? 0,
        code: data?.code,
        errors: data?.errors,
        retryAfterSec: data?.retryAfterSec,
      };

      if (!error.response) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          apiError.code = 'SERVER_ERROR';
        } else {
          apiError.code = 'NETWORK_ERROR';
        }
        apiError.statusCode = 0;
      } else if (!apiError.code && apiError.statusCode >= 500) {
        apiError.code = 'SERVER_ERROR';
      }

      logApiFailure({
        method: originalRequest?.method,
        url: originalRequest?.url,
        status: error.response?.status,
        code: apiError.code,
        message: data?.code,
        network: !error.response,
      });

      return Promise.reject(apiError);
    },
  );

  return client;
}

function shouldRetry(error: AxiosError, url?: string): boolean {
  // Auth must fail fast — never retry hung login/register.
  if (isAuthPath(url)) return false;
  if (error.code === 'ECONNABORTED') return false;
  if (!error.response) return true;
  return error.response.status >= 500;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const apiClient = createApiClient();
