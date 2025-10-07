"use client";

import { useState, useEffect } from "react";
import CrewTable from "@/components/CrewTable";
import { UserService } from "@/services";
import { User } from "@/types/api";
import toast from "react-hot-toast";

interface Crew {
  id: string;
  name: string;
  position: string;
  department: string;
  status: string;
  joinDate: string;
  email: string;
  phone: string;
}

export default function CrewManagement() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Convert User data to Crew format for compatibility with existing components
  const convertUserToCrew = (user: User): Crew => ({
    id: user.id.toString(),
    name:
      user.name ||
      user.profile?.full_name ||
      `${user.profile?.first_name || ""} ${user.profile?.middle_name || ""} ${
        user.profile?.last_name || ""
      }`.trim() ||
      user.profile?.first_name ||
      user.email,
    position:
      user.employment?.rank_name ||
      user.employment?.rank_name ||
      "Not assigned",
    department:
      user.employment?.fleet_name ||
      user.employment?.fleet_name ||
      "Not assigned",
    status:
      user.employment?.crew_status || user.employment?.crew_status || "active",
    joinDate:
      user.employment?.hire_date || user.employment?.hire_date || "Unknown",
    email: user.email,
    phone:
      user.contacts?.mobile_number ||
      user.contacts?.mobile_number ||
      "Not provided",
  });

  // Load crew data from API
  const loadCrewData = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllCrew();

      if (response.success && response.crew) {
        const convertedCrew = response.crew.map(convertUserToCrew);
        setCrews(convertedCrew);
        toast.success("Crew data loaded successfully");
      } else {
        toast.error(response.message || "Failed to load crew data");
      }
    } catch (error) {
      console.error("Error loading crew data:", error);
      toast.error("Failed to load crew data");
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadCrewData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading crew data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50pb-20 md:pb-8">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div
              className={`mb-6 sm:mb-8 transform transition-all duration-1000 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Crew Management
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    Manage your crew members information
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div
              className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 transform transition-all duration-1000 delay-200 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h3 className="text-gray-900 font-semibold text-sm sm:text-base">
                    Total Crew
                  </h3>
                  <span className="text-xl sm:text-2xl">👥</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  {crews.length}
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  All crew members
                </p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h3 className="text-gray-900 font-semibold text-sm sm:text-base">
                    Active
                  </h3>
                  <span className="text-xl sm:text-2xl">✅</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                  {crews.filter((crew) => crew.status === "active").length}
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Currently working
                </p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h3 className="text-gray-900 font-semibold text-sm sm:text-base">
                    On Vacation
                  </h3>
                  <span className="text-xl sm:text-2xl">🏖️</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-yellow-600 mb-1">
                  {crews.filter((crew) => crew.status === "on_leave").length}
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">Taking leave</p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-lg">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h3 className="text-gray-900 font-semibold text-sm sm:text-base">
                    Inactive
                  </h3>
                  <span className="text-xl sm:text-2xl">❌</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">
                  {crews.filter((crew) => crew.status === "inactive").length}
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">Not working</p>
              </div>
            </div>

            {/* Crew Table */}
            <div
              className={`transform transition-all duration-1000 delay-400 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <CrewTable
                crews={crews}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
