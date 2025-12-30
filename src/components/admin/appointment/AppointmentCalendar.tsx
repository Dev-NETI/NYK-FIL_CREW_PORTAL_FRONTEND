"use client";

import { useEffect, useMemo, useState } from "react";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarGrid from "./calendar/CalendarGrid";
import api from "@/lib/axios";
import CalendarSkeleton from "@/components/CalendarSkeleton";

interface DayInfo {
  totalSlots: number;
  bookedSlots: number;
  cancelledSlots: number;
  availableSlots: number;
}

export default function AppointmentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [data, setData] = useState<Record<string, DayInfo>>({});
  const [loading, setLoading] = useState(true);

  const monthKey = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, [currentMonth]);

  useEffect(() => {
    fetchCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/appointments/calendar", {
        params: { month: monthKey },
      });

      const formatted: Record<string, DayInfo> = {};
      (res.data.data || []).forEach((item: any) => {
        formatted[item.date] = {
          totalSlots: item.total_slots ?? 0,
          bookedSlots: item.booked_slots ?? 0,
          cancelledSlots: item.cancelled_slots ?? 0,
          availableSlots: item.available_slots ?? 0,
        };
      });

      setData(formatted);
    } catch (e) {
      console.error("Calendar fetch failed:", e);
      setData({});
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
        <CalendarSkeleton showHeader={false} className="mt-6" />
      ) : (
        <CalendarGrid currentMonth={currentMonth} data={data} />
      )}
    </div>
  );
}
