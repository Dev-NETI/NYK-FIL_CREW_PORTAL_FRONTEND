"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AuthService } from "@/services/auth";

interface NavigationProps {
  currentPath?: string;
}

export default function Navigation({ currentPath = "/" }: NavigationProps) {
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [previousActive, setPreviousActive] = useState<string | null>(
    currentPath
  );

  const navItems = [
    {
      href: "/home",
      label: "Home",
      icon: "grid-3x3-gap-fill",
      activeIcon: "grid-3x3-gap-fill",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: "person",
      activeIcon: "person-fill",
    },
    {
      href: "/documents",
      label: "Documents",
      icon: "file-earmark",
      activeIcon: "file-earmark-fill",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: "gear",
      activeIcon: "gear-fill",
    },
  ];

  const isActive = (path: string) => currentPath === path;

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
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/home" className="flex items-center group">
                <Image
                  src="/nykfil.png"
                  alt="Logo"
                  width={150}
                  height={100}
                  className="w-full h-full object-contain max-w-[120px] sm:max-w-[150px] lg:max-w-[180px]"
                />
              </Link>
            </div>

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
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-200 animate-in slide-in-from-bottom-2 fade-in duration-500"
                      : previousActive === item.href && !isActive(item.href)
                      ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 animate-out slide-out-to-top-2 fade-out duration-300"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-white/20 transform transition-transform duration-300 ${
                      clickedItem === item.href
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }`}
                  ></div>
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

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* User Menu */}
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 p-2 lg:p-3 rounded-xl hover:bg-gray-100 transition-all duration-300"
                >
                  <i className="bi bi-person-circle lg"></i>
                </Link>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-sm lg:text-base font-medium text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 lg:py-3 rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                <span className=" lg:inline">
                  <i className="bi bi-box-arrow-right"></i>
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 md:hidden">
        <div className="grid grid-cols-4 py-2 sm:py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`flex flex-col items-center py-2 sm:py-3 px-1 sm:px-2 transition-all duration-600 ease-out rounded-lg mx-1 transform relative overflow-hidden ${
                clickedItem === item.href ? "scale-105 -rotate-1" : "scale-100"
              } ${
                isActive(item.href)
                  ? "bg-gradient-to-t from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200 animate-in zoom-in-75 slide-in-from-bottom-3 duration-500"
                  : previousActive === item.href && !isActive(item.href)
                  ? "bg-gradient-to-t from-gray-400 to-gray-300 text-gray-600 animate-out zoom-out-95 slide-out-to-top-3 duration-350"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gradient-to-t hover:from-gray-100 hover:to-gray-50"
              }`}
            >
              <div
                className={`absolute inset-0 bg-white/10 rounded-lg transform transition-all duration-300 ${
                  clickedItem === item.href
                    ? "scale-100 opacity-100"
                    : "scale-0 opacity-0"
                }`}
              ></div>
              <i
                className={`bi bi-${
                  isActive(item.href) ? item.activeIcon : item.icon
                } text-lg sm:text-xl mb-1 transition-all duration-500 ease-out z-10 ${
                  clickedItem === item.href
                    ? "-rotate-6 scale-110"
                    : "rotate-0 scale-100"
                } ${
                  isActive(item.href)
                    ? "animate-in spin-in-6 zoom-in-50 duration-400 delay-75"
                    : ""
                }`}
              ></i>
              <span
                className={`text-xs sm:text-sm font-medium transition-all duration-400 ease-out z-10 ${
                  clickedItem === item.href
                    ? "translate-y-0.5 font-semibold"
                    : "translate-y-0 font-medium"
                } ${
                  isActive(item.href)
                    ? "animate-in slide-in-from-bottom-1 duration-400 delay-100"
                    : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 sm:h-20 md:h-0 lg:h-18"></div>
    </>
  );
}
