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

export class CrewCertificateService {
  /**
   * Get crew certificates by crew ID
   */
  static async getCrewCertificatesByCrewId(
    crewId: string
  ): Promise<CrewCertificate[]> {
    const response = await api.get<CrewCertificate[]>(
      `/crew-certificates?crew_id=${crewId}`
    );
    return response.data;
  }

  /**
   * Create a new crew certificate
   * Accepts either JSON object or FormData (for file uploads)
   */
  static async createCrewCertificate(
    data: CreateCrewCertificateData | FormData
  ): Promise<CrewCertificate> {
    const response = await api.post<CrewCertificate>("/crew-certificates", data);
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
    const response = isFormData
      ? await api.post<CrewCertificate>(`/crew-certificates/${id}`, data)
      : await api.put<CrewCertificate>(`/crew-certificates/${id}`, data);
    return response.data;
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
