import { useState, useEffect, useMemo } from "react";
import CertificateListItemComponent from "./CertificateListItemComponent";
import {
  CrewCertificateService,
  CrewCertificate,
  CrewCertificateFilters,
} from "@/services/crew-certificate";
import {
  CertificateTypeService,
  CertificateType,
} from "@/services/certificate-type";
import { useUser } from "@/hooks/useUser";
import toast from "react-hot-toast";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import CrewCertificateEditModal from "./CrewCertificateEditModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const ITEMS_PER_PAGE = 5;

export default function CertificateListComponent() {
  const { user } = useUser();
  const [certificates, setCertificates] = useState<CrewCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCertificateType, setSelectedCertificateType] =
    useState<string>("");
  const [certificateTypes, setCertificateTypes] = useState<CertificateType[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Shared modals state
  const [editingCertificate, setEditingCertificate] =
    useState<CrewCertificate | null>(null);
  const [deletingCertificate, setDeletingCertificate] =
    useState<CrewCertificate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load certificate types on mount
  useEffect(() => {
    const loadCertificateTypes = async () => {
      try {
        const types = await CertificateTypeService.getCertificateTypes();
        setCertificateTypes(types);
      } catch (error) {
        console.error("Error loading certificate types:", error);
      }
    };
    loadCertificateTypes();
  }, []);

  // Fetch certificates with filters
  const fetchCertificates = async () => {
    if (!user?.profile?.crew_id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const filters: CrewCertificateFilters = {};

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }
      if (selectedCertificateType) {
        filters.certificate_type_id = parseInt(selectedCertificateType);
      }

      const data = await CrewCertificateService.getCrewCertificatesByCrewId(
        user.profile.crew_id,
        filters
      );
      setCertificates(data);
      setCurrentPage(1); // Reset to first page when data changes
    } catch (error: any) {
      console.error("Error fetching certificates:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load certificates"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch certificates when filters change (with debounce for search)
  useEffect(() => {
    if (user?.profile?.crew_id) {
      const debounceTimer = setTimeout(() => {
        fetchCertificates();
      }, 300); // 300ms debounce for search

      return () => clearTimeout(debounceTimer);
    }
  }, [user?.profile?.crew_id, searchTerm, selectedCertificateType]);

  // Calculate pagination
  const totalPages = Math.ceil(certificates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCertificates = useMemo(() => {
    return certificates.slice(startIndex, endIndex);
  }, [certificates, startIndex, endIndex]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCertificateType("");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || selectedCertificateType !== "";

  // Edit/Delete handlers
  const handleEditClick = (certificate: CrewCertificate) => {
    setEditingCertificate(certificate);
  };

  const handleDeleteClick = (certificate: CrewCertificate) => {
    setDeletingCertificate(certificate);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCertificate) return;

    setIsDeleting(true);
    try {
      await CrewCertificateService.deleteCrewCertificate(
        deletingCertificate.id
      );
      toast.success("Certificate deleted successfully!");
      setDeletingCertificate(null);
      fetchCertificates(); // Refresh list
    } catch (error: any) {
      console.error("Error deleting certificate:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete certificate"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setEditingCertificate(null);
    fetchCertificates(); // Refresh list
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search certificates, numbers, or issuing authority..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Certificate Type Filter */}
          <div className="sm:w-64 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedCertificateType}
              onChange={(e) => setSelectedCertificateType(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white"
            >
              <option value="">All Certificate Types</option>
              {certificateTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchTerm.trim() && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-sm font-medium">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-indigo-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCertificateType && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                Type:{" "}
                {
                  certificateTypes.find(
                    (t) => t.id === parseInt(selectedCertificateType)
                  )?.name
                }
                <button
                  onClick={() => setSelectedCertificateType("")}
                  className="hover:text-purple-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 px-2">
        {certificates.length > 0 ? (
          <p>
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {startIndex + 1}-{Math.min(endIndex, certificates.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {certificates.length}
            </span>{" "}
            {certificates.length === 1 ? "certificate" : "certificates"}
            {hasActiveFilters && (
              <span className="text-indigo-600"> (filtered)</span>
            )}
          </p>
        ) : null}
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        {paginatedCertificates.map((cert) => (
          <CertificateListItemComponent
            key={cert.id}
            certificate={{
              id: cert.id,
              name:
                cert.certificate?.name ||
                cert.certificate?.code ||
                `Certificate #${cert.certificate_id}`,
              issueDate: cert.date_issued || "",
              expiryDate: cert.expiry_date || "",
              issuingAuthority: cert.issued_by || "N/A",
              certificateNumber: cert.certificate_no || "N/A",
              status: cert.status || "valid",
              hasFile: cert.has_file || false,
            }}
            certificateData={cert}
            onUpdate={fetchCertificates}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        ))}

        {/* Empty State */}
        {certificates.length === 0 && (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {hasActiveFilters ? (
                <Search className="w-10 h-10 text-gray-400" />
              ) : (
                <i className="bi bi-award text-gray-400 text-4xl"></i>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {hasActiveFilters
                ? "No Certificates Found"
                : "No Certificates Yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters
                ? "Try adjusting your search or filters"
                : "Start by adding your professional certificates and licenses"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {certificates.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-28">
          <div className="flex items-center justify-between">
            {/* Page Info */}
            <div className="text-sm text-gray-600">
              Page{" "}
              <span className="font-semibold text-gray-900">{currentPage}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              {/* Page Numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    // Show ellipsis
                    const showEllipsisBefore =
                      page === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter =
                      page === currentPage + 2 && currentPage < totalPages - 2;

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`min-w-[2.5rem] px-3 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? "bg-indigo-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Mobile: Simple page indicator */}
              <div className="sm:hidden px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                {currentPage} / {totalPages}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Edit Modal */}
      {editingCertificate && (
        <CrewCertificateEditModal
          isOpen={!!editingCertificate}
          onClose={() => setEditingCertificate(null)}
          onSuccess={handleEditSuccess}
          certificate={editingCertificate}
        />
      )}

      {/* Shared Delete Modal */}
      {deletingCertificate && (
        <DeleteConfirmationModal
          isOpen={!!deletingCertificate}
          onClose={() => setDeletingCertificate(null)}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          certificateName={
            deletingCertificate.certificate?.name ||
            deletingCertificate.certificate?.code ||
            "this certificate"
          }
        />
      )}
    </div>
  );
}
