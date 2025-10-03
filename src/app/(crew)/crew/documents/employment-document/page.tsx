"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import EmploymentDocumentListComponent from "@/components/crew/documents/employment-document/EmploymentDocumentListComponent";
import { AuthService } from "@/services";
import { User } from "@/types/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface EmploymentDocument {
  id: number;
  documentType: string;
  documentNumber: string;
  createdAt: string;
  modifiedBy: string;
  icon: string;
  color: string;
}

export default function EmploymentDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  // Sample employment documents data
  const employmentDocuments: EmploymentDocument[] = [
    {
      id: 1,
      documentType: "TIN",
      documentNumber: "SB-2024-001234",
      createdAt: "2024-01-15T08:30:00",
      modifiedBy: "Admin User",
      icon: "bi-file-earmark-text",
      color: "blue",
    },
    {
      id: 2,
      documentType: "SSS",
      documentNumber: "P1234567890",
      createdAt: "2024-03-10T14:20:00",
      modifiedBy: "HR Department",
      icon: "bi-file-earmark-text",
      color: "green",
    },
    {
      id: 3,
      documentType: "PAG-IBIG",
      documentNumber: "MC-2024-567890",
      createdAt: "2024-04-22T10:15:00",
      modifiedBy: "Medical Officer",
      icon: "bi-file-earmark-text",
      color: "purple",
    },
    {
      id: 4,
      documentType: "PHILHEALTH",
      documentNumber: "STCW-2024-789012",
      createdAt: "2024-05-05T16:45:00",
      modifiedBy: "Training Officer",
      icon: "bi-file-earmark-text",
      color: "orange",
    },
    {
      id: 5,
      documentType: "SRN",
      documentNumber: "COE-2024-345678",
      createdAt: "2024-06-12T09:00:00",
      modifiedBy: "HR Manager",
      icon: "bi-file-earmark-text",
      color: "indigo",
    },
  ];

  useEffect(() => {
    const initializePage = async () => {
      try {
        const userData = AuthService.getStoredUser();
        if (!userData) {
          toast.error("Authentication required");
          router.push("/login");
          return;
        }
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

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
                  <i className="bi bi-file-earmark-text text-white text-xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    Employment Documents
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base mt-1">
                    View and manage your employment-related documents
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  toast.success("Create document feature coming soon!")
                }
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 flex-shrink-0"
              >
                <i className="bi bi-plus-circle text-lg"></i>
                <span className="hidden sm:inline">Create Document</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">
                  Total Documents
                </p>
                <p className="text-4xl font-bold">
                  {employmentDocuments.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <i className="bi bi-files text-3xl"></i>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <EmploymentDocumentListComponent documents={employmentDocuments} />
        </div>
      </div>
    </div>
  );
}
