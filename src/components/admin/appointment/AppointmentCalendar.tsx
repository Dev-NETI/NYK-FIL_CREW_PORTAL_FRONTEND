"use client";

import { useEffect, useState } from "react";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarGrid from "./calendar/CalendarGrid";
import { DepartmentScheduleService } from "@/services/department-schedule";

interface DayInfo {
  totalSlots: number;
  bookedSlots: number;
}

export default function AppointmentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [data, setData] = useState<Record<string, DayInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);

      const res = await DepartmentScheduleService.getAll();

      const formatted: Record<string, DayInfo> = {};

      res.data.forEach((item: any) => {
        const key = item.date.split("T")[0];

        formatted[key] = {
          totalSlots: item.total_slots,
          bookedSlots: item.booked_slots ?? 0,
        };
      });

      setData(formatted);
    } catch (e) {
      console.error("Failed to load calendar data", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <CalendarHeader
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />

      {loading ? (
        <div className="text-center text-gray-500 py-10">
          Loading calendar...
        </div>
      ) : (
        <CalendarGrid currentMonth={currentMonth} data={data} />
      )}
    </div>
  );
}
