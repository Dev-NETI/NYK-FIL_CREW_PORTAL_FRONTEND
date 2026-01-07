"use client";

import { useState } from "react";

export interface DayInfo {
  totalSlots: number;
  bookedSlots: number;
  cancelledSlots: number;
  availableSlots: number;
}

interface Props {
  date: Date | null;
  data: Record<string, DayInfo>;
}

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CalendarDayCell({ date, data }: Props) {
  const [hover, setHover] = useState(false);

  if (!date) {
    return <div className="border bg-gray-50 h-24 rounded-md" />;
  }

  const key = formatLocalDateKey(date);

  const info: DayInfo = data[key] ?? {
    totalSlots: 0,
    bookedSlots: 0,
    cancelledSlots: 0,
    availableSlots: 0,
  };

  const remaining =
    typeof info.availableSlots === "number"
      ? info.availableSlots
      : info.totalSlots - info.bookedSlots;

  const hasSlots = info.totalSlots > 0;
  const isFull = hasSlots && remaining <= 0;

  const bgClass = !hasSlots
    ? "bg-white"
    : isFull
    ? "bg-red-100"
    : "bg-green-50";

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`border p-2 rounded-md h-24 flex flex-col justify-between transition ${bgClass}`}
      >
        <span className="text-sm font-medium">{date.getDate()}</span>

        <div className="text-xs text-gray-600">
          {!hasSlots ? (
            <span className="text-gray-400">No slots</span>
          ) : isFull ? (
            <span className="text-red-600 font-semibold">
              Fully booked
            </span>
          ) : (
            <span className="text-green-700">
              {remaining} slots
            </span>
          )}
        </div>
      </div>

      {hover && hasSlots && (
        <div className="absolute top-0 left-0 z-50 -translate-y-2 w-48 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-lg">
          <p className="font-semibold">{date.toDateString()}</p>
          <p>Total Slots: {info.totalSlots}</p>
          <p>Booked (Confirmed): {info.bookedSlots}</p>
          <p>Cancelled: {info.cancelledSlots}</p>
          <p className="text-green-300">
            Available: {remaining}
          </p>
        </div>
      )}
    </div>
  );
}
