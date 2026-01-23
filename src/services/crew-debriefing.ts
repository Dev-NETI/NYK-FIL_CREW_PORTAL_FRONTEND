import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";
import { downloadBlob } from "@/lib/utils";

export type DebriefingStatus = "draft" | "submitted" | "confirmed";

export interface DebriefingForm {
  id: number;
  crew_id: number;
  department_id?: number | null;

  status: DebriefingStatus;

  rank?: string | null;
  crew_name?: string | null;
  vessel_type?: string | null;
  principal_name?: string | null;

  embarkation_vessel_name?: string | null;
  embarkation_place?: string | null;
  embarkation_date?: string | null;

  disembarkation_date?: string | null;
  disembarkation_place?: string | null;
  manila_arrival_date?: string | null;

  present_address?: string | null;
  provincial_address?: string | null;
  phone_number?: string | null;
  email?: string | null;
  date_of_availability?: string | null;
  availability_status?: string | null;
  next_vessel_assignment_date?: string | null;
  long_vacation_reason?: string | null;

  has_illness_or_injury?: boolean;
  illness_injury_types?: string[] | null;
  lost_work_days?: number | null;
  medical_incident_details?: string | null;

  comment_q1_technical?: string | null;
  comment_q2_crewing?: string | null;
  comment_q3_complaint?: string | null;
  comment_q4_immigrant_visa?: string | null;
  comment_q5_commitments?: string | null;
  comment_q6_additional?: string | null;

  submitted_at?: string | null;
  confirmed_at?: string | null;
  confirmed_by?: number | null;

  created_at: string;
  updated_at: string;
}

export interface DebriefingPrefill {
  mobile_number?: string | null;
  email?: string | null;
  present_address?: string | null;
  provincial_address?: string | null;
}

export interface LaravelPagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;

  from?: number | null;
  to?: number | null;
  links?: any;
}

export interface CrewDebriefingListResponse extends BaseApiResponse {
  data: LaravelPagination<DebriefingForm>;
}

export interface CrewDebriefingItemResponse extends BaseApiResponse {
  data: DebriefingForm;
  prefill?: DebriefingPrefill;
}

export class CrewDebriefingService {
  static async getForms(params?: {
    per_page?: number;
    page?: number;
  }): Promise<CrewDebriefingListResponse> {
    const res = await api.get<CrewDebriefingListResponse>(
      "/crew/debriefing-forms",
      { params }
    );

    return res.data;
  }

  static async getForm(id: number): Promise<CrewDebriefingItemResponse> {
    const res = await api.get<CrewDebriefingItemResponse>(
      `/crew/debriefing-forms/${id}`
    );
    return res.data;
  }

  /**
   * Creates a draft (backend sets status=draft and autopopulates crew details)
   */
  static async createDraft(
    payload: Partial<DebriefingForm>
  ): Promise<CrewDebriefingItemResponse> {
    const res = await api.post<CrewDebriefingItemResponse>(
      "/crew/debriefing-forms",
      payload
    );
    return res.data;
  }

  /**
   * Draft update only (backend blocks if status != draft)
   */
  static async updateDraft(
    id: number,
    payload: Partial<DebriefingForm>
  ): Promise<CrewDebriefingItemResponse> {
    const res = await api.put<CrewDebriefingItemResponse>(
      `/crew/debriefing-forms/${id}`,
      payload
    );
    return res.data;
  }

  static async submitForm(
    id: number,
    payload: Partial<DebriefingForm>
  ): Promise<CrewDebriefingItemResponse> {
    const res = await api.post<CrewDebriefingItemResponse>(
      `/crew/debriefing-forms/${id}/submit`,
      payload
    );
    return res.data;
  }

  /**
   * PDF endpoints (same route as backend)
   * NOTE: If axios baseURL already includes /api, this will work as-is.
   */
  static async downloadPdf(id: number) {
    const res = await api.get(`/crew/debriefing-forms/${id}/pdf/download`, {
      responseType: "blob",
      timeout: 18000,
    });

    const filename = `debriefing_form_${id}.pdf`;
    downloadBlob(res.data, filename);
  }

  static async previewPdf(id: number) {
    const res = await api.get(`/crew/debriefing-forms/${id}/pdf/preview`, {
      responseType: "blob",
      timeout: 18000,
    });

    const file = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
}
