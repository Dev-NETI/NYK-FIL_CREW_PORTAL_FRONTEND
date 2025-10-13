import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";

export interface TravelDocumentType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TravelDocument {
  id: number;
  crew_id: string;
  id_no: string;
  travel_document_type_id: number;
  place_of_issue: string;
  date_of_issue: string;
  expiration_date: string;
  remaining_pages: number;
  is_US_VISA: number;
  visa_type: string | null;
  file_path?: string;
  file_ext?: string;
  modified_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  travel_document_type: TravelDocumentType;
}

export interface SaveTravelDocumentPayload {
  crew_id: number;
  travel_document_type_id: number;
  id_no: string;
  place_of_issue: string;
  date_of_issue: string;
  expiration_date: string;
  remaining_pages?: number;
  is_US_VISA: boolean;
  visa_type?: string;
}

export interface SaveTravelDocumentResponse {
  success: boolean;
  message: string;
}

export interface UpdateTravelDocumentPayload {
  id_no?: string;
  place_of_issue?: string;
  date_of_issue?: string;
  expiration_date?: string;
  remaining_pages?: number;
  is_US_VISA?: boolean;
  visa_type?: string;
}

export interface UpdateTravelDocumentResponse {
  success: boolean;
  message: string;
}

export class TravelDocumentService {
  /**
   * Get travel documents by crew ID
   */
  static async getTravelDocumentsByCrewId(
    crewId: number | string
  ): Promise<TravelDocument[]> {
    const response = await api.get<TravelDocument[]>(
      `/travel-documents/${crewId}`
    );
    return response.data;
  }

  /**
   * Save a new travel document
   * Accepts either JSON object or FormData (for file uploads)
   */
  static async saveTravelDocument(
    payload: SaveTravelDocumentPayload | FormData
  ): Promise<SaveTravelDocumentResponse> {
    const response = await api.post<SaveTravelDocumentResponse>(
      "/travel-documents",
      payload
    );
    return response.data;
  }

  /**
   * Update an existing travel document
   * Accepts either JSON object or FormData (for file uploads)
   */
  static async updateTravelDocument(
    travelDocumentId: number,
    payload: UpdateTravelDocumentPayload | FormData
  ): Promise<UpdateTravelDocumentResponse> {
    // Use POST when FormData (for file uploads), PUT for JSON
    const isFormData = payload instanceof FormData;
    const response = isFormData
      ? await api.post<UpdateTravelDocumentResponse>(
          `/travel-documents/${travelDocumentId}`,
          payload
        )
      : await api.put<UpdateTravelDocumentResponse>(
          `/travel-documents/${travelDocumentId}`,
          payload
        );
    return response.data;
  }

  /**
   * Delete travel document
   */
  static async deleteTravelDocument(
    documentId: number
  ): Promise<BaseApiResponse> {
    const response = await api.delete<BaseApiResponse>(
      `/travel-documents/${documentId}`
    );
    return response.data;
  }
}
