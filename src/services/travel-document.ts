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
   */
  static async saveTravelDocument(
    payload: SaveTravelDocumentPayload
  ): Promise<SaveTravelDocumentResponse> {
    const response = await api.post<SaveTravelDocumentResponse>(
      "/travel-documents",
      payload
    );
    return response.data;
  }
}
