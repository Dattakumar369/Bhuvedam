import type { Conversation, SendMessageRequest, SendMessageResponse } from '@/types/ai';
import type { ApiResponse } from '@/types/api';
import type { LoginRequest, LoginResponse, LoginPasswordRequest, RegisterRequest, ResetPasswordRequest, ChangePasswordRequest, SendOtpResponse, User, VerifyOtpResponse } from '@/types/user';
import type { WeatherData } from '@/types/weather';

import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { logger, logAuthApiError, maskPhone } from '@/utils/logger';

export const userRepository = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<{ success: boolean; data: LoginResponse }>(
      ENDPOINTS.auth.login,
      data,
    );
    return response.data.data;
  },

  async loginWithPassword(data: LoginPasswordRequest): Promise<LoginResponse> {
    const response = await apiClient.post<{ success: boolean; data: LoginResponse }>(
      ENDPOINTS.auth.loginPassword,
      data,
    );
    return response.data.data;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    logger.auth.info('Register request', {
      phone: maskPhone(data.phone),
      nameLength: data.name?.trim().length ?? 0,
      language: data.language,
    });
    try {
      const response = await apiClient.post<{ success: boolean; data: LoginResponse }>(
        ENDPOINTS.auth.register,
        data,
      );
      logger.auth.info('Register success', { userId: response.data.data.user.id });
      return response.data.data;
    } catch (err) {
      logAuthApiError('Register', err, { phone: maskPhone(data.phone) });
      throw err;
    }
  },

  async forgotPassword(phone: string): Promise<SendOtpResponse> {
    const response = await apiClient.post<{ success: boolean; data: SendOtpResponse }>(
      ENDPOINTS.auth.forgotPassword,
      { phone },
    );
    return response.data.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<LoginResponse> {
    const response = await apiClient.post<{ success: boolean; data: LoginResponse }>(
      ENDPOINTS.auth.resetPassword,
      data,
    );
    return response.data.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post(ENDPOINTS.auth.changePassword, data);
  },

  async sendOtp(phone: string): Promise<SendOtpResponse> {
    const response = await apiClient.post<{ success: boolean; data: SendOtpResponse }>(
      ENDPOINTS.auth.sendOtp,
      { phone },
    );
    return response.data.data;
  },

  async verifyOtp(phone: string, otp: string, extras?: { name?: string; language?: string }): Promise<VerifyOtpResponse> {
    const response = await apiClient.post<{ success: boolean; data: VerifyOtpResponse }>(
      ENDPOINTS.auth.verifyOtp,
      { phone, otp, ...extras },
    );
    return response.data.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(ENDPOINTS.auth.profile);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post(ENDPOINTS.auth.logout);
  },
};

export const weatherRepository = {
  async getCurrentWeather(location?: string): Promise<WeatherData> {
    const response = await apiClient.get<ApiResponse<WeatherData>>(ENDPOINTS.weather.current, {
      params: { location },
    });
    return response.data.data;
  },

  async getForecast(location?: string): Promise<WeatherData> {
    const response = await apiClient.get<ApiResponse<WeatherData>>(ENDPOINTS.weather.forecast, {
      params: { location },
    });
    return response.data.data;
  },
};

export const aiRepository = {
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<ApiResponse<Conversation[]>>(ENDPOINTS.ai.conversations);
    return response.data.data;
  },

  async getConversation(id: string): Promise<Conversation> {
    const response = await apiClient.get<ApiResponse<Conversation>>(ENDPOINTS.ai.conversation(id));
    return response.data.data;
  },

  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await apiClient.post<ApiResponse<SendMessageResponse>>(ENDPOINTS.ai.send, data);
    return response.data.data;
  },

  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.ai.conversation(id));
  },
};
