import api from '@/lib/axios';
import { BaseApiResponse } from '@/types/api';

export interface EmploymentRecord {
  id: number;
  user_id: number;
  program_id: number;
  batch?: string;
  program: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface EmploymentListResponse extends BaseApiResponse {
  data: EmploymentRecord[];
}

export interface EmploymentResponse extends BaseApiResponse {
  data: EmploymentRecord;
}

export interface CreateEmploymentData {
  program_id: number;
  batch?: string;
}

export interface UpdateEmploymentData extends Partial<CreateEmploymentData> {}

export class EmploymentService {
  /**
   * Get employment records for a user
   */
  static async getEmploymentRecords(userId: string): Promise<EmploymentListResponse> {
    const response = await api.get<EmploymentListResponse>(`/admin/crew/${userId}/employment`);
    return response.data;
  }

  /**
   * Get specific employment record
   */
  static async getEmploymentRecord(userId: string, employmentId: number): Promise<EmploymentResponse> {
    const response = await api.get<EmploymentResponse>(`/admin/crew/${userId}/employment/${employmentId}`);
    return response.data;
  }

  /**
   * Create new employment record
   */
  static async createEmploymentRecord(userId: string, data: CreateEmploymentData): Promise<EmploymentResponse> {
    const response = await api.post<EmploymentResponse>(`/admin/crew/${userId}/employment`, data);
    return response.data;
  }

  /**
   * Update employment record
   */
  static async updateEmploymentRecord(userId: string, employmentId: number, data: UpdateEmploymentData): Promise<EmploymentResponse> {
    const response = await api.put<EmploymentResponse>(`/admin/crew/${userId}/employment/${employmentId}`, data);
    return response.data;
  }

  /**
   * Delete employment record
   */
  static async deleteEmploymentRecord(userId: string, employmentId: number): Promise<BaseApiResponse> {
    const response = await api.delete<BaseApiResponse>(`/admin/crew/${userId}/employment/${employmentId}`);
    return response.data;
  }
}