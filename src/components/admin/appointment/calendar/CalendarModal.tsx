interface Props {
  date: Date | null;
  data: Record<string, any>;
  onClose: () => void;
}

const formatTime = (time: string) => {
  const [h, m] = time.split(":");
  const hour = Number(h);
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${period}`;
};

export default function CalendarModal({ date, data, onClose }: Props) {
  if (!date) return null;

  const key = date.toISOString().split("T")[0];
  const info = data[key];

  if (!info) return null;

  const slots = [];
  const start = new Date(`${key}T${info.opening_time}`);
  const end = new Date(`${key}T${info.closing_time}`);

  let current = new Date(start);

  while (current < end) {
    slots.push(new Date(current));
    current.setMinutes(current.getMinutes() + info.slot_duration_minutes);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {date.toDateString()}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {slots.map((time, i) => (
            <button
              key={i}
              className="border rounded-lg py-2 hover:bg-blue-600 hover:text-white transition"
            >
              {formatTime(time.toTimeString().slice(0, 5))}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
