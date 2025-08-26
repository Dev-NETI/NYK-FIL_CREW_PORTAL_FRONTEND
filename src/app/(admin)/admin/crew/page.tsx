"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import CrewTable from "@/components/CrewTable";
import CrewForm from "@/components/CrewForm";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<Crew | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCrewId, setDeletingCrewId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mock data - In a real app, this would come from an API
  useEffect(() => {
    const mockCrews: Crew[] = [
      {
        id: "1",
        name: "John Smith",
        position: "Ship Captain",
        department: "Operations",
        status: "active",
        joinDate: "2022-01-15",
        email: "john.smith@nykfil.com",
        phone: "+63-912-345-6789",
      },
      {
        id: "2",
        name: "Maria Garcia",
        position: "Chief Engineer",
        department: "Engineering",
        status: "active",
        joinDate: "2021-08-20",
        email: "maria.garcia@nykfil.com",
        phone: "+63-917-234-5678",
      },
      {
        id: "3",
        name: "David Johnson",
        position: "Safety Officer",
        department: "Safety",
        status: "on_leave",
        joinDate: "2020-05-10",
        email: "david.johnson@nykfil.com",
        phone: "+63-920-123-4567",
      },
      {
        id: "4",
        name: "Sarah Lee",
        position: "Navigator",
        department: "Operations",
        status: "active",
        joinDate: "2023-02-28",
        email: "sarah.lee@nykfil.com",
        phone: "+63-918-345-6789",
      },
      {
        id: "5",
        name: "Robert Chen",
        position: "HR Manager",
        department: "Human Resources",
        status: "inactive",
        joinDate: "2019-11-05",
        email: "robert.chen@nykfil.com",
        phone: "+63-915-678-9012",
      },
    ];

    setCrews(mockCrews);
    setIsLoaded(true);
  }, []);

  const handleAddCrew = () => {
    setEditingCrew(null);
    setIsFormOpen(true);
  };

  const handleEditCrew = (crew: Crew) => {
    setEditingCrew(crew);
    setIsFormOpen(true);
  };

  const handleSaveCrew = (crewData: Omit<Crew, "id"> | Crew) => {
    if ("id" in crewData) {
      // Editing existing crew
      setCrews((prev) =>
        prev.map((crew) => (crew.id === crewData.id ? crewData : crew))
      );
    } else {
      // Adding new crew
      const newCrew: Crew = {
        ...crewData,
        id: Date.now().toString(), // Simple ID generation for demo
      };
      setCrews((prev) => [...prev, newCrew]);
    }

    setIsFormOpen(false);
    setEditingCrew(null);
  };

  const handleDeleteCrew = (id: string) => {
    setDeletingCrewId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCrew = () => {
    if (deletingCrewId) {
      setCrews((prev) => prev.filter((crew) => crew.id !== deletingCrewId));
      setIsDeleteModalOpen(false);
      setDeletingCrewId(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingCrewId(null);
  };

  const deletingCrew = crews.find((crew) => crew.id === deletingCrewId);

  return (
    <>
      <Navigation currentPath="/admin/crew" />
      <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-8">
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
                <button
                  onClick={handleAddCrew}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <i className="bi bi-plus-circle text-lg"></i>
                  <span className="hidden xs:inline">Add New Crew Member</span>
                  <span className="xs:hidden">Add Crew</span>
                </button>
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
                    On Leave
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
                onEdit={handleEditCrew}
                onDelete={handleDeleteCrew}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Crew Form Modal */}
      <CrewForm
        crew={editingCrew}
        onSave={handleSaveCrew}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingCrew(null);
        }}
        isOpen={isFormOpen}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onConfirm={confirmDeleteCrew}
        onCancel={cancelDelete}
        title="Delete Crew Member"
        message={
          deletingCrew
            ? `Are you sure you want to delete "${deletingCrew.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this crew member?"
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
