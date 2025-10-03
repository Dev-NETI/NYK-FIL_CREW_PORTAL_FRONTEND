import api from "@/lib/axios";

export interface EmploymentDocumentType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export class EmploymentDocumentTypeService {
  /**
   * Get all employment document types
   */
  static async getEmploymentDocumentTypes(): Promise<EmploymentDocumentType[]> {
    const response = await api.get<EmploymentDocumentType[]>(
      "/employment-document-types"
    );
    return response.data;
  }
}
