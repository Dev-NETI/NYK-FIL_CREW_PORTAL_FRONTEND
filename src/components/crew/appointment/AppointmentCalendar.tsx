"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CalendarDay {
  date: string;
  isAvailable: boolean;
  availableSlots: number;
}

export type CalendarDayCell = CalendarDay | null;

interface Props {
  days: CalendarDayCell[];
  selectedDate: string | null;
  currentMonthLabel: string;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function AppointmentCalendar({
  days,
  selectedDate,
  currentMonthLabel,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const [activeTooltipDate, setActiveTooltipDate] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl p-6 shadow w full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-center flex-1">
          {currentMonthLabel}
        </h3>

        <button
          onClick={onNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />;

          const isSelected = selectedDate === day.date;
          const isTooltipActive = activeTooltipDate === day.date;

          return (
            <div
              key={day.date}
              className="relative flex items-center justify-center group"
              onMouseEnter={() => setActiveTooltipDate(day.date)}
              onMouseLeave={() => setActiveTooltipDate(null)}
            >
              <button
                disabled={!day.isAvailable}
                onClick={() => {
                  if (!day.isAvailable) return;
                  onSelectDate(day.date);
                  setActiveTooltipDate(
                    isTooltipActive ? null : day.date
                  );
                }}
                className={`relative w-full h-12 rounded-lg border text-sm transition flex items-center justify-center
                  ${
                    !day.isAvailable
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-blue-50"
                  }
                `}
              >
                {day.date.slice(8, 10)}

                {!day.isAvailable && day.availableSlots === 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </button>

              {day.isAvailable && (
                <div
                  className={`absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-1 transition-opacity
                    ${
                      isTooltipActive
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }
                  `}
                >
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow whitespace-nowrap">
                    {day.availableSlots} slot
                    {day.availableSlots > 1 ? "s" : ""} available
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
