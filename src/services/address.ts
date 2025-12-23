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
  type: 'permanent' | 'current';
  full_address?: string;
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
  type: 'permanent' | 'current';
  full_address?: string;
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
   * Generate full address string from address components
   */
  private static generateFullAddress(
    streetAddress: string | undefined,
    barangayDesc: string,
    cityDesc: string, 
    provinceDesc: string,
    regionDesc: string,
    zipCode: string | undefined
  ): string {
    const parts: string[] = [];
    
    // Add street address if provided
    if (streetAddress?.trim()) {
      parts.push(streetAddress.trim());
    }
    
    // Add barangay
    if (barangayDesc?.trim()) {
      parts.push(barangayDesc.trim());
    }
    
    // Add city/municipality
    if (cityDesc?.trim()) {
      parts.push(cityDesc.trim());
    }
    
    // Add province
    if (provinceDesc?.trim()) {
      parts.push(provinceDesc.trim());
    }
    
    // Add region
    if (regionDesc?.trim()) {
      parts.push(regionDesc.trim());
    }
    
    // Add zip code if provided
    if (zipCode?.trim()) {
      parts.push(zipCode.trim());
    }
    
    return parts.join(', ');
  }
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
      type: 'permanent' | 'current';
      // Add descriptive fields for full address generation
      region_desc?: string;
      province_desc?: string;
      city_desc?: string;
      barangay_desc?: string;
    },
    existingAddressId?: number
  ): Promise<AddressResponse> {
    // Generate full address if descriptive data is provided
    let fullAddress: string | undefined;
    if (addressData.region_desc && addressData.province_desc && 
        addressData.city_desc && addressData.barangay_desc) {
      fullAddress = this.generateFullAddress(
        addressData.street_address,
        addressData.barangay_desc,
        addressData.city_desc,
        addressData.province_desc,
        addressData.region_desc,
        addressData.zip_code
      );
    }

    const payload: CreateAddressRequest = {
      user_id: addressData.user_id,
      street_address: addressData.street_address,
      region_id: addressData.region_code,
      province_id: addressData.province_code,
      city_id: addressData.city_code,
      brgy_id: addressData.barangay_code,
      zip_code: addressData.zip_code,
      type: addressData.type,
      full_address: fullAddress,
    };

    if (existingAddressId) {
      return this.updateAddress(existingAddressId, payload);
    } else {
      return this.createAddress(payload);
    }
  }
}