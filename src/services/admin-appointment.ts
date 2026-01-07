import api from "@/lib/axios";
import { BaseApiResponse, CalendarDayApi } from "@/types/api";

export interface Department {
  id: number;
  name: string;
}

export interface AppointmentType {
  id: number;
  name: string;
  is_active: boolean;
}

type Role = "crew" | "department";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export interface Appointment {
  id: number;
  user_id: number;
  department_id: number;
  appointment_type_id: number;
  schedule_id: number;
  date: string;
  time: string;
  status: AppointmentStatus
  purpose: string;
  created_by: number;
  created_by_type: Role;
  created_at: string;
  updated_at: string;
  department?: Department;
  type?: AppointmentType;
  user?: {
    profile?: {
    first_name: string;
    middle_name?: string | null;
      last_name: string;
    };
  };
  cancellations?: {
    id: number;
    appointment_id: number;
    cancelled_by: number;
    cancelled_by_type: Role;
    reason: string;
    cancelled_at: string;
    created_at: string;
  }[];
}

export interface AppointmentListResponse extends BaseApiResponse {
  data: Appointment[];
}

export interface AppointmentTypeListResponse extends BaseApiResponse {
  data: AppointmentType[];
}

export interface AdminAppointmentListResponse {
  success: boolean;
  data: any[];
}

export interface AdminCalendarResponse extends BaseApiResponse {
  data: CalendarDayApi[];
}

export class AppointmentService {
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

  static async getCalendar(month: string): Promise<CalendarDayApi[]> {
  const response = await api.get<AdminCalendarResponse>(
    "/admin/appointments/calendar",
    { params: { month } }
  );

  return Array.isArray(response.data.data) ? response.data.data : [];
}
}
