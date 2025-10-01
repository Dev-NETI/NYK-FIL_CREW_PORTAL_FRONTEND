import api from '@/lib/axios';
import { User, BaseApiResponse, CrewListResponse } from '@/types/api';

export interface UserProfileResponse extends BaseApiResponse {
  user?: User;
}

export class UserService {
  /**
   * Get user profile by crew ID
   */
  static async getUserProfile(crewId: string): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>(`/crew/${crewId}/profile`);
    return response.data;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(crewId: string, profileData: Partial<User>): Promise<UserProfileResponse> {
    const response = await api.put<UserProfileResponse>(`/crew/${crewId}/profile`, profileData);
    return response.data;
  }

  /**
   * Get current user's profile
   */
  static async getCurrentUserProfile(): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>('/user/profile');
    return response.data;
  }

  /**
   * Get all crew members (admin only)
   */
  static async getAllCrew(): Promise<CrewListResponse> {
    const response = await api.get<CrewListResponse>('/admin/crew');
    return response.data;
  }

  /**
   * Get crew member profile by ID (admin only)
   */
  static async getCrewProfile(crewId: string): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>(`/admin/crew/${crewId}`);
    return response.data;
  }
}