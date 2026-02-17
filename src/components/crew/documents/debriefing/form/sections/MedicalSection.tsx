"use client";

import Section from "../../ui/Section";
import { Input, RequiredMark, Textarea } from "../../ui/Field";
import { illnessOptions } from "../constants";
import { DebriefingForm } from "@/services/crew-debriefing";
import { FieldErrors } from "../validation";

export default function MedicalSection({
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
  const toggleIllnessType = (val: string) => {
    const current = new Set(form.illness_injury_types ?? []);
    if (current.has(val)) current.delete(val);
    else current.add(val);
    setField("illness_injury_types", Array.from(current));
  };

  return (
    <Section title="Medical Condition">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm font-medium text-gray-800">
            <RequiredMark label="Have you experienced any illness or injury?" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLocked}
              onClick={() => setField("has_illness_or_injury", true)}
              className={`h-[40px] px-4 rounded-lg text-sm font-medium border transition ${
                form.has_illness_or_injury
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              Yes
            </button>
            <button
              type="button"
              disabled={isLocked}
              onClick={() => setField("has_illness_or_injury", false)}
              className={`h-[40px] px-4 rounded-lg text-sm font-medium border transition ${
                !form.has_illness_or_injury
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              No
            </button>
          </div>
        </div>

        {errors.has_illness_or_injury && <p className="text-xs text-red-600">{errors.has_illness_or_injury}</p>}

        <div className="bg-gray-50 border rounded-xl p-4">
          <div className="text-sm font-semibold text-gray-900 mb-2">If YES, check applicable:</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {illnessOptions.map((opt) => (
              <label key={opt} className={`flex items-center gap-2 text-sm text-gray-700 ${isLocked ? "opacity-60" : ""}`}>
                <input
                  type="checkbox"
                  disabled={isLocked || !form.has_illness_or_injury}
                  checked={(form.illness_injury_types ?? []).includes(opt)}
                  onChange={() => toggleIllnessType(opt)}
                />
                {opt}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <Input
              type="number"
              label="Days of Lost Work (optional)"
              value={form.lost_work_days == null ? "" : String(form.lost_work_days)}
              onChange={(v) => setField("lost_work_days", v === "" ? null : Number(v))}
              disabled={isLocked}
              error={errors.lost_work_days}
            />
            <div />
          </div>

          <Textarea
            label={
              form.has_illness_or_injury ? <RequiredMark label="Medical incident details" /> : "Medical incident details (optional)"
            }
            value={String(form.medical_incident_details ?? "")}
            onChange={(v) => setField("medical_incident_details", v)}
            disabled={isLocked || !form.has_illness_or_injury}
            error={errors.medical_incident_details}
            placeholder="Describe symptoms, incident, medications, etc."
          />
        </div>
      </div>
    </Section>
  );
}
