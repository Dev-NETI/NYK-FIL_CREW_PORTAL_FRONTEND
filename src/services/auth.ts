import api from '@/lib/axios';
import toast from 'react-hot-toast';
import {
  LoginInitiateRequest,
  LoginInitiateResponse,
  LoginVerifyRequest,
  LoginVerifyResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  LogoutResponse,
  UserResponse,
  User,
} from '@/types/api';

export class AuthService {
  /**
   * Get CSRF cookie from Laravel Sanctum
   */
  static async getCsrfCookie(): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
    await api.get('/sanctum/csrf-cookie', {
      baseURL: baseUrl,
    });
  }

  /**
   * Initiate login by sending email and receiving OTP
   */
  static async initiateLogin(data: LoginInitiateRequest): Promise<LoginInitiateResponse> {
    await this.getCsrfCookie();
    const response = await api.post<LoginInitiateResponse>('/auth/login', data);
    return response.data;
  }

  /**
   * Verify OTP and complete login
   */
  static async verifyOtp(data: LoginVerifyRequest): Promise<LoginVerifyResponse> {
    await this.getCsrfCookie();
    const response = await api.post<LoginVerifyResponse>('/auth/verify', data);
    return response.data;
  }

  /**
   * Resend OTP code
   */
  static async resendOtp(data: ResendOtpRequest): Promise<ResendOtpResponse> {
    await this.getCsrfCookie();
    const response = await api.post<ResendOtpResponse>('/auth/resend-otp', data);
    return response.data;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<LogoutResponse> {
    await this.getCsrfCookie();
    const response = await api.post<LogoutResponse>('/auth/logout');
    return response.data;
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/user');
    return response.data;
  }

  /**
   * Store authentication data in localStorage and cookies
   */
  static storeAuthData(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Also store in cookies for middleware access
      document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400; SameSite=Lax`;
    }
  }

  /**
   * Clear authentication data from localStorage and cookies
   */
  static clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Also clear cookies
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  /**
   * Get stored authentication token
   */
  static getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Get stored user data
   */
  static getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          this.clearAuthData();
        }
      }
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }

  /**
   * Handle successful login
   */
  static handleLoginSuccess(token: string, user: User, redirectTo?: string): void {
    this.storeAuthData(token, user);
    
    // Show success toast with role-specific message
    const isCrewMember = Boolean(user.is_crew);
    toast.success(`Welcome back, ${user.name || user.email}!`, {
      icon: isCrewMember ? '⚓' : '👨‍💼',
    });
    
    // Redirect based on user role or provided redirect path
    const destination = redirectTo || (isCrewMember ? '/crew/home' : '/admin');
    
    // Immediate redirect without delay to prevent middleware conflicts
    if (typeof window !== 'undefined') {
      window.location.href = destination;
    }
  }

  /**
   * Handle logout
   */
  static async handleLogout(): Promise<void> {
    try {
      // Call logout endpoint
      await this.logout();
      toast.success('Logged out successfully', {
        icon: '👋',
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
      toast.error('Logout failed, but you will be logged out locally');
    } finally {
      // Clear local storage
      this.clearAuthData();
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  /**
   * Show success toast notification
   */
  static showSuccessToast(message: string, icon?: string): void {
    toast.success(message, { icon });
  }

  /**
   * Show error toast notification
   */
  static showErrorToast(message: string, icon?: string): void {
    toast.error(message, { icon });
  }

  /**
   * Show loading toast notification
   */
  static showLoadingToast(message: string): string {
    return toast.loading(message);
  }

  /**
   * Dismiss toast notification
   */
  static dismissToast(toastId: string): void {
    toast.dismiss(toastId);
  }
}