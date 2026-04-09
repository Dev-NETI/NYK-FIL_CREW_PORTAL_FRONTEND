"use client";

import { useState } from "react";
import CertificateListComponent from "@/components/crew/documents/certificate/CertificateListComponent";
import CrewCertificateFormComponent from "@/components/crew/documents/certificate/CrewCertificateFormComponent";
import { useUser } from "@/hooks/useUser";

export default function CertificatePage() {
  const { user } = useUser();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const crewId = user?.profile?.crew_id;

  return (
    <div className="min-h-screen bg-slate-100 pt-[20px] sm:pt-16 pb-28 md:pb-8">
      {/* ── Hero Banner ── */}
      <div className="bg-[#0a1628] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-500/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-blue-400/10 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <i className="bi bi-award text-blue-400 text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Certificates
            </h1>
            <p className="text-blue-300/80 text-sm mt-0.5">
              Manage and track your maritime certificates
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Add Certificate Card */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full group text-left"
        >
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-200">
            {/* Top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-700" />

            <div className="p-5 flex items-center gap-4">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <i className="bi bi-plus-circle-fill text-blue-600 text-2xl"></i>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-0.5">
                  Upload
                </p>
                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  Add Certificate
                </h2>
                <p className="text-sm text-gray-500 mt-1 leading-snug">
                  Upload a new certificate to your records
                </p>
              </div>

              {/* Arrow */}
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700 transition-colors shadow-sm">
                <i className="bi bi-arrow-right text-white text-base"></i>
              </div>
            </div>

            {/* Info strip */}
            <div className="px-5 pb-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <i className="bi bi-file-earmark-arrow-up text-gray-400"></i>
                <span>Attach certificate file</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <i className="bi bi-calendar-check text-gray-400"></i>
                <span>Set expiry date</span>
              </div>
            </div>
          </div>
        </button>

        {/* Quick tips card */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="bi bi-lightbulb-fill text-blue-500 text-sm"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
              Quick Tip
            </p>
            <p className="text-sm text-blue-700 leading-snug">
              Keep your certificates up to date. Renew expiring certificates
              early to avoid gaps in your eligibility for vessel assignments.
            </p>
          </div>
        </div>

        {/* Certificate List */}
        <CertificateListComponent key={refreshKey} />
      </div>

      {/* Add Certificate Modal */}
      <CrewCertificateFormComponent
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        crewId={crewId}
      />
    </div>
  );
}
