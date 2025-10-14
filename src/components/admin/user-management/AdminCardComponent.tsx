interface AdminCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: string;
  iconColor?: string;
  valueColor?: string;
}

export default function AdminCardComponent({
  title,
  value,
  description,
  icon,
  iconColor = "text-gray-900",
  valueColor = "text-gray-900",
}: AdminCardProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h3 className="text-gray-900 font-semibold text-sm sm:text-base">
          {title}
        </h3>
        <span className="text-xl sm:text-2xl">{icon}</span>
      </div>
      <div className={`text-xl sm:text-2xl font-bold ${valueColor} mb-1`}>
        {value}
      </div>
      <p className="text-gray-600 text-xs sm:text-sm">{description}</p>
    </div>
  );
}
