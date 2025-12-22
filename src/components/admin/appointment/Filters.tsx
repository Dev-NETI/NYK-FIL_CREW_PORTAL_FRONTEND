"use client";

import { useState } from "react";

interface Props {
  onFilterChange: (filters: any) => void;
}

export default function AppointmentFilters({ onFilterChange }: Props) {
  const [status, setStatus] = useState("all")
  const [department, setDepartment] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const applyFilters = () => {
    onFilterChange({
      status,
      department,
      dateFrom,
      dateTo,
    })
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="border rounded-lg p-2 w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select
            className="border rounded-lg p-2 w-full"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="all">All</option>
            <option value="medical">Medical</option>
            <option value="training">Training</option>
            <option value="documents">Document Processing</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">From</label>
          <input
            type="date"
            className="border rounded-lg p-2 w-full"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To</label>
          <input
            type="date"
            className="border rounded-lg p-2 w-full"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={applyFilters}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
