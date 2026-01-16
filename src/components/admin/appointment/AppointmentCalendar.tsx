"use client";

import { useEffect, useMemo, useState } from "react";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarGrid from "./calendar/CalendarGrid";
import CalendarSkeleton from "@/components/CalendarSkeleton";
import { DayInfo } from "./calendar/CalendarDayCell";
import { AdminAppointmentService } from "@/services/admin-appointment";
import { CalendarDayApi } from "@/types/api";

export default function AppointmentCalendar({
  onSelectDate,
}: {
  onSelectDate?: (dateKey: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [data, setData] = useState<Record<string, DayInfo>>({});
  const [loading, setLoading] = useState(true);

  const monthKey = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, [currentMonth]);

  useEffect(() => {
    let isMounted = true;

    const fetchCalendarData = async () => {
      setLoading(true);

      try {
        const items = await AdminAppointmentService.getCalendar(monthKey);

        const formatted: Record<string, DayInfo> = {};

        (items || []).forEach((item: CalendarDayApi) => {
          formatted[item.date] = {
            totalSlots: item.total_slots ?? 0,
            bookedSlots: item.booked_slots ?? 0,
            cancelledSlots: item.cancelled_slots ?? 0,
            availableSlots: item.available_slots ?? 0,
          };
        });

        if (!isMounted) return;
        setData(formatted);
      } catch (e) {
        console.error("Calendar fetch failed:", e);

        if (!isMounted) return;
        setData({});
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchCalendarData();

    return () => {
      isMounted = false;
    };
  }, [monthKey]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <CalendarHeader currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />

      {loading ? (
        <CalendarSkeleton showHeader={false} className="mt-6" />
      ) : (
        <CalendarGrid currentMonth={currentMonth} data={data} onDayClick={(dateKey) => onSelectDate?.(dateKey)}/>
      )}
    </div>
  );
}
