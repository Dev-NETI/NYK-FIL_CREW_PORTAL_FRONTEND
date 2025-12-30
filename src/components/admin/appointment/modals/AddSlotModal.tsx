"use client";

import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import ValidationError from "@/components/ui/ValidationError";

type ServerErrors = Record<string, string[]>;
type FieldErrors = Record<string, string>;

const normalizeDate = (date?: string) => (date ? date.split("T")[0] : "");
const normalizeTime = (time?: string | null) => (time ? time.slice(0, 5) : "");

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const generateTimes = () => {
  const times: { value: string; label: string }[] = [];

  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const hour = h % 12 || 12;
      const suffix = h < 12 ? "AM" : "PM";

      times.push({
        value,
        label: `${hour}:${String(m).padStart(2, "0")} ${suffix}`,
      });
    }
  }

  return times;
};

const TIME_OPTIONS = generateTimes();

export default function AddSlotModal({
  initialData,
  onClose,
  onSave,
  serverErrors,
}: {
  initialData?: any;
  onClose: () => void;
  onSave: (data: any) => void;
  serverErrors?: ServerErrors;
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

  const TimePicker = ({
    label,
    value,
    onChange,
    errorKey,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    errorKey: string;
  }) => {
    const [open, setOpen] = useState(false);

    const selectedLabel =
      TIME_OPTIONS.find((t) => t.value === value)?.label ?? "Select time";

    const hasError = !!errors[errorKey];

    return (
      <div>
        <label className="text-sm font-medium">{label}</label>

        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className={`border rounded-lg p-2 w-full text-left ${
                hasError ? "border-red-500" : ""
              }`}
            >
              {selectedLabel}
            </button>
          </Popover.Trigger>

          <Popover.Content
            sideOffset={6}
            className="bg-white shadow-lg rounded-xl w-48 max-h-64 overflow-y-auto p-1 z-50"
          >
            {TIME_OPTIONS.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => {
                  onChange(t.value);
                  clearError(errorKey);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 ${
                  value === t.value ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                {t.label}
              </button>
            ))}
          </Popover.Content>
        </Popover.Root>

        <ValidationError errors={errors[errorKey] ?? ""} className="text-xs" />
      </div>
    );
  };

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!initialData?.id && !date) nextErrors.date = "Date is required.";

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
        nextErrors.slot_duration_minutes =
          "Slot duration must be at least 5 minutes.";
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

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/10 z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Edit Slot" : "Add Slot"}
        </h2>

        <div className="space-y-4">
          {!initialData?.id && (
            <div>
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  clearError("date");
                }}
                className={`border rounded-lg p-2 w-full ${
                  errors.date ? "border-red-500" : ""
                }`}
              />

              <ValidationError errors={errors.date ?? ""} className="text-xs" />
            </div>
          )}

          <TimePicker
            label="Opening Time"
            value={openingTime}
            onChange={setOpeningTime}
            errorKey="opening_time"
          />

          <TimePicker
            label="Closing Time"
            value={closingTime}
            onChange={setClosingTime}
            errorKey="closing_time"
          />

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

            <ValidationError
              errors={errors.total_slots ?? ""}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Slot Duration (minutes){" "}
              <span className="text-gray-500">(optional)</span>
            </label>

            <input
              type="number"
              min={5}
              value={slotDuration}
              onChange={(e) => {
                setSlotDuration(e.target.value);
                clearError("slot_duration_minutes");
              }}
              className={`border rounded-lg p-2 w-full ${
                errors.slot_duration_minutes ? "border-red-500" : ""
              }`}
              placeholder="e.g. 30"
            />

            <ValidationError
              errors={errors.slot_duration_minutes ?? ""}
              className="text-xs"
            />
          </div>
        </div>

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
