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
 * Format ISO date string to YYYY-MM-DD
 * Example: "2025-12-29T00:00:00.000000Z" → "2025-12-29"
 */
export const formatDate = (date?: string): string => {
  if (!date) return "-";
  return date.split("T")[0];
};
