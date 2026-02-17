"use client";

import { useRouter } from "next/navigation";
import { User } from "@/types/api";

interface QuickLink {
  icon: string;
  title: string;
  href: string;
  color: string;
  delay: string;
}

interface QuickAccessProps {
  currentUser: User | null;
  isLoaded?: boolean;
}

export default function QuickAccess({ currentUser, isLoaded = true }: QuickAccessProps) {
  const router = useRouter();

  const quickLinks: QuickLink[] = [
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
  ];

  return (
    <div
      className={`mb-8 transform transition-all duration-1000 delay-200 ${
        isLoaded
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0"
      }`}
    >
      {/* Wave Decoration */}
      <div className="relative">
        <svg
          className="w-full h-16 sm:h-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
            fill="white"
            className="drop-shadow-lg"
          />
        </svg>
      </div>
      <div className="bg-white px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => router.push(link.href)}
              className={`w-full transform transition-all duration-700 ${
                link.delay
              } ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 group h-full flex flex-col">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-3 sm:mb-4 transform transition-transform duration-300 mx-auto group-hover:scale-110`}
                >
                  <i
                    className={`bi bi-${link.icon} text-lg sm:text-xl lg:text-2xl text-white`}
                  ></i>
                </div>
                <h3 className="text-gray-900 text-sm sm:text-base lg:text-lg font-semibold mb-1 sm:mb-2 text-center">
                  {link.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
