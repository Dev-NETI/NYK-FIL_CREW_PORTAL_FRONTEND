export const illnessOptions = [
  "Work-related Injury",
  "Work-related Illness",
  "Non-work related Injury",
  "Non-work related Illness",
  "Other",
] as const;

export const REQUIRED_SUBMIT_KEYS = new Set([
  "embarkation_vessel_name",
  "embarkation_place",
  "embarkation_date",
  "disembarkation_date",
  "disembarkation_place",
  "manila_arrival_date",
  "present_address",
  "provincial_address",
  "phone_number",
  "email",
  "date_of_availability",
  "availability_status",
  "has_illness_or_injury",
]);
