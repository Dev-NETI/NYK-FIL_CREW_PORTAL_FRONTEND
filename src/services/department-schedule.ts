import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";

export interface DepartmentSchedule {
  id: number;
  date: string;
  total_slots: number;
}

export interface DepartmentScheduleListResponse extends BaseApiResponse {
  data: DepartmentSchedule[];
}

export interface DepartmentScheduleResponse extends BaseApiResponse {
  data: DepartmentSchedule;
}

export type DepartmentScheduleCreatePayload =
  | { total_slots: number; date: string }
  | { total_slots: number; dates: string[] }
  | { total_slots: number; start_date: string; end_date: string };

export type DepartmentScheduleUpdatePayload = {
  total_slots: number;
};

export class DepartmentScheduleService {
  static async getAll(): Promise<DepartmentScheduleListResponse> {
    const response = await api.get<DepartmentScheduleListResponse>(
      "/admin/department-schedules"
    );
    return response.data;
  }

  static async create(
    data: DepartmentScheduleCreatePayload
  ): Promise<DepartmentScheduleListResponse> {
    // controller returns array (saved schedules)
    const response = await api.post<DepartmentScheduleListResponse>(
      "/admin/department-schedules",
      data
    );
    return response.data;
  }

  static async update(
    id: number,
    data: DepartmentScheduleUpdatePayload
  ): Promise<DepartmentScheduleResponse> {
    const response = await api.put<DepartmentScheduleResponse>(
      `/admin/department-schedules/${id}`,
      data
    );
    return response.data;
  }

  static async delete(id: number): Promise<BaseApiResponse> {
    const response = await api.delete<BaseApiResponse>(
      `/admin/department-schedules/${id}`
    );
    return response.data;
  }
}
