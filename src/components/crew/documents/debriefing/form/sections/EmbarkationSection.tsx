"use client";

import Section from "../../ui/Section";
import { Input, RequiredMark } from "../../ui/Field";
import { DebriefingForm } from "@/services/crew-debriefing";
import { FieldErrors } from "../validation";

export default function EmbarkationSection({
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
    <Section title="Embarkation Details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label={<RequiredMark label="Name of Vessel" />}
          value={String(form.embarkation_vessel_name ?? "")}
          onChange={(v) => setField("embarkation_vessel_name", v)}
          disabled={isLocked}
          error={errors.embarkation_vessel_name}
          placeholder="e.g., MV Example"
        />

        <Input
          label={<RequiredMark label="Place of Embarkation" />}
          value={String(form.embarkation_place ?? "")}
          onChange={(v) => setField("embarkation_place", v)}
          disabled={isLocked}
          error={errors.embarkation_place}
          placeholder="e.g., Manila"
        />

        <Input
          label={<RequiredMark label="Date of Embarkation" />}
          value={String(form.embarkation_date ?? "")}
          onChange={(v) => setField("embarkation_date", v)}
          disabled={isLocked}
          error={errors.embarkation_date}
          type="date"
        />
      </div>
    </Section>
  );
}
