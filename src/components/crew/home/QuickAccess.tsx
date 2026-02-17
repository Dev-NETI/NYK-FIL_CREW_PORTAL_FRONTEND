"use client";

import { useRouter } from "next/navigation";
import { User } from "@/types/api";

interface QuickLink {
  title: string;
  href: string;
  color: string;
  delay: string;
}

interface QuickAccessProps {
  currentUser: User | null;
  isLoaded?: boolean;
}

export default function QuickAccess({
  currentUser,
  isLoaded = true,
}: QuickAccessProps) {
  const router = useRouter();

  const quickLinks: QuickLink[] = [
    {
      title: "My Profile",
      href: currentUser?.profile?.crew_id
        ? `/crew/profile/${currentUser.profile.crew_id}`
        : "/crew/profile",
      color: "bg-blue-500 hover:bg-blue-600",
      delay: "delay-100",
    },
    {
      title: "Documents",
      href: "/crew/documents",
      color: "bg-emerald-500 hover:bg-emerald-600",
      delay: "delay-150",
    },
    {
      title: "Appointments",
      href: "/crew/appointment-schedule",
      color: "bg-purple-500 hover:bg-purple-600",
      delay: "delay-200",
    },
    {
      title: "Reports",
      href: "/crew/reports",
      color: "bg-orange-500 hover:bg-orange-600",
      delay: "delay-250",
    },
    {
      title: "Finance",
      href: "/crew/finance",
      color: "bg-teal-500 hover:bg-teal-600",
      delay: "delay-300",
    },
    {
      title: "Notifications",
      href: "/crew/notifications",
      color: "bg-amber-500 hover:bg-amber-600",
      delay: "delay-350",
    },
  ];

  return (
    <div
      className={`mb-4 sm:mb-8 transform transition-all duration-700 ${
        isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-3 sm:mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => router.push(link.href)}
              className={`w-full transform transition-all duration-500 ${
                link.delay
              } ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div
                className={`${link.color} rounded-xl py-4 px-3 sm:py-5 sm:px-4 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg`}
              >
                <span className="text-white text-sm sm:text-base font-semibold tracking-wide">
                  {link.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
