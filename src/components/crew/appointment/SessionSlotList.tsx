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

export default function SessionSlotList({
  sessions,
  selectedSession,
  onSelectSession,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow">
        <h3 className="text-lg font-semibold mb-4">Select AM / PM</h3>

        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="bg-white rounded-xl p-4 shadow text-gray-500 text-sm">
        No available sessions for this date.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="text-lg font-semibold mb-4">Select AM / PM</h3>

      <div className="grid grid-cols-2 gap-3">
        {sessions.map((slot) => {
          const isSelected = selectedSession?.value === slot.value;

          return (
            <button
              key={slot.value}
              disabled={!slot.isAvailable}
              onClick={() => onSelectSession(slot)}
              className={`
                py-2 rounded-lg border text-sm font-medium transition
                ${
                  !slot.isAvailable
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isSelected
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-50"
                }
              `}
            >
              {slot.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
