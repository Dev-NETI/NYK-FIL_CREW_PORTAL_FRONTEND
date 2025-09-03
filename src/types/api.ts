// Base API Response interface
export interface BaseApiResponse {
  success: boolean;
  message: string;
}

// Authentication API Response interfaces
export interface LoginInitiateResponse extends BaseApiResponse {
  session_token?: string;
  expires_in?: number;
  otp?: string; // Only for development/debugging
  retry_after?: number;
}

export interface LoginVerifyResponse extends BaseApiResponse {
  user?: User;
  token?: string;
  expires_at?: string;
  redirect_to?: string;
  attempts_remaining?: number;
  retry_after?: number;
}

export interface ResendOtpResponse extends BaseApiResponse {
  expires_in?: number;
  retry_after?: number;
}

export interface LogoutResponse extends BaseApiResponse {}

export interface UserResponse extends BaseApiResponse {
  user?: User;
}

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  last_login_at?: string | null;
  first_name?: string;
  last_name?: string;
  is_crew: number; // 1 = crew, 0 = admin
  role?: string; // 'crew' or 'admin'
  crew_id?: string;
  fleet_id?: number;
  rank_id?: number;
}

// Request interfaces
export interface LoginInitiateRequest {
  email: string;
}

export interface LoginVerifyRequest {
  session_token: string;
  otp: string;
}

export interface ResendOtpRequest {
  session_token: string;
}

// Error response interface
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  retry_after?: number;
}