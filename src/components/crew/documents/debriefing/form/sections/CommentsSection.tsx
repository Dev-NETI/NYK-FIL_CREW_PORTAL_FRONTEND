"use client";

import Section from "../../ui/Section";
import { Textarea } from "../../ui/Field";
import { DebriefingForm } from "@/services/crew-debriefing";
import { FieldErrors } from "../validation";

export default function CommentsSection({
  form,
  setField,
  isLocked,
}: {
  form: Partial<DebriefingForm>;
  setField: (k: keyof DebriefingForm, v: any) => void;
  isLocked: boolean;
  errors: FieldErrors;
}) {
  return (
    <Section
      title="Comments & Feedback"
      subtitle="Your comments regarding shipboard experience and vacation"
    >
      <div className="space-y-3">
        <Textarea
          label="1. Do you have any comment about technical matter during your last assignment?"
          value={String(form.comment_q1_technical ?? "")}
          onChange={(v) => setField("comment_q1_technical", v)}
          disabled={isLocked}
          placeholder="Write your answer..."
        />

        <Textarea
          label="2. Do you have any comment about crewing matter during your last assignment?"
          value={String(form.comment_q2_crewing ?? "")}
          onChange={(v) => setField("comment_q2_crewing", v)}
          disabled={isLocked}
          placeholder="Write your answer..."
        />

        <Textarea
          label="3. Do you have any complaint for your last assignment?"
          value={String(form.comment_q3_complaint ?? "")}
          onChange={(v) => setField("comment_q3_complaint", v)}
          disabled={isLocked}
          placeholder="Write your answer..."
        />

        <Textarea
          label="4. Are you currently in the process of applying for an immigrant visa? If yes, please provide relevant details."
          value={String(form.comment_q4_immigrant_visa ?? "")}
          onChange={(v) => setField("comment_q4_immigrant_visa", v)}
          disabled={isLocked}
          placeholder="Write your answer..."
        />

        <Textarea
          label="5. Do you have any personal commitments, pre-planned schedule, or family occasions?"
          value={String(form.comment_q5_commitments ?? "")}
          onChange={(v) => setField("comment_q5_commitments", v)}
          disabled={isLocked}
          placeholder="Write your answer..."
        />

        <Textarea
          label="6. Additional comments / suggestions / relevant info"
          value={String(form.comment_q6_additional ?? "")}
          onChange={(v) => setField("comment_q6_additional", v)}
          disabled={isLocked}
          placeholder="Write your answer..."
        />
      </div>
    </Section>
  );
}
