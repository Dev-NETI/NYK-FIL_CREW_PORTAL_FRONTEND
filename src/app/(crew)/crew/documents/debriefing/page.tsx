"use client";

import { useState } from "react";
import DebriefingListComponent from "@/components/crew/documents/debriefing/list/DebriefingListComponent";
import CrewDebriefingFormModal from "@/components/crew/documents/debriefing/form/CrewDebriefingFormModal";

export default function DebriefingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeFormId, setActiveFormId] = useState<number | undefined>(undefined);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="bi bi-journal-text text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Debriefing
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Create, submit, and download your confirmed debriefing form
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveFormId(undefined);
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <i className="bi bi-plus-circle text-lg"></i>
              <span className="hidden sm:inline">New / Continue Draft</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DebriefingListComponent
          key={refreshKey}
        />
      </div>

      <CrewDebriefingFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          handleSuccess();
        }}
        formId={activeFormId}
      />
    </div>
  );
}
