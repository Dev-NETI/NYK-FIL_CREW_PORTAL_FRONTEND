"use client";

import CalendarDayCell from "./CalendarDayCell";
import { generateCalendar } from "./calendarUtils";

interface DayInfo {
  totalSlots: number;
  bookedSlots: number;
  cancelledSlots: number;
  availableSlots: number;
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
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <CalendarDayCell
            key={index}
            date={day}
            data={data}
          />
        ))}
      </div>
    </div>
  );
}
