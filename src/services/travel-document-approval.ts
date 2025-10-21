import api from "@/lib/axios";

export interface UserProfile {
  id: number;
  user_id: number;
  crew_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  birth_date: string | null;
  birth_place: string | null;
  age: number | null;
  gender: string | null;
  nationality: string | null;
  civil_status: string | null;
  religion: string | null;
  blood_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelDocumentType {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface TravelDocument {
  id: number;
  crew_id: string;
  travel_document_type_id: number;
  id_no: string;
  place_of_issue: string;
  date_of_issue: string;
  expiration_date: string;
  remaining_pages?: number;
  visa_type?: string;
  is_US_VISA: boolean;
  file_path: string | null;
  file_ext: string | null;
  created_at: string;
  updated_at: string;
  modified_by: string | null;
  user_profile?: UserProfile;
  travel_document_type?: TravelDocumentType;
}

export interface TravelDocumentUpdate {
  id: number;
  travel_document_id: number;
  crew_id: number;
  original_data: Record<string, any>;
  updated_data: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  modified_by: string | null;
  travelDocument?: TravelDocument;
  user_profile?: UserProfile;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data?: TravelDocumentUpdate;
}

export interface RejectRequest {
  rejection_reason: string;
}

export class TravelDocumentApprovalService {
  /**
   * Get all pending update requests
   */
  static async getPendingUpdates(): Promise<TravelDocumentUpdate[]> {
    const response = await api.get<TravelDocumentUpdate[]>(
      "/travel-document-updates"
    );
    return response.data;
  }

  /**
   * Get all update requests (pending, approved, rejected)
   */
  static async getAllUpdates(): Promise<TravelDocumentUpdate[]> {
    const response = await api.get<TravelDocumentUpdate[]>(
      "/travel-document-updates/all"
    );
    return response.data;
  }

  /**
   * Get single update request
   */
  static async getUpdate(id: number): Promise<TravelDocumentUpdate> {
    const response = await api.get<TravelDocumentUpdate>(
      `/travel-document-updates/${id}`
    );
    return response.data;
  }

  /**
   * Approve an update request
   */
  static async approve(id: number): Promise<ApprovalResponse> {
    const response = await api.post<ApprovalResponse>(
      `/travel-document-updates/${id}/approve`
    );
    return response.data;
  }

  /**
   * Reject an update request
   */
  static async reject(
    id: number,
    data: RejectRequest
  ): Promise<ApprovalResponse> {
    const response = await api.post<ApprovalResponse>(
      `/travel-document-updates/${id}/reject`,
      data
    );
    return response.data;
  }

  /**
   * Get update history for a specific travel document
   */
  static async getHistory(
    documentId: number
  ): Promise<TravelDocumentUpdate[]> {
    const response = await api.get<{
      success: boolean;
      data: TravelDocumentUpdate[];
    }>(`/travel-document-updates/history/${documentId}`);
    return response.data.data;
  }
}