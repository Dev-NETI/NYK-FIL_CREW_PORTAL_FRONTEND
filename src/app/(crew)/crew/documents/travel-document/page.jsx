"use client";
import Navigation from "@/components/Navigation";
import TravelDocumentListComponent from "@/components/crew/documents/travel-document/TravelDocumentListComponent";

export default function TravelDocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPath="/crew/documents" />

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-start sm:items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="bi bi-passport text-white text-xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    Travel Documents
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">
                    View and manage your travel-related documents
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <TravelDocumentListComponent />
        </div>
      </div>
    </div>
  );
}
