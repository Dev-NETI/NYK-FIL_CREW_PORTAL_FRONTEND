import api from "@/lib/axios";

export interface EmploymentDocumentUpdate {
  id: number;
  employment_document_id: number;
  crew_id: number;
  original_data: Record<string, any>;
  updated_data: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  employment_document?: {
    id: number;
    crew_id: number;
    employment_document_type_id: number;
    document_number: string;
    file_path: string | null;
    file_ext: string | null;
    crew?: {
      id: number;
      email: string;
      crew_profile?: {
        firstname: string;
        middlename: string | null;
        lastname: string;
      };
    };
    position?: {
      id: number;
      name: string;
    };
    vessel?: {
      id: number;
      name: string;
    };
  };
  crew?: {
    id: number;
    email: string;
    crew_profile?: {
      firstname: string;
      middlename: string | null;
      lastname: string;
    };
  };
  reviewer?: {
    id: number;
    email: string;
    admin_profile?: {
      firstname: string;
      middlename: string | null;
      lastname: string;
    };
  };
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
    const response = await api.get<{ success: boolean; data: EmploymentDocumentUpdate[] }>(
      "/admin/employment-document-updates"
    );
    return response.data.data;
  }

  /**
   * Get all update requests (pending, approved, rejected)
   */
  static async getAllUpdates(): Promise<EmploymentDocumentUpdate[]> {
    const response = await api.get<{ success: boolean; data: EmploymentDocumentUpdate[] }>(
      "/admin/employment-document-updates/all"
    );
    return response.data.data;
  }

  /**
   * Get single update request
   */
  static async getUpdate(id: number): Promise<EmploymentDocumentUpdate> {
    const response = await api.get<{ success: boolean; data: EmploymentDocumentUpdate }>(
      `/admin/employment-document-updates/${id}`
    );
    return response.data.data;
  }

  /**
   * Approve an update request
   */
  static async approve(id: number): Promise<ApprovalResponse> {
    const response = await api.post<ApprovalResponse>(
      `/admin/employment-document-updates/${id}/approve`
    );
    return response.data;
  }

  /**
   * Reject an update request
   */
  static async reject(id: number, data: RejectRequest): Promise<ApprovalResponse> {
    const response = await api.post<ApprovalResponse>(
      `/admin/employment-document-updates/${id}/reject`,
      data
    );
    return response.data;
  }

  /**
   * Get update history for a specific employment document
   */
  static async getHistory(documentId: number): Promise<EmploymentDocumentUpdate[]> {
    const response = await api.get<{ success: boolean; data: EmploymentDocumentUpdate[] }>(
      `/admin/employment-document-updates/history/${documentId}`
    );
    return response.data.data;
  }
}
