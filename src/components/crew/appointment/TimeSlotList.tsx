"use client";

import { TimeSlotApi } from "@/services/crew-appointments";
import { formatTime } from "@/lib/utils";

interface Props {
  slots: TimeSlotApi[];
  selectedSlot: TimeSlotApi | null;
  onSelectSlot: (slot: TimeSlotApi) => void;
  loading?: boolean;
}

export default function TimeSlotList({
  slots,
  selectedSlot,
  onSelectSlot,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>

        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 rounded-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div className="bg-white rounded-xl p-4 shadow text-gray-500 text-sm">
        No available time slots for this date.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>

      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.time === slot.time;

          return (
            <button
              key={slot.time}
              disabled={!slot.isAvailable}
              onClick={() => onSelectSlot(slot)}
              className={`
                py-2 rounded-lg border text-sm font-medium transition
                ${
                  !slot.isAvailable
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isSelected
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-50"
                }
              `}
            >
              {formatTime(slot.time)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
