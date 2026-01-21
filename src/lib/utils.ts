import { Appointment } from "@/services/admin-appointment";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format time (HH:mm or HH:mm:ss) to 12-hour format
 * Example: "14:30" → "2:30 PM"
 */
export const formatTime = (time?: string): string => {
  if (!time) return "-";

  const [hourStr, minute] = time.split(":");
  const hour = Number(hourStr);

  if (Number.isNaN(hour) || !minute) return "-";

  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
};

/**
 * Format ISO date string to Text
 * Example: "2025-12-29T00:00:00.000000Z" → "January 12, 2026"
 */
export const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * status badge for appointment list
 */
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "submitted":
      return "bg-blue-100 text-blue-700";
    case "draft":
      return "bg-gray-100 text-orange-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

/**
 * cancellation reason for appointment list crew and admin
 */
export const getCancellationReason = (appt: Appointment) => {
  if (appt.status !== "cancelled") return "";

  const list = appt.cancellations ?? [];
  if (list.length === 0) return "-";

  const latest = [...list].sort((a, b) => {
    const da = new Date(a.cancelled_at ?? a.created_at).getTime();
    const db = new Date(b.cancelled_at ?? b.created_at).getTime();
    return db - da;
  })[0];

  return latest?.reason?.trim() || "-";
};


export const getDisplayFormId = (id: number) => {
  // stable pseudo-random looking number
  return 100000 + (id * 73) % 900000;
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}