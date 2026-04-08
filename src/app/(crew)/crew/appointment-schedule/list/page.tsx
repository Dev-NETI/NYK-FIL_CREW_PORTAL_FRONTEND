"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CrewAppointmentList from "@/components/crew/appointment/CrewAppointmentList";

export default function CrewAppointmentsListPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 pt-[20px] sm:pt-16 pb-28 md:pb-8">
      {/* Hero Banner */}
      <div className="bg-[#0a1628] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-emerald-500/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-blue-400/10 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <i className="bi bi-arrow-left text-white text-base"></i>
          </button>

          <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <i className="bi bi-calendar2-week-fill text-emerald-400 text-xl"></i>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              My Appointments
            </h1>
            <p className="text-emerald-300/80 text-xs mt-0.5">
              View and manage your booked appointments
            </p>
          </div>

          <Link
            href="/crew/appointment-schedule/book"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold transition-all flex-shrink-0 shadow-md shadow-blue-900/40"
          >
            <i className="bi bi-plus-lg text-base"></i>
            <span className="hidden sm:inline">Book</span>
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="max-w-4xl mx-auto px-4 py-5">
        <CrewAppointmentList />
      </div>
    </div>
  );
}
