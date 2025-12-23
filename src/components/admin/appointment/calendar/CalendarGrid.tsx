"use client";

import CalendarDayCell from "./CalendarDayCell";
import { generateCalendar } from "./calendarUtils";

interface DayInfo {
  totalSlots: number;
  bookedSlots: number;
}

interface Props {
  currentMonth: Date;
  data: Record<string, DayInfo>;
}

export default function CalendarGrid({ currentMonth, data }: Props) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = generateCalendar(year, month);

  return (
    <div>
      <div className="grid grid-cols-7 text-center font-semibold text-gray-600 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => (
          <CalendarDayCell key={i} date={day} data={data} />
        ))}
      </div>
    </div>
  );
}
