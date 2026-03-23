import axiosInstance from "@/lib/axios";

export interface Fleet {
  id: number;
  name: string;
}

export class FleetService {
  static async getFleets(): Promise<{ success: boolean; data: Fleet[] }> {
    const response = await axiosInstance.get("/fleets");
    const data = response.data;
    // FleetController returns a plain array
    if (Array.isArray(data)) {
      return { success: true, data };
    }
    return { success: true, data: data.data ?? [] };
  }
}
