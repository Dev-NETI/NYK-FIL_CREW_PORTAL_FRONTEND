"use client";

import { useEffect, useMemo, useState } from "react";
import ValidationError from "@/components/ui/ValidationError";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

dayjs.extend(customParseFormat);

type ServerErrors = Record<string, string[]>;
type FieldErrors = Record<string, string>;

const normalizeDate = (date?: string) => (date ? String(date).split("T")[0] : "");

type CreateMode = "range" | "multiple";

const expandRange = (start: string, end: string) => {
  const s = dayjs(start, "YYYY-MM-DD", true);
  const e = dayjs(end, "YYYY-MM-DD", true);
  if (!s.isValid() || !e.isValid()) return [];

  if (e.isBefore(s, "day")) return [];

  const out: string[] = [];
  let d = s.clone();
  while (d.isSame(e, "day") || d.isBefore(e, "day")) {
    out.push(d.format("YYYY-MM-DD"));
    d = d.add(1, "day");
  }
  return out;
};

export default function AddSlotModal({
  initialData,
  onClose,
  onSave,
  serverErrors,
  disabledDates,
}: {
  initialData?: any;
  onClose: () => void;
  onSave: (data: any) => void;
  serverErrors?: ServerErrors;
  disabledDates: Set<string>;
}) {
  const isEdit = !!initialData?.id;

  // create mode
  const [mode, setMode] = useState<CreateMode>("range");

  // range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // multiple
  const [multiDate, setMultiDate] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  // common
  const [capacity, setCapacity] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (key: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  useEffect(() => {
    if (isEdit) {
      setCapacity(initialData.total_slots?.toString() ?? "");
    } else {
      setMode("range");
      setStartDate("");
      setEndDate("");
      setMultiDate("");
      setSelectedDates([]);
      setCapacity("");
    }

    setErrors({});
  }, [initialData, isEdit]);

  useEffect(() => {
    if (!serverErrors) return;

    const mapped: FieldErrors = {};
    Object.entries(serverErrors).forEach(([key, msgs]) => {
      mapped[key] = msgs?.[0] ?? "Invalid value";
    });

    setErrors((prev) => ({ ...prev, ...mapped }));
  }, [serverErrors]);

  const shouldDisableDate = useMemo(() => {
    return (value: Dayjs) => disabledDates.has(value.format("YYYY-MM-DD"));
  }, [disabledDates]);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    // capacity
    if (!capacity.trim()) {
      nextErrors.total_slots = "Daily capacity is required.";
    } else {
      const cap = Number(capacity);
      if (!Number.isFinite(cap) || cap <= 0) {
        nextErrors.total_slots = "Daily capacity must be greater than 0.";
      }
    }

    if (!isEdit) {
      if (mode === "range") {
        if (!startDate) nextErrors.start_date = "Start date is required.";
        if (!endDate) nextErrors.end_date = "End date is required.";

        if (startDate && disabledDates.has(startDate)) {
          nextErrors.start_date = "A schedule already exists for this date.";
        }
        if (endDate && disabledDates.has(endDate)) {
          nextErrors.end_date = "A schedule already exists for this date.";
        }

        if (startDate && endDate) {
          const rangeDates = expandRange(startDate, endDate);
          if (rangeDates.length === 0) {
            nextErrors.end_date = "End date must be the same as or later than start date.";
          } else {
            const conflict = rangeDates.find((d) => disabledDates.has(d));
            if (conflict) {
              nextErrors.start_date = "Some dates in this range already have schedules.";
            }
          }
        }
      }

      if (mode === "multiple") {
        if (selectedDates.length === 0) {
          nextErrors.dates = "Please select at least one date.";
        } else {
          const conflict = selectedDates.find((d) => disabledDates.has(d));
          if (conflict) {
            nextErrors.dates = "Some selected dates already have schedules.";
          }
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAddMultiDate = () => {
    if (!multiDate) return;

    if (disabledDates.has(multiDate)) {
      setErrors((prev) => ({ ...prev, dates: "A schedule already exists for one of the selected dates." }));
      return;
    }

    setSelectedDates((prev) => {
      if (prev.includes(multiDate)) return prev;
      return [...prev, multiDate].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    });

    setMultiDate("");
    clearError("dates");
  };

  const handleRemoveMultiDate = (date: string) => {
    setSelectedDates((prev) => prev.filter((d) => d !== date));
  };

  const handleSave = () => {
    if (!validate()) return;

    if (isEdit) {
      onSave({
        id: initialData.id,
        total_slots: Number(capacity),
      });
      return;
    }

    if (mode === "multiple") {
      onSave({
        total_slots: Number(capacity),
        dates: selectedDates,
      });
      return;
    }

    // range
    onSave({
      total_slots: Number(capacity),
      start_date: startDate,
      end_date: endDate,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/10 z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Capacity" : "Add Schedule"}
        </h2>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="space-y-4">
            {!isEdit && (
              <div>
                <label className="text-sm font-medium">Selection Type</label>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("range");
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.dates;
                        delete copy.start_date;
                        delete copy.end_date;
                        return copy;
                      });
                    }}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      mode === "range" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"
                    }`}
                  >
                    Date Range
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("multiple");
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.dates;
                        delete copy.start_date;
                        delete copy.end_date;
                        return copy;
                      });
                    }}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      mode === "multiple" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700"
                    }`}
                  >
                    Multiple Days
                  </button>
                </div>
              </div>
            )}

            {!isEdit && mode === "range" && (
              <>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <div className={errors.start_date ? "rounded-lg ring-1 ring-red-500" : ""}>
                    <DatePicker
                      value={startDate ? dayjs(startDate, "YYYY-MM-DD") : null}
                      onChange={(value) => {
                        const next = value ? value.format("YYYY-MM-DD") : "";
                        setStartDate(next);
                        clearError("start_date");
                      }}
                      shouldDisableDate={shouldDisableDate}
                      disablePast
                      slotProps={{
                        textField: { size: "small", fullWidth: true, placeholder: "Select start date" } as any,
                      }}
                    />
                  </div>
                  <ValidationError errors={errors.start_date ?? ""} className="text-xs" />
                </div>

                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <div className={errors.end_date ? "rounded-lg ring-1 ring-red-500" : ""}>
                    <DatePicker
                      value={endDate ? dayjs(endDate, "YYYY-MM-DD") : null}
                      onChange={(value) => {
                        const next = value ? value.format("YYYY-MM-DD") : "";
                        setEndDate(next);
                        clearError("end_date");
                      }}
                      shouldDisableDate={shouldDisableDate}
                      disablePast
                      slotProps={{
                        textField: { size: "small", fullWidth: true, placeholder: "Select end date" } as any,
                      }}
                    />
                  </div>
                  <ValidationError errors={errors.end_date ?? ""} className="text-xs" />
                </div>
              </>
            )}

            {!isEdit && mode === "multiple" && (
              <>
                <div>
                  <label className="text-sm font-medium">Pick a Date</label>
                  <div className={errors.dates ? "rounded-lg ring-1 ring-red-500" : ""}>
                    <DatePicker
                      value={multiDate ? dayjs(multiDate, "YYYY-MM-DD") : null}
                      onChange={(value) => {
                        const next = value ? value.format("YYYY-MM-DD") : "";
                        setMultiDate(next);
                        clearError("dates");
                      }}
                      shouldDisableDate={shouldDisableDate}
                      disablePast
                      slotProps={{
                        textField: { size: "small", fullWidth: true, placeholder: "Select date" } as any,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddMultiDate}
                      className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm"
                      disabled={!multiDate}
                    >
                      Add Date
                    </button>
                  </div>

                  <ValidationError errors={errors.dates ?? ""} className="text-xs" />

                  {selectedDates.length > 0 && (
                    <div className="mt-3 border rounded-lg p-3 space-y-2">
                      <p className="text-xs text-gray-600">Selected dates:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedDates.map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                          >
                            {d}
                            <button
                              type="button"
                              onClick={() => handleRemoveMultiDate(d)}
                              className="text-gray-500 hover:text-gray-800"
                              aria-label={`Remove ${d}`}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium">Daily Capacity</label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => {
                  setCapacity(e.target.value);
                  clearError("total_slots");
                }}
                className={`border rounded-lg p-2 w-full ${
                  errors.total_slots ? "border-red-500" : ""
                }`}
              />
              <ValidationError errors={errors.total_slots ?? ""} className="text-xs" />
            </div>
          </div>
        </LocalizationProvider>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300"
            type="button"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
            type="button"
          >
            {isEdit ? "Save Changes" : "Save Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
