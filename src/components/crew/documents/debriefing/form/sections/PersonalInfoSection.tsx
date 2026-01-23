"use client";

import Section from "../../ui/Section";
import { Input, RequiredMark, Textarea } from "../../ui/Field";
import { DebriefingForm } from "@/services/crew-debriefing";
import { FieldErrors } from "../validation";

export default function PersonalInfoSection({
  form,
  setField,
  isLocked,
  errors,
}: {
  form: Partial<DebriefingForm>;
  setField: (k: keyof DebriefingForm, v: any) => void;
  isLocked: boolean;
  errors: FieldErrors;
}) {
  const readOnlyPersonal = false; // set to true once data can be prepopulated

  return (
    <Section
      title="Personal Information"
      subtitle="Read-only, pre-populated."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Textarea
          label={<RequiredMark label="Present Address" />}
          value={String(form.present_address ?? "")}
          onChange={(v) => setField("present_address", v)}
          disabled={readOnlyPersonal || isLocked}
          error={errors.present_address}
          placeholder="Present address"
        />

        <Textarea
          label={<RequiredMark label="Provincial Address" />}
          value={String(form.provincial_address ?? "")}
          onChange={(v) => setField("provincial_address", v)}
          disabled={readOnlyPersonal || isLocked}
          error={errors.provincial_address}
          placeholder="Provincial address"
        />

        <Input
          label={<RequiredMark label="Phone Number" />}
          value={String(form.phone_number ?? "")}
          onChange={(v) => setField("phone_number", v)}
          disabled={readOnlyPersonal || isLocked}
          error={errors.phone_number}
          placeholder="e.g., 09XXXXXXXXX"
        />

        <Input
          label={<RequiredMark label="Email" />}
          value={String(form.email ?? "")}
          onChange={(v) => setField("email", v)}
          disabled={readOnlyPersonal || isLocked}
          error={errors.email}
          placeholder="name@email.com"
        />

        <Input
          label={<RequiredMark label="Date of Availability" />}
          value={String(form.date_of_availability ?? "")}
          onChange={(v) => setField("date_of_availability", v)}
          disabled={isLocked}
          error={errors.date_of_availability}
          type="date"
        />

        <Input
          label={<RequiredMark label="Availability Status" />}
          value={String(form.availability_status ?? "")}
          onChange={(v) => setField("availability_status", v)}
          disabled={isLocked}
          error={errors.availability_status}
          placeholder="e.g., Available / Not Available"
        />

        <Input
          label="Next Vessel Assignment Date (optional)"
          value={String(form.next_vessel_assignment_date ?? "")}
          onChange={(v) => setField("next_vessel_assignment_date", v)}
          disabled={isLocked}
          error={errors.next_vessel_assignment_date}
          type="date"
        />

        <Textarea
          label="Reason for Long Vacation (optional)"
          value={String(form.long_vacation_reason ?? "")}
          onChange={(v) => setField("long_vacation_reason", v)}
          disabled={isLocked}
          error={errors.long_vacation_reason}
          placeholder="If applicable, explain briefly"
        />
      </div>
    </Section>
  );
}
