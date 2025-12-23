"use client";

import { useState, useEffect } from "react";
import { AuthService } from "@/services";
import { User } from "@/types/api";
import {
  CrewIdCard,
  DashboardStatsCard,
  QuickAccess,
  RecentActivities,
  HelpfulTips,
} from "@/components/crew/home";

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userName = currentUser?.profile?.first_name
    ? currentUser.profile.first_name
    : currentUser?.name?.split(" ")[0] || "Crew Member";

  useEffect(() => {
    const user = AuthService.getStoredUser();
    setCurrentUser(user);
    setIsLoaded(true);

    console.log(user);
  }, []);

  const quickLinks = useMemo(
    () => [
      {
        icon: "person-badge",
        title: "My Profile",
        href: currentUser?.profile?.crew_id
          ? `/crew/profile/${currentUser.profile.crew_id}`
          : "/crew/profile",
        color: "from-blue-500 to-purple-600",
        delay: "delay-100",
      },
      {
        icon: "file-earmark-text",
        title: "Documents",
        href: "/crew/documents",
        color: "from-green-500 to-blue-500",
        delay: "delay-200",
      },
      {
        icon: "calendar-check",
        title: "Appointments",
        href: "/crew/appointment-schedule",
        color: "from-purple-500 to-pink-500",
        delay: "delay-300",
      },
      {
        icon: "megaphone",
        title: "Reports",
        href: "/crew/reports",
        color: "from-orange-500 to-red-500",
        delay: "delay-400",
      },
      {
        icon: "currency-dollar",
        title: "Finance",
        href: "/crew/finance",
        color: "from-teal-500 to-green-500",
        delay: "delay-500",
      },
      {
        icon: "bell",
        title: "Notifications",
        href: "/crew/notifications",
        color: "from-yellow-500 to-orange-500",
        delay: "delay-600",
      },
    ],
    [currentUser]
  );

  const recentActivities = [
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
    <>
      <div className="min-h-screen bg-gray-50 pt-15">
        <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div
              className={`text-center mb-6 transform transition-all duration-1000 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="text-center sm:text-left w-full">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {getTimeBasedGreeting()}, {userName}! ⚓
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base mt-1">
                    Welcome to your crew portal. Stay updated with your maritime
                    career and documentation.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start mt-2 text-xs text-blue-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span>System Status: Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Maritime ID Card - Flippable */}
            <CrewIdCard user={currentUser} isLoaded={isLoaded} />

            {/* Dashboard Stats Cards */}
            <DashboardStatsCard currentUser={currentUser} isLoaded={isLoaded} />
          </div>
        </div>

        {/* Quick Access */}
        <QuickAccess currentUser={currentUser} isLoaded={isLoaded} />

        {/* Recent Activities and Helpful Tips inside white background */}
        <div className="bg-white px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
          <RecentActivities isLoaded={isLoaded} />
          <HelpfulTips isLoaded={isLoaded} />
        </div>
      </div>
    </>
  );
}
