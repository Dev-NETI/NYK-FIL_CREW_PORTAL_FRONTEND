"use client";

import { TimeSlotApi } from "@/services/crew-appointments";

interface Props {
  slots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

const formatTime = (time?: string) => {
  if (!time) return "-";

  const [hourStr, minute] = time.split(":");
  const hour = Number(hourStr);
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
};

export default function TimeSlotList({
  slots,
  selectedSlot,
  onSelectSlot,
}: Props) {
  if (!slots.length) {
    return (
      <div className="bg-white rounded-xl p-4 shadow text-gray-500 text-sm">
        Select a date to view available time slots.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
      <div className="grid grid-cols-2 gap-3">
        {slots.map((time) => {
          const isSelected = selectedSlot === time;
          return (
            <button
              key={time}
              onClick={() => onSelectSlot(time)}
              className={`py-2 rounded-lg border text-sm font-medium ${
                isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-50"
              }`}
            >
              {formatTime(time)}
            </button>
          );
        })}
      </div>
    </div>
  );
}