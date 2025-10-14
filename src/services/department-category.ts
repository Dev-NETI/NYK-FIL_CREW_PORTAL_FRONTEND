import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";

export interface DepartmentCategory {
  id: number;
  name: string;
  modified_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DepartmentCategoryListResponse extends BaseApiResponse {
  data: DepartmentCategory[];
  total: number;
}

export class DepartmentCategoryService {
  /**
   * Get all department categories
   */
  static async getAllDepartmentCategories(): Promise<DepartmentCategory[]> {
    const response = await api.get<DepartmentCategory[]>(
      "/department-categories"
    );
    return response.data;
  }
}
