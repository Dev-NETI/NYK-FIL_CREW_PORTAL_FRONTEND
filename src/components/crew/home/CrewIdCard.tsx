"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { User } from "@/types/api";

interface CrewIdCardProps {
  user: User | null;
  isLoaded?: boolean;
}

export default function CrewIdCard({ user, isLoaded = true }: CrewIdCardProps) {
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
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
  }, [user]);

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
                          {user?.profile?.first_name &&
                          user?.profile?.last_name
                            ? `${user.profile.first_name[0]}${user.profile?.last_name[0]}`
                            : user?.name
                            ? user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            : user?.email?.[0]?.toUpperCase() ||
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
                        {user?.profile?.first_name &&
                        user?.profile?.last_name
                          ? `${user.profile?.first_name} ${
                              user.profile?.middle_name
                                ? user.profile?.middle_name[0] +
                                  "."
                                : ""
                            } ${user.profile?.last_name}`.trim()
                          : user?.name || "NOT PROVIDED"}
                      </div>
                    </div>

                    {/* Position */}
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">
                        Position
                      </div>
                      <div className="text-xs font-semibold text-gray-800">
                        {user?.employment?.rank_name || "SEAFARER"}
                      </div>
                    </div>

                    {/* Two Column Layout for IDs */}
                    <div className="grid grid-cols-2 gap-1 sm:gap-2 pt-1">
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">
                          Crew ID
                        </div>
                        <div className="text-xs font-mono font-bold text-gray-900">
                          {user?.profile?.crew_id || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-semibold">
                          SRN
                        </div>
                        <div className="text-xs font-mono font-bold text-gray-900">
                          {user?.profile?.srn || "N/A"}
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
                    {user?.email || "NOT PROVIDED"}
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
                          user?.profile?.crew_id || "N/A"
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
                      Crew ID: {user?.profile?.crew_id || "N/A"}
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
    </>
  );
}
