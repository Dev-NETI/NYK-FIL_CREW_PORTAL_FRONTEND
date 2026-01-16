"use client";

import { useEffect, useMemo, useState } from "react";
import AppointmentList from "@/components/admin/appointment/AppointmentList";
import AppointmentTypes from "@/components/admin/appointment/AppointmentTypes";
import DepartmentSettings from "@/components/admin/appointment/DepartmentSettings";
import AppointmentCalendar from "@/components/admin/appointment/AppointmentCalendar";
import { Filters } from "@/components/admin/appointment/filters/AppointmentListFilter";

export default function AppointmentModule() {
  const [activeTab, setActiveTab] = useState("appointments");

  const [filters, setFilters] = useState<Filters>({
    status: "all",
    name: "",
    typeId: "all",
    date: "",
  });

  const tabs = useMemo(
    () => [
      { key: "appointments", label: "Appointments" },
      { key: "types", label: "Appointment Types" },
      { key: "settings", label: "Department Settings" },
      { key: "calendar", label: "Calendar" },
    ],
    []
  );

  useEffect(() => {
    if (activeTab !== "appointments") return;

    const el = document.getElementById("appointment-list");
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeTab]);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
        Appointment Management
      </h1>

      <div className="hidden md:flex space-x-4 border-b mb-6">
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
      <div className="md:hidden mb-6">
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Select tab
        </label>
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
        >
          {tabs.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {activeTab === "appointments" && (
        <div id="appointment-list">
          <AppointmentList filters={filters} onChangeFilters={setFilters} />
        </div>
      )}

      {activeTab === "types" && <AppointmentTypes />}

      {activeTab === "settings" && <DepartmentSettings />}

      {activeTab === "calendar" && (
        <AppointmentCalendar
          onSelectDate={(dateKey) => {
            setFilters((prev) => ({ ...prev, date: dateKey }));
            setActiveTab("appointments");
          }}
        />
      )}
    </div>
  );
}
