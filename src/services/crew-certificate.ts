import api from "@/lib/axios";
import { Certificate } from "./certificate";

export interface CrewCertificate {
  id: number;
  certificate_id: number;
  crew_id: string;
  grade: string | null;
  rank_permitted: string | null;
  certificate_no: string | null;
  issued_by: string | null;
  date_issued: string | null;
  expiry_date: string | null;
  file_path: string | null;
  file_ext: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  modified_by?: string;
  certificate?: Certificate;
  // Computed fields from API
  status?: "valid" | "expired" | "expiring_soon";
  has_file?: boolean;
  days_until_expiry?: number | null;
}

export interface CreateCrewCertificateData {
  certificate_id: number;
  crew_id: string;
  grade?: string;
  rank_permitted?: string;
  certificate_no?: string;
  issued_by?: string;
  date_issued?: string;
  expiry_date?: string;
}

export interface CrewCertificateFilters {
  search?: string;
  certificate_type_id?: number;
}

export class CrewCertificateService {
  /**
   * Get crew certificates by crew ID with optional filtering
   */
  static async getCrewCertificatesByCrewId(
    crewId: string,
    filters?: CrewCertificateFilters
  ): Promise<CrewCertificate[]> {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.certificate_type_id) {
      params.append(
        "certificate_type_id",
        filters.certificate_type_id.toString()
      );
    }

    const queryString = params.toString();
    const url = `/crew/${crewId}/certificates${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await api.get<{
      success: boolean;
      data: CrewCertificate[];
      count: number;
    }>(url);
    return response.data.data;
  }

  /**
   * Create a new crew certificate
   * Accepts either JSON object or FormData (for file uploads)
   */
  static async createCrewCertificate(
    data: CreateCrewCertificateData | FormData
  ): Promise<CrewCertificate> {
    const response = await api.post<CrewCertificate>(
      "/crew-certificates",
      data
    );
    return response.data;
  }

  /**
   * Update crew certificate
   * Accepts either JSON object or FormData (for file uploads)
   */
  static async updateCrewCertificate(
    id: number,
    data: Partial<CreateCrewCertificateData> | FormData
  ): Promise<CrewCertificate> {
    const isFormData = data instanceof FormData;

    if (isFormData) {
      // For FormData, we need to use POST with _method override for Laravel
      data.append("_method", "PUT");
      const response = await api.post<{
        success: boolean;
        data: CrewCertificate;
        message: string;
      }>(`/crew-certificates/${id}`, data);
      return response.data.data;
    } else {
      const response = await api.put<{
        success: boolean;
        data: CrewCertificate;
        message: string;
      }>(`/crew-certificates/${id}`, data);
      return response.data.data;
    }
  }

  /**
   * Delete crew certificate
   */
  static async deleteCrewCertificate(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/crew-certificates/${id}`
    );
    return response.data;
  }
}
