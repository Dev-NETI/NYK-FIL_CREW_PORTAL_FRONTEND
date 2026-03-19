import api from "@/lib/axios";

export interface DashboardCrewStats {
  total: number;
  on_board: number;
  on_vacation: number;
  new_hires: number;
  re_hires: number;
  with_active_contracts: number;
  gender_distribution: { gender: string; count: number }[];
  registrations_by_month: { month: string; label: string; count: number }[];
}

export interface DashboardContractStats {
  total: number;
  active: number;
  expired: number;
  expiring_30_days: number;
  expiring_60_days: number;
  expiring_90_days: number;
  top_vessels: { id: number; name: string; active_crew: number }[];
  ending_by_month: { month: string; label: string; count: number }[];
}

export interface DashboardVesselStats {
  total: number;
  active: number;
}

export interface DashboardDocumentStats {
  pending_employment: number;
  pending_travel: number;
  pending_certificates: number;
  total_pending: number;
  expiring_travel_30_days: number;
  expiring_certificates_30_days: number;
  recent_pending_employment: { id: number; crew_name: string; created_at: string }[];
  recent_pending_travel: { id: number; crew_name: string; created_at: string }[];
}

export interface DashboardAppointmentStats {
  today: number;
  this_month: number;
  by_status: Record<string, number>;
}

export interface DashboardData {
  crew: DashboardCrewStats;
  contracts: DashboardContractStats;
  vessels: DashboardVesselStats;
  documents: DashboardDocumentStats;
  appointments: DashboardAppointmentStats;
  profile_updates: { pending: number };
  debriefing_forms: { total: number; by_status: Record<string, number> };
  job_description_requests: { by_status: Record<string, number> };
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export class DashboardService {
  static async getAdminDashboard(): Promise<DashboardData> {
    const response = await api.get<DashboardResponse>("/admin/dashboard");
    return response.data.data;
  }
}
