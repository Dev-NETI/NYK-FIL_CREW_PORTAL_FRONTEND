"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AuthService } from "@/services/auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/types/api";
import { useCrewUnreadCount } from "@/contexts/CrewUnreadCountContext";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { unreadCount } = useCrewUnreadCount();

  // Get user from localStorage if not provided as prop
  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const storedUser = AuthService.getStoredUser();
      setCurrentUser(storedUser);
    }
  }, [user]);

  // Update previousActive when the route changes
  useEffect(() => {
    setPreviousActive(currentRoute);
  }, [currentRoute]);

  // Track scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const isActive = (path: string) => currentRoute === path;

  const handleNavClick = (href: string) => {
    if (previousActive !== href) {
      setPreviousActive(href);
    }
    setClickedItem(href);
    setTimeout(() => setClickedItem(null), 200);
  };

  const handleLogout = async () => {
    await AuthService.handleLogout();
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 pt-7 sm:pt-0 bg-blue-900`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/crew/home"
                className="flex items-center group relative"
              >
                <div className="absolute -inset-2 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Image
                  src="/nykfil.png"
                  alt="Logo"
                  width={150}
                  height={100}
                  className="relative w-full h-full object-contain max-w-[120px] sm:max-w-[150px] lg:max-w-[180px] transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden relative flex items-center justify-center w-11 h-11 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-4 flex flex-col justify-between">
                <span
                  className={`block h-0.5 w-5 bg-white rounded-full transition-all duration-300 origin-center ${
                    isMobileMenuOpen
                      ? "rotate-45 translate-y-[7px]"
                      : "rotate-0"
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-white rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0 scale-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-white rounded-full transition-all duration-300 origin-center ${
                    isMobileMenuOpen
                      ? "-rotate-45 -translate-y-[7px]"
                      : "rotate-0"
                  }`}
                />
              </div>
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
                        className={`bi bi-${
                          isActive(item.href) ? item.activeIcon : item.icon
                        } text-lg transition-transform duration-300 ${
                          clickedItem === item.href ? "scale-90" : "scale-100"
                        }`}
                      />
                      {/* Unread Badge for Chat */}
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

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-white/10 hover:bg-white/15 active:bg-white/20 transition-all duration-300 text-white group">
                    <div className="relative">
                      <Avatar className="w-10 h-10 ring-2 ring-white/30 group-hover:ring-white/50 transition-all duration-300">
                        <AvatarImage src="/USER.svg" alt="User Avatar" />
                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                          {currentUser?.name
                            ? currentUser.name.charAt(0).toUpperCase()
                            : "P"}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-white font-semibold text-sm leading-tight">
                        {currentUser?.name
                          ? `${currentUser.profile?.first_name || currentUser.name}`
                          : "Welcome!"}
                      </p>
                      <p className="text-blue-200 text-xs">
                        {currentUser?.profile?.crew_id
                          ? `ID: ${currentUser.profile?.crew_id}`
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
                  {/* User Header */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 ring-3 ring-white/30">
                        <AvatarImage src="/USER.svg" alt="User Avatar" />
                        <AvatarFallback className="text-lg font-bold bg-white text-blue-600">
                          {currentUser?.name
                            ? currentUser.name.charAt(0).toUpperCase()
                            : "P"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-base truncate">
                          {currentUser?.name
                            ? `${currentUser.profile?.first_name || currentUser.name}`
                            : "Welcome!"}
                        </p>
                        <p className="text-blue-100 text-sm truncate">
                          {currentUser?.profile?.crew_id
                            ? `Crew ID: ${currentUser.profile?.crew_id}`
                            : currentUser?.email || "Portal User"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
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

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ease-out ${
            isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-gradient-to-b from-blue-600/50 to-blue-700/80 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-4 space-y-3">
              {/* User Welcome Card */}
              <div
                className={`flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10 transition-all duration-300 ${
                  isMobileMenuOpen
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12 ring-2 ring-white/30">
                    <AvatarImage src="/USER.svg" alt="User Avatar" />
                    <AvatarFallback className="text-base font-bold bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                      {currentUser?.name
                        ? currentUser.name.charAt(0).toUpperCase()
                        : "P"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-blue-600 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-base truncate">
                    {currentUser?.name
                      ? `Hello, ${currentUser.profile?.first_name || currentUser.name}!`
                      : "Welcome back!"}
                  </p>
                  <p className="text-blue-200 text-sm truncate">
                    {currentUser?.profile?.crew_id
                      ? `Crew ID: ${currentUser.profile?.crew_id}`
                      : currentUser?.email || "Portal User"}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-1">
                <Link
                  href={`/crew/profile/${currentUser?.profile?.crew_id || ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: "150ms" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <i className="bi bi-person-circle text-lg" />
                  </div>
                  <span className="font-medium">View Profile</span>
                  <i className="bi bi-chevron-right text-white/50 ml-auto" />
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-white hover:bg-red-500/20 active:bg-red-500/30 transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: "200ms" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <i className="bi bi-box-arrow-right text-lg text-red-300" />
                  </div>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {!hideBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-safe">
          <div className="">
            <div className="bg-white/95 backdrop-blur-xl rounded-t-xl shadow-lg shadow-black/10 border border-gray-100 px-2 py-2">
              <div className="grid grid-cols-4 gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`flex flex-col items-center py-2.5 px-2 rounded-xl transition-all duration-300 relative ${
                      clickedItem === item.href ? "scale-90" : "scale-100"
                    } ${
                      isActive(item.href)
                        ? "bg-blue-50"
                        : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <div className="relative mb-1">
                      <i
                        className={`bi bi-${
                          isActive(item.href) ? item.activeIcon : item.icon
                        } text-xl transition-all duration-300 ${
                          isActive(item.href)
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      />
                      {/* Unread Badge for Chat */}
                      {item.label === "Chat" && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-sm ring-2 ring-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium transition-colors duration-300 ${
                        isActive(item.href) ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {item.label}
                    </span>
                    {/* Active indicator line */}
                    {isActive(item.href) && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for mobile bottom nav */}
      {!hideBottomNav && <div className="h-23 md:h-0" />}
    </>
  );
}
