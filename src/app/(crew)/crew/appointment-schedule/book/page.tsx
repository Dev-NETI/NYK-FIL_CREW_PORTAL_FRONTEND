"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

import Navigation from "@/components/Navigation";
import AppointmentCalendar, {
  CalendarDayCell,
  CalendarDayStatus,
} from "@/components/crew/appointment/AppointmentCalendar";
import TimeSlotList from "@/components/crew/appointment/TimeSlotList";
import BookingForm from "@/components/crew/appointment/BookingForm";
import { formatDate, formatTime } from "@/lib/utils";

import {
  CrewAppointmentService,
  TimeSlotApi,
  CrewAppointmentType,
} from "@/services/crew-appointments";
import { DepartmentService, Department } from "@/services/department";
import { CalendarDayApi } from "@/types/api";

export default function CrewAppointmentsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDayCell[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotApi[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<CrewAppointmentType[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotApi | null>(null);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const currentMonthLabel = useMemo(
    () => format(currentMonth, "MMMM yyyy"),
    [currentMonth]
  );

  const monthParam = useMemo(
    () => format(currentMonth, "yyyy-MM"),
    [currentMonth]
  );

  useEffect(() => {
    DepartmentService.getAllDepartments().then(setDepartments);
  }, []);

  useEffect(() => {
    if (!selectedDepartmentId) {
      setAppointmentTypes([]);
      return;
    }

    CrewAppointmentService.getAppointmentTypesByDepartment(
      selectedDepartmentId
    ).then((types) => {
      setAppointmentTypes(types.filter((t) => t.is_active));
    });
  }, [selectedDepartmentId]);

  useEffect(() => {
    if (!selectedDepartmentId) {
      setCalendarDays([]);
      return;
    }

    setLoading(true);

    CrewAppointmentService.getCalendar(selectedDepartmentId, monthParam)
      .then((apiDays: CalendarDayApi[]) => {
        const safeDays = Array.isArray(apiDays) ? apiDays : [];

        const scheduleMap = new Map<
          string,
          { totalSlots: number; availableSlots: number }
        >();

        safeDays.forEach((d) => {
          const dateKey = String(d.date).split("T")[0].split(" ")[0];
          scheduleMap.set(dateKey, {
            totalSlots: Number(d.total_slots ?? 0),
            availableSlots: Number(d.available_slots ?? 0),
          });
        });

        const getStatus = (
          hasSchedule: boolean,
          totalSlots: number,
          availableSlots: number
        ): CalendarDayStatus => {
          if (!hasSchedule) return "no_slots";
          if (totalSlots > 0 && availableSlots === 0) return "full";
          if (availableSlots > 0 && availableSlots <= 2) return "limited";
          return "available";
        };

        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startWeekday = monthStart.getDay();

        const leadingEmptyDays: CalendarDayCell[] = Array.from({
          length: startWeekday,
        }).map(() => null);

        const daysInMonth: CalendarDayCell[] = eachDayOfInterval({
          start: monthStart,
          end: monthEnd,
        }).map((date) => {
          const key = format(date, "yyyy-MM-dd");

          const sched = scheduleMap.get(key);
          const hasSchedule = Boolean(sched);
          const totalSlots = sched?.totalSlots ?? 0;
          const availableSlots = sched?.availableSlots ?? 0;

          const status = getStatus(hasSchedule, totalSlots, availableSlots);

          return {
            date: key,
            status,
            isAvailable: status === "available" || status === "limited",
            availableSlots,
          };
        });

        setCalendarDays([...leadingEmptyDays, ...daysInMonth]);
      })
      .catch(() => setCalendarDays([]))
      .finally(() => setLoading(false));
  }, [selectedDepartmentId, monthParam, currentMonth]);

  useEffect(() => {
    if (!selectedDepartmentId || !selectedDate) {
      setTimeSlots([]);
      return;
    }

    setLoading(true);

    CrewAppointmentService.getTimeSlots(selectedDepartmentId, selectedDate)
      .then(setTimeSlots)
      .finally(() => setLoading(false));
  }, [selectedDepartmentId, selectedDate]);

  const handleSubmit = async () => {
    if (
      submitting ||
      !selectedDepartmentId ||
      !selectedAppointmentTypeId ||
      !selectedDate ||
      !selectedSlot ||
      !purpose.trim()
    ) {
      return;
    }

    try {
      setSubmitting(true);

      await CrewAppointmentService.create({
        department_id: selectedDepartmentId,
        appointment_type_id: selectedAppointmentTypeId,
        appointment_date: selectedDate,
        time: selectedSlot.time,
        purpose,
      });

      toast.success("Appointment submitted. Status: Pending (awaiting confirmation).");
      setSelectedDate(null);
      setSelectedSlot(null);
      setPurpose("");
      router.push("/crew/appointment-schedule/list");
    } catch (err: any) {
      const message =
        err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat()?.[0]
          : err?.response?.data?.message;

      toast.error(message || "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled =
    loading ||
    submitting ||
    !selectedDepartmentId ||
    !selectedAppointmentTypeId ||
    !selectedDate ||
    !selectedSlot ||
    !purpose.trim();

  const Spinner = () => (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation currentPath="/crew/documents" />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Book an Appointment</h1>
          <p className="text-gray-600">
            Schedule an appointment with your selected department
          </p>
        </div>

        <BookingForm
          departments={departments}
          appointmentTypes={appointmentTypes}
          selectedDepartmentId={selectedDepartmentId}
          selectedAppointmentTypeId={selectedAppointmentTypeId}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          purpose={purpose}
          loading={loading}
          onChangeDepartment={(id) => {
            setSelectedDepartmentId(id);
            setSelectedAppointmentTypeId(null);
            setSelectedDate(null);
            setSelectedSlot(null);
          }}
          onChangeAppointmentType={setSelectedAppointmentTypeId}
          onChangePurpose={setPurpose}
          onSubmit={handleSubmit}
        />

        {selectedDepartmentId && selectedAppointmentTypeId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AppointmentCalendar
                days={calendarDays}
                selectedDate={selectedDate}
                currentMonthLabel={currentMonthLabel}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
                onPrevMonth={() =>
                  setCurrentMonth((prev) => subMonths(prev, 1))
                }
                onNextMonth={() =>
                  setCurrentMonth((prev) => addMonths(prev, 1))
                }
              />
            </div>

            <TimeSlotList
              slots={timeSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          </div>
        )}

        {selectedDate && selectedSlot && (
          <div className="bg-white rounded-xl p-6 shadow space-y-2">
            <p>
              <strong>Date:</strong> {formatDate(selectedDate)}
            </p>
            <p>
              <strong>Time:</strong> {formatTime(selectedSlot.time)}
            </p>
            <p>
              <strong>Purpose:</strong> {purpose}
            </p>

            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className={`w-full py-2 rounded-lg font-medium inline-flex items-center justify-center gap-2 ${
                isDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {submitting && <Spinner />}
              {submitting ? "Submitting..." : "Confirm Appointment"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
