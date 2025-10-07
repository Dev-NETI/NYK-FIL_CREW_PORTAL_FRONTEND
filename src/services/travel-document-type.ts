import api from "@/lib/axios";

export interface TravelDocumentType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export class TravelDocumentTypeService {
  /**
   * Get all travel document types
   */
  static async getTravelDocumentTypes(): Promise<TravelDocumentType[]> {
    const response = await api.get<TravelDocumentType[]>(
      `/travel-document-types`
    );
    return response.data;
  }
}
