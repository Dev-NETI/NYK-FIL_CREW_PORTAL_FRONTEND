"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarDayStatus = "available" | "limited" | "full" | "no_slots";

export interface CalendarDay {
  date: string;
  isAvailable: boolean;
  availableSlots: number;
  status: CalendarDayStatus;
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

function Legend() {
  const items = [
    {
      key: "available",
      text: "Available",
      dot: "bg-green-500",
      chip: "bg-green-50 text-green-700 border-green-200",
    },
    {
      key: "limited",
      text: "Limited",
      dot: "bg-orange-500",
      chip: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      key: "full",
      text: "Fully booked",
      dot: "bg-red-500",
      chip: "bg-red-50 text-red-700 border-red-200",
    },
    {
      key: "no_slots",
      text: "No slots",
      dot: "bg-gray-400",
      chip: "bg-gray-50 text-gray-600 border-gray-200",
    },
  ] as const;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <div
            key={i.key}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${i.chip}`}
          >
            <span className={`h-2 w-2 rounded-full ${i.dot}`} />
            <span>{i.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getDayDotClass(status: CalendarDayStatus) {
  switch (status) {
    case "available":
      return "bg-green-500";
    case "limited":
      return "bg-orange-500";
    case "full":
      return "bg-red-500";
    case "no_slots":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
}

function getDayBgClass(
  status: CalendarDayStatus,
  isSelected: boolean,
  isDisabled: boolean
) {
  if (isSelected) return "bg-blue-600 text-white border-blue-600";
  if (isDisabled) return "bg-gray-100 text-gray-400 border-gray-200";

  switch (status) {
    case "available":
      return "bg-white hover:bg-green-50 border-gray-200";
    case "limited":
      return "bg-white hover:bg-orange-50 border-gray-200";
    default:
      return "bg-white hover:bg-blue-50 border-gray-200";
  }
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

  const weekdayLabels = useMemo(
    () => [
      { full: "Sun", short: "S" },
      { full: "Mon", short: "M" },
      { full: "Tue", short: "T" },
      { full: "Wed", short: "W" },
      { full: "Thu", short: "T" },
      { full: "Fri", short: "F" },
      { full: "Sat", short: "S" },
    ],
    []
  );

  const toggleTooltip = (date: string) => {
    setActiveTooltipDate((prev) => (prev === date ? null : date));
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 flex items-center justify-center"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="text-base sm:text-lg font-semibold text-center flex-1">
          {currentMonthLabel}
        </h3>

        <button
          onClick={onNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 flex items-center justify-center"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-medium text-gray-500 mb-2">
        {weekdayLabels.map((d) => (
          <div key={d.full} className="flex items-center justify-center">
            <span className="hidden sm:inline">{d.full}</span>
            <span className="sm:hidden">{d.short}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />;

          const isSelected = selectedDate === day.date;
          const isTooltipActive = activeTooltipDate === day.date;

          const isDisabled =
            !day.isAvailable || day.status === "no_slots" || day.status === "full";

          const tooltipText =
            day.status === "no_slots"
              ? "No slots set"
              : day.status === "full"
              ? "Fully booked"
              : `${day.availableSlots} slot${day.availableSlots > 1 ? "s" : ""} available`;

          return (
            <div
              key={day.date}
              className="relative flex items-center justify-center"
              onMouseEnter={() => setActiveTooltipDate(day.date)}
              onMouseLeave={() => setActiveTooltipDate(null)}
            >
              <button
                disabled={isDisabled}
                onClick={() => {
                  toggleTooltip(day.date);
                  if (!isDisabled) onSelectDate(day.date);
                }}
                className={[
                  "relative w-full rounded-lg border transition flex items-center justify-center",
                  "h-11 sm:h-12",
                  "text-sm select-none",
                  getDayBgClass(day.status, isSelected, isDisabled),
                ].join(" ")}
                aria-label={`${day.date} — ${tooltipText}`}
              >
                {day.date.slice(8, 10)}
                <span
                  className={`absolute top-1 right-1 h-2 w-2 rounded-full ${getDayDotClass(
                    day.status
                  )}`}
                />
              </button>

              <div
                className={`absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-1 transition-opacity ${
                  isTooltipActive ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow whitespace-nowrap">
                  {tooltipText}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Legend />
    </div>
  );
}
