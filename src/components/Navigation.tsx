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
    currentRoute
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);
  // Mock unread message count - replace with actual data from API later
  const [unreadCount] = useState(3);

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
      label: "Inbox",
      icon: "chat",
      activeIcon: "chat-fill",
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
      <nav className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 backdrop-blur-md border-b border-blue-400/20 fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/crew/home" className="flex items-center group">
                <Image
                  src="/nykfil.png"
                  alt="Logo"
                  width={150}
                  height={100}
                  className="w-full h-full object-contain max-w-[120px] sm:max-w-[150px] lg:max-w-[180px]"
                />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-white hover:bg-blue-800 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i
                className={`bi ${
                  isMobileMenuOpen ? "bi-x" : "bi-list"
                } text-xl`}
              ></i>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-sm lg:text-base font-medium transition-all duration-700 ease-out flex items-center space-x-2 transform relative overflow-hidden ${
                    clickedItem === item.href
                      ? "scale-110 rotate-1"
                      : "scale-100"
                  } ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-300/30 animate-in slide-in-from-bottom-2 fade-in duration-500"
                      : previousActive === item.href && !isActive(item.href)
                      ? "bg-gradient-to-r from-blue-700 to-blue-800 text-blue-200 animate-out slide-out-to-top-2 fade-out duration-300"
                      : "text-white hover:text-blue-100 hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-700 hover:shadow-md"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-white/20 transform transition-transform duration-300 ${
                      clickedItem === item.href
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }`}
                  ></div>
                  <div className="relative">
                    <i
                      className={`bi bi-${
                        isActive(item.href) ? item.activeIcon : item.icon
                      } text-base lg:text-lg transition-all duration-500 ease-out z-10 ${
                        clickedItem === item.href
                          ? "rotate-12 scale-125"
                          : "rotate-0 scale-100"
                      } ${
                        isActive(item.href)
                          ? "animate-in zoom-in-50 duration-400 delay-100"
                          : ""
                      }`}
                    ></i>
                    {/* Unread Badge for Inbox */}
                    {item.label === "Inbox" && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center z-20 animate-in zoom-in-50 duration-300">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`hidden lg:inline transition-all duration-400 ease-out z-10 ${
                      clickedItem === item.href
                        ? "translate-x-1"
                        : "translate-x-0"
                    } ${
                      isActive(item.href)
                        ? "animate-in slide-in-from-right-2 duration-400 delay-150"
                        : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 p-2 lg:p-3 rounded-xl hover:bg-blue-800 transition-all duration-300 text-white">
                    <Avatar className="w-9 h-9 lg:w-10 lg:h-10">
                      <AvatarImage
                        src="/default-avatar.png"
                        alt="User Avatar"
                      />
                      <AvatarFallback className="text-sm lg:text-base font-medium bg-blue-600 text-white">
                        {currentUser?.name
                          ? currentUser.name.charAt(0).toUpperCase()
                          : "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-white font-medium text-sm">
                        {currentUser?.name
                          ? `Hello, ${
                              currentUser.profile?.first_name ||
                              currentUser.name
                            }!`
                          : "Welcome back!"}
                      </p>
                      <p className="text-blue-200 text-xs">
                        {currentUser?.profile?.crew_id
                          ? `Crew ID: ${currentUser.profile?.crew_id}`
                          : currentUser?.name || "Portal User"}
                      </p>
                    </div>
                    <i className="bi bi-chevron-down text-blue-200 text-sm hidden lg:block"></i>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2 bg-blue-900/98 backdrop-blur-md border border-blue-700/50 shadow-xl">
                  {/* User Welcome Section in Dropdown */}
                  <div className="flex items-center space-x-3 px-4 py-3 mb-2 bg-blue-800/50 rounded-lg border border-blue-700/50 mx-2 mt-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src="/default-avatar.png"
                        alt="User Avatar"
                      />
                      <AvatarFallback className="text-sm font-medium bg-blue-600 text-white">
                        {currentUser?.name
                          ? currentUser.name.charAt(0).toUpperCase()
                          : "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {currentUser?.name
                          ? `Hello, ${currentUser?.name || currentUser.name}!`
                          : "Welcome back!"}
                      </p>
                      <p className="text-blue-200 text-xs">
                        {currentUser?.profile?.crew_id
                          ? `Crew ID: ${currentUser.profile?.crew_id}`
                          : currentUser?.name || "Portal User"}
                      </p>
                    </div>
                  </div>

                  <div className="px-2 pb-2">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/crew/profile/${
                          currentUser?.profile?.crew_id || ""
                        }`}
                        className="flex items-center space-x-3 px-2 py-2 rounded-lg text-blue-100 hover:text-white hover:bg-blue-800 transition-all duration-300"
                      >
                        <i className="bi bi-person-circle text-lg"></i>
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-2 py-2 rounded-lg text-blue-100 hover:text-white hover:bg-red-600 transition-all duration-300"
                      >
                        <i className="bi bi-box-arrow-right text-lg"></i>
                        <span>Sign Out</span>
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
          className={`md:hidden bg-gradient-to-b from-blue-600 to-blue-700 backdrop-blur-md border-b border-blue-400/20 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-4 py-3">
            {/* User Welcome Section */}
            <div className="flex items-center space-x-3 px-4 py-3 mb-3 bg-blue-800/50 rounded-lg border border-blue-700/50">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/default-avatar.png" alt="User Avatar" />
                <AvatarFallback className="text-sm font-medium bg-blue-600 text-white">
                  {currentUser?.name
                    ? currentUser.name.charAt(0).toUpperCase()
                    : "P"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">
                  {currentUser?.name
                    ? `Hello, ${currentUser?.name}!`
                    : "Welcome back!"}
                </p>
                <p className="text-blue-200 text-xs">
                  {currentUser?.profile?.crew_id
                    ? `Crew ID: ${currentUser.profile?.crew_id}`
                    : currentUser?.email || "Portal User"}
                </p>
              </div>
            </div>
            {/* User Actions */}
            <div className="space-y-1 pt-3 border-t border-blue-700/50">
              <Link
                href={`/crew/profile/${currentUser?.profile?.crew_id || ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-100 hover:text-white hover:bg-blue-800 transition-all duration-300"
              >
                <i className="bi bi-person-circle text-lg"></i>
                <span className="text-base font-medium">Profile</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-100 hover:text-white hover:bg-red-600 transition-all duration-300"
              >
                <i className="bi bi-box-arrow-right text-lg"></i>
                <span className="text-base font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Hidden when chat is open */}
      {!hideBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-t border-gray-200 shadow-[0_-2px_10px_-2px_rgba(0,0,0,0.06)] z-40 md:hidden">
          <div className="grid grid-cols-4 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`flex flex-col items-center py-2 sm:py-3 px-1 sm:px-2 transition-all duration-600 ease-out rounded-lg mx-1 transform relative overflow-hidden ${
                  clickedItem === item.href
                    ? "scale-105 -rotate-1"
                    : "scale-100"
                } ${
                  isActive(item.href)
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-blue-500"
                }`}
              >
                <div className="relative mb-1">
                  <i
                    className={`bi bi-${
                      isActive(item.href) ? item.activeIcon : item.icon
                    } text-[22px] transition-all duration-300 ${
                      clickedItem === item.href ? "scale-110" : "scale-100"
                    }`}
                  ></i>
                  {/* Unread Badge for Inbox */}
                  {item.label === "Inbox" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-sm ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                  {/* Active Indicator Dot */}
                  {isActive(item.href) && (
                    <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                  )}
                </div>
                <span
                  className={`text-[11px] leading-tight transition-all duration-300 ${
                    isActive(item.href)
                      ? "font-semibold text-blue-600"
                      : "font-medium text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Spacer for mobile bottom nav - Only show when nav is visible */}
      {!hideBottomNav && <div className="h-8 md:h-0"></div>}
    </>
  );
}
