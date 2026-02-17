"use client";

import Section from "../../ui/Section";
import { Input } from "../../ui/Field";
import { DebriefingForm } from "@/services/crew-debriefing";

export default function CrewDetailsSection({ form }: { form: Partial<DebriefingForm> }) {
  return (
    <Section title="Crew Details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Rank" value={String(form.rank ?? "")} disabled />
        <Input label="Name" value={String(form.crew_name ?? "")} disabled />
        <Input label="Vessel Type" value={String(form.vessel_type ?? "")} disabled />
        <Input label="Principal" value={String(form.principal_name ?? "")} disabled />
      </div>
    </Section>
  );
}
