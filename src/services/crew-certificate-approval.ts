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

export interface Certificate {
  id: number;
  certificate_type_id: number;
  name: string;
  code: string;
  stcw_type: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrewCertificate {
  id: number;
  certificate_id: number;
  crew_id: string;
  grade: string | null;
  rank_permitted: string | null;
  certificate_no: string;
  issued_by: string;
  date_issued: string;
  expiry_date: string | null;
  file_path: string | null;
  file_ext: string | null;
  created_at: string;
  updated_at: string;
  modified_by: string | null;
  crew?: UserProfile;
  certificate?: Certificate;
}

export interface CrewCertificateUpdate {
  id: number;
  crew_certificate_id: number | null;
  crew_id: string;
  original_data: Record<string, any>;
  updated_data: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  modified_by: string | null;
  crew_certificate?: CrewCertificate | null;
  user_profile?: UserProfile;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data?: CrewCertificateUpdate;
}

export interface RejectRequest {
  rejection_reason: string;
}

export class CrewCertificateApprovalService {
  /**
   * Get all pending update requests
   */
  static async getPendingUpdates(): Promise<CrewCertificateUpdate[]> {
    const response = await api.get<CrewCertificateUpdate[]>(
      "/crew-certificate-updates"
    );
    return response.data;
  }

  /**
   * Get all update requests (pending, approved, rejected)
   */
  static async getAllUpdates(): Promise<CrewCertificateUpdate[]> {
    const response = await api.get<CrewCertificateUpdate[]>(
      "/crew-certificate-updates/all"
    );
    return response.data;
  }

  /**
   * Get single update request
   */
  static async getUpdate(id: number): Promise<CrewCertificateUpdate> {
    const response = await api.get<CrewCertificateUpdate>(
      `/crew-certificate-updates/${id}`
    );
    return response.data;
  }

  /**
   * Approve an update request
   */
  static async approve(id: number): Promise<ApprovalResponse> {
    const response = await api.post<ApprovalResponse>(
      `/crew-certificate-updates/${id}/approve`
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
      `/crew-certificate-updates/${id}/reject`,
      data
    );
    return response.data;
  }

  /**
   * Get update history for a specific crew certificate
   */
  static async getHistory(
    certificateId: number
  ): Promise<CrewCertificateUpdate[]> {
    const response = await api.get<{
      success: boolean;
      data: CrewCertificateUpdate[];
    }>(`/crew-certificate-updates/history/${certificateId}`);
    return response.data.data;
  }
}
