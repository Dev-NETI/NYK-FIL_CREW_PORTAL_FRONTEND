"use client";

interface Activity {
  icon: string;
  title: string;
  description: string;
  time: string;
}

interface RecentActivitiesProps {
  isLoaded?: boolean;
}

export default function RecentActivities({
  isLoaded = true,
}: RecentActivitiesProps) {
  const activities: Activity[] = [
    {
      icon: "file-earmark-check",
      title: "Certificate uploaded",
      description: "STCW Basic Safety Training - Valid until 2026",
      time: "2 hours ago",
    },
    {
      icon: "person-badge",
      title: "Profile updated",
      description: "Emergency contact information updated",
      time: "1 day ago",
    },
    {
      icon: "megaphone",
      title: "Briefing completed",
      description: "Port safety briefing - Singapore",
      time: "2 days ago",
    },
  ];

  return (
    <div
      className={`mt-8 transform transition-all duration-1000 delay-700 ${
        isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-3 sm:mb-4">
        Recent Activities
      </h2>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                <i
                  className={`bi bi-${activity.icon} text-blue-600 text-sm`}
                ></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900">
                  {activity.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
