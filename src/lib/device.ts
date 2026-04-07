/**
 * Generates a UUID v4. Falls back to a Math.random-based approach for
 * older Android WebViews that don't support crypto.randomUUID().
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for older Android WebViews (pre-Chrome 92)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns a stable UUID for the current browser/device/app install.
 * Generated once and persisted in localStorage as 'device_id'.
 *
 * In Capacitor (mobile): persists until app is uninstalled or data is cleared.
 * In browser: persists until localStorage is cleared.
 */
export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = generateUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

/**
 * Returns a human-readable device name derived from the user agent.
 * Handles Capacitor (mobile WebView), browsers, and desktop OSes.
 */
export function getDeviceName(): string {
  const ua = navigator.userAgent;

  // Detect Capacitor mobile app
  const isCapacitor =
    typeof (window as any).Capacitor !== "undefined" ||
    ua.includes("CapacitorApp");

  let os = "Unknown OS";
  if (ua.includes("iPhone")) os = "iPhone";
  else if (ua.includes("iPad")) os = "iPad";
  else if (ua.includes("Android")) {
    // Extract Android version if available
    const match = ua.match(/Android (\d+)/);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (ua.includes("Windows NT 10.0")) os = "Windows 10/11";
  else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";

  if (isCapacitor) {
    return `Mobile App on ${os}`;
  }

  let browser = "Unknown Browser";
  if (ua.includes("Edg/") || ua.includes("EdgA/")) browser = "Edge";
  else if (ua.includes("OPR/") || ua.includes("Opera/")) browser = "Opera";
  else if (ua.includes("Chrome/") && !ua.includes("Chromium/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome/")) browser = "Safari";
  else if (ua.includes("Chromium/")) browser = "Chromium";

  return `${browser} on ${os}`;
}
