import api from "@/lib/axios";
import { BaseApiResponse } from "@/types/api";
import { downloadBlob } from "@/lib/utils";

export type DebriefingStatus = "draft" | "submitted" | "confirmed";
export type PdfStatus = "pending" | "generating" | "ready" | "failed";

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

  signature_path?: string | null;

  submitted_at?: string | null;
  confirmed_at?: string | null;
  confirmed_by?: number | null;

  pdf_path?: string | null;
  pdf_status?: PdfStatus | null;
  pdf_error?: string | null;
  pdf_generated_at?: string | null;
  pdf_emailed_at?: string | null;

  created_at: string;
  updated_at: string;

  crew?: {
    id: number;
    name?: string | null;
    email?: string | null;
    profile?: {
      first_name?: string | null;
      middle_name?: string | null;
      last_name?: string | null;
      rank?: string | null;
    } | null;
  } | null;

  confirmed_by_user?: {
    id: number;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface LaravelPaginator<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DebriefingListResponse extends BaseApiResponse {
  data: LaravelPaginator<DebriefingForm>;
}

export interface DebriefingItemResponse extends BaseApiResponse {
  data: DebriefingForm;
}

export type OverrideDebriefingPayload = Partial<DebriefingForm> & {
  override_reason: string;
};

export class AdminDebriefingService {
  static async getForms(params?: {
    status?: string;
    crew_name?: string;
    vessel?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<DebriefingListResponse> {
    const res = await api.get<DebriefingListResponse>("/admin/debriefing-forms", {
      params,
    });

    return res.data;
  }

  static async confirmForm(id: number): Promise<BaseApiResponse> {
    const res = await api.post<BaseApiResponse>(
      `/admin/debriefing-forms/${id}/confirm`,
      undefined,
      { timeout: 180000 }
    );
    return res.data;
  }

  static async regeneratePdf(id: number): Promise<BaseApiResponse> {
    const res = await api.post<BaseApiResponse>(
      `/admin/debriefing-forms/${id}/pdf/regenerate`,
      undefined,
      { timeout: 180000 }
    );
    return res.data;
  }

  static async previewPdf(id: number) {
    const res = await api.get(`/admin/debriefing-forms/${id}/pdf/preview`, {
      responseType: "blob",
      timeout: 180000,
    });

    const file = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  static async downloadPdf(id: number) {
    const res = await api.get(`/admin/debriefing-forms/${id}/pdf/download`, {
      responseType: "blob",
      timeout: 180000,
    });

    downloadBlob(res.data, `debriefing_form_${id}.pdf`);
  }
  static async getForm(id: number): Promise<DebriefingItemResponse> {
    const res = await api.get<DebriefingItemResponse>(`/admin/debriefing-forms/${id}`);
    return res.data;
  }

  static async overrideForm(id: number, payload: OverrideDebriefingPayload): Promise<BaseApiResponse> {
    const res = await api.put<BaseApiResponse>(`/admin/debriefing-forms/${id}/override`, payload, {
      timeout: 180000,
    });
    return res.data;
  }
}
