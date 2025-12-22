"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AuthService } from "@/services";
import { User } from "@/types/api";
import QRCode from "qrcode";

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const router = useRouter();

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

    // Generate QR code when user data is available
    if (user?.profile?.crew_id) {
      QRCode.toDataURL(user.profile.crew_id, {
        width: 128,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => {
          setQrCodeDataUrl(url);
        })
        .catch((err) => {
          console.error("QR Code generation failed:", err);
        });
    } else {
      // Generate default QR code
      QRCode.toDataURL("NYK-FIL-CREW", {
        width: 128,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => {
          setQrCodeDataUrl(url);
        })
        .catch((err) => {
          console.error("QR Code generation failed:", err);
        });
    }
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
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

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
            <div
              className={`mb-6 sm:mb-8 flex justify-center transform transition-all duration-1000 delay-300 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="w-full max-w-sm sm:max-w-md perspective-1000">
                <div
                  className={`relative w-full transform-style-preserve-3d transition-transform duration-700 cursor-pointer ${
                    isCardFlipped ? "rotate-y-180" : ""
                  }`}
                  style={{ aspectRatio: "1.586/1" }}
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                >
                  {/* Front Side */}
                  <div
                    className={`absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-2xl overflow-hidden border border-gray-200 ${
                      isCardFlipped ? "rotate-y-180" : ""
                    }`}
                    style={{
                      background: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8)), url("/anchor.jpg")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-xs font-bold">
                            NYK-FIL CREW PORTAL
                          </div>
                          <div className="text-blue-100 text-xs">
                            SEAFARER IDENTIFICATION
                          </div>
                        </div>
                        <div className="text-white text-xs font-mono"></div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 sm:p-4 bg-white">
                      <div className="flex space-x-3 sm:space-x-4">
                        {/* Photo Section */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center">
                            <div className="w-10 h-14 sm:w-14 sm:h-18 bg-gradient-to-b from-blue-500 to-blue-600 rounded flex items-center justify-center">
                              <span className="text-white font-bold text-sm sm:text-lg">
                                {currentUser?.profile?.first_name &&
                                currentUser?.profile?.last_name
                                  ? `${currentUser.profile.first_name[0]}${currentUser.profile?.last_name[0]}`
                                  : currentUser?.name
                                  ? currentUser.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                  : currentUser?.email?.[0]?.toUpperCase() ||
                                    "U"}
                              </span>
                            </div>
                          </div>
                          <div className="text-center mt-1">
                            <div className="text-xs text-gray-500">PHOTO</div>
                          </div>
                        </div>

                        {/* Information Section */}
                        <div className="flex-1 space-y-1 sm:space-y-2">
                          {/* Name */}
                          <div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">
                              Full Name
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                              {currentUser?.profile?.first_name &&
                              currentUser?.profile?.last_name
                                ? `${currentUser.profile?.first_name} ${
                                    currentUser.profile?.middle_name
                                      ? currentUser.profile?.middle_name[0] +
                                        "."
                                      : ""
                                  } ${currentUser.profile?.last_name}`.trim()
                                : currentUser?.name || "NOT PROVIDED"}
                            </div>
                          </div>

                          {/* Position */}
                          <div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">
                              Position
                            </div>
                            <div className="text-xs font-semibold text-gray-800">
                              {currentUser?.employment?.rank_name || "SEAFARER"}
                            </div>
                          </div>

                          {/* Two Column Layout for IDs */}
                          <div className="grid grid-cols-2 gap-1 sm:gap-2 pt-1">
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-semibold">
                                Crew ID
                              </div>
                              <div className="text-xs font-mono font-bold text-gray-900">
                                {currentUser?.profile?.crew_id || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-semibold">
                                SRN
                              </div>
                              <div className="text-xs font-mono font-bold text-gray-900">
                                {currentUser?.profile?.srn || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Email Section */}
                      <div className="mt-2 sm:mt-3 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500 uppercase font-semibold">
                          Email Address
                        </div>
                        <div className="text-xs font-semibold text-gray-800 truncate overflow-hidden">
                          {currentUser?.email || "NOT PROVIDED"}
                        </div>
                      </div>
                    </div>

                    {/* Security Stripe */}
                    <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"></div>

                    {/* Flip Indicator */}
                    <div className="absolute bottom-2 right-2 bg-black/20 rounded-full p-1">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div
                    className={`absolute inset-0 w-full h-full backface-hidden rounded-xl shadow-2xl overflow-hidden border border-gray-200 rotate-y-180 ${
                      isCardFlipped ? "" : "rotate-y-180"
                    }`}
                    style={{
                      background: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8)), url("/anchor.jpg")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    {/* Back Header */}
                    <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-xs font-bold">
                            NYK-FIL CREW PORTAL
                          </div>
                          <div className="text-gray-200 text-xs">
                            QR CODE VERIFICATION
                          </div>
                        </div>
                        <div className="text-white text-xs">BACK</div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 sm:p-4 bg-white flex-1 flex flex-col">
                      <div className="flex-1 flex flex-col items-center justify-center">
                        {/* QR Code */}
                        <div className="bg-white p-2 sm:p-3 border-2 border-gray-300 rounded-lg shadow-inner">
                          {qrCodeDataUrl ? (
                            <Image
                              src={qrCodeDataUrl}
                              alt={`QR Code for Crew ID: ${
                                currentUser?.profile?.crew_id || "N/A"
                              }`}
                              width={96}
                              height={96}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded"
                            />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-900 rounded flex items-center justify-center">
                              <div className="text-white text-xs">
                                Loading...
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Crew ID Info */}
                        <div className="mt-3 text-center px-2">
                          <div className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                            Crew ID: {currentUser?.profile?.crew_id || "N/A"}
                          </div>
                          <div className="text-xs text-gray-600">
                            Scan for secure verification
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Stripe */}
                    <div className="h-1 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600"></div>

                    {/* Flip Indicator */}
                    <div className="absolute bottom-2 right-2 bg-black/20 rounded-full p-1">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-center mt-2">
                  <div className="text-xs text-gray-500">
                    💡 Click the card to flip and view QR code
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Stats Cards */}
            <div
              className={`mb-6 sm:mb-8 transform transition-all duration-1000 delay-500 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-3 sm:px-6 lg:px-8">
                {/* Active Documents */}
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3 flex-shrink-0">
                      <i className="bi bi-file-earmark-check text-green-600 text-sm sm:text-lg"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        8
                      </p>
                      <p className="text-xs text-gray-600">Active Docs</p>
                    </div>
                  </div>
                </div>

                {/* Pending Items */}
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3 flex-shrink-0">
                      <i className="bi bi-clock text-yellow-600 text-sm sm:text-lg"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        3
                      </p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                  </div>
                </div>

                {/* Expiring Soon */}
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-orange-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3 flex-shrink-0">
                      <i className="bi bi-exclamation-triangle text-orange-600 text-sm sm:text-lg"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        2
                      </p>
                      <p className="text-xs text-gray-600">Expiring</p>
                    </div>
                  </div>
                </div>

                {/* Profile Complete */}
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3 flex-shrink-0">
                      <i className="bi bi-person-badge text-blue-600 text-sm sm:text-lg"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        85%
                      </p>
                      <p className="text-xs text-gray-600">Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="">
          {/* Quick Actions */}
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

              {/* Recent Activities */}
              <div
                className={`mt-8 transform transition-all duration-1000 delay-700 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  Recent Activities
                </h2>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
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
                          <p className="text-xs text-gray-500 mt-2">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Helpful Tips */}
              <div
                className={`mt-6 sm:mt-8 transform transition-all duration-1000 delay-800 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-100">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="bg-blue-500 rounded-lg p-2 sm:p-3 flex-shrink-0">
                      <i className="bi bi-lightbulb text-white text-sm sm:text-lg"></i>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                        💡 Helpful Tip
                      </h3>
                      <p className="text-gray-700 text-xs sm:text-sm mb-3">
                        Keep your documents up to date to ensure smooth
                        operations. Check expiration dates regularly and upload
                        renewals promptly.
                      </p>
                      <div className="flex items-center text-xs sm:text-sm text-blue-600">
                        <i className="bi bi-info-circle mr-2 flex-shrink-0"></i>
                        <span>
                          Click on your ID card above to view the QR code
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
