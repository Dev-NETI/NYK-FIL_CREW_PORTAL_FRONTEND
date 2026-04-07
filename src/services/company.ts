import axiosInstance from "@/lib/axios";

export interface Company {
  id: number;
  name: string;
}

export class CompanyService {
  static async getCompanies(): Promise<{ success: boolean; data: Company[] }> {
    const response = await axiosInstance.get("/companies");
    const data = response.data;
    if (Array.isArray(data)) {
      return { success: true, data };
    }
    return { success: true, data: data.data ?? [] };
  }
}
