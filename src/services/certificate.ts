import api from "@/lib/axios";
import { CertificateType } from "./certificate-type";

export interface Certificate {
  id: number;
  certificate_type_id: number;
  regulation: string | null;
  name: string | null;
  stcw_type: "COC" | "COP" | null;
  code: string | null;
  vessel_type: string | null;
  nmc_type: "NMC" | "NMCR" | null;
  nmc_department: "Deck" | "Engine" | "Catering" | "Common" | null;
  rank: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  modified_by?: string;
  certificate_type?: CertificateType;
  crew_certificates?: CrewCertificate[];
}

export interface CrewCertificate {
  id: number;
  certificate_id: number;
  crew_id: string;
  grade: string | null;
  rank_permitted: string | null;
  certificate_no: string | null;
  issued_by: string | null;
  date_issued: string | null;
  expiry_date: string | null;
  file_path: string | null;
  file_ext: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  modified_by?: string;
  crew?: {
    crew_id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string | null;
  };
}

export class CertificateService {
  /**
   * Get certificates by certificate type ID
   */
  static async getCertificateByCertTypeId(
    certificateTypeId: number
  ): Promise<Certificate[]> {
    const response = await api.get<Certificate[]>(
      `/certificates/${certificateTypeId}`
    );
    return response.data;
  }
}
