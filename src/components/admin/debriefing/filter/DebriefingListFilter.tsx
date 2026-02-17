"use client";

import { useEffect, useMemo, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { DebriefingStatus } from "@/services/admin-debriefing";

type FilterStatus = "all" | DebriefingStatus;

export interface DebriefingFilters {
  status: FilterStatus;
  crewName: string;
  vessel: string;
  dateFrom: string;
  dateTo: string;
}

interface Props {
  value: DebriefingFilters;
  onChange: (value: DebriefingFilters) => void;
  onClear: () => void;
}

export default function DebriefingFilters({ value, onChange, onClear }: Props) {
  const [crewDraft, setCrewDraft] = useState(value.crewName);
  const [vesselDraft, setVesselDraft] = useState(value.vessel);

  useEffect(() => setCrewDraft(value.crewName), [value.crewName]);
  useEffect(() => setVesselDraft(value.vessel), [value.vessel]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (crewDraft !== value.crewName) onChange({ ...value, crewName: crewDraft });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crewDraft]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (vesselDraft !== value.vessel) onChange({ ...value, vessel: vesselDraft });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vesselDraft]);

  const fromValue = useMemo(() => (value.dateFrom ? dayjs(value.dateFrom) : null), [value.dateFrom]);
  const toValue = useMemo(() => (value.dateTo ? dayjs(value.dateTo) : null), [value.dateTo]);

  const handleFromChange = (d: Dayjs | null) => onChange({ ...value, dateFrom: d ? d.format("YYYY-MM-DD") : "" });
  const handleToChange = (d: Dayjs | null) => onChange({ ...value, dateTo: d ? d.format("YYYY-MM-DD") : "" });

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full lg:flex-1">
          <div className="w-full">
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={value.status}
              onChange={(e) => onChange({ ...value, status: e.target.value as DebriefingStatus })}
              className="w-full h-[42px] px-3 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </div>

          <div className="w-full">
            <label className="block text-xs font-medium text-gray-600 mb-1">Crew Name</label>
            <input
              type="text"
              placeholder="Search crew name"
              value={crewDraft}
              onChange={(e) => setCrewDraft(e.target.value)}
              className="w-full h-[42px] px-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-medium text-gray-600 mb-1">Vessel</label>
            <input
              type="text"
              placeholder="Search vessel"
              value={vesselDraft}
              onChange={(e) => setVesselDraft(e.target.value)}
              className="w-full h-[42px] px-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-medium text-gray-600 mb-1">Date From</label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={fromValue}
                onChange={handleFromChange}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </LocalizationProvider>
          </div>

          <div className="w-full">
            <label className="block text-xs font-medium text-gray-600 mb-1">Date To</label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={toValue}
                onChange={handleToChange}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
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
