"use client";

import Link from "next/link";
import Navigation from "@/components/Navigation";
import CrewAppointmentList from "@/components/crew/appointment/CrewAppointmentList";

export default function CrewAppointmentsListPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation currentPath="/crew/appointments" />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">View and manage your booked appointments</p>

          <div className="mt-4 flex justify-center">
            <Link
              href="/crew/appointment-schedule/book"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              + Book Appointment
            </Link>
          </div>
        </div>

        <CrewAppointmentList />
      </div>
    </div>
  );
}
