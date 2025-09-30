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

export type LogoutResponse = BaseApiResponse;

export interface UserResponse extends BaseApiResponse {
  user?: User;
}

export interface CrewListResponse extends BaseApiResponse {
  crew?: User[];
  total?: number;
}

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  last_login_at?: string | null;
  is_crew: number; // 1 = crew, 0 = admin
  role?: string; // 'crew' or 'admin'
  crew_id?: string;
  fleet_name?: string;
  rank_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  mobile_number?: string;
  permanent_address_id?: number;
  graduated_school_id?: number;
  date_graduated?: string;
  crew_status?: string;
  hire_status?: string;
  hire_date?: string;
  passport_number?: string;
  passport_expiry?: string;
  seaman_book_number?: string;
  seaman_book_expiry?: string;
  primary_allotee_id?: number;
  last_login_ip?: string;
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