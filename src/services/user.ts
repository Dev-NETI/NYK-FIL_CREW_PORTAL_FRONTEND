import api from "@/lib/axios";
import { User, BaseApiResponse, CrewListResponse } from "@/types/api";

export interface UserProfileResponse extends BaseApiResponse {
  user?: User;
}

export class UserService {
  /**
   * Get user profile by crew ID
   */
  static async getUserProfile(crewId: string): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>(
      `/crew/${crewId}/profile`
    );
    return response.data;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    crewId: string,
    profileData: Partial<User>
  ): Promise<UserProfileResponse> {
    const response = await api.put<UserProfileResponse>(
      `/crew/${crewId}/profile`,
      profileData
    );
    return response.data;
  }

  /**
   * Get current user's profile
   */
  static async getCurrentUserProfile(): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>("/user/profile");
    return response.data;
  }

  /**
   * Get all crew members with pagination and filters (admin only)
   */
  static async getAllCrew(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<CrewListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.search !== undefined) searchParams.append('search', params.search);
    if (params?.status && params.status !== 'all') searchParams.append('status', params.status);
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.append('sort_order', params.sort_order);

    const queryString = searchParams.toString();
    const url = queryString ? `/admin/crew?${queryString}` : '/admin/crew';
    
    const response = await api.get<CrewListResponse>(url);
    return response.data;
  }

  /**
   * Get crew member profile by ID (admin only)
   */
  static async getCrewProfile(id: string): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>(
      `/admin/crew/${id}/profile`
    );
    return response.data;
  }

  /**
   * Update crew member profile (admin only)
   */
  static async updateCrewProfile(
    id: string,
    profileData: Partial<User>
  ): Promise<UserProfileResponse> {
    const response = await api.put<UserProfileResponse>(
      `/admin/crew/${id}`,
      profileData
    );
    return response.data;
  }

  /**
   * Store education information for crew member (admin only)
   */
  static async storeEducationInformation(
    id: string,
    educationData: {
      high_school?: {
        school_name: string;
        date_graduated?: string;
        degree?: string;
      };
      college?: {
        school_name: string;
        date_graduated?: string;
        degree?: string;
      };
      higher_education?: {
        school_name: string;
        date_graduated?: string;
        degree?: string;
      };
    }
  ): Promise<BaseApiResponse> {
    const response = await api.post<BaseApiResponse>(
      `/admin/crew/${id}/education-info`,
      educationData
    );
    return response.data;
  }

  /**
   * Update education information for crew member (admin only)
   */
  static async updateEducationInformation(
    id: string,
    educationData: {
      high_school?: {
        school_name: string;
        date_graduated?: string;
        degree?: string;
      };
      college?: {
        school_name: string;
        date_graduated?: string;
        degree?: string;
      };
      higher_education?: {
        school_name: string;
        date_graduated?: string;
        degree?: string;
      };
    }
  ): Promise<BaseApiResponse> {
    const response = await api.put<BaseApiResponse>(
      `/admin/crew/${id}/education-info`,
      educationData
    );
    return response.data;
  }
}
