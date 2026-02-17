import api from "@/lib/axios";

export interface CertificateType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  modified_by?: string;
}

export class CertificateTypeService {
  /**
   * Get all certificate types
   */
  static async getCertificateTypes(): Promise<CertificateType[]> {
    const response = await api.get<CertificateType[]>("/certificate-types");
    return response.data;
  }
}
