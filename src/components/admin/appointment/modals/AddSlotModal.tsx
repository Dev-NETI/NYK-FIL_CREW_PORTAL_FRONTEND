"use client";

import { useState, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";

const normalizeDate = (date?: string) =>
  date ? date.split("T")[0] : "";

const normalizeTime = (time?: string) =>
  time ? time.slice(0, 5) : "";

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
}: {
  initialData?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [date, setDate] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    if (initialData) {
      setDate(normalizeDate(initialData.date));
      setOpeningTime(normalizeTime(initialData.opening_time));
      setClosingTime(normalizeTime(initialData.closing_time));
      setCapacity(initialData.total_slots?.toString() ?? "");
    }
  }, [initialData]);

  const handleSave = () => {
    onSave({
      id: initialData?.id,
      date,
      opening_time: openingTime || null,
      closing_time: closingTime || null,
      total_slots: Number(capacity),
    });
  };

  const TimePicker = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => {
    const [open, setOpen] = useState(false);

    const selectedLabel =
      TIME_OPTIONS.find((t) => t.value === value)?.label ?? "Select time";

    return (
      <div>
        <label className="text-sm font-medium">{label}</label>

        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button className="border rounded-lg p-2 w-full text-left">
              {selectedLabel}
            </button>
          </Popover.Trigger>

          <Popover.Content
            sideOffset={6}
            className="bg-white shadow-lg rounded-xl w-48 max-h-64 overflow-y-auto p-1 z-50"
          >
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  onChange(t.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 ${value === t.value
                    ? "bg-gray-100 font-semibold"
                    : ""
                  }`}
              >
                {t.label}
              </button>
            ))}
          </Popover.Content>
        </Popover.Root>
      </div>
    );
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/10 z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? "Edit Slot" : "Add Slot"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg p-2 w-full"
            />
          </div>

          <TimePicker
            label="Opening Time"
            value={openingTime}
            onChange={setOpeningTime}
          />

          <TimePicker
            label="Closing Time"
            value={closingTime}
            onChange={setClosingTime}
          />

          <div>
            <label className="text-sm font-medium">
              Daily Capacity
            </label>
            <input
              type="number"
              min={0}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="border rounded-lg p-2 w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            {initialData ? "Save Changes" : "Add Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}
