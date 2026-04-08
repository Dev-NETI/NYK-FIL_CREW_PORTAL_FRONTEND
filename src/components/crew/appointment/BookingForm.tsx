"use client";

import ValidationError from "@/components/ui/ValidationError";
import { CrewAppointmentType, AppointmentSession } from "@/services/crew-appointments";
import { Department } from "@/services/department";

interface Props {
  departments: Department[];
  appointmentTypes: CrewAppointmentType[];
  selectedDepartmentId: number | null;
  selectedAppointmentTypeId: number | null;
  selectedDate: string | null;
  selectedSession: AppointmentSession | null;
  purpose: string;
  loading?: boolean;

  onChangeDepartment: (id: number) => void;
  onChangeAppointmentType: (id: number) => void;
  onChangePurpose: (value: string) => void;
  onSubmit: () => void;
}

export default function BookingForm({
  departments,
  appointmentTypes,
  selectedDepartmentId,
  selectedAppointmentTypeId,
  selectedSession,
  purpose,
  loading = false,
  onChangeDepartment,
  onChangeAppointmentType,
  onChangePurpose,
}: Props) {
  const purposeError =
    selectedSession && !purpose.trim() ? "Purpose is required." : "";

  return (
    <div className="space-y-4">
      {/* Department */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <i className="bi bi-building text-blue-600 text-sm"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide leading-none">Department</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Select the department you wish to visit</p>
          </div>
        </div>
        <div className="p-4">
          <div className="relative">
            <select
              value={selectedDepartmentId ?? ""}
              onChange={(e) => onChangeDepartment(Number(e.target.value))}
              disabled={loading}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <option value="">— Choose a department —</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <i className="bi bi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
          </div>
        </div>
      </div>

      {/* Appointment Type */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedDepartmentId ? "bg-violet-100" : "bg-gray-100"}`}>
            <i className={`bi bi-tag text-sm ${selectedDepartmentId ? "text-violet-600" : "text-gray-400"}`}></i>
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wide leading-none ${selectedDepartmentId ? "text-gray-700" : "text-gray-400"}`}>Appointment Type</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {selectedDepartmentId ? "Select the type of appointment" : "Select a department first"}
            </p>
          </div>
        </div>
        <div className="p-4">
          <div className="relative">
            <select
              value={selectedAppointmentTypeId ?? ""}
              onChange={(e) => onChangeAppointmentType(Number(e.target.value))}
              disabled={!selectedDepartmentId || loading}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <option value="">— Choose appointment type —</option>
              {appointmentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <i className="bi bi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
          </div>

          {selectedDepartmentId && appointmentTypes.length === 0 && !loading && (
            <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <i className="bi bi-exclamation-circle text-sm flex-shrink-0"></i>
              <p className="text-xs font-medium">No appointment types available for this department.</p>
            </div>
          )}
        </div>
      </div>

      {/* Purpose */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <i className="bi bi-chat-left-text text-emerald-600 text-sm"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide leading-none">Purpose</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Briefly describe your reason for the appointment</p>
          </div>
        </div>
        <div className="p-4">
          <textarea
            rows={4}
            value={purpose}
            onChange={(e) => onChangePurpose(e.target.value)}
            placeholder="e.g. Document renewal, medical clearance, contract signing..."
            disabled={loading}
            className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
              purposeError ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-gray-200"
            }`}
          />
          <ValidationError errors={purposeError} className="text-xs mt-1" />
          <p className="text-[11px] text-gray-400 mt-1.5 text-right">{purpose.length} characters</p>
        </div>
      </div>
    </div>
  );
}
