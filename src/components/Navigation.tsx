"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AuthService } from "@/services/auth";
import { UserService } from "@/services/user";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/types/api";
import { useCrewUnreadCount } from "@/contexts/CrewUnreadCountContext";
import nyklogo from "@/lib/assets/nykfil.png";

interface NavigationProps {
  currentPath?: string;
  user?: User;
  hideBottomNav?: boolean;
}

export default function Navigation({
  currentPath,
  user,
  hideBottomNav = false,
}: NavigationProps) {
  const pathname = usePathname();
  const currentRoute = currentPath || pathname;
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [previousActive, setPreviousActive] = useState<string | null>(
    currentRoute,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false); // controls slide-up animation
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);
  const { unreadCount } = useCrewUnreadCount();
  const sheetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      setCurrentUser(AuthService.getStoredUser());
    }
  }, [user]);

  useEffect(() => {
    const syncProfileImage = async () => {
      const crewId = currentUser?.profile?.crew_id;
      if (!crewId) return;
      try {
        const res = await UserService.getUserProfile(crewId);
        if (res.success && res.user?.profile?.image_path != null) {
          setCurrentUser((prev) =>
            prev
              ? {
                  ...prev,
                  profile: {
                    ...(prev.profile ?? {}),
                    image_path: res.user!.profile!.image_path,
                  },
                }
              : prev,
          );
        }
      } catch {
        /* silent */
      }
    };
    syncProfileImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.profile?.crew_id]);

  useEffect(() => {
    setPreviousActive(currentRoute);
  }, [currentRoute]);

  // ── Bottom-sheet open/close helpers ────────────────────────────────────────
  const openSheet = () => {
    setIsSheetOpen(true);
    // Defer so the DOM mounts first, then trigger the slide-up transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsSheetVisible(true));
    });
  };

  const closeSheet = () => {
    setIsSheetVisible(false);
    // Wait for slide-down animation before unmounting
    if (sheetTimerRef.current) clearTimeout(sheetTimerRef.current);
    sheetTimerRef.current = setTimeout(() => setIsSheetOpen(false), 350);
  };

  const navItems = [
    {
      href: "/crew/home",
      label: "Home",
      icon: "grid-3x3-gap-fill",
      activeIcon: "grid-3x3-gap-fill",
    },
    {
      href: "/crew/documents",
      label: "Documents",
      icon: "file-earmark",
      activeIcon: "file-earmark-fill",
    },
    {
      href: "/crew/appointment-schedule",
      label: "Appointment",
      icon: "calendar2-check",
      activeIcon: "calendar2-check-fill",
    },
    {
      href: "/crew/inbox",
      label: "Chat",
      icon: "chat",
      activeIcon: "chat-fill",
    },
    {
      href: currentUser?.profile?.crew_id
        ? `/crew/profile/${currentUser.profile.crew_id}`
        : "/crew/profile",
      label: "Profile",
      icon: "person",
      activeIcon: "person-fill",
    },
  ];

  const isActive = (path: string) =>
    path === "/crew/home"
      ? currentRoute === path
      : currentRoute.startsWith(path);

  const handleNavClick = (href: string) => {
    if (previousActive !== href) setPreviousActive(href);
    setClickedItem(href);
    setTimeout(() => setClickedItem(null), 200);
  };

  const handleLogout = async () => {
    closeSheet();
    await AuthService.handleLogout();
  };

  const profileImageUrl = currentUser?.profile?.image_path
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${currentUser.profile.image_path}`
    : null;

  const displayName =
    currentUser?.profile?.first_name || currentUser?.name || "Crew Member";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* ══════════════════════════════ TOP NAV ══════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 pt-7 sm:pt-0 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/crew/home"
              className="flex items-center group relative"
            >
              <div className="absolute -inset-2 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image
                src={nyklogo}
                alt="Logo"
                width={200}
                height={150}
                className="relative w-full h-full object-contain max-w-[120px] sm:max-w-[150px] lg:max-w-[180px] transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Mobile: avatar button → opens bottom sheet */}
            <button
              className="md:hidden relative flex items-center justify-center w-10 h-10 rounded-full ring-2 ring-white/30 active:ring-white/60 transition-all duration-200 overflow-hidden"
              onClick={openSheet}
              aria-label="Open menu"
            >
              {profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImageUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-black">
                    {initials}
                  </span>
                </div>
              )}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2.5 ${
                      clickedItem === item.href ? "scale-95" : "scale-100"
                    } ${
                      isActive(item.href)
                        ? "bg-white text-blue-600 shadow-lg shadow-blue-500/25"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="relative">
                      <i
                        className={`bi bi-${isActive(item.href) ? item.activeIcon : item.icon} text-lg`}
                      />
                      {item.label === "Chat" && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-lg ring-2 ring-white animate-pulse">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="hidden lg:inline font-medium">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop User Dropdown */}
            <div className="hidden md:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-white/10 hover:bg-white/15 active:bg-white/20 transition-all duration-300 text-white group">
                    <div className="relative">
                      <Avatar className="w-10 h-10 ring-2 ring-white/30 group-hover:ring-white/50 transition-all duration-300">
                        <AvatarImage
                          src={profileImageUrl ?? "/USER.svg"}
                          alt="User Avatar"
                        />
                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-white font-semibold text-sm leading-tight">
                        {displayName}
                      </p>
                      <p className="text-blue-200 text-xs">
                        {currentUser?.profile?.crew_id
                          ? `ID: ${currentUser.profile.crew_id}`
                          : "Portal User"}
                      </p>
                    </div>
                    <i className="bi bi-chevron-down text-white/70 text-xs hidden lg:block transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-72 mt-3 p-0 bg-white border-0 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden"
                  align="end"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 ring-2 ring-white/30">
                        <AvatarImage
                          src={profileImageUrl ?? "/USER.svg"}
                          alt="User Avatar"
                        />
                        <AvatarFallback className="text-lg font-bold bg-white text-blue-600">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-base truncate">
                          {displayName}
                        </p>
                        <p className="text-blue-100 text-sm truncate">
                          {currentUser?.profile?.crew_id
                            ? `Crew ID: ${currentUser.profile.crew_id}`
                            : currentUser?.email || "Portal User"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/crew/profile/${currentUser?.profile?.crew_id || ""}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <i className="bi bi-person text-blue-600 text-lg" />
                        </div>
                        <div>
                          <p className="font-medium">My Profile</p>
                          <p className="text-xs text-gray-500">
                            View and edit your profile
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <div className="h-px bg-gray-100 my-2" />
                    <DropdownMenuItem asChild>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                          <i className="bi bi-box-arrow-right text-red-500 text-lg" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Sign Out</p>
                          <p className="text-xs text-gray-500">
                            Log out of your account
                          </p>
                        </div>
                      </button>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════ iOS-STYLE BOTTOM SHEET (mobile only) ═══════ */}
      {isSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[150] md:hidden transition-opacity duration-350 ${
              isSheetVisible ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(3px)",
            }}
            onClick={closeSheet}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div
            className={`fixed bottom-0 left-0 right-0 z-[160] md:hidden transition-transform duration-350 ease-out ${
              isSheetVisible ? "translate-y-0" : "translate-y-full"
            }`}
            style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
          >
            <div className="bg-white rounded-t-3xl overflow-hidden shadow-2xl">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* User card */}
              <div className="mx-4 mt-3 mb-4 flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-blue-100">
                    {profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileImageUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <span className="text-white text-xl font-black">
                          {initials}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-black text-base truncate">
                    {displayName}
                  </p>
                  <p className="text-gray-500 text-sm truncate">
                    {currentUser?.profile?.crew_id
                      ? `Crew ID: ${currentUser.profile.crew_id}`
                      : currentUser?.email || "Crew Member"}
                  </p>
                </div>
                {/* Verified badge */}
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <i className="bi bi-patch-check-fill text-blue-600 text-base"></i>
                </div>
              </div>

              {/* Actions group — iOS grouped style */}
              <div className="mx-4 rounded-2xl overflow-hidden border border-gray-100 bg-white mb-3">
                {/* View Profile */}
                <Link
                  href={`/crew/profile/${currentUser?.profile?.crew_id || ""}`}
                  onClick={closeSheet}
                  className="flex items-center gap-4 px-5 py-4 active:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-person-fill text-blue-600 text-base"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      My Profile
                    </p>
                    <p className="text-xs text-gray-400">
                      View and edit your information
                    </p>
                  </div>
                  <i className="bi bi-chevron-right text-gray-300 text-sm"></i>
                </Link>
              </div>

              {/* Sign Out — separate group (iOS pattern) */}
              <div className="mx-4 rounded-2xl overflow-hidden border border-red-100 bg-white mb-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-5 py-4 active:bg-red-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <i className="bi bi-box-arrow-right text-red-500 text-base"></i>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-red-600">
                      Sign Out
                    </p>
                    <p className="text-xs text-gray-400">
                      Log out of your account
                    </p>
                  </div>
                </button>
              </div>

              {/* Cancel — iOS-style standalone pill */}
              <div className="mx-4 mb-4">
                <button
                  onClick={closeSheet}
                  className="w-full py-4 rounded-2xl bg-gray-100 active:bg-gray-200 transition-colors text-sm font-black text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════ BOTTOM NAV (mobile) ══════════════════════ */}
      {!hideBottomNav && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-100"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="px-2 py-2">
            <div className="grid grid-cols-5 gap-1 items-end">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const isAppointment = item.label === "Appointment";

                if (isAppointment) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => handleNavClick(item.href)}
                      className={`flex flex-col items-center transition-all duration-300 relative -mt-5 ${
                        clickedItem === item.href ? "scale-90" : "scale-100"
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 transition-all duration-300 ${
                          active
                            ? "bg-blue-700 scale-105"
                            : "bg-blue-600 active:scale-95"
                        }`}
                      >
                        <i
                          className={`bi bi-${active ? item.activeIcon : item.icon} text-2xl text-white`}
                        />
                      </div>
                      <span className="text-[11px] font-semibold mt-1 text-blue-600">
                        {item.label}
                      </span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`flex flex-col items-center py-2.5 px-2 rounded-xl transition-all duration-300 relative ${
                      clickedItem === item.href ? "scale-90" : "scale-100"
                    } ${active ? "bg-blue-50" : "hover:bg-gray-50 active:bg-gray-100"}`}
                  >
                    <div className="relative mb-1">
                      <i
                        className={`bi bi-${active ? item.activeIcon : item.icon} text-xl transition-all duration-300 ${
                          active ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      {item.label === "Chat" && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-sm ring-2 ring-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium transition-colors duration-300 ${
                        active ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for mobile bottom nav */}
      {!hideBottomNav && (
        <div
          className="md:hidden"
          style={{ height: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
        />
      )}
    </>
  );
}
