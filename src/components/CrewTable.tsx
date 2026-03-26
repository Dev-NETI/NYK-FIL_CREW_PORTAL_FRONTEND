"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import { PaginationInfo, User } from "@/types/api";
import { RankService, Rank } from "@/services/rank";
import { FleetService, Fleet } from "@/services/fleet";

interface CrewTableProps {
  crews: User[];
  currentPage: number;
  itemsPerPage: number;
  pagination?: PaginationInfo | null;
  searchTerm?: string;
  rankFilter?: string;
  fleetFilter?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  loading?: boolean;
  onPageChange: (page: number) => void;
  onSearchChange?: (searchTerm: string) => void;
  onRankFilterChange?: (rankId: string) => void;
  onFleetFilterChange?: (fleetId: string) => void;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

export default function CrewTable({
  crews,
  currentPage,
  itemsPerPage,
  pagination,
  searchTerm: externalSearchTerm = "",
  rankFilter: externalRankFilter = "all",
  fleetFilter: externalFleetFilter = "all",
  sortBy = "created_at",
  sortOrder = "desc",
  loading = false,
  onPageChange,
  onSearchChange,
  onRankFilterChange,
  onFleetFilterChange,
  onSortChange,
}: CrewTableProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(externalSearchTerm);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const router = useRouter();

  useEffect(() => {
    setLocalSearchTerm(externalSearchTerm);
  }, [externalSearchTerm]);

  useEffect(() => {
    RankService.getRanks().then((res) => {
      if (res.success)
        setRanks([...res.data].sort((a, b) => a.name.localeCompare(b.name)));
    });
    FleetService.getFleets().then((res) => {
      if (res.success) setFleets(res.data);
    });
  }, []);

  const getUserName = (user: User): string => {
    return (
      user.profile?.full_name ||
      `${user.profile?.first_name || ""} ${user.profile?.middle_name || ""} ${
        user.profile?.last_name || ""
      }`.trim() ||
      user.profile?.first_name ||
      user.email
    );
  };

  const getUserPosition = (user: User): string => {
    return (
      user.profile?.rank_name || user.employment?.rank_name || "Not assigned"
    );
  };

  const getUserFleet = (user: User): string => {
    return user.profile?.fleet_name || user.employment?.fleet_name || "Not assigned";
  };

  const getUserStatus = (user: User): string => {
    return user.employment?.crew_status || "active";
  };

  const paginatedCrews = crews;
  const totalPages =
    pagination?.last_page || Math.ceil(crews.length / itemsPerPage);
  const totalItems = pagination?.total || crews.length;

  const handleSearchSubmit = () => {
    onSearchChange?.(localSearchTerm);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    onSearchChange?.("");
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleSortClick = (column: string) => {
    const newSortOrder =
      sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    onSortChange?.(column, newSortOrder);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      on_leave: "bg-yellow-100 text-yellow-800",
      on_vacation: "bg-yellow-100 text-yellow-800",
    };

    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-lg">
      {/* Header with Search and Filters */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Crew Members
            </h2>

            {/* Search */}
            <div className="relative w-full sm:w-auto flex">
              <div className="relative flex-1">
                <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search crew members..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full sm:w-64 pl-10 pr-10 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {localSearchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    <i className="bi bi-x-circle text-sm"></i>
                  </button>
                )}
              </div>
              <button
                onClick={handleSearchSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
                title="Search"
              >
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            {/* Department (Fleet) Filter */}
            <select
              value={externalFleetFilter}
              onChange={(e) => onFleetFilterChange?.(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Fleets</option>
              {fleets.map((fleet) => (
                <option key={fleet.id} value={fleet.id.toString()}>
                  {fleet.name}
                </option>
              ))}
            </select>

            {/* Position (Rank) Filter */}
            <select
              value={externalRankFilter}
              onChange={(e) => onRankFilterChange?.(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Positions</option>
              {ranks.map((rank) => (
                <option key={rank.id} value={rank.id.toString()}>
                  {rank.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortClick("first_name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {sortBy === "first_name" && (
                    <i
                      className={`bi bi-chevron-${
                        sortOrder === "asc" ? "up" : "down"
                      } text-xs`}
                    ></i>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSortClick("email")}
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  {sortBy === "email" && (
                    <i
                      className={`bi bi-chevron-${
                        sortOrder === "asc" ? "up" : "down"
                      } text-xs`}
                    ></i>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fleet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedCrews.map((user) => {
              const name = getUserName(user);
              const position = getUserPosition(user);
              const fleet = getUserFleet(user);
              const status = getUserStatus(user);

              return (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{fleet}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        status,
                      )}`}
                    >
                      {status
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/admin/crew/${user.id}`)}
                        className="text-green-600 hover:text-green-900 transition-colors duration-200"
                        title="View crew details"
                      >
                        <i className="bi bi-eye text-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <div className="space-y-3 p-4">
          {paginatedCrews.map((user) => {
            const name = getUserName(user);
            const position = getUserPosition(user);
            const fleet = getUserFleet(user);
            const status = getUserStatus(user);

            return (
              <div
                key={user.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {name}
                      </h3>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/crew/${user.id}`)}
                      className="text-green-600 hover:text-green-900 transition-colors duration-200 p-1"
                      title="View crew details"
                    >
                      <i className="bi bi-eye text-lg"></i>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Position:</span>
                    <p className="font-medium text-gray-900">{position}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fleet:</span>
                    <p className="font-medium text-gray-900">{fleet}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        status,
                      )}`}
                    >
                      {status
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
      />

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading crew members...</p>
        </div>
      )}

      {!loading && crews.length === 0 && (
        <div className="text-center py-12">
          <i className="bi bi-people text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No crew members found</p>
        </div>
      )}
    </div>
  );
}
