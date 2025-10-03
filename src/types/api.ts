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

export interface CrewListResponse extends BaseApiResponse {
  crew?: User[];
  total?: number;
}

// User Profile interfaces
export interface UserProfile {
  crew_id?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  full_name?: string;
}

export interface UserContact {
  mobile_number?: string;
  alternate_phone?: string;
  email_personal?: string;
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

export interface UserEducation {
  graduated_school_id?: number;
  date_graduated?: string;
  degree?: string;
  field_of_study?: string;
  gpa?: number;
  education_level?: string;
  certifications?: string;
  additional_training?: string;
}

export interface UserPhysicalTraits {
  height?: number;
  weight?: number;
  blood_type?: string;
  eye_color?: string;
  hair_color?: string;
  distinguishing_marks?: string;
  medical_conditions?: string;
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
  is_crew: number; // 1 = crew, 0 = admin
  role?: string; // 'crew' or 'admin'

  // Organized nested data
  profile?: UserProfile;
  contacts?: UserContact;
  employment?: UserEmployment;
  education?: UserEducation;
  physical_traits?: UserPhysicalTraits;

  // Backward compatibility fields (flattened for existing clients)
  crew_id?: string;
  fleet_name?: string;
  rank_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  date_of_birth?: string;
  age?: number;
  gender?: string;
  mobile_number?: string;
  permanent_address_id?: number;
  graduated_school_id?: number;
  date_graduated?: string;
  crew_status?: string;
  hire_status?: string;
  hire_date?: string;
  passport_number?: string;
  passport_expiry?: string;
  seaman_book_number?: string;
  seaman_book_expiry?: string;
  primary_allotee_id?: number;

  // Legacy fields that might still be used
  birth_date?: string;
  birth_place?: string;
  nationality?: string;
  civil_status?: string;
  religion?: string;
  height?: number;
  weight?: number;
  blood_type?: string;
  eye_color?: string;
  hair_color?: string;

  // Address fields (temporary backward compatibility)
  permanent_region?: string;
  permanent_province?: string;
  permanent_city?: string;
  permanent_barangay?: string;
  permanent_street?: string;
  permanent_postal_code?: string;
  contact_region?: string;
  contact_province?: string;
  contact_city?: string;
  contact_barangay?: string;
  contact_street?: string;
  contact_postal_code?: string;

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

// Error response interface
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  retry_after?: number;
}
