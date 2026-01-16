"use client";

import CalendarDayCell, { DayInfo } from "./CalendarDayCell";
import { generateCalendar } from "./calendarUtils";

interface Props {
  currentMonth: Date;
  data: Record<string, DayInfo>;
  onDayClick?: (dateKey: string) => void;
}

export default function CalendarGrid({ currentMonth, data, onDayClick }: Props) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = generateCalendar(year, month);

  return (
    <div>
      <div className="grid grid-cols-7 text-center font-semibold text-gray-600 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <CalendarDayCell key={index} date={day} data={data} onDayClick={onDayClick} />
        ))}
      </div>
    </div>
  );
}
