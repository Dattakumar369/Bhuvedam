import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { API_CONFIG } from '@/constants/app';
import type { ApiError } from '@/types/api';
import { logApiFailure } from '@/utils/logger';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
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
      }

      if (
        originalRequest &&
        !originalRequest.headers['X-Retry'] &&
        shouldRetry(error)
      ) {
        originalRequest.headers['X-Retry'] = 'true';
        await delay(API_CONFIG.retryDelay);
        return client(originalRequest);
      }

      const data = error.response?.data as {
        message?: string;
        error?: string;
        code?: string;
        errors?: Record<string, string[]>;
        retryAfterSec?: number;
      } | undefined;

      const rawMessage = data?.message ?? data?.error ?? '';
      const apiError: ApiError = {
        message: rawMessage || 'Something went wrong. Please try again.',
        statusCode: error.response?.status ?? 500,
        code: data?.code,
        errors: data?.errors,
        retryAfterSec: data?.retryAfterSec,
      };

      logApiFailure({
        method: originalRequest?.method,
        url: originalRequest?.url,
        status: error.response?.status,
        code: apiError.code,
        message: apiError.message,
        network: !error.response,
      });

      return Promise.reject(apiError);
    },
  );

  return client;
}

function shouldRetry(error: AxiosError): boolean {
  if (!error.response) return true;
  return error.response.status >= 500;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const apiClient = createApiClient();
