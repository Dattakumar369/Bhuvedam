export interface User {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  avatar?: string;
  language: string;
  location?: string;
  farmSize?: string;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
}

export interface LoginRequest {
  phone: string;
  name?: string;
  language?: string;
  otp?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SendOtpResponse {
  expiresInSec: number;
  /** voice until DLT SMS is live; sms after OTP_CHANNEL=sms */
  channel?: 'voice' | 'sms';
  /** Only in dev when OTP_DEV_MODE=true on backend */
  devOtp?: string;
}

export interface VerifyOtpResponse {
  token?: string;
  user?: User;
  needsName?: boolean;
  phone?: string;
}

export interface RegisterRequest {
  name: string;
  password: string;
  phone?: string;
  email?: string;
  language?: string;
}

export interface LoginPasswordRequest {
  identifier: string;
  password: string;
}

export interface ResetPasswordRequest {
  phone: string;
  otp: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
