"use client";

interface Props {
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
}

export default function CalendarHeader({ currentMonth, setCurrentMonth }: Props) {
  const monthName = currentMonth.toLocaleString("default", { month: "long" })
  const year = currentMonth.getFullYear()

  const next = () =>
    setCurrentMonth(new Date(year, currentMonth.getMonth() + 1, 1))

  const prev = () =>
    setCurrentMonth(new Date(year, currentMonth.getMonth() - 1, 1))

  return (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={prev}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
      >
        ←
      </button>

      <h2 className="text-xl font-bold">
        {monthName} {year}
      </h2>

      <button
        onClick={next}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
      >
        →
      </button>
    </div>
  );
}
