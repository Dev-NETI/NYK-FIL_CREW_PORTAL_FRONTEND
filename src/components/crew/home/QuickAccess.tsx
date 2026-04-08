"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { User } from "@/types/api";

interface QuickLink {
  icon: string;
  title: string;
  subtitle: string;
  href: string;
  gradient: string;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const quickLinks: QuickLink[] = [
    {
      icon: "person-badge-fill",
      title: "My Profile",
      subtitle: "Personal info",
      href: currentUser?.profile?.crew_id
        ? `/crew/profile/${currentUser.profile.crew_id}`
        : "/crew/profile",
      gradient: "from-blue-500 to-indigo-600",
      delay: "delay-[100ms]",
    },
    {
      icon: "file-earmark-text-fill",
      title: "Documents",
      subtitle: "Certificates",
      href: "/crew/documents",
      gradient: "from-emerald-400 to-teal-600",
      delay: "delay-[150ms]",
    },
    {
      icon: "calendar-check-fill",
      title: "Appointments",
      subtitle: "Schedule",
      href: "/crew/appointment-schedule",
      gradient: "from-purple-500 to-violet-600",
      delay: "delay-[200ms]",
    },
  ];

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(quickLinks.length / ITEMS_PER_PAGE);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollLeft = el.scrollLeft;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const ratio = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      const index = Math.round(ratio * (totalPages - 1));
      setActiveIndex(index);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [totalPages]);

  return (
    <div
      className={`transform transition-all duration-700 ${
        isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="pb-2">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 mb-3">
          <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Quick Access
          </h2>
          <span className="text-white/40 text-xs font-medium">
            Swipe to explore
          </span>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-4 sm:px-6 pb-1 [&::-webkit-scrollbar]:hidden"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => router.push(link.href)}
              className={`flex-none w-32 sm:w-36 transform transition-all duration-500 ${link.delay} ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              } active:scale-95`}
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-start gap-3 h-full transition-all duration-200 active:shadow-sm">
                {/* Icon bubble */}
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center shadow-sm`}
                >
                  <i
                    className={`bi bi-${link.icon} text-white text-xl`}
                    style={{ lineHeight: 1 }}
                  />
                </div>
                {/* Labels */}
                <div className="text-left">
                  <p className="text-gray-900 text-sm font-semibold leading-tight">
                    {link.title}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {link.subtitle}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {/* Trailing spacer */}
          <div className="flex-none w-1" aria-hidden />
        </div>

        {/* Page dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "bg-white w-4 h-1.5"
                    : "bg-white/30 w-1.5 h-1.5"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
