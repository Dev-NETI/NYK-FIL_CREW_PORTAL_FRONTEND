"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const quickLinks = [
    {
      icon: "person-badge",
      title: "My Profile",
      description: "View and update your crew information and certifications",
      href: "/profile",
      color: "from-blue-500 to-purple-600",
      delay: "delay-100",
    },
    {
      icon: "file-earmark-text",
      title: "Documents",
      description: "Access certificates, contracts, and maritime documents",
      href: "/documents",
      color: "from-green-500 to-blue-500",
      delay: "delay-200",
    },
    {
      icon: "calendar-check",
      title: "Appointment Schedule",
      description: "View upcoming medical exams and appointments",
      href: "/settings",
      color: "from-purple-500 to-pink-500",
      delay: "delay-300",
    },
    {
      icon: "megaphone",
      title: "Debriefing / Briefing",
      description: "Access safety briefings and voyage reports",
      href: "/reports",
      color: "from-orange-500 to-red-500",
      delay: "delay-400",
    },
    {
      icon: "currency-dollar",
      title: "Finance",
      description: "View payroll, allotments, and financial statements",
      href: "/messages",
      color: "from-teal-500 to-green-500",
      delay: "delay-500",
    },
    {
      icon: "bell",
      title: "Notifications",
      description: "Important vessel updates, alerts, and announcements",
      href: "/notifications",
      color: "from-yellow-500 to-orange-500",
      delay: "delay-600",
    },
  ];

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
      <Navigation currentPath="/home" />
      <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div
              className={`text-center mb-8 transform transition-all duration-1000 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-center sm:text-left w-full">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Crew Dashboard
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Welcome aboard! Manage your maritime career and documentation.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className={`mb-8 transform transition-all duration-1000 delay-200 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Quick Links
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className={`transform transition-all duration-700 ${
                      link.delay
                    } ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                  >
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 group">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3 sm:mb-4 transform group-hover:rotate-12 transition-transform duration-300">
                        <i className={`bi bi-${link.icon} text-xl sm:text-2xl text-gray-700`}></i>
                      </div>
                      <h3 className="text-gray-900 font-semibold text-base sm:text-lg mb-2">
                        {link.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className={`mb-8 transform transition-all duration-1000 delay-800 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <i className={`bi bi-${activity.icon} text-lg text-gray-700`}></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-medium text-sm">
                          {activity.title}
                        </h4>
                        <p className="text-gray-600 text-xs">
                          {activity.description}
                        </p>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href="/activity"
                    className="text-gray-600 text-sm hover:text-gray-900 transition-colors duration-300"
                  >
                    View all activity →
                  </Link>
                </div>
              </div>
            </div>

            {/* Status Cards */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 transform transition-all duration-1000 delay-1000 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 font-semibold text-sm sm:text-base">
                    Certificates
                  </h3>
                  <i className="bi bi-file-earmark-check text-xl sm:text-2xl text-gray-700"></i>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  12
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Valid certificates
                </p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 font-semibold text-sm sm:text-base">
                    Sea Time
                  </h3>
                  <i className="bi bi-water text-xl sm:text-2xl text-gray-700"></i>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  847
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Days served
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div
              className={`transform transition-all duration-1000 delay-1200 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                  <div>
                    <h3 className="text-gray-900 font-semibold text-lg mb-2">
                      Need assistance with crew management?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Get help with certificates, documentation, or crew support services
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      href="/help"
                      className="bg-gray-100 text-gray-800 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-300 hover:scale-105"
                    >
                      Get Help
                    </Link>
                    <button className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-105">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div
              className={`mt-8 text-center transform transition-all duration-1000 delay-1400 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <Link
                href="/"
                className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-300"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
