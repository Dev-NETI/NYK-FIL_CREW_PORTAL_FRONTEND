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
import AppointmentCalendar from "@/components/crew/appointment/AppointmentCalendar";
import TimeSlotList from "@/components/crew/appointment/TimeSlotList";
import BookingForm from "@/components/crew/appointment/BookingForm";
import { formatTime } from "@/lib/utils";

import {
  CrewAppointmentService,
  TimeSlotApi,
  CrewAppointmentType,
} from "@/services/crew-appointments";
import { DepartmentService } from "@/services/department";

interface CalendarDay {
  date: string;
  isAvailable: boolean;
  availableSlots: number;
}

export type CalendarDayCell = CalendarDay | null;

interface Department {
  id: number;
  name: string;
}

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
      .then((res) => {
        const apiDays = Array.isArray(res) ? res : [];
        const availabilityMap = new Map<string, number>();

        apiDays.forEach((d) => {
          const dateKey = String(d.date).split("T")[0].split(" ")[0];
          const available = d.available_slots ?? d.available_slots ?? 0;
          availabilityMap.set(dateKey, Number(available));
        });

        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startWeekday = monthStart.getDay();

        const leadingEmptyDays = Array.from({ length: startWeekday }).map(() => null);

        const daysInMonth = eachDayOfInterval({
          start: monthStart,
          end: monthEnd,
        }).map((date) => {
          const key = format(date, "yyyy-MM-dd");
          const slots = availabilityMap.get(key) ?? 0;

          return {
            date: key,
            isAvailable: slots > 0,
            availableSlots: slots,
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

    CrewAppointmentService.getTimeSlots(
      selectedDepartmentId,
      selectedDate
    )
      .then(setTimeSlots)
      .finally(() => setLoading(false));
  }, [selectedDepartmentId, selectedDate]);

  const handleSubmit = async () => {
    if (
      !selectedDepartmentId ||
      !selectedAppointmentTypeId ||
      !selectedDate ||
      !selectedSlot ||
      !purpose.trim()
    ) {
      return;
    }

    try {
      await CrewAppointmentService.create({
        department_id: selectedDepartmentId,
        appointment_type_id: selectedAppointmentTypeId,
        appointment_date: selectedDate,
        time: selectedSlot.time,
        purpose,
      });

      toast.success("Appointment booked");
      setSelectedDate(null);
      setSelectedSlot(null);
      setPurpose("");
      router.push("/crew/appointment-schedule/list");
    } catch {
      toast.error("Failed to book appointment");
    }
  };

  const isDisabled =
    loading ||
    !selectedDepartmentId ||
    !selectedAppointmentTypeId ||
    !selectedDate ||
    !selectedSlot ||
    !purpose.trim();

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
              <strong>Date:</strong> {selectedDate}
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
              className={`w-full py-2 rounded-lg font-medium ${isDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
              Confirm Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
