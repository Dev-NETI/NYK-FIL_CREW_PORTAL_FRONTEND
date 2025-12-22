"use client";

import { useState } from "react";

interface DayInfo {
  totalSlots: number;
  bookedSlots: number;
}

interface Props {
  date: Date | null;
  data: Record<string, DayInfo>;
}

export default function CalendarDayCell({ date, data }: Props) {
  const [hover, setHover] = useState(false);

  if (!date)
    return <div className="border bg-gray-50 h-24 rounded-md" />;

  const key = date.toISOString().split("T")[0];

  const info = data[key] || {
    totalSlots: 0,
    bookedSlots: 0,
  };

  const remaining = info.totalSlots - info.bookedSlots;
  const isFull = info.totalSlots > 0 && remaining <= 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`border p-2 rounded-md h-24 flex flex-col 
        justify-between transition ${
          isFull
            ? "bg-red-100"
            : info.totalSlots > 0
            ? "bg-green-50"
            : "bg-white"
        }`}
      >
        <span className="text-sm font-medium">{date.getDate()}</span>

        <div className="text-xs text-gray-600">
          {info.totalSlots === 0 ? (
            <span className="text-gray-400">No slots</span>
          ) : isFull ? (
            <span className="text-red-600 font-semibold">Fully booked</span>
          ) : (
            <span className="text-green-700">{remaining} slots</span>
          )}
        </div>
      </div>

      {hover && info.totalSlots > 0 && (
        <div
          className="absolute top-0 left-0 z-50 transform -translate-y-2 
          w-44 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-lg"
        >
          <p className="font-semibold">{date.toDateString()}</p>
          <p>Total Slots: {info.totalSlots}</p>
          <p>Booked: {info.bookedSlots}</p>
          <p className="text-green-300">Available: {remaining}</p>
        </div>
      )}
    </div>
  );
}
