"use client";

import { useMemo, useState } from "react";

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

const STATUS_CONFIG: Record<
  CalendarDayStatus,
  { dot: string; selectedBg: string; hoverBg: string; textClass: string; borderClass: string }
> = {
  available: {
    dot: "bg-emerald-500",
    selectedBg: "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200",
    hoverBg: "hover:bg-emerald-50 hover:border-emerald-300",
    textClass: "text-gray-800",
    borderClass: "border-gray-200",
  },
  limited: {
    dot: "bg-amber-500",
    selectedBg: "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200",
    hoverBg: "hover:bg-amber-50 hover:border-amber-300",
    textClass: "text-gray-800",
    borderClass: "border-gray-200",
  },
  full: {
    dot: "bg-red-500",
    selectedBg: "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200",
    hoverBg: "",
    textClass: "text-gray-400",
    borderClass: "border-gray-100",
  },
  no_slots: {
    dot: "bg-gray-300",
    selectedBg: "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200",
    hoverBg: "",
    textClass: "text-gray-300",
    borderClass: "border-gray-100",
  },
};

const LEGEND = [
  { key: "available", label: "Available", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "limited",   label: "Limited",   dot: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "full",      label: "Full",      dot: "bg-red-500",     chip: "bg-red-50 text-red-700 border-red-200" },
  { key: "no_slots",  label: "No slots",  dot: "bg-gray-300",    chip: "bg-gray-50 text-gray-500 border-gray-200" },
] as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AppointmentCalendar({
  days,
  selectedDate,
  currentMonthLabel,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const [tooltipDate, setTooltipDate] = useState<string | null>(null);

  const weekdayLabels = useMemo(() => WEEKDAYS, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <i className="bi bi-calendar3 text-blue-600 text-sm"></i>
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide leading-none">Select Date</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Tap an available date to continue</p>
        </div>
      </div>

      <div className="p-4">
        {/* Month Navigator */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onPrevMonth}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 active:scale-95 flex items-center justify-center transition-all"
            aria-label="Previous month"
          >
            <i className="bi bi-chevron-left text-gray-600 text-sm"></i>
          </button>

          <h3 className="text-base font-black text-gray-900">{currentMonthLabel}</h3>

          <button
            onClick={onNextMonth}
            className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 active:scale-95 flex items-center justify-center transition-all"
            aria-label="Next month"
          >
            <i className="bi bi-chevron-right text-gray-600 text-sm"></i>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekdayLabels.map((d) => (
            <div
              key={d}
              className="flex items-center justify-center text-[11px] font-bold text-gray-400 uppercase tracking-wider py-1"
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d[0]}</span>
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} />;

            const cfg = STATUS_CONFIG[day.status];
            const isSelected = selectedDate === day.date;
            const isDisabled = day.status === "no_slots" || day.status === "full";
            const isTooltipVisible = tooltipDate === day.date;

            const tooltipText =
              day.status === "no_slots"
                ? "No slots"
                : day.status === "full"
                ? "Fully booked"
                : `${day.availableSlots} slot${day.availableSlots !== 1 ? "s" : ""} left`;

            return (
              <div
                key={day.date}
                className="relative flex items-center justify-center"
                onMouseEnter={() => setTooltipDate(day.date)}
                onMouseLeave={() => setTooltipDate(null)}
              >
                <button
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) onSelectDate(day.date);
                  }}
                  aria-label={`${day.date} — ${tooltipText}`}
                  className={[
                    "relative w-full h-10 sm:h-11 rounded-xl border text-sm font-semibold transition-all select-none",
                    isSelected
                      ? cfg.selectedBg
                      : isDisabled
                      ? `bg-gray-50 ${cfg.textClass} ${cfg.borderClass} cursor-not-allowed`
                      : `bg-white ${cfg.textClass} ${cfg.borderClass} ${cfg.hoverBg} active:scale-95`,
                  ].join(" ")}
                >
                  {day.date.slice(8, 10)}

                  {/* Status dot */}
                  {!isSelected && (
                    <span
                      className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                    />
                  )}

                  {/* Selected checkmark */}
                  {isSelected && (
                    <span className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full bg-white/30 flex items-center justify-center">
                      <i className="bi bi-check text-white text-[8px] font-black leading-none"></i>
                    </span>
                  )}
                </button>

                {/* Tooltip */}
                {isTooltipVisible && (
                  <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1.5 pointer-events-none">
                    <div className="bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                      {tooltipText}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
          {LEGEND.map((l) => (
            <div
              key={l.key}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${l.chip}`}
            >
              <span className={`h-2 w-2 rounded-full flex-shrink-0 ${l.dot}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
