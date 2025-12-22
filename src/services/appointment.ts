import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";

export interface Appointment {
  id: number;
  crew_id: number;
  department_id: number;
  appointment_type_id: number;
  date: string;
  time: string;
  status: "confirmed" | "cancelled";
  purpose: string;
  cancelled_at?: string;
  cancelled_by?: "crew" | "department";
  cancellation_reason?: string;
  created_at: string;
}

export interface AppointmentType {
  id: number;
  name: string;
  is_active: boolean;
}

export interface DepartmentSettings {
  department_id: number;
  daily_capacity: number;
  start_time: string;
  end_time: string;
}

export interface AppointmentListResponse extends BaseApiResponse {
  data: Appointment[];
}

export interface AppointmentTypeListResponse extends BaseApiResponse {
  data: AppointmentType[];
}

export interface DepartmentSettingsResponse extends BaseApiResponse {
  data: DepartmentSettings;
}

export class AppointmentService {
  static async getAppointments(): Promise<AppointmentListResponse> {
    const response = await api.get<AppointmentListResponse>(
      "/admin/appointments"
    );
    return response.data;
  }

  static async confirmAppointment(id: number): Promise<BaseApiResponse> {
    const response = await api.post<BaseApiResponse>(
      `/admin/appointments/${id}/confirm`
    );
    return response.data;
  }

  static async cancelAppointment(
    id: number,
    reason: string
  ): Promise<BaseApiResponse> {
    const response = await api.post<BaseApiResponse>(
      `/admin/appointments/${id}/cancel`,
      { reason }
    );
    return response.data;
  }

  /* -------- APPOINTMENT TYPES -------- */

  static async getAppointmentTypes(): Promise<AppointmentTypeListResponse> {
    const response = await api.get<AppointmentTypeListResponse>(
      "/admin/appointment-types"
    );
    return response.data;
  }

  static async createAppointmentType(data: {
    department_id: number;
    name: string;
  }): Promise<BaseApiResponse> {
    const response = await api.post<BaseApiResponse>(
      "/admin/appointment-types",
      data
    );
    return response.data;
  }

  static async toggleAppointmentType(
    id: number
  ): Promise<BaseApiResponse> {
    const response = await api.patch<BaseApiResponse>(
      `/admin/appointment-types/${id}/toggle`
    );
    return response.data;
  }

  /* -------- DEPARTMENT SCHEDULES -------- */

  static async getDepartmentSchedules() {
    const response = await api.get("/admin/department-schedules");
    return response.data;
  }

  static async saveDepartmentSchedule(data: {
    id?: number;
    date: string;
    total_slots: number;
    opening_time?: string | null;
    closing_time?: string | null;
  }) {
    if (data.id) {
      return (
        await api.put(`/admin/department-schedules/${data.id}`, data)
      ).data;
    }

    return (
      await api.post("/admin/department-schedules", data)
    ).data;
  }

  static async deleteDepartmentSchedule(id: number) {
    return (
      await api.delete(`/admin/department-schedules/${id}`)
    ).data;
  }
}
