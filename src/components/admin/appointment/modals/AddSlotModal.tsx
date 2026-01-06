"use client";

import { useEffect, useMemo, useState } from "react";
import ValidationError from "@/components/ui/ValidationError";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

dayjs.extend(customParseFormat);

type ServerErrors = Record<string, string[]>;
type FieldErrors = Record<string, string>;

const normalizeDate = (date?: string) => (date ? date.split("T")[0] : "");
const normalizeTime = (time?: string | null) => (time ? time.slice(0, 5) : "");

const toMinutes = (time: string) => {
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) return NaN;

  const h = Number(match[1]);
  const m = Number(match[2]);
  return h * 60 + m;
};

const DEFAULT_SLOT_DURATION = 30;

const computeMaxSlots = (
  openingTime: string,
  closingTime: string,
  durationMinutes: number
) => {
  if (!openingTime || !closingTime) return 0;

  const open = toMinutes(openingTime);
  const close = toMinutes(closingTime);

  if (!Number.isFinite(open) || !Number.isFinite(close)) return 0;

  const totalMinutes = close - open;
  if (totalMinutes <= 0) return 0;

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return 0;

  return Math.floor(totalMinutes / durationMinutes);
};

const toDayjsTime = (value: string): Dayjs | null => {
  if (!value) return null;

  const hhmm = dayjs(value, "HH:mm", true);
  if (hhmm.isValid()) return hhmm;

  const ampm = dayjs(value, "hh:mm A", true);
  return ampm.isValid() ? ampm : null;
};

const fromDayjsTime = (value: Dayjs | null) => {
  return value ? value.format("HH:mm") : "";
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
  const [date, setDate] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [slotDuration, setSlotDuration] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (key: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  useEffect(() => {
    if (initialData) {
      setDate(normalizeDate(initialData.date));
      setOpeningTime(normalizeTime(initialData.opening_time));
      setClosingTime(normalizeTime(initialData.closing_time));
      setCapacity(initialData.total_slots?.toString() ?? "");
      setSlotDuration(
        initialData.slot_duration_minutes != null
          ? String(initialData.slot_duration_minutes)
          : ""
      );
    } else {
      setDate("");
      setOpeningTime("");
      setClosingTime("");
      setCapacity("");
      setSlotDuration("");
    }

    setErrors({});
  }, [initialData]);

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

    if (!initialData?.id) {
      if (!date) nextErrors.date = "Date is required.";
      if (date && disabledDates.has(date)) {
        nextErrors.date = "A schedule already exists for this date.";
      }
    }

    if (!capacity.trim()) {
      nextErrors.total_slots = "Daily capacity is required.";
    } else {
      const cap = Number(capacity);
      if (!Number.isFinite(cap) || cap <= 0) {
        nextErrors.total_slots = "Daily capacity must be greater than 0.";
      }
    }

    if (!openingTime) nextErrors.opening_time = "Opening time is required.";
    if (!closingTime) nextErrors.closing_time = "Closing time is required.";

    if (openingTime && closingTime) {
      if (toMinutes(closingTime) <= toMinutes(openingTime)) {
        nextErrors.closing_time = "Closing time must be later than opening time.";
      }
    }

    if (slotDuration.trim()) {
      const dur = Number(slotDuration);
      if (!Number.isFinite(dur) || dur < 5) {
        nextErrors.slot_duration_minutes = "Slot duration must be at least 5 minutes.";
      }
    }

    const durationForValidation = slotDuration.trim()
      ? Number(slotDuration)
      : DEFAULT_SLOT_DURATION;

    if (openingTime && closingTime && Number.isFinite(durationForValidation)) {
      const maxSlots = computeMaxSlots(openingTime, closingTime, durationForValidation);

      if (maxSlots <= 0) {
        nextErrors.total_slots = "Invalid time range or slot duration.";
      } else if (capacity.trim()) {
        const cap = Number(capacity);
        if (Number.isFinite(cap) && cap > maxSlots) {
          nextErrors.total_slots = `Daily capacity cannot exceed ${maxSlots} based on the selected time range and slot duration.`;
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      id: initialData?.id,
      date,
      opening_time: openingTime || null,
      closing_time: closingTime || null,
      total_slots: Number(capacity),
      slot_duration_minutes: slotDuration.trim() ? Number(slotDuration) : null,
    });
  };

  const maxCapacity =
    openingTime && closingTime
      ? computeMaxSlots(
        openingTime,
        closingTime,
        slotDuration.trim() ? Number(slotDuration) : DEFAULT_SLOT_DURATION
      )
      : 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/10 z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Edit Slot" : "Add Slot"}
        </h2>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="space-y-4">
            {!initialData?.id && (
              <div>
                <label className="text-sm font-medium">Date</label>

                <div className={errors.date ? "rounded-lg ring-1 ring-red-500" : ""}>
                  <DatePicker
                    value={date ? dayjs(date, "YYYY-MM-DD") : null}
                    onChange={(value) => {
                      const next = value ? value.format("YYYY-MM-DD") : "";
                      setDate(next);
                      clearError("date");
                    }}
                    shouldDisableDate={shouldDisableDate}
                    disablePast
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        placeholder: "Select date",
                      } as any,
                    }}
                  />
                </div>

                <ValidationError errors={errors.date ?? ""} className="text-xs" />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Opening Time</label>

              <div
                className={errors.opening_time ? "rounded-lg ring-1 ring-red-500" : ""}
              >
                <TimePicker
                  value={toDayjsTime(openingTime)}
                  onChange={(val) => {
                    setOpeningTime(fromDayjsTime(val));
                    clearError("opening_time");
                  }}
                  ampm
                  minutesStep={5}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "Select time",
                    } as any,
                  }}
                />
              </div>

              <ValidationError errors={errors.opening_time ?? ""} className="text-xs" />
            </div>

            <div>
              <label className="text-sm font-medium">Closing Time</label>

              <div
                className={errors.closing_time ? "rounded-lg ring-1 ring-red-500" : ""}
              >
                <TimePicker
                  value={toDayjsTime(closingTime)}
                  onChange={(val) => {
                    setClosingTime(fromDayjsTime(val));
                    clearError("closing_time");
                  }}
                  ampm
                  minutesStep={5}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      placeholder: "Select time",
                    } as any,
                  }}
                />
              </div>

              <ValidationError errors={errors.closing_time ?? ""} className="text-xs" />
            </div>

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
                className={`border rounded-lg p-2 w-full ${errors.total_slots ? "border-red-500" : ""
                  }`}
              />

              {openingTime && closingTime && (
                <p className="text-xs text-gray-500 mt-1">
                  Max capacity: {maxCapacity} slots
                  {!slotDuration.trim()
                    ? ` (default duration: ${DEFAULT_SLOT_DURATION} mins)`
                    : ""}
                </p>
              )}

              <ValidationError errors={errors.total_slots ?? ""} className="text-xs" />
            </div>

            <div>
              <label className="text-sm font-medium">
                Slot Duration (minutes) <span className="text-gray-500">(optional)</span>
              </label>

              <input
                type="number"
                min={5}
                value={slotDuration}
                onChange={(e) => {
                  setSlotDuration(e.target.value);
                  clearError("slot_duration_minutes");
                }}
                className={`border rounded-lg p-2 w-full ${errors.slot_duration_minutes ? "border-red-500" : ""
                  }`}
                placeholder="e.g. 30"
              />

              <ValidationError errors={errors.slot_duration_minutes ?? ""} className="text-xs" />
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
            {initialData ? "Save Changes" : "Add Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}
