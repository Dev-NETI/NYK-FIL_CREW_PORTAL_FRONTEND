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
  file_path?: string;
  file_ext?: string;
  modified_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  employment_document_type: EmploymentDocumentType;
}

export interface UpdateEmploymentDocumentData {
  document_number: string;
}

export interface CreateEmploymentDocumentData {
  crew_id: number;
  employment_document_type_id: number;
  document_number: string;
}

export interface CreateEmploymentDocumentResponse extends BaseApiResponse {
  data?: EmploymentDocument;
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
   * Create employment document
   * Accepts either JSON object or FormData (for file uploads)
   */
  static async createEmploymentDocument(
    data: CreateEmploymentDocumentData | FormData
  ): Promise<CreateEmploymentDocumentResponse> {
    const response = await api.post<CreateEmploymentDocumentResponse>(
      `/employment-documents`,
      data
    );
    return response.data;
  }

  /**
   * Update employment document
   * Accepts either JSON object or FormData (for file uploads)
   */
  static async updateEmploymentDocument(
    documentId: number,
    data: UpdateEmploymentDocumentData | FormData
  ): Promise<UpdateEmploymentDocumentResponse> {
    // Use POST when FormData (for file uploads), PUT for JSON
    const isFormData = data instanceof FormData;
    const response = isFormData
      ? await api.post<UpdateEmploymentDocumentResponse>(
          `/employment-documents/${documentId}`,
          data
        )
      : await api.put<UpdateEmploymentDocumentResponse>(
          `/employment-documents/${documentId}`,
          data
        );
    return response.data;
  }

  /**
   * Delete employment document
   */
  static async deleteEmploymentDocument(
    documentId: number
  ): Promise<BaseApiResponse> {
    const response = await api.delete<BaseApiResponse>(
      `/employment-documents/${documentId}`
    );
    return response.data;
  }
}
