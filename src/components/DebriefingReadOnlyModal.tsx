"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import CrewDetailsSection from "@/components/crew/documents/debriefing/form/sections/CrewDetailsSection";
import EmbarkationSection from "@/components/crew/documents/debriefing/form/sections/EmbarkationSection";
import DisembarkationSection from "@/components/crew/documents/debriefing/form/sections/DisembarkationSection";
import PersonalInfoSection from "@/components/crew/documents/debriefing/form/sections/PersonalInfoSection";
import MedicalSection from "@/components/crew/documents/debriefing/form/sections/MedicalSection";
import CommentsSection from "@/components/crew/documents/debriefing/form/sections/CommentsSection";
import { FieldErrors } from "@/components/crew/documents/debriefing/form/validation";
import { AdminDebriefingService } from "@/services/admin-debriefing";

type AnyDebriefingForm = {
  id?: number;
  crew_id?: number;
  crew_name?: string | null;
  status?: string | null;

  embarkation_date?: any;
  disembarkation_date?: any;
  manila_arrival_date?: any;
  date_of_availability?: any;
  next_vessel_assignment_date?: any;

  [key: string]: any;
};

export default function DebriefingReadOnlyModal({
  isOpen,
  onClose,
  formId,
  fetchForm,
  headerNote = "Read-only view. This form cannot be edited.",
  onSaved,

  allowOverride = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  formId?: number;
  fetchForm: (id: number) => Promise<{ data: AnyDebriefingForm }>;
  headerNote?: string;
  onSaved?: () => void;
  allowOverride?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Partial<AnyDebriefingForm>>({});
  const [draft, setDraft] = useState<Partial<AnyDebriefingForm>>({});
  const [isOverrideMode, setIsOverrideMode] = useState(false);

  const [overrideReason, setOverrideReason] = useState("");
  const [confirmNow, setConfirmNow] = useState(false);

  const [errors] = useState<FieldErrors>({});

  const title = useMemo(() => {
    if (formId) return `Debriefing Form #${formId}`;
    if (form.id) return `Debriefing Form #${form.id}`;
    return "Debriefing Form";
  }, [formId, form.id]);

  const toDateInput = (v: any): string | null => {
    if (v == null || String(v).trim() === "") return null;

    const s = String(v).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    const first10 = s.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(first10)) return first10;

    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    return null;
  };

  const normalizeFormDates = (raw: Partial<AnyDebriefingForm>) => {
    const next: Partial<AnyDebriefingForm> = { ...raw };

    const dateFields: string[] = [
      "embarkation_date",
      "disembarkation_date",
      "manila_arrival_date",
      "date_of_availability",
      "next_vessel_assignment_date",
    ];

    dateFields.forEach((k) => {
      (next as any)[k] = toDateInput((raw as any)[k]);
    });

    return next;
  };

  const status = String((isOverrideMode ? draft.status : form.status) ?? "");
  const isSubmitted = String(form.status ?? "") === "submitted";

  const canOverride = allowOverride && isSubmitted;

  const badgeCls =
    status === "confirmed"
      ? "bg-green-100 text-green-700"
      : status === "submitted"
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-700";

  const setField = (key: string, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const enterOverrideMode = () => {
    if (!canOverride) return;

    setIsOverrideMode(true);
    setDraft(form);
    setOverrideReason("");
    setConfirmNow(false);
  };

  const cancelOverrideMode = () => {
    setIsOverrideMode(false);
    setDraft({});
    setOverrideReason("");
    setConfirmNow(false);
  };

  const saveOverride = async () => {
    if (!canOverride) return;
    if (!formId) return;

    try {
      setSaving(true);
      const payload: any = {
        ...draft,
        override_reason: overrideReason || null,
        confirm_now: confirmNow,
      };

      // remove fields you don't want to send
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      const res = await AdminDebriefingService.overrideForm(formId, payload);

      toast.success(res.message || "Form overridden successfully.");

      const refreshed = await fetchForm(formId);
      const normalized = normalizeFormDates(refreshed.data);
      setForm(normalized);
      setDraft(normalized);
      setIsOverrideMode(false);

      onSaved?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Override failed.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !formId) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetchForm(formId);
        const normalized = normalizeFormDates(res.data);
        setForm(normalized);
        setDraft({});
        setIsOverrideMode(false);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load form");
        onClose();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formId]);

  if (!isOpen) return null;

  const activeForm = isOverrideMode ? draft : form;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {isOverrideMode
                  ? "Override mode: you can edit this submitted form."
                  : headerNote}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${badgeCls}`}
              >
                {String(form.status ?? "—")}
              </span>

              <button
                onClick={onClose}
                className="h-9 w-9 rounded-full flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition"
                title="Close"
                type="button"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700">
            This form is{" "}
            <strong className="capitalize">{String(form.status ?? "—")}</strong>.
          </div>

          {allowOverride && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              {!isOverrideMode ? (
                <>
                  <button
                    type="button"
                    onClick={enterOverrideMode}
                    disabled={!canOverride}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${canOverride
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    title={
                      canOverride
                        ? "Override submitted form"
                        : "Only submitted forms can be overridden"
                    }
                  >
                    Override
                  </button>

                  {!canOverride && (
                    <span className="text-xs text-gray-500">
                      Override is available only when status is{" "}
                      <strong>submitted</strong>.
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Override reason (optional)"
                      className="w-full border rounded-xl px-3 py-2 text-sm"
                    />

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={confirmNow}
                        onChange={(e) => setConfirmNow(e.target.checked)}
                        className="h-4 w-4"
                      />
                      Confirm immediately (queue PDF)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelOverrideMode}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-60"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={saveOverride}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save Override"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-5 max-h-[72vh] overflow-y-auto space-y-4">
          {loading && (
            <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-600">
              Loading...
            </div>
          )}

          <CrewDetailsSection form={activeForm as any} />

          <EmbarkationSection
            form={activeForm as any}
            setField={isOverrideMode ? setField : () => { }}
            isLocked={!isOverrideMode}
            errors={errors}
          />
          <DisembarkationSection
            form={activeForm as any}
            setField={isOverrideMode ? setField : () => { }}
            isLocked={!isOverrideMode}
            errors={errors}
          />
          <PersonalInfoSection
            form={activeForm as any}
            setField={isOverrideMode ? setField : () => { }}
            isLocked={!isOverrideMode}
            errors={errors}
          />
          <MedicalSection
            form={activeForm as any}
            setField={isOverrideMode ? setField : () => { }}
            isLocked={!isOverrideMode}
            errors={errors}
          />
          <CommentsSection
            form={activeForm as any}
            setField={isOverrideMode ? setField : () => { }}
            isLocked={!isOverrideMode}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );
}
