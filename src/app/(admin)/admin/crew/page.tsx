"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import CrewTable from "@/components/CrewTable";
import { UserService } from "@/services";
import { User, PaginationInfo } from "@/types/api";
import toast from "react-hot-toast";

export default function CrewManagement() {
  const [crews, setCrews] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("first_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Load crew data from API with current filters and pagination
  const loadCrewData = useCallback(
    async (resetPage = false) => {
      try {
        setLoading(true);
        const pageToLoad = resetPage ? 1 : currentPage;

        const response = await UserService.getAllCrew({
          page: pageToLoad,
          per_page: itemsPerPage,
          search: searchTerm,
          status: statusFilter,
          sort_by: sortBy,
          sort_order: sortOrder,
        });

        if (response.success && response.crew) {
          setCrews(response.crew);
          setPagination(response.pagination || null);

          if (resetPage && pageToLoad !== currentPage) {
            setCurrentPage(pageToLoad);
          }

          // Only show success toast on initial load
          if (!isLoaded) {
            toast.success("Crew data loaded successfully");
          }
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
    },
    [currentPage, itemsPerPage, searchTerm, statusFilter, sortBy, sortOrder]
  );

  // Load data when dependencies change
  useEffect(() => {
    loadCrewData();
  }, [loadCrewData]);

  // Handle filter changes (reset to page 1)
  const handleSearchChange = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback(
    (newSortBy: string, newSortOrder: "asc" | "desc") => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      setCurrentPage(1);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href="/admin/crew/profile-update-approvals"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <i className="bi bi-check-circle mr-2"></i>
                    Profile Approvals
                  </Link>
                </div>
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
                pagination={pagination}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onPageChange={handlePageChange}
                onSearchChange={handleSearchChange}
                onStatusFilterChange={handleStatusFilterChange}
                onSortChange={handleSortChange}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
