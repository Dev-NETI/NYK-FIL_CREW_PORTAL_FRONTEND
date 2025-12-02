"use client";

import { useState } from "react";
import CertificateListComponent from "@/components/crew/documents/certificate/CertificateListComponent";
import CrewCertificateFormComponent from "@/components/crew/documents/certificate/CrewCertificateFormComponent";

export default function CertificatePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock data for summary cards - will be replaced with actual API calls
  const [certificates] = useState([
    {
      id: 1,
      name: "STCW Basic Safety Training",
      status: "valid",
    },
    {
      id: 2,
      name: "Certificate of Competency",
      status: "valid",
    },
    {
      id: 3,
      name: "Advanced Fire Fighting",
      status: "expiring_soon",
    },
    {
      id: 4,
      name: "Medical First Aid",
      status: "expired",
    },
  ]);

  const handleAddSuccess = () => {
    setRefreshKey((prev) => prev + 1); // Trigger refresh of certificate list
  };

  // TODO: Get actual crew_id from auth context
  const crewId = "CR-001"; // Replace with actual crew_id

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="bi bi-award text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Certificates
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage certificates
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <i className="bi bi-plus-circle text-lg"></i>
              <span className="hidden sm:inline">Add Certificate</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Certificates List */}
        <CertificateListComponent key={refreshKey} />
      </div>

      {/* Add Certificate Modal */}
      <CrewCertificateFormComponent
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        crewId={crewId}
      />
    </div>
  );
}
