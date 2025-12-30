"use client";

import { useEffect, useMemo, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

type AppointmentStatus = "all" | "pending" | "confirmed" | "cancelled";

interface AppointmentTypeOption {
  id: number;
  name: string;
}

export interface Filters {
  status: AppointmentStatus;
  name: string;
  typeId: string;
  date: string;
}

interface Props {
  types: AppointmentTypeOption[];
  typesLoading?: boolean;

  value: Filters;
  onChange: (value: Filters) => void;

  onClear: () => void;
}

export default function AppointmentFilters({
  types,
  typesLoading = false,
  value,
  onChange,
  onClear,
}: Props) {
  const [nameDraft, setNameDraft] = useState(value.name);

  useEffect(() => {
    setNameDraft(value.name);
  }, [value.name]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (nameDraft !== value.name) {
        onChange({ ...value, name: nameDraft });
      }
    }, 250);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameDraft]);

  const handleDateChange = (d: Dayjs | null) => {
    onChange({ ...value, date: d ? d.format("YYYY-MM-DD") : "" });
  };

  const dateValue = useMemo(() => (value.date ? dayjs(value.date) : null), [value.date]);

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:flex-1">
          <div className="w-full">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Status
            </label>
            <select
              value={value.status}
              onChange={(e) =>
                onChange({ ...value, status: e.target.value as AppointmentStatus })
              }
              className="w-full h-[42px] px-3 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="w-full">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Appointment Type
            </label>
            <select
              value={value.typeId}
              onChange={(e) => onChange({ ...value, typeId: e.target.value })}
              className="w-full h-[42px] px-3 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              disabled={typesLoading}
            >
              <option value="all">
                {typesLoading ? "Loading types..." : "All Appointment Types"}
              </option>
              {types.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Crew Name
            </label>
            <input
              type="text"
              placeholder="Search crew name"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="w-full h-[42px] px-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Date
            </label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={dateValue}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </div>
        </div>
        <div className="flex justify-end lg:justify-start">
          <button
            onClick={onClear}
            className="h-[42px] px-4 rounded-lg bg-gray-200 text-sm hover:bg-gray-300 transition w-full sm:w-auto"
            type="button"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
