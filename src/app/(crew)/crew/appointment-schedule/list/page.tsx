"use client";

import Navigation from "@/components/Navigation";
import CrewAppointmentList from "@/components/crew/appointment/CrewAppointmentList";

export default function CrewAppointmentsListPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation currentPath="/crew/appointments" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">
            View and manage your booked appointments
          </p>
        </div>

        <CrewAppointmentList />
      </div>
    </div>
  );
}
