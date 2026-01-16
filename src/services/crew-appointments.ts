import api from "@/lib/axios";
import { BaseApiResponse, CalendarDayApi } from "@/types/api";
import { Appointment } from "./admin-appointment";

export type AppointmentSession = "AM" | "PM";

export interface VerifiedAppointment {
  id: number;
  user_id: number;
  date: string;
  session: AppointmentSession;
  status: string;
  purpose?: string | null;
  type?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  user?: {
    profile?: {
      first_name?: string | null;
      middle_name?: string | null;
      last_name?: string | null;
      crew_id?: string | null;
    };
  };
}

export interface VerifyQrResponse extends BaseApiResponse {
  data: VerifiedAppointment;
}

export interface CalendarResponse extends BaseApiResponse {
  data: CalendarDayApi[];
}

export interface CrewAppointmentType {
  id: number;
  name: string;
  is_active: boolean;
}

export interface CrewAppointmentListResponse {
  success: boolean;
  data: Appointment[];
}

export interface CrewAppointmentTypeListResponse extends BaseApiResponse {
  data: CrewAppointmentType[];
}

export interface QrTokenResponse extends BaseApiResponse {
  data: { token: string };
}

export type CrewAppointmentCreatePayload = {
  department_id: number;
  appointment_type_id: number;
  appointment_date: string;
  session: AppointmentSession;
  purpose: string;
};

export class CrewAppointmentService {
  static async getCalendar(
    departmentId: number,
    month: string
  ): Promise<CalendarDayApi[]> {
    const response = await api.get<CalendarResponse>(
      "/crew/appointments/calendar",
      {
        params: {
          department_id: departmentId,
          month,
        },
      }
    );

    return response.data.data;
  }

  static async create(payload: CrewAppointmentCreatePayload): Promise<BaseApiResponse> {
    const response = await api.post<BaseApiResponse>(
      "/crew/appointments",
      payload
    );

    return response.data;
  }

  static async getAppointments(): Promise<CrewAppointmentListResponse> {
    const response = await api.get<CrewAppointmentListResponse>(
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

  static async getAppointmentTypesByDepartment(
    departmentId: number
  ): Promise<CrewAppointmentType[]> {
    const response = await api.get<CrewAppointmentTypeListResponse>(
      `/appointment-types/department/${departmentId}`
    );

    return response.data.data;
  }

  static async getQrToken(appointmentId: number): Promise<string> {
    const res = await api.get<QrTokenResponse>(
      `/crew/appointments/${appointmentId}/qr`
    );
    return res.data.data.token;
  }

  static async verifyQrToken(token: string): Promise<VerifiedAppointment> {
    const res = await api.post<VerifyQrResponse>(
      "/guard/appointments/verify",
      { token }
    );

    return res.data.data;
  }
}
