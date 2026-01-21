"use client";

import Section from "../../ui/Section";
import { RequiredMark, Input } from "../../ui/Field";
import { DebriefingForm } from "@/services/crew-debriefing";
import { FieldErrors } from "../validation";

export default function DisembarkationSection({
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
  return (
    <Section title="Disembarkation Details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label={<RequiredMark label="Date of Disembarkation" />}
          value={String(form.disembarkation_date ?? "")}
          onChange={(v) => setField("disembarkation_date", v)}
          disabled={isLocked}
          error={errors.disembarkation_date}
          type="date"
        />

        <Input
          label={<RequiredMark label="Place of Disembarkation" />}
          value={String(form.disembarkation_place ?? "")}
          onChange={(v) => setField("disembarkation_place", v)}
          disabled={isLocked}
          error={errors.disembarkation_place}
          placeholder="e.g., Singapore"
        />

        <Input
          label={<RequiredMark label="Date of Arrival in Manila" />}
          value={String(form.manila_arrival_date ?? "")}
          onChange={(v) => setField("manila_arrival_date", v)}
          disabled={isLocked}
          error={errors.manila_arrival_date}
          type="date"
        />
      </div>
    </Section>
  );
}
