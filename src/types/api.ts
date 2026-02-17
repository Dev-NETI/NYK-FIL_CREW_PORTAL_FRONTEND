// Base API Response interface
export interface BaseApiResponse {
  success: boolean;
  message: string;
}

// Authentication API Response interfaces
export interface LoginInitiateResponse extends BaseApiResponse {
  session_token?: string;
  expires_in?: number;
  otp?: string; // Only for development/debugging
  retry_after?: number;
}

export interface LoginVerifyResponse extends BaseApiResponse {
  user?: User;
  token?: string;
  expires_at?: string;
  redirect_to?: string;
  attempts_remaining?: number;
  retry_after?: number;
}

export interface ResendOtpResponse extends BaseApiResponse {
  expires_in?: number;
  retry_after?: number;
}

export type LogoutResponse = BaseApiResponse;

export interface UserResponse extends BaseApiResponse {
  user?: User;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  has_more_pages: boolean;
}

export interface CrewFilters {
  search: string;
  status: string;
  sort_by: string;
  sort_order: string;
}

export interface CrewListResponse extends BaseApiResponse {
  crew?: User[];
  pagination?: PaginationInfo;
  filters?: CrewFilters;
  total?: number; // Keep for backward compatibility
}

// User Profile interfaces
export interface UserProfile {
  crew_id?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  birth_date?: string;
  birth_place?: string;
  age?: number;
  gender?: string;
  full_name?: string;
  nationality?: string;
  civil_status?: string;
  religion?: string;
}

export interface UserContact {
  mobile_number?: string;
  alternate_phone?: string;
  permanent_address_id?: number;
  current_address_id?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface UserEmployment {
  fleet_id?: number;
  fleet_name?: string;
  rank_id?: number;
  rank_name?: string;
  crew_status?: string;
  hire_status?: string;
  hire_date?: string;
  passport_number?: string;
  passport_expiry?: string;
  seaman_book_number?: string;
  seaman_book_expiry?: string;
  primary_allotee_id?: number;
  basic_salary?: number;
  employment_notes?: string;
}

export interface EducationRecord {
  id: number;
  school_name: string;
  date_graduated: string | null;
  degree: string | null;
  education_level: string; // 'high_school', 'college', 'higher_education'
}

export interface UserPhysicalTraits {
  height?: number;
  weight?: number;
  blood_type?: string;
  eye_color?: string;
  hair_color?: string;
}

// Updated User interface with new structure
export interface User {
  // Core user data
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  last_login_at?: string | null;
  last_login_ip?: string;
  is_crew: boolean; // 1 = crew, 0 = admin
  role?: string; // 'crew' or 'admin'

  // Organized nested data
  profile?: UserProfile;
  contacts?: UserContact;
  employment?: UserEmployment;
  education?: EducationRecord[];
  physical_traits?: UserPhysicalTraits;
  permanent_address?: PermanentAddress;
  current_address?: CurrentAddress;

  // Address fields (temporary backward compatibility)
  permanent_region?: string;
  permanent_province?: string;
  permanent_city?: string;
  permanent_barangay?: string;
  permanent_street?: string;
  permanent_postal_code?: string;
  current_region?: string;
  current_province?: string;
  current_city?: string;
  current_barangay?: string;
  current_street?: string;
  current_postal_code?: string;

  // Contact fields
  emergency_contact_number?: string;
  emergency_contact_relation?: string;

  // Education fields
  highschool_name?: string;
  highschool_graduation_date?: string;
  college_name?: string;
  college_degree?: string;
  college_graduation_date?: string;
  higher_education_name?: string;
  higher_education_degree?: string;
  higher_education_graduation_date?: string;
}

export interface PermanentAddress {
  full_address?: string;
  brgy_id?: string;
  city_id?: string;
  province_id?: string;
  region_id?: string;
  street_address?: string;
  zip_code?: string;
}

export interface CurrentAddress {
  full_address?: string;
  brgy_id?: string;
  city_id?: string;
  province_id?: string;
  region_id?: string;
  street_address?: string;
  zip_code?: string;
}
// Request interfaces
export interface LoginInitiateRequest {
  email: string;
}

export interface LoginVerifyRequest {
  session_token: string;
  otp: string;
}

export interface ResendOtpRequest {
  session_token: string;
}

// Geography interfaces
export interface Region {
  reg_code: string;
  reg_desc: string;
}

export interface Province {
  prov_code: string;
  prov_desc: string;
  reg_code: string;
}

export interface City {
  citymun_code: string;
  citymun_desc: string;
  prov_code: string;
  reg_code: string;
}

export interface Barangay {
  brgy_code: string;
  brgy_desc: string;
  citymun_code: string;
  prov_code: string;
  reg_code: string;
}

export interface GeographyResponse<T> extends BaseApiResponse {
  data: T;
}

// Address interfaces
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

// Error response interface
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  retry_after?: number;
}

// appointment calendar
export interface CalendarDayApi {
  date: string;
  total_slots: number;
  booked_slots: number;
  cancelled_slots: number;
  available_slots: number;
}

