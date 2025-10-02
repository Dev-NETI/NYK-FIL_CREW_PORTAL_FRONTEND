import api from '@/lib/axios';
import { BaseApiResponse } from '@/types/api';

export interface Program {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramListResponse extends BaseApiResponse {
  data: Program[];
}

export interface ProgramResponse extends BaseApiResponse {
  data: Program;
}

export interface CreateProgramData {
  name: string;
}

export interface UpdateProgramData {
  name: string;
}

export class ProgramService {
  /**
   * Get all programs
   */
  static async getPrograms(): Promise<ProgramListResponse> {
    const response = await api.get<ProgramListResponse>('/admin/programs');
    return response.data;
  }

  /**
   * Get program by ID
   */
  static async getProgram(id: number): Promise<ProgramResponse> {
    const response = await api.get<ProgramResponse>(`/admin/programs/${id}`);
    return response.data;
  }

  /**
   * Create new program
   */
  static async createProgram(data: CreateProgramData): Promise<ProgramResponse> {
    const response = await api.post<ProgramResponse>('/admin/programs', data);
    return response.data;
  }

  /**
   * Update program
   */
  static async updateProgram(id: number, data: UpdateProgramData): Promise<ProgramResponse> {
    const response = await api.put<ProgramResponse>(`/admin/programs/${id}`, data);
    return response.data;
  }

  /**
   * Delete program
   */
  static async deleteProgram(id: number): Promise<BaseApiResponse> {
    const response = await api.delete<BaseApiResponse>(`/admin/programs/${id}`);
    return response.data;
  }
}