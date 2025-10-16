import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";

export interface Department {
  id: number;
  name: string;
}

export interface AdminProfile {
  firstname: string;
  middlename: string;
  lastname: string;
  full_name: string;
}

export interface Admin {
  id: number;
  email: string;
  department_id: number;
  department: Department;
  profile: AdminProfile;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminListResponse extends BaseApiResponse {
  data: Admin[];
  total: number;
}

export interface AdminResponse extends BaseApiResponse {
  data: Admin;
}

export interface CreateAdminRequest {
  email: string;
  department_id: number;
  firstname: string;
  middlename?: string;
  lastname: string;
}

export interface UpdateAdminRequest {
  email?: string;
  department_id?: number;
  firstname?: string;
  middlename?: string;
  lastname?: string;
}

export class AdminManagementService {
  /**
   * Get all admin users
   */
  static async getAllAdmins(): Promise<AdminListResponse> {
    const response = await api.get<AdminListResponse>("/admins");
    return response.data;
  }

  /**
   * Get admin user by ID
   */
  static async getAdmin(id: number): Promise<Admin> {
    const response = await api.get<Admin>(`/admins/${id}`);
    return response.data;
  }

  /**
   * Create new admin user
   */
  static async createAdmin(data: CreateAdminRequest): Promise<AdminResponse> {
    const response = await api.post<AdminResponse>("/admins", data);
    return response.data;
  }

  /**
   * Update admin user
   */
  static async updateAdmin(
    id: number,
    data: UpdateAdminRequest
  ): Promise<BaseApiResponse> {
    const response = await api.put<BaseApiResponse>(`/admins/${id}`, data);
    return response.data;
  }

  /**
   * Delete admin user (soft delete)
   */
  static async deleteAdmin(id: number): Promise<BaseApiResponse> {
    const response = await api.delete<BaseApiResponse>(`/admins/${id}`);
    return response.data;
  }
}
