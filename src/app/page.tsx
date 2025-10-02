"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsLoaded(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-md sm:max-w-lg lg:max-w-4xl mx-auto">
          <div
            className={`text-center mb-12 transform transition-all duration-1000 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Welcome to NYK-FIL APPLICATION
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-2 sm:mb-4">
              Your Digital Workplace
            </p>

            <p className="text-gray-500 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
              Streamline your work experience with our comprehensive employee
              management platform
            </p>
          </div>

          <div
            className={`mb-8 sm:mb-12 lg:mb-16 transform transition-all duration-1000 delay-300 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <Link
              href="/login"
              className="w-full sm:max-w-sm lg:max-w-md mx-auto block bg-gray-900 text-white py-4 sm:py-5 lg:py-6 rounded-xl font-semibold text-center shadow-lg hover:bg-gray-800 transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-base sm:text-lg">Get Started</span>
                <span className="text-sm sm:text-base">→</span>
              </div>
            </Link>
          </div>

          <div
            className={`text-center transform transition-all duration-1000 delay-1000 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
}
