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

import AppointmentCalendar, {
  CalendarDayCell,
  CalendarDayStatus,
} from "@/components/crew/appointment/AppointmentCalendar";
import SessionSlotList, {
  SessionSlot,
} from "@/components/crew/appointment/SessionSlotList";
import BookingForm from "@/components/crew/appointment/BookingForm";
import { formatDate } from "@/lib/utils";

import {
  CrewAppointmentService,
  CrewAppointmentType,
} from "@/services/crew-appointments";
import { DepartmentService, Department } from "@/services/department";
import { CalendarDayApi } from "@/types/api";

// ── Step indicator ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Details", icon: "bi-building" },
  { id: 2, label: "Date", icon: "bi-calendar3" },
  { id: 3, label: "Session", icon: "bi-clock" },
  { id: 4, label: "Confirm", icon: "bi-check-circle" },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, idx) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div
            key={step.id}
            className="flex items-center flex-1 last:flex-none"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-300"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {done ? (
                  <i className="bi bi-check-lg text-sm"></i>
                ) : (
                  <i className={`bi ${step.icon} text-xs`}></i>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold hidden sm:block ${
                  active
                    ? "text-blue-600"
                    : done
                      ? "text-emerald-600"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${
                  done ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Spinner ─────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function CrewAppointmentsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDayCell[]>([]);
  const [sessions, setSessions] = useState<SessionSlot[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<
    CrewAppointmentType[]
  >([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = useState<
    number | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionSlot | null>(
    null,
  );
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const currentMonthLabel = useMemo(
    () => format(currentMonth, "MMMM yyyy"),
    [currentMonth],
  );

  const monthParam = useMemo(
    () => format(currentMonth, "yyyy-MM"),
    [currentMonth],
  );

  // Derive current step for the step bar
  const currentStep = useMemo(() => {
    if (!selectedDepartmentId || !selectedAppointmentTypeId) return 1;
    if (!selectedDate) return 2;
    if (!selectedSession) return 3;
    return 4;
  }, [
    selectedDepartmentId,
    selectedAppointmentTypeId,
    selectedDate,
    selectedSession,
  ]);

  // Lookup labels for confirmation card
  const selectedDepartment = departments.find(
    (d) => d.id === selectedDepartmentId,
  );
  const selectedType = appointmentTypes.find(
    (t) => t.id === selectedAppointmentTypeId,
  );

  const isSubmitDisabled =
    loading ||
    submitting ||
    !selectedDepartmentId ||
    !selectedAppointmentTypeId ||
    !selectedDate ||
    !selectedSession ||
    !purpose.trim();

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    DepartmentService.getAllDepartments().then(setDepartments);
  }, []);

  useEffect(() => {
    if (!selectedDepartmentId) {
      setAppointmentTypes([]);
      return;
    }
    CrewAppointmentService.getAppointmentTypesByDepartment(
      selectedDepartmentId,
    ).then((types) => setAppointmentTypes(types.filter((t) => t.is_active)));
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
          const key = String(d.date).split("T")[0].split(" ")[0];
          scheduleMap.set(key, {
            totalSlots: Number(d.total_slots ?? 0),
            availableSlots: Number(d.available_slots ?? 0),
          });
        });

        const getStatus = (
          hasSchedule: boolean,
          totalSlots: number,
          availableSlots: number,
        ): CalendarDayStatus => {
          if (!hasSchedule) return "no_slots";
          if (totalSlots > 0 && availableSlots === 0) return "full";
          if (availableSlots > 0 && availableSlots <= 2) return "limited";
          return "available";
        };

        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startWeekday = monthStart.getDay();

        const leadingEmpty: CalendarDayCell[] = Array.from({
          length: startWeekday,
        }).map(() => null);

        const daysInMonth: CalendarDayCell[] = eachDayOfInterval({
          start: monthStart,
          end: monthEnd,
        }).map((date) => {
          const key = format(date, "yyyy-MM-dd");
          const sched = scheduleMap.get(key);
          const totalSlots = sched?.totalSlots ?? 0;
          const availableSlots = sched?.availableSlots ?? 0;
          const status = getStatus(Boolean(sched), totalSlots, availableSlots);
          return {
            date: key,
            status,
            isAvailable: status === "available" || status === "limited",
            availableSlots,
          };
        });

        setCalendarDays([...leadingEmpty, ...daysInMonth]);
      })
      .catch(() => setCalendarDays([]))
      .finally(() => setLoading(false));
  }, [selectedDepartmentId, monthParam, currentMonth]);

  useEffect(() => {
    if (!selectedDate) {
      setSessions([]);
      return;
    }
    setSessions([
      { value: "AM", isAvailable: true },
      { value: "PM", isAvailable: true },
    ]);
  }, [selectedDate]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isSubmitDisabled) return;
    try {
      setSubmitting(true);
      await CrewAppointmentService.create({
        department_id: selectedDepartmentId!,
        appointment_type_id: selectedAppointmentTypeId!,
        appointment_date: selectedDate!,
        session: selectedSession!.value,
        purpose,
      });
      toast.success("Appointment submitted — awaiting confirmation.");
      router.push("/crew/appointment-schedule/list");
    } catch (err: any) {
      const message = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()?.[0]
        : err?.response?.data?.message;
      toast.error(
        typeof message === "string" ? message : "Failed to book appointment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 pt-[20px] sm:pt-16 pb-28 md:pb-8">
      {/* Hero Banner */}
      <div className="bg-[#0a1628] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-500/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-blue-400/10 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <i className="bi bi-arrow-left text-white text-base"></i>
          </button>
          <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <i className="bi bi-calendar-plus-fill text-blue-400 text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Book Appointment
            </h1>
            <p className="text-blue-300/80 text-xs mt-0.5">
              Fill in the details below to schedule your visit
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Step bar */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 shadow-sm">
          <StepBar current={currentStep} />
        </div>

        {/* Step 1 — Details (always visible) */}
        <BookingForm
          departments={departments}
          appointmentTypes={appointmentTypes}
          selectedDepartmentId={selectedDepartmentId}
          selectedAppointmentTypeId={selectedAppointmentTypeId}
          selectedDate={selectedDate}
          selectedSession={selectedSession ? selectedSession.value : null}
          purpose={purpose}
          loading={loading}
          onChangeDepartment={(id) => {
            setSelectedDepartmentId(id);
            setSelectedAppointmentTypeId(null);
            setSelectedDate(null);
            setSelectedSession(null);
          }}
          onChangeAppointmentType={setSelectedAppointmentTypeId}
          onChangePurpose={setPurpose}
          onSubmit={handleSubmit}
        />

        {/* Steps 2 + 3 — Calendar & Session (shown after dept + type selected) */}
        {selectedDepartmentId && selectedAppointmentTypeId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <AppointmentCalendar
                days={calendarDays}
                selectedDate={selectedDate}
                currentMonthLabel={currentMonthLabel}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedSession(null);
                }}
                onPrevMonth={() => setCurrentMonth((p) => subMonths(p, 1))}
                onNextMonth={() => setCurrentMonth((p) => addMonths(p, 1))}
              />
            </div>

            <SessionSlotList
              sessions={sessions}
              selectedSession={selectedSession}
              onSelectSession={setSelectedSession}
              loading={loading}
            />
          </div>
        )}

        {/* Step 4 — Confirmation summary */}
        {selectedDate && selectedSession && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <i className="bi bi-check2-all text-emerald-600 text-sm"></i>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide leading-none">
                  Review &amp; Confirm
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Double-check your appointment details
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Summary rows */}
              {[
                {
                  icon: "bi-building",
                  label: "Department",
                  value: selectedDepartment?.name,
                },
                { icon: "bi-tag", label: "Type", value: selectedType?.name },
                {
                  icon: "bi-calendar3",
                  label: "Date",
                  value: formatDate(selectedDate),
                },
                {
                  icon:
                    selectedSession.value === "AM"
                      ? "bi-sunrise-fill"
                      : "bi-sunset-fill",
                  label: "Session",
                  value:
                    selectedSession.value === "AM"
                      ? "AM — Morning (8:00 AM – 12:00 PM)"
                      : "PM — Afternoon (1:00 PM – 5:00 PM)",
                },
                {
                  icon: "bi-chat-left-text",
                  label: "Purpose",
                  value: purpose || "—",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className={`bi ${row.icon} text-gray-500 text-xs`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold leading-none mb-0.5">
                      {row.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 leading-snug break-words">
                      {row.value || "—"}
                    </p>
                  </div>
                </div>
              ))}

              {/* Notice */}
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 mt-1">
                <i className="bi bi-info-circle-fill text-blue-500 text-sm flex-shrink-0 mt-0.5"></i>
                <p className="text-xs text-blue-700 leading-snug">
                  Your appointment will be <strong>pending</strong> until
                  confirmed by the department. Bring a valid ID on your
                  appointment day.
                </p>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold transition-all ${
                  isSubmitDisabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-md shadow-blue-200"
                }`}
              >
                {submitting ? (
                  <>
                    <Spinner />
                    Submitting…
                  </>
                ) : (
                  <>
                    <i className="bi bi-calendar-check-fill text-base"></i>
                    Confirm Appointment
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
