"use client";
import { motion } from "motion/react";
import TravelDocumentListComponent from "@/components/crew/documents/travel-document/TravelDocumentListComponent";
import { useRouter } from "next/navigation";

export default function TravelDocumentsPage() {
  const router = useRouter();
  return (
    <div
      className="min-h-screen pt-15 flex flex-col bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{ backgroundImage: "url('/home1.png')" }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Header */}
      <motion.div
        className="relative z-10 px-4 sm:px-6 py-8 sm:py-12"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <i className="bi bi-arrow-left text-xl text-white"></i>
            </button>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
              <i className="bi bi-folder-fill text-2xl sm:text-3xl text-blue-400"></i>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Travel Documents
              </h1>
              <p className="text-sm sm:text-base text-white/60 mt-0.5">
                View and manage your travel-related documents
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-8 bg-blue-900/90 rounded-t-4xl">
        <div className="max-w-4xl mx-auto">
          {/* Documents List */}
          <TravelDocumentListComponent />
        </div>
      </div>
    </div>
  );
}
