import api from "@/lib/axios";

export interface Role {
  id: number;
  name: string;
  modified_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export class RoleService {
  /**
   * Get all roles
   */
  static async getAll(): Promise<Role[]> {
    const response = await api.get<Role[]>("/roles");
    return response.data;
  }
}
