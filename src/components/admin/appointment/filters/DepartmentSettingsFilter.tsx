"use client";

import dayjs, { Dayjs } from "dayjs";
import { X } from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function DepartmentSettingsFilter({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={value ? dayjs(value) : null}
          onChange={(date: Dayjs | null) =>
            onChange(date ? date.format("YYYY-MM-DD") : "")
          }
          slotProps={{
            textField: {
              size: "small",
              placeholder: "Filter by date",
              className: "min-w-[170px]",
            },
          }}
        />
      </LocalizationProvider>

      {value && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
        >
          <X size={16} />
          Clear
        </button>
      )}
    </div>
  );
}
