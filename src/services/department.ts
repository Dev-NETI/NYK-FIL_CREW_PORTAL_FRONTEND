import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";
import { DepartmentCategory } from "./department-category";

export interface Department {
  id: number;
  department_category_id: number;
  name: string;
  modified_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  department_category: DepartmentCategory;
}

export interface DepartmentListResponse extends BaseApiResponse {
  data: Department[];
  total: number;
}

export class DepartmentService {
  /**
   * Get all departments
   */
  static async getAllDepartments(): Promise<Department[]> {
    const response = await api.get<Department[]>("/departments");
    return response.data;
  }

  /**
   * Get departments by department category ID
   */
  static async getDepartmentsByCategory(
    departmentCategoryId: number
  ): Promise<Department[]> {
    const response = await api.get<Department[]>(
      `/departments/${departmentCategoryId}`
    );
    return response.data;
  }
}
