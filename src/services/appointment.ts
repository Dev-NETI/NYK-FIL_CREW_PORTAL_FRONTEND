import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";

export interface Appointment {
  id: number;
  crew_id: number;
  department_id: number;
  appointment_type_id: number;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  purpose: string;
  cancelled_at?: string;
  cancelled_by?: "crew" | "department";
  cancellation_reason?: string;
  created_at: string;
  department: Department;
  type: AppointmentType;
}

export interface Department {
  id: number;
  name: string;
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

export interface CalendarDaySlots {
  date: string;
  total_slots: number;
  booked_slots: number;
  cancelled_slots: number;
  available_slots: number;
}

export interface CalendarSlotsResponse extends BaseApiResponse {
  data: CalendarDaySlots[];
}

export interface AdminAppointmentListResponse {
  success: boolean;
  data: any[];
}

export class AppointmentService {
  static async getAppointments(): Promise<AppointmentListResponse> {
    const response = await api.get<AppointmentListResponse>(
      "/crew/appointments"
    );
    return response.data;
  }

  static async cancelAppointment(
    id: number,
    remarks: string
  ): Promise<BaseApiResponse> {
    const response = await api.post<BaseApiResponse>(
      `/crew/appointments/${id}/cancel`,
      { remarks }
    );
    return response.data;
  }

  static async getCalendarSlots(params: {
    department_id: number;
    month: string;
  }): Promise<CalendarSlotsResponse> {
    const response = await api.get<CalendarSlotsResponse>(
      "/crew/appointments/calendar",
      { params }
    );
    return response.data;
  }

  static async confirmAppointment(
    id: number
  ): Promise<BaseApiResponse> {
    const response = await api.post<BaseApiResponse>(
      `/admin/appointments/${id}/confirm`
    );
    return response.data;
  }

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
      const response = await api.put(
        `/admin/department-schedules/${data.id}`,
        data
      );
      return response.data;
    }

    const response = await api.post(
      "/admin/department-schedules",
      data
    );
    return response.data;
  }

  static async deleteDepartmentSchedule(id: number) {
    const response = await api.delete(
      `/admin/department-schedules/${id}`
    );
    return response.data;
  }
}

export class AdminAppointmentService {
  static async getAppointments(params?: {
    status?: string;
    from?: string;
    to?: string;
  }): Promise<AdminAppointmentListResponse> {
    const response = await api.get(
      "/admin/appointments",
      { params }
    );
    return response.data;
  }

  static async cancelAppointment(
    id: number,
    reason: string
  ) {
    return api.post(
      `/admin/appointments/${id}/cancel`,
      { reason }
    );
  }
}
