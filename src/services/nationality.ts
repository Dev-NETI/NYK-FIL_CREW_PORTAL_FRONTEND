import api from '@/lib/axios';
import { BaseApiResponse } from '@/types/api';

export interface Nationality {
  id: number;
  nationality: string;
  created_at: string;
  updated_at: string;
}

export interface NationalityListResponse extends BaseApiResponse {
    data: Nationality[];
}

export interface NationalityResponse extends BaseApiResponse {
    data: Nationality;
}

export class NationalityService {

    static async getNationalities(): Promise<NationalityListResponse> {
        const response = await api.get<NationalityListResponse>('/nationalities');
        return response.data;
    }

}