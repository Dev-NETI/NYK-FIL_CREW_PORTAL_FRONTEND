"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services";
import { User } from "@/types/api";
import QRCode from "qrcode";
import PageTransition from "@/components/PageTransition";

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const router = useRouter();

  // console.log(currentUser);

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
        description: "View and update your crew information and certifications",
        href: currentUser?.profile?.crew_id
          ? `/crew/profile/${currentUser.profile.crew_id}`
          : "/crew/profile",
        color: "from-blue-500 to-purple-600",
        delay: "delay-100",
      },
      {
        icon: "file-earmark-text",
        title: "Documents",
        description: "Access certificates, contracts, and maritime documents",
        href: "/crew/documents",
        color: "from-green-500 to-blue-500",
        delay: "delay-200",
      },
      {
        icon: "calendar-check",
        title: "Appointment Schedule",
        description: "View upcoming medical exams and appointments",
        href: "/appointment-schedule",
        color: "from-purple-500 to-pink-500",
        delay: "delay-300",
      },
      {
        icon: "megaphone",
        title: "Debriefing / Briefing",
        description: "Access safety briefings and voyage reports",
        href: "/crew/reports",
        color: "from-orange-500 to-red-500",
        delay: "delay-400",
      },
      {
        icon: "currency-dollar",
        title: "Finance",
        description: "View payroll, allotments, and financial statements",
        href: "/crew/finance",
        color: "from-teal-500 to-green-500",
        delay: "delay-500",
      },
      {
        icon: "bell",
        title: "Notifications",
        description: "Important vessel updates, alerts, and announcements",
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
    <PageTransition>
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

      <div className="min-h-screen bg-gray-50">
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
                    Welcome aboard! Manage your maritime career and
                    documentation.
                  </p>
                </div>
              </div>
            </div>

            {/* Maritime ID Card - Flippable */}
            <div
              className={`mb-8 flex justify-center transform transition-all duration-1000 delay-300 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="w-full max-w-md perspective-1000">
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
                    <div className="p-4 bg-white">
                      <div className="flex space-x-4">
                        {/* Photo Section */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-20 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center">
                            <div className="w-14 h-18 bg-gradient-to-b from-blue-500 to-blue-600 rounded flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
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
                        <div className="flex-1 space-y-2">
                          {/* Name */}
                          <div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">
                              Full Name
                            </div>
                            <div className="text-sm font-bold text-gray-900 leading-tight">
                              {currentUser?.first_name && currentUser?.last_name
                                ? `${currentUser.first_name} ${
                                    currentUser.middle_name
                                      ? currentUser.middle_name[0] + "."
                                      : ""
                                  } ${currentUser.last_name}`.trim()
                                : currentUser?.name || "NOT PROVIDED"}
                            </div>
                          </div>

                          {/* Position */}
                          <div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">
                              Position
                            </div>
                            <div className="text-xs font-semibold text-gray-800">
                              {currentUser?.rank_name || "SEAFARER"}
                            </div>
                          </div>

                          {/* Two Column Layout for IDs */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-semibold">
                                Crew ID
                              </div>
                              <div className="text-xs font-mono font-bold text-gray-900">
                                {currentUser?.crew_id || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-semibold">
                                SRN
                              </div>
                              <div className="text-xs font-mono font-bold text-gray-900">
                                {currentUser?.srn || "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Email Section */}
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500 uppercase font-semibold">
                          Email Address
                        </div>
                        <div className="text-xs font-semibold text-gray-800 truncate">
                          {currentUser?.email || "NOT PROVIDED"}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600 font-medium">
                            ACTIVE
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Valid: {new Date().getFullYear()}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          ★ AUTHORIZED ★
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

                    {/* QR Code Section */}
                    <div className="p-6 bg-white flex flex-col items-center justify-center h-full mt-4">
                      {/* QR Code */}
                      <div className="bg-white p-4 border-2 border-gray-300 rounded-lg shadow-inner mt-4">
                        {qrCodeDataUrl ? (
                          <img
                            src={qrCodeDataUrl}
                            alt={`QR Code for Crew ID: ${
                              currentUser?.crew_id || "N/A"
                            }`}
                            className="w-32 h-32 rounded"
                          />
                        ) : (
                          <div
                            className="w-32 h-32 bg-gray-900 rounded flex items-center justify-center"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='qr' width='10' height='10' patternUnits='userSpaceOnUse'%3e%3crect width='5' height='5' fill='%23000'/%3e%3crect x='5' y='5' width='5' height='5' fill='%23000'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100' height='100' fill='url(%23qr)'/%3e%3c/svg%3e")`,
                              backgroundSize: "10px 10px",
                            }}
                          >
                            <div className="text-white text-xs">Loading...</div>
                          </div>
                        )}
                      </div>

                      {/* Crew ID Info */}
                      <div className="mt-4 text-center">
                        <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
                          Crew ID
                        </div>
                        <div className="text-lg font-mono font-bold text-gray-900 mb-2">
                          {currentUser?.crew_id || "N/A"}
                        </div>
                        <div className="text-xs text-gray-600">
                          This QR code contains encrypted crew identification
                          data for security verification purposes.
                        </div>
                      </div>
                    </div>

                    {/* Back Footer */}
                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          📱 Scan to verify
                        </div>
                        <div className="text-xs text-gray-500">
                          Security Level: HIGH
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          🔒 ENCRYPTED
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
                  <button
                    key={index}
                    onClick={() => router.push(`${link.href}?direction=forward`)}
                    className={`w-full transform transition-all duration-700 ${
                      link.delay
                    } ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                  >
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 group">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3 sm:mb-4 transform group-hover:rotate-12 transition-transform duration-300">
                        <i
                          className={`bi bi-${link.icon} text-xl sm:text-2xl text-gray-700`}
                        ></i>
                      </div>
                      <h3 className="text-gray-900 font-semibold text-base sm:text-lg mb-2">
                        {link.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                  </button>
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
                        <i
                          className={`bi bi-${activity.icon} text-lg text-gray-700`}
                        ></i>
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
                <p className="text-gray-600 text-xs sm:text-sm">Days served</p>
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
                      Get help with certificates, documentation, or crew support
                      services
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
    </PageTransition>
  );
}
