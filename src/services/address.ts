import api from '@/lib/axios';
import {
  BaseApiResponse,
  Region,
  Province,
  City,
  Barangay,
} from '@/types/api';

export interface Address {
  id: number;
  user_id: number;
  street_address: string | null;
  brgy_id: string;
  city_id: string;
  province_id: string;
  region_id: string;
  zip_code: string | null;
  region?: Region;
  province?: Province;
  city?: City;
  barangay?: Barangay;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressRequest {
  user_id?: number;
  street_address?: string;
  brgy_id: string;
  city_id: string;
  province_id: string;
  region_id: string;
  zip_code?: string;
}

export interface UpdateAddressRequest extends CreateAddressRequest {}

export interface AddressResponse extends BaseApiResponse {
  data: Address;
}

export interface AddressListResponse extends BaseApiResponse {
  data: Address[];
}

export class AddressService {
  /**
   * Get all addresses for the authenticated user
   */
  static async getAddresses(): Promise<AddressListResponse> {
    const response = await api.get<AddressListResponse>('/crew/addresses');
    return response.data;
  }

  /**
   * Get a specific address by ID
   */
  static async getAddress(id: number): Promise<AddressResponse> {
    const response = await api.get<AddressResponse>(`/crew/addresses/${id}`);
    return response.data;
  }

  /**
   * Create a new address
   */
  static async createAddress(data: CreateAddressRequest): Promise<AddressResponse> {
    const response = await api.post<AddressResponse>('/admin/addresses', data);
    return response.data;
  }

  /**
   * Update an existing address
   */
  static async updateAddress(id: number, data: UpdateAddressRequest): Promise<AddressResponse> {
    const response = await api.put<AddressResponse>(`/admin/addresses/${id}`, data);
    return response.data;
  }

  /**
   * Delete an address
   */
  static async deleteAddress(id: number): Promise<BaseApiResponse> {
    const response = await api.delete<BaseApiResponse>(`/admin/addresses/${id}`);
    return response.data;
  }

  /**
   * Create or update an address based on geography data
   */
  static async createOrUpdateFromGeography(
    addressData: {
      user_id?: number;
      street_address?: string;
      region_code: string;
      province_code: string;
      city_code: string;
      barangay_code: string;
      zip_code?: string;
    },
    existingAddressId?: number
  ): Promise<AddressResponse> {
    const payload: CreateAddressRequest = {
      user_id: addressData.user_id,
      street_address: addressData.street_address,
      region_id: addressData.region_code,
      province_id: addressData.province_code,
      city_id: addressData.city_code,
      brgy_id: addressData.barangay_code,
      zip_code: addressData.zip_code,
    };

    if (existingAddressId) {
      return this.updateAddress(existingAddressId, payload);
    } else {
      return this.createAddress(payload);
    }
  }
}