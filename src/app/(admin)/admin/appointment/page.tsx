"use client";

import { useState } from "react";
import AppointmentList from "@/components/admin/appointment/AppointmentList";
import AppointmentTypes from "@/components/admin/appointment/AppointmentTypes";
import DepartmentSettings from "@/components/admin/appointment/DepartmentSettings";
import AppointmentCalendar from "@/components/admin/appointment/AppointmentCalendar";

export default function AppointmentModule() {
  const [activeTab, setActiveTab] = useState("appointments");

  const tabs = [
    { key: "appointments", label: "Appointments" },
    { key: "types", label: "Appointment Types" },
    { key: "settings", label: "Department Settings" },
    { key: "calendar", label: "Calendar" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Appointment Management</h1>

      <div className="flex space-x-4 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-2 font-medium transition-all ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "appointments" && <AppointmentList />}
      {activeTab === "types" && <AppointmentTypes />}
      {activeTab === "settings" && <DepartmentSettings />}
      {activeTab === "calendar" && <AppointmentCalendar />}
    </div>
  );
}
