import api from '@/lib/axios';
import {
  Region,
  Province,
  City,
  Barangay,
  GeographyResponse,
} from '@/types/api';

export class GeographyService {
  /**
   * Get all regions
   */
  static async getRegions(): Promise<GeographyResponse<Region[]>> {
    const response = await api.get<GeographyResponse<Region[]>>('/geography/regions');
    return response.data;
  }

  /**
   * Get provinces by region code
   */
  static async getProvincesByRegion(regCode: string): Promise<GeographyResponse<Province[]>> {
    const response = await api.get<GeographyResponse<Province[]>>('/geography/provinces', {
      params: { reg_code: regCode }
    });
    return response.data;
  }

  /**
   * Get cities by province code
   */
  static async getCitiesByProvince(provCode: string): Promise<GeographyResponse<City[]>> {
    const response = await api.get<GeographyResponse<City[]>>('/geography/cities', {
      params: { prov_code: provCode }
    });
    return response.data;
  }

  /**
   * Get barangays by city code
   */
  static async getBarangaysByCity(cityCode: string): Promise<GeographyResponse<Barangay[]>> {
    const response = await api.get<GeographyResponse<Barangay[]>>('/geography/barangays', {
      params: { citymun_code: cityCode }
    });
    return response.data;
  }

  /**
   * Get region by code
   */
  static async getRegionByCode(regCode: string): Promise<GeographyResponse<Region>> {
    const response = await api.get<GeographyResponse<Region>>(`/geography/region/${regCode}`);
    return response.data;
  }

  /**
   * Get province by code
   */
  static async getProvinceByCode(provCode: string): Promise<GeographyResponse<Province>> {
    const response = await api.get<GeographyResponse<Province>>(`/geography/province/${provCode}`);
    return response.data;
  }

  /**
   * Get city by code
   */
  static async getCityByCode(cityCode: string): Promise<GeographyResponse<City>> {
    const response = await api.get<GeographyResponse<City>>(`/geography/city/${cityCode}`);
    return response.data;
  }

  /**
   * Get barangay by code
   */
  static async getBarangayByCode(brgyCode: string): Promise<GeographyResponse<Barangay>> {
    const response = await api.get<GeographyResponse<Barangay>>(`/geography/barangay/${brgyCode}`);
    return response.data;
  }
}