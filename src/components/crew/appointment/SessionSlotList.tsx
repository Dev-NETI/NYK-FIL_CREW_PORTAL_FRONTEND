"use client";

export type SessionSlot = {
  value: "AM" | "PM";
  isAvailable: boolean;
};

interface Props {
  sessions: SessionSlot[];
  selectedSession: SessionSlot | null;
  onSelectSession: (slot: SessionSlot) => void;
  loading?: boolean;
}

const SESSION_CONFIG = {
  AM: {
    icon: "bi-sunrise-fill",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    label: "Morning",
    time: "8:00 AM – 12:00 PM",
    selectedBg: "bg-blue-600 border-blue-600",
    hoverBg: "hover:bg-amber-50 hover:border-amber-300",
  },
  PM: {
    icon: "bi-sunset-fill",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50",
    label: "Afternoon",
    time: "1:00 PM – 5:00 PM",
    selectedBg: "bg-blue-600 border-blue-600",
    hoverBg: "hover:bg-orange-50 hover:border-orange-300",
  },
};

export default function SessionSlotList({
  sessions,
  selectedSession,
  onSelectSession,
  loading = false,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <i className="bi bi-clock text-amber-600 text-sm"></i>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide leading-none">Session</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Pick your preferred time slot</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <>
            <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          </>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <i className="bi bi-calendar-x text-gray-400 text-xl"></i>
            </div>
            <p className="text-sm font-semibold text-gray-500">No sessions available</p>
            <p className="text-xs text-gray-400 mt-0.5">Select a date to see available slots</p>
          </div>
        ) : (
          sessions.map((slot) => {
            const cfg = SESSION_CONFIG[slot.value];
            const isSelected = selectedSession?.value === slot.value;
            const isDisabled = !slot.isAvailable;

            return (
              <button
                key={slot.value}
                disabled={isDisabled}
                onClick={() => onSelectSession(slot)}
                className={[
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98]",
                  isDisabled
                    ? "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed"
                    : isSelected
                    ? `${cfg.selectedBg} shadow-md shadow-blue-200`
                    : `bg-white border-gray-200 ${cfg.hoverBg}`,
                ].join(" ")}
              >
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "bg-white/20" : cfg.iconBg
                  }`}
                >
                  <i
                    className={`bi ${cfg.icon} text-xl ${
                      isSelected ? "text-white" : cfg.iconColor
                    }`}
                  ></i>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-base font-black leading-none ${
                        isSelected ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {slot.value}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      isSelected ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {cfg.time}
                  </p>
                </div>

                {/* Check */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? "bg-white border-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <i className="bi bi-check text-blue-600 text-sm font-black"></i>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
