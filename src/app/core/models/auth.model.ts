export interface User {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  emailVerified: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

export interface EmailRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OtpIssuedResponse {
  message: string;
  email: string;
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
}

export interface MessageResponse {
  message: string;
}

export interface ApiError {
  status: number;
  code?: string;
  message: string;
  fieldErrors?: Record<string, string>;
  timestamp?: string;
}

