import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";

export interface ProfileUpdateRequest {
  id: number;
  crew_id: number;
  section: "basic" | "contact" | "physical" | "education";
  current_data: any;
  requested_data: any;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  crew?: {
    id: number;
    name: string;
    email: string;
    profile?: {
      crew_id?: string;
      full_name?: string;
    };
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ProfileUpdateRequestResponse extends BaseApiResponse {
  data?: ProfileUpdateRequest;
}

export interface ProfileUpdateRequestListResponse extends BaseApiResponse {
  data?: ProfileUpdateRequest[];
}

export class ProfileUpdateRequestService {
  /**
   * Submit a new profile update request
   */
  static async submitUpdateRequest(
    crewId: number,
    section: string,
    requestedData: any
  ): Promise<ProfileUpdateRequestResponse> {
    const response = await api.post<ProfileUpdateRequestResponse>(
      "/profile-update-requests",
      {
        crew_id: crewId,
        section,
        requested_data: requestedData,
      }
    );
    return response.data;
  }

  /**
   * Get profile update requests for a crew member
   */
  static async getCrewRequests(crewId: string): Promise<ProfileUpdateRequestListResponse> {
    const response = await api.get<ProfileUpdateRequestListResponse>(
      `/profile-update-requests/crew/${crewId}`
    );
    return response.data;
  }

  /**
   * Get pending profile update requests (admin only)
   */
  static async getPendingRequests(): Promise<ProfileUpdateRequestListResponse> {
    const response = await api.get<ProfileUpdateRequestListResponse>(
      "/admin/profile-update-requests/pending"
    );
    return response.data;
  }

  /**
   * Approve a profile update request (admin only)
   */
  static async approveRequest(id: number): Promise<ProfileUpdateRequestResponse> {
    const response = await api.post<ProfileUpdateRequestResponse>(
      `/admin/profile-update-requests/${id}/approve`
    );
    return response.data;
  }

  /**
   * Reject a profile update request (admin only)
   */
  static async rejectRequest(
    id: number,
    rejectionReason: string
  ): Promise<ProfileUpdateRequestResponse> {
    const response = await api.post<ProfileUpdateRequestResponse>(
      `/admin/profile-update-requests/${id}/reject`,
      {
        rejection_reason: rejectionReason,
      }
    );
    return response.data;
  }
}