"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
  CrewDebriefingService,
  DebriefingForm,
  DebriefingPrefill,
} from "@/services/crew-debriefing";
import SubmitDebriefingModal from "../list/SubmitDebriefingModal";

import CrewDetailsSection from "./sections/CrewDetailsSection";
import EmbarkationSection from "./sections/EmbarkationSection";
import DisembarkationSection from "./sections/DisembarkationSection";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import MedicalSection from "./sections/MedicalSection";
import CommentsSection from "./sections/CommentsSection";

import {
  FieldErrors,
  validateDraft,
  validateSubmit,
  buildPayload,
} from "./validation";

type ServerErrors = Record<string, string[]>;

export default function CrewDebriefingFormModal({
  isOpen,
  onClose,
  onSuccess,
  formId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  formId?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<DebriefingForm>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  const [uiRef, setUiRef] = useState<string>("");
  const closingRef = useRef(false);

  const status = String(form.status ?? "draft") as DebriefingForm["status"];
  const isDraft = status === "draft";
  const isLocked = !isDraft;

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

  const normalizeFormDates = (
    raw: Partial<DebriefingForm>
  ): Partial<DebriefingForm> => {
    const next: Partial<DebriefingForm> = { ...raw };

    const dateFields: (keyof DebriefingForm)[] = [
      "embarkation_date",
      "disembarkation_date",
      "manila_arrival_date",
      "date_of_availability",
      "next_vessel_assignment_date",
    ];

    dateFields.forEach((k) => {
      const normalized = toDateInput((raw as any)[k]);
      (next as any)[k] = normalized;
    });

    return next;
  };

  const applyPrefill = (
    raw: Partial<DebriefingForm>,
    prefill?: DebriefingPrefill
  ): Partial<DebriefingForm> => {
    if (!prefill) return raw;

    return {
      ...raw,
      phone_number: raw.phone_number ?? prefill.mobile_number ?? null,
      email: raw.email ?? prefill.email ?? null,
      present_address: raw.present_address ?? prefill.present_address ?? null,
      provincial_address:
        raw.provincial_address ?? prefill.provincial_address ?? null,
    };
  };

  const title = useMemo(() => {
    if (formId) return `Debriefing Form #${formId}`;
    if (form.id) return `Debriefing Form #${form.id}`;
    return uiRef ? `Debriefing Form #${uiRef}` : "Debriefing Form";
  }, [formId, form.id, uiRef]);

  const resetState = () => {
    setForm({});
    setErrors({});
    setLoading(false);
    setSubmitConfirmOpen(false);
    closingRef.current = false;
  };

  const mapServerErrors = (e: any): FieldErrors => {
    const v: ServerErrors | undefined = e?.response?.data?.errors;
    if (!v || typeof v !== "object") return {};

    const out: FieldErrors = {};
    Object.entries(v).forEach(([key, msgs]) => {
      out[key] =
        Array.isArray(msgs) && msgs.length ? String(msgs[0]) : "Invalid value.";
    });
    return out;
  };

  const setField = (key: keyof DebriefingForm, value: any) => {
    const dateKeys: (keyof DebriefingForm)[] = [
      "embarkation_date",
      "disembarkation_date",
      "manila_arrival_date",
      "date_of_availability",
      "next_vessel_assignment_date",
    ];

    const nextValue =
      dateKeys.includes(key) ? (toDateInput(value) ?? "") : value;

    setForm((prev) => ({ ...prev, [key]: nextValue }));

    if (errors?.[String(key)]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[String(key)];
        return next;
      });
    }
  };

  const loadExisting = async () => {
    if (!formId) return;

    try {
      setLoading(true);
      const res = await CrewDebriefingService.getForm(formId);

      const merged = applyPrefill(res.data, res.prefill);
      setForm(normalizeFormDates(merged));
      setErrors({});
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load form");
      resetState();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const createDraft = async () => {
    try {
      setLoading(true);
      const res = await CrewDebriefingService.createDraft({});

      const merged = applyPrefill(res.data, res.prefill);
      setForm(normalizeFormDates(merged));
      setErrors({});
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to create draft");
      resetState();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (!formId) {
      setUiRef(String(Math.floor(100000 + Math.random() * 900000)));
    } else {
      setUiRef("");
    }

    (async () => {
      if (formId) await loadExisting();
      else await createDraft();
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formId]);

  const saveDraft = async (silent?: boolean) => {
    if (!form.id) {
      if (!silent) toast.error("Draft not ready yet.");
      return false;
    }

    const v = validateDraft(form);
    if (Object.keys(v).length) {
      setErrors(v);
      if (!silent) toast.error("Please fix the highlighted fields.");
      return false;
    }

    try {
      setLoading(true);
      setErrors({});

      const payload = buildPayload(form);
      const res = await CrewDebriefingService.updateDraft(form.id, payload);

      setForm(normalizeFormDates(res.data));
      if (!silent) toast.success("Draft saved");
      onSuccess();
      return true;
    } catch (e: any) {
      const normalized = mapServerErrors(e);
      if (Object.keys(normalized).length) setErrors(normalized);

      if (!silent)
        toast.error(e?.response?.data?.message || "Failed to save draft");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraftAndClose = async () => {
    if (loading || isLocked) return;

    const ok = await saveDraft(false);
    if (!ok) return;

    resetState();
    onClose();
  };

  const submitForm = async () => {
    if (!form.id) {
      toast.error("Draft not ready yet.");
      return;
    }

    const v = validateSubmit(form);
    if (Object.keys(v).length) {
      setErrors(v);
      toast.error("Please complete all required fields.");
      setSubmitConfirmOpen(false);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const payload = buildPayload(form);
      const res = await CrewDebriefingService.submitForm(form.id, payload);

      setForm(normalizeFormDates(res.data));
      toast.success("Debriefing form submitted");
      onSuccess();

      resetState();
      onClose();
    } catch (e: any) {
      const normalized = mapServerErrors(e);
      if (Object.keys(normalized).length) setErrors(normalized);

      toast.error(e?.response?.data?.message || "Failed to submit form");
    } finally {
      setLoading(false);
      setSubmitConfirmOpen(false);
    }
  };

  const handleCloseAutoSave = async () => {
    if (closingRef.current) return;
    closingRef.current = true;

    if (isLocked) {
      resetState();
      onClose();
      return;
    }

    if (form.id) {
      await saveDraft(true);
      toast.success("Draft saved");
    }

    resetState();
    onClose();
  };

  const StatusBadge = () => {
    const s = String(form.status ?? "draft");
    const cls =
      s === "confirmed"
        ? "bg-green-100 text-green-700"
        : s === "submitted"
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-700";

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}
      >
        {s}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 border-b">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete all required fields and submit for review.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge />

                <button
                  onClick={handleCloseAutoSave}
                  disabled={loading}
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition ${
                    loading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                  title="Close (auto-saves draft)"
                  type="button"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            {isLocked && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-900">
                This form is <strong className="capitalize">{status}</strong>{" "}
                and can no longer be edited.
              </div>
            )}
          </div>

          <div className="p-5 max-h-[72vh] overflow-y-auto space-y-4">
            {loading && (
              <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-600">
                Loading...
              </div>
            )}

            <CrewDetailsSection form={form} />

            <EmbarkationSection
              form={form}
              setField={setField}
              isLocked={isLocked}
              errors={errors}
            />
            <DisembarkationSection
              form={form}
              setField={setField}
              isLocked={isLocked}
              errors={errors}
            />
            <PersonalInfoSection
              form={form}
              setField={setField}
              isLocked={isLocked}
              errors={errors}
            />
            <MedicalSection
              form={form}
              setField={setField}
              isLocked={isLocked}
              errors={errors}
            />
            <CommentsSection
              form={form}
              setField={setField}
              isLocked={isLocked}
              errors={errors}
            />
          </div>

          <div className="p-5 border-t bg-gray-50 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
            <div className="flex gap-2 justify-end">
              <button
                disabled={loading || isLocked}
                onClick={handleSaveDraftAndClose}
                className={`h-[42px] px-4 rounded-lg text-sm font-medium transition ${
                  loading || isLocked
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
                }`}
                type="button"
              >
                Save as Draft
              </button>

              <button
                disabled={loading || isLocked}
                onClick={() => setSubmitConfirmOpen(true)}
                className={`h-[42px] px-4 rounded-lg text-sm font-medium transition ${
                  loading || isLocked
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                }`}
                type="button"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      <SubmitDebriefingModal
        open={submitConfirmOpen}
        onClose={() => setSubmitConfirmOpen(false)}
        onConfirm={submitForm}
        loading={loading}
      />
    </>
  );
}
