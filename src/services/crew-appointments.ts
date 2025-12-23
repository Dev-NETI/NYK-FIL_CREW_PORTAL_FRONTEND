import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";

/* ---------------- API TYPES ---------------- */

export interface CalendarDayApi {
  date: string;
  available_slots: number;
}

export type TimeSlotApi = string;

export interface CalendarResponse extends BaseApiResponse {
  data: CalendarDayApi[];
}

export interface TimeSlotResponse extends BaseApiResponse {
  success: boolean;
  data: TimeSlotApi[];
}

export interface CrewAppointmentType {
  id: number;
  name: string;
  is_active: boolean;
}

export interface CrewAppointmentTypeListResponse extends BaseApiResponse {
  data: CrewAppointmentType[];
}

/* ---------------- SERVICE ---------------- */

export class CrewAppointmentService {
  static async getCalendar(
    departmentId: number,
    month: string
  ): Promise<CalendarResponse> {
    const response = await api.get<CalendarResponse>(
      "/crew/appointments/calendar",
      {
        params: {
          department_id: departmentId,
          month,
        },
      }
    );

    return response.data;
  }

  static async getTimeSlots(
    departmentId: number,
    date: string
  ): Promise<string[]> {
    const response = await api.get<TimeSlotResponse>(
      "/crew/appointments/slots",
      {
        params: { department_id: departmentId, date },
      }
    );

    return Array.isArray(response.data.data) ? response.data.data : [];
  }

  static async create(payload: {
    department_id: number;
    appointment_type_id: number;
    appointment_date: string;
    time: string;
    purpose: string;
  }): Promise<BaseApiResponse> {
    const response = await api.post<BaseApiResponse>(
      "/crew/appointments",
      payload
    );

    return response.data;
  }

  static async getAppointmentTypesByDepartment(
    departmentId: number
  ): Promise<CrewAppointmentType[]> {
    const response = await api.get<CrewAppointmentTypeListResponse>(
      `/appointment-types/department/${departmentId}`
    );

    return response.data.data;
  }
}