import { DebriefingForm } from "@/services/crew-debriefing";

export type FieldErrors = Record<string, string>;

export function validateDraft(form: Partial<DebriefingForm>): FieldErrors {
  const e: FieldErrors = {};
  if (form.email && !String(form.email).includes("@")) e.email = "Invalid email address.";
  if (form.lost_work_days != null && String(form.lost_work_days) !== "") {
    const n = Number(form.lost_work_days);
    if (Number.isNaN(n) || n < 0) e.lost_work_days = "Must be 0 or greater.";
  }
  return e;
}

export function validateSubmit(form: Partial<DebriefingForm>): FieldErrors {
  const e: FieldErrors = {};
  const req = (k: keyof DebriefingForm, label: string) => {
    const v = (form as any)[k];
    if (v == null || String(v).trim() === "") e[String(k)] = `${label} is required.`;
  };

  req("embarkation_vessel_name", "Embarkation vessel name");
  req("embarkation_place", "Embarkation place");
  req("embarkation_date", "Embarkation date");

  req("disembarkation_date", "Disembarkation date");
  req("disembarkation_place", "Disembarkation place");
  req("manila_arrival_date", "Manila arrival date");

  req("present_address", "Present address");
  req("provincial_address", "Provincial address");
  req("phone_number", "Phone number");
  req("email", "Email");
  req("date_of_availability", "Date of availability");
  req("availability_status", "Availability status");

  if (typeof form.has_illness_or_injury !== "boolean") {
    e.has_illness_or_injury = "Please select Yes or No.";
  }
  if (form.has_illness_or_injury) {
    if (!form.medical_incident_details || String(form.medical_incident_details).trim() === "") {
      e.medical_incident_details = "Medical incident details is required when Yes is selected.";
    }
  }

  if (form.email && !String(form.email).includes("@")) e.email = "Invalid email address.";

  if (form.lost_work_days != null && String(form.lost_work_days) !== "") {
    const n = Number(form.lost_work_days);
    if (Number.isNaN(n) || n < 0) e.lost_work_days = "Must be 0 or greater.";
  }

  return e;
}

export function buildPayload(form: Partial<DebriefingForm>): Partial<DebriefingForm> {
  return {
    embarkation_vessel_name: form.embarkation_vessel_name ?? null,
    embarkation_place: form.embarkation_place ?? null,
    embarkation_date: form.embarkation_date ?? null,

    disembarkation_date: form.disembarkation_date ?? null,
    disembarkation_place: form.disembarkation_place ?? null,
    manila_arrival_date: form.manila_arrival_date ?? null,

    present_address: form.present_address ?? null,
    provincial_address: form.provincial_address ?? null,
    phone_number: form.phone_number ?? null,
    email: form.email ?? null,
    date_of_availability: form.date_of_availability ?? null,
    availability_status: form.availability_status ?? null,
    next_vessel_assignment_date: form.next_vessel_assignment_date ?? null,
    long_vacation_reason: form.long_vacation_reason ?? null,

    has_illness_or_injury: Boolean(form.has_illness_or_injury),
    illness_injury_types: (form.illness_injury_types ?? []) as any,
    lost_work_days:
      form.lost_work_days === null || form.lost_work_days === ("" as any)
        ? null
        : Number(form.lost_work_days),
    medical_incident_details: form.medical_incident_details ?? null,

    comment_q1_technical: form.comment_q1_technical ?? null,
    comment_q2_crewing: form.comment_q2_crewing ?? null,
    comment_q3_complaint: form.comment_q3_complaint ?? null,
    comment_q4_immigrant_visa: form.comment_q4_immigrant_visa ?? null,
    comment_q5_commitments: form.comment_q5_commitments ?? null,
    comment_q6_additional: form.comment_q6_additional ?? null,
  };
}
