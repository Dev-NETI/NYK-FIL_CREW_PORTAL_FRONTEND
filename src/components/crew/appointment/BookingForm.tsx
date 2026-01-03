"use client";

import ValidationError from "@/components/ui/ValidationError";
import { CrewAppointmentType, TimeSlotApi } from "@/services/crew-appointments";
import { Department } from "@/services/department";

interface Props {
  departments: Department[];
  appointmentTypes: CrewAppointmentType[];
  selectedDepartmentId: number | null;
  selectedAppointmentTypeId: number | null;
  selectedDate: string | null;
  selectedSlot: TimeSlotApi | null;
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
  selectedSlot,
  purpose,
  loading = false,
  onChangeDepartment,
  onChangeAppointmentType,
  onChangePurpose,
}: Props) {
  const purposeError =
    selectedSlot && !purpose.trim() ? "Purpose is required." : "";

  return (
    <div className="bg-white rounded-xl p-4 shadow space-y-4">
      <h3 className="text-lg font-semibold">Appointment Details</h3>

      <select
        value={selectedDepartmentId ?? ""}
        onChange={(e) => onChangeDepartment(Number(e.target.value))}
        className="w-full border rounded-lg p-2 text-sm"
        disabled={loading}
      >
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>

      <select
        value={selectedAppointmentTypeId ?? ""}
        onChange={(e) => onChangeAppointmentType(Number(e.target.value))}
        className="w-full border rounded-lg p-2 text-sm"
        disabled={!selectedDepartmentId || loading}
      >
        <option value="">Select Appointment Type</option>
        {appointmentTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>

      <textarea
        rows={4}
        value={purpose}
        onChange={(e) => onChangePurpose(e.target.value)}
        placeholder="Purpose of appointment"
        className={`w-full border rounded-lg p-2 text-sm ${
          purposeError ? "border-red-500" : ""
        }`}
        disabled={loading}
      />

      <ValidationError errors={purposeError} className="text-xs" />
    </div>
  );
}
