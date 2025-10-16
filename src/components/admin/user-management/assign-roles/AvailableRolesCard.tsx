"use client";

import { useState, useMemo } from "react";
import { Shield, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Role } from "@/services/role";
import { motion, AnimatePresence } from "framer-motion";

interface AvailableRolesCardProps {
  availableRoles: Role[];
  onAssignRole: (roleId: number) => void;
  saving: boolean;
}

export default function AvailableRolesCard({
  availableRoles,
  onAssignRole,
  saving,
}: AvailableRolesCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredRoles = useMemo(() => {
    return availableRoles.filter((role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableRoles, searchQuery]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoles = filteredRoles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Available Roles ({filteredRoles.length})
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search available roles..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-3 min-h-[400px]">
        {filteredRoles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>
              {searchQuery
                ? "No roles found matching your search"
                : "All roles have been assigned"}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {paginatedRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-gray-400 mr-3" />
                    <p className="font-medium text-gray-900">{role.name}</p>
                  </div>
                  <button
                    onClick={() => onAssignRole(role.id)}
                    disabled={saving}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Assign role"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
