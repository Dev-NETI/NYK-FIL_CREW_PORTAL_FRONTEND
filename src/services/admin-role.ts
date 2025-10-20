import api from "@/lib/axios";

export interface User {
  id: number;
  is_crew: boolean;
  department_id: number;
  email: string;
  email_verified_at: string | null;
  modified_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  last_login_ip: string | null;
}

export interface Role {
  id: number;
  name: string;
  modified_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminRole {
  id: number;
  user_id: number;
  role_id: number;
  modified_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: User;
  role: Role;
}

export interface AdminRoleByUserResponse {
  success: boolean;
  data: AdminRole[];
  message?: string;
}

export interface CreateAdminRoleRequest {
  user_id: number;
  role_id: number;
}

export interface CreateAdminRoleResponse {
  success: boolean;
  message: string;
  data?: AdminRole;
}

export interface DeleteAdminRoleResponse {
  success: boolean;
  message: string;
}

export class AdminRoleService {
  /**
   * Get all admin role assignments
   * Response includes user and role data
   */
  static async getAll(): Promise<AdminRole[]> {
    const response = await api.get<AdminRole[]>("/admin-roles");
    return response.data;
  }

  /**
   * Get admin roles for a specific user
   * Response includes only role data (no user field)
   */
  static async getByUserId(userId: number): Promise<AdminRole[]> {
    const response = await api.get<AdminRole[]>(`/admin-roles/user/${userId}`);
    return response.data;
  }

  /**
   * Assign a role to a user
   */
  static async store(
    data: CreateAdminRoleRequest
  ): Promise<CreateAdminRoleResponse> {
    const response = await api.post<CreateAdminRoleResponse>(
      "/admin-roles",
      data
    );
    return response.data;
  }

  /**
   * Remove a role assignment
   */
  static async destroy(id: number): Promise<DeleteAdminRoleResponse> {
    const response = await api.delete<DeleteAdminRoleResponse>(
      `/admin-roles/${id}`
    );
    return response.data;
  }
}
