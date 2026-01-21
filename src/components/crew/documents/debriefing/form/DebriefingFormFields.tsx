"use client";

import { DebriefingForm } from "@/services/crew-debriefing";
import { FieldErrors } from "./validation";

import CrewDetailsSection from "./sections/CrewDetailsSection";
import EmbarkationSection from "./sections/EmbarkationSection";
import DisembarkationSection from "./sections/DisembarkationSection";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import MedicalSection from "./sections/MedicalSection";
import CommentsSection from "./sections/CommentsSection";

export default function DebriefingFormFields({
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
    <div className="space-y-6">
      <CrewDetailsSection form={form} />

      <EmbarkationSection form={form} setField={setField} isLocked={isLocked} errors={errors} />

      <DisembarkationSection form={form} setField={setField} isLocked={isLocked} errors={errors} />

      <PersonalInfoSection form={form} setField={setField} isLocked={isLocked} errors={errors} />

      <MedicalSection form={form} setField={setField} isLocked={isLocked} errors={errors} />

      <CommentsSection form={form} setField={setField} isLocked={isLocked} errors={errors} />
    </div>
  );
}
