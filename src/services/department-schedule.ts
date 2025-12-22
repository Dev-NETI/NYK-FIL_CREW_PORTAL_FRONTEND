import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";

export interface DepartmentSchedule {
  id: number;
  date: string;
  total_slots: number;
  opening_time: string;
  closing_time: string;
  slot_duration_minutes: number | null;
}

export interface DepartmentScheduleListResponse extends BaseApiResponse {
  data: DepartmentSchedule[];
}

export interface DepartmentScheduleResponse extends BaseApiResponse {
  data: DepartmentSchedule;
}

export class DepartmentScheduleService {
  static async getAll(): Promise<DepartmentScheduleListResponse> {
    const response = await api.get("/admin/department-schedules");
    return response.data;
  }

  static async create(
    data: Partial<DepartmentSchedule>
  ): Promise<DepartmentScheduleResponse> {
    const response = await api.post("/admin/department-schedules", data);
    return response.data;
  }

  static async update(
    id: number,
    data: Partial<DepartmentSchedule>
  ): Promise<DepartmentScheduleResponse> {
    const response = await api.put(`/admin/department-schedules/${id}`, data);
    return response.data;
  }

  static async delete(id: number): Promise<BaseApiResponse> {
    const response = await api.delete(`/admin/department-schedules/${id}`);
    return response.data;
  }
}
