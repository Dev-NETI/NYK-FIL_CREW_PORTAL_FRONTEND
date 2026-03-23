import axiosInstance from "@/lib/axios";

export interface Rank {
  id: number;
  name: string;
  code?: string;
}

export class RankService {
  static async getRanks(): Promise<{ success: boolean; data: Rank[] }> {
    const response = await axiosInstance.get("/ranks");
    const data = response.data;
    // RankController returns a plain array
    if (Array.isArray(data)) {
      return { success: true, data };
    }
    return { success: true, data: data.data ?? [] };
  }
}
