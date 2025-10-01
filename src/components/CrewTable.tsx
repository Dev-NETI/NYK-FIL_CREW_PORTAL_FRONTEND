"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";

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

interface CrewTableProps {
  crews: Crew[];
  onEdit: (crew: Crew) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function CrewTable({
  crews,
  onEdit,
  onDelete,
  currentPage,
  itemsPerPage,
  onPageChange,
}: CrewTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();

  const filteredCrews = useMemo(() => {
    return crews.filter((crew) => {
      const matchesSearch =
        crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crew.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || crew.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [crews, searchTerm, statusFilter]);

  const paginatedCrews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCrews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCrews, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCrews.length / itemsPerPage);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onPageChange(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    onPageChange(1);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
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
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Crew Members
          </h2>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search crew members..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedCrews.map((crew) => (
              <tr
                key={crew.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {crew.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {crew.name}
                      </div>
                      <div className="text-sm text-gray-500">{crew.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{crew.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{crew.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                      crew.status
                    )}`}
                  >
                    {crew.status
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(crew.joinDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/crew/${crew.id}`)}
                      className="text-green-600 hover:text-green-900 transition-colors duration-200"
                      title="View crew details"
                    >
                      <i className="bi bi-eye text-lg"></i>
                    </button>
                    <button
                      onClick={() => onEdit(crew)}
                      className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                      title="Edit crew member"
                    >
                      <i className="bi bi-pencil-square text-lg"></i>
                    </button>
                    <button
                      onClick={() => onDelete(crew.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Delete crew member"
                    >
                      <i className="bi bi-trash3 text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <div className="space-y-3 p-4">
          {paginatedCrews.map((crew) => (
            <div
              key={crew.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {crew.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {crew.name}
                    </h3>
                    <p className="text-xs text-gray-500">{crew.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/admin/crew/${crew.id}`)}
                    className="text-green-600 hover:text-green-900 transition-colors duration-200 p-1"
                    title="View crew details"
                  >
                    <i className="bi bi-eye text-lg"></i>
                  </button>
                  <button
                    onClick={() => onEdit(crew)}
                    className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1"
                    title="Edit crew member"
                  >
                    <i className="bi bi-pencil-square text-lg"></i>
                  </button>
                  <button
                    onClick={() => onDelete(crew.id)}
                    className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1"
                    title="Delete crew member"
                  >
                    <i className="bi bi-trash3 text-lg"></i>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Position:</span>
                  <p className="font-medium text-gray-900">{crew.position}</p>
                </div>
                <div>
                  <span className="text-gray-500">Department:</span>
                  <p className="font-medium text-gray-900">{crew.department}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                      crew.status
                    )}`}
                  >
                    {crew.status
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Join Date:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(crew.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        totalItems={filteredCrews.length}
      />

      {filteredCrews.length === 0 && (
        <div className="text-center py-12">
          <i className="bi bi-people text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No crew members found</p>
        </div>
      )}
    </div>
  );
}
