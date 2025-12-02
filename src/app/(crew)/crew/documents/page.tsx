"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function DocumentsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const documentCategories = [
    {
      id: "employment",
      title: "Employment Documents",
      description: "Contracts, COC, COE, and employment-related documents",
      icon: "💼",
      path: "/crew/documents/employment-document",
      color: "from-blue-500 to-blue-700",
      hoverColor: "hover:from-blue-600 hover:to-blue-800",
    },
    {
      id: "certificates",
      title: "Certificates",
      description: "Training certificates, licenses, and qualifications",
      icon: "🎓",
      path: "/crew/documents/certificate",
      color: "from-green-500 to-green-700",
      hoverColor: "hover:from-green-600 hover:to-green-800",
    },
    {
      id: "travel",
      title: "Travel Documents",
      description: "Passport, visas, seaman's book, and travel permits",
      icon: "✈️",
      path: "/crew/documents/travel-document",
      color: "from-purple-500 to-purple-700",
      hoverColor: "hover:from-purple-600 hover:to-purple-800",
    },
  ];

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation currentPath="/crew/documents" />

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div
            className={`text-center mb-12 sm:mb-16 lg:mb-20 transform transition-all duration-1000 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Document Management
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Access and manage your employment, certificate, and travel
              documents
            </p>
          </div>

          {/* Document Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-24">
            {documentCategories.map((category, index) => (
              <div
                key={category.id}
                className={`transform transition-all duration-1000 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${(index + 1) * 150}ms` }}
              >
                <button
                  onClick={() => handleNavigate(category.path)}
                  className="w-full h-full group"
                >
                  <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} ${category.hoverColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />

                    {/* Content */}
                    <div className="relative z-10 p-8 sm:p-10 flex flex-col items-center text-center h-full">
                      {/* Icon */}
                      <div className="text-6xl sm:text-7xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        {category.icon}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-3">
                        {category.title}
                      </h2>

                      {/* Description */}
                      <p className="text-sm sm:text-base text-gray-600 group-hover:text-white/90 transition-colors duration-300 mb-6 flex-grow">
                        {category.description}
                      </p>

                      {/* Action Button */}
                      <div className="flex items-center space-x-2 text-gray-900 group-hover:text-white transition-colors duration-300 font-medium">
                        <span>View Documents</span>
                        <svg
                          className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Border Highlight */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-2xl transition-all duration-300" />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
