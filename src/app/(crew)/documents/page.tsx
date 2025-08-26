"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  status: "approved" | "pending" | "rejected";
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const documents: Document[] = [
    {
      id: "1",
      name: "Employee Handbook 2024.pdf",
      type: "PDF",
      size: "2.4 MB",
      lastModified: "2024-01-15",
      status: "approved",
    },
    {
      id: "2",
      name: "Performance Review Q1.docx",
      type: "DOCX",
      size: "890 KB",
      lastModified: "2024-01-10",
      status: "pending",
    },
    {
      id: "3",
      name: "Project Proposal.xlsx",
      type: "XLSX",
      size: "1.2 MB",
      lastModified: "2024-01-08",
      status: "approved",
    },
    {
      id: "4",
      name: "Contract Amendment.pdf",
      type: "PDF",
      size: "455 KB",
      lastModified: "2024-01-05",
      status: "rejected",
    },
  ];

  const categories = [
    { id: "all", label: "All Documents", count: documents.length },
    {
      id: "approved",
      label: "Approved",
      count: documents.filter((d) => d.status === "approved").length,
    },
    {
      id: "pending",
      label: "Pending",
      count: documents.filter((d) => d.status === "pending").length,
    },
    {
      id: "rejected",
      label: "Rejected",
      count: documents.filter((d) => d.status === "rejected").length,
    },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || doc.status === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "📄";
      case "docx":
      case "doc":
        return "📝";
      case "xlsx":
      case "xls":
        return "📊";
      case "pptx":
      case "ppt":
        return "📈";
      default:
        return "📄";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation currentPath="/documents" />

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-md sm:max-w-lg lg:max-w-6xl mx-auto">
          <div
            className={`flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 lg:mb-10 space-y-4 sm:space-y-0 transform transition-all duration-1000 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                Documents
              </h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                Manage your files securely
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="p-3 sm:p-4 lg:p-5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <span className="text-lg sm:text-xl lg:text-2xl group-hover:rotate-90 transition-transform duration-300">
                ➕
              </span>
            </button>
          </div>

          <div
            className={`mb-6 sm:mb-8 lg:mb-10 transform transition-all duration-1000 delay-200 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 sm:pl-14 lg:pl-16 pr-4 sm:pr-6 lg:pr-8 py-4 sm:py-5 lg:py-6 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base lg:text-lg"
              />
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 lg:pl-6 flex items-center pointer-events-none">
                <span className="text-gray-400 text-lg sm:text-xl lg:text-2xl">
                  🔍
                </span>
              </div>
            </div>
          </div>

          <div
            className={`mb-6 sm:mb-8 lg:mb-10 transform transition-all duration-1000 delay-300 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:space-x-4 gap-2 sm:gap-3 lg:gap-0 lg:overflow-x-auto lg:pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 rounded-xl text-xs sm:text-sm lg:text-base font-medium transition-all duration-300 transform hover:scale-105 lg:flex-shrink-0 ${
                    selectedCategory === category.id
                      ? "bg-gray-900 text-white shadow-lg"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  <span className="block sm:inline">{category.label}</span>
                  <span className="block sm:inline lg:ml-1">
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div
            className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 transform transition-all duration-1000 delay-400 ${
              isLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="text-2xl sm:text-3xl lg:text-4xl transform group-hover:scale-110 transition-transform duration-300">
                    {getFileIcon(document.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate mb-2 sm:mb-3 group-hover:text-gray-700 transition-colors duration-300">
                      {document.name}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-3 sm:mb-4 space-y-1 sm:space-y-0">
                      <span className="text-xs sm:text-sm lg:text-base text-gray-500">
                        {document.size}
                      </span>
                      <span className="text-gray-300 hidden sm:inline">•</span>
                      <span className="text-xs sm:text-sm lg:text-base text-gray-500">
                        {new Date(document.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`inline-flex px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-xs sm:text-sm lg:text-base font-medium rounded-full transition-all duration-300 ${getStatusColor(
                          document.status
                        )}`}
                      >
                        {document.status.charAt(0).toUpperCase() +
                          document.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 sm:space-x-3 mt-4 sm:mt-6">
                  <button className="p-2 sm:p-3 text-gray-400 hover:text-gray-700 transition-all duration-300 hover:scale-110 hover:bg-gray-50 rounded-lg">
                    <span className="text-base sm:text-lg lg:text-xl">👁️</span>
                  </button>
                  <button className="p-2 sm:p-3 text-gray-400 hover:text-gray-700 transition-all duration-300 hover:scale-110 hover:bg-gray-50 rounded-lg">
                    <span className="text-base sm:text-lg lg:text-xl">⬇️</span>
                  </button>
                  <button className="p-2 sm:p-3 text-gray-400 hover:text-gray-700 transition-all duration-300 hover:scale-110 hover:bg-gray-50 rounded-lg">
                    <span className="text-base sm:text-lg lg:text-xl">⋮</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredDocuments.length === 0 && (
              <div className="lg:col-span-2 xl:col-span-3 text-center py-12 sm:py-16 lg:py-20">
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 lg:mb-8 animate-bounce">
                  📂
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-900 mb-2 sm:mb-3 lg:mb-4">
                  No documents found
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm sm:max-w-md lg:max-w-lg w-full">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                  Upload Document
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 sm:p-2"
                >
                  <span className="text-xl sm:text-2xl lg:text-3xl">✕</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 lg:p-10 text-center mb-4 sm:mb-6 lg:mb-8">
                <div className="text-3xl sm:text-4xl lg:text-5xl mb-2 sm:mb-3 lg:mb-4">
                  📎
                </div>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-2 sm:mb-3">
                  Drag & drop files here
                </p>
                <p className="text-xs sm:text-sm lg:text-base text-gray-500">
                  or click to browse
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div>
                  <label className="block text-sm sm:text-base lg:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
                    Category
                  </label>
                  <select className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm sm:text-base lg:text-lg">
                    <option>Personal Documents</option>
                    <option>Work Documents</option>
                    <option>Legal Documents</option>
                    <option>Financial Documents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm sm:text-base lg:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none resize-none text-sm sm:text-base lg:text-lg"
                    placeholder="Optional description..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4 pt-2 sm:pt-4 lg:pt-6">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 py-2 sm:py-3 lg:py-4 px-4 sm:px-6 lg:px-8 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base lg:text-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 py-2 sm:py-3 lg:py-4 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base lg:text-lg font-medium"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
