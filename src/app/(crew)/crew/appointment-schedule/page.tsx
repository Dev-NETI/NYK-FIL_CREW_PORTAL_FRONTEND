"use client";

import { useRouter } from "next/navigation";

export default function CrewAppointmentsLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 pt-[20px] sm:pt-16 pb-28 md:pb-8">
      {/* ── Hero Banner ── */}
      <div className="bg-[#0a1628] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-500/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-blue-400/10 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <i className="bi bi-calendar2-check-fill text-blue-400 text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Appointments
            </h1>
            <p className="text-blue-300/80 text-sm mt-0.5">
              Book and manage your department appointments
            </p>
          </div>
        </div>
      </div>

      {/* ── Action Cards ── */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Book an Appointment */}
        <button
          onClick={() => router.push("/crew/appointment-schedule/book")}
          className="w-full group text-left"
        >
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-200">
            {/* Top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-700" />

            <div className="p-5 flex items-center gap-4">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <i className="bi bi-calendar-plus-fill text-blue-600 text-2xl"></i>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-0.5">
                  Schedule
                </p>
                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  Book an Appointment
                </h2>
                <p className="text-sm text-gray-500 mt-1 leading-snug">
                  Schedule a new appointment with your selected department
                </p>
              </div>

              {/* Arrow */}
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700 transition-colors shadow-sm">
                <i className="bi bi-arrow-right text-white text-base"></i>
              </div>
            </div>

            {/* Info strip */}
            <div className="px-5 pb-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <i className="bi bi-clock text-gray-400"></i>
                <span>Pick date &amp; time</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <i className="bi bi-building text-gray-400"></i>
                <span>Select department</span>
              </div>
            </div>
          </div>
        </button>

        {/* View Appointments */}
        <button
          onClick={() => router.push("/crew/appointment-schedule/list")}
          className="w-full group text-left"
        >
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-200">
            {/* Top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-700" />

            <div className="p-5 flex items-center gap-4">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                <i className="bi bi-calendar2-week-fill text-emerald-600 text-2xl"></i>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-0.5">
                  History
                </p>
                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  View Appointments
                </h2>
                <p className="text-sm text-gray-500 mt-1 leading-snug">
                  Track your upcoming and past appointment records
                </p>
              </div>

              {/* Arrow */}
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-700 transition-colors shadow-sm">
                <i className="bi bi-arrow-right text-white text-base"></i>
              </div>
            </div>

            {/* Info strip */}
            <div className="px-5 pb-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <i className="bi bi-hourglass-split text-gray-400"></i>
                <span>Upcoming &amp; pending</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <i className="bi bi-check2-circle text-gray-400"></i>
                <span>Completed records</span>
              </div>
            </div>
          </div>
        </button>

        {/* Quick tips card */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="bi bi-lightbulb-fill text-amber-500 text-sm"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">
              Quick Tip
            </p>
            <p className="text-sm text-amber-700 leading-snug">
              Book your appointment at least 2 days in advance to ensure
              availability. Bring your valid ID on the day of your appointment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
