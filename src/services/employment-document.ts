import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";

export interface EmploymentDocumentType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EmploymentDocument {
  id: number;
  crew_id: string;
  employment_document_type_id: number;
  document_number: string;
  modified_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  employment_document_type: EmploymentDocumentType;
}

export interface UpdateEmploymentDocumentData {
  document_number: string;
}

export interface UpdateEmploymentDocumentResponse extends BaseApiResponse {
  data?: EmploymentDocument;
}

export class EmploymentDocumentService {
  /**
   * Get employment documents by crew ID
   */
  static async getEmploymentDocumentsByCrewId(
    crewId: number | string
  ): Promise<EmploymentDocument[]> {
    const response = await api.get<EmploymentDocument[]>(
      `/employment-documents/${crewId}`
    );
    return response.data;
  }

  /**
   * Update employment document
   */
  static async updateEmploymentDocument(
    documentId: number,
    data: UpdateEmploymentDocumentData
  ): Promise<UpdateEmploymentDocumentResponse> {
    const response = await api.put<UpdateEmploymentDocumentResponse>(
      `/employment-documents/${documentId}`,
      data
    );
    return response.data;
  }
}
