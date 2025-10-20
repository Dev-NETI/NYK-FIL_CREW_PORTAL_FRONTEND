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

export interface EmploymentDocumentType {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmploymentDocument {
  id: number;
  crew_id: string;
  employment_document_type_id: number;
  document_number: string;
  file_path: string | null;
  file_ext: string | null;
  created_at: string;
  updated_at: string;
  modified_by: string | null;
  user_profile?: UserProfile;
  employment_document_type?: EmploymentDocumentType;
}

export interface EmploymentDocumentUpdate {
  id: number;
  employment_document_id: number;
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
  employment_document?: EmploymentDocument;
  user_profile?: UserProfile;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data?: EmploymentDocumentUpdate;
}

export interface RejectRequest {
  rejection_reason: string;
}

export class EmploymentDocumentApprovalService {
  /**
   * Get all pending update requests
   */
  static async getPendingUpdates(): Promise<EmploymentDocumentUpdate[]> {
    const response = await api.get<EmploymentDocumentUpdate[]>(
      "/employment-document-updates"
    );
    return response.data;
  }

  /**
   * Get all update requests (pending, approved, rejected)
   */
  static async getAllUpdates(): Promise<EmploymentDocumentUpdate[]> {
    const response = await api.get<EmploymentDocumentUpdate[]>(
      "/employment-document-updates/all"
    );
    return response.data;
  }

  /**
   * Get single update request
   */
  static async getUpdate(id: number): Promise<EmploymentDocumentUpdate> {
    const response = await api.get<EmploymentDocumentUpdate>(
      `/employment-document-updates/${id}`
    );
    return response.data;
  }

  /**
   * Approve an update request
   */
  static async approve(id: number): Promise<ApprovalResponse> {
    const response = await api.post<ApprovalResponse>(
      `/employment-document-updates/${id}/approve`
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
      `/employment-document-updates/${id}/reject`,
      data
    );
    return response.data;
  }

  /**
   * Get update history for a specific employment document
   */
  static async getHistory(
    documentId: number
  ): Promise<EmploymentDocumentUpdate[]> {
    const response = await api.get<{
      success: boolean;
      data: EmploymentDocumentUpdate[];
    }>(`/employment-document-updates/history/${documentId}`);
    return response.data.data;
  }
}
