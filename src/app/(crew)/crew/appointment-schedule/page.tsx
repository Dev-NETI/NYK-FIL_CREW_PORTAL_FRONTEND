"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function CrewAppointmentsLandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const appointmentActions = [
    {
      id: "book",
      title: "Book an Appointment",
      description: "Schedule a new appointment with your selected department",
      icon: "📅",
      path: "/crew/appointment-schedule/book",
      color: "from-blue-500 to-blue-700",
      hoverColor: "hover:from-blue-600 hover:to-blue-800",
      actionLabel: "Book Now",
    },
    {
      id: "view",
      title: "View Appointments",
      description: "View and track your upcoming and past appointments",
      icon: "📋",
      path: "/crew/appointment-schedule/list",
      color: "from-green-500 to-green-700",
      hoverColor: "hover:from-green-600 hover:to-green-800",
      actionLabel: "View Appointments",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation currentPath="/crew/appointments" />

      <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          <div
            className={`text-center mb-14 transition-all duration-1000 ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Appointments
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Book new appointments or view your existing schedules
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {appointmentActions.map((item, index) => (
              <div
                key={item.id}
                className={`transition-all duration-1000 ${
                  isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${(index + 1) * 150}ms` }}
              >
                <button
                  onClick={() => handleNavigate(item.path)}
                  className="w-full h-full group"
                >
                  <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${item.color} ${item.hoverColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />

                    <div className="relative z-10 p-10 flex flex-col items-center text-center h-full">
                      <div className="text-6xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                        {item.icon}
                      </div>

                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-3">
                        {item.title}
                      </h2>

                      <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300 mb-8">
                        {item.description}
                      </p>

                      <div className="flex items-center space-x-2 font-medium text-gray-900 group-hover:text-white transition-colors duration-300">
                        <span>{item.actionLabel}</span>
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
