"use client";

import clsx from "clsx";
import { ReactNode } from "react";

export type ServerErrors = Record<string, string[]> | null;


/* =======================
 | Required Mark
 ======================= */
export function RequiredMark({ label }: { label: string }) {
  return (
    <span>
      {label} <span className="text-red-500">*</span>
    </span>
  );
}

/* =======================
 | Input
 ======================= */
export function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  error,
}: {
  label: ReactNode;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={clsx(
          "w-full h-[42px] px-3 rounded-lg border text-sm transition",
          "focus:outline-none focus:ring-2",
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-500"
            : "bg-white focus:ring-blue-500",
          error
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-300"
        )}
      />

      {error && (
        <p className="text-xs text-red-600 mt-0.5">{error}</p>
      )}
    </div>
  );
}

/* =======================
 | Textarea
 ======================= */
export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  rows = 3,
}: {
  label: ReactNode;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">
        {label}
      </label>

      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={clsx(
          "w-full px-3 py-2 rounded-lg border text-sm resize-none transition",
          "focus:outline-none focus:ring-2",
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-500"
            : "bg-white focus:ring-blue-500",
          error
            ? "border-red-400 focus:ring-red-500"
            : "border-gray-300"
        )}
      />

      {error && (
        <p className="text-xs text-red-600 mt-0.5">{error}</p>
      )}
    </div>
  );
}
