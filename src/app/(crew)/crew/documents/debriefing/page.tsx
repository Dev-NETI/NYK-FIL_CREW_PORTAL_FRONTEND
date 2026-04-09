"use client";

import { useState } from "react";
import DebriefingListComponent from "@/components/crew/documents/debriefing/list/DebriefingListComponent";
import CrewDebriefingFormModal from "@/components/crew/documents/debriefing/form/CrewDebriefingFormModal";

export default function DebriefingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeFormId, setActiveFormId] = useState<number | undefined>(
    undefined,
  );

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-100 pt-[20px] sm:pt-16 pb-28 md:pb-8">
      {/* ── Hero Banner ── */}
      <div className="bg-[#0a1628] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-amber-500/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-amber-400/10 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <i className="bi bi-journal-text text-amber-400 text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Debriefing
            </h1>
            <p className="text-amber-300/80 text-sm mt-0.5">
              Create, submit, and download your confirmed debriefing form
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* New / Continue Draft Card */}
        <button
          onClick={() => {
            setActiveFormId(undefined);
            setIsModalOpen(true);
          }}
          className="w-full group text-left"
        >
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md active:scale-[0.99] transition-all duration-200">
            {/* Top accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-600" />

            <div className="p-5 flex items-center gap-4">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                <i className="bi bi-plus-circle-fill text-amber-600 text-2xl"></i>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-0.5">
                  Create
                </p>
                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  New / Continue Draft
                </h2>
                <p className="text-sm text-gray-500 mt-1 leading-snug">
                  Start a new debriefing form or resume an existing draft
                </p>
              </div>

              {/* Arrow */}
              <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-700 transition-colors shadow-sm">
                <i className="bi bi-arrow-right text-white text-base"></i>
              </div>
            </div>

            {/* Info strip */}
            <div className="px-5 pb-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <i className="bi bi-file-earmark-text text-gray-400"></i>
                <span>Fill out debriefing form</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <i className="bi bi-send text-gray-400"></i>
                <span>Submit for confirmation</span>
              </div>
            </div>
          </div>
        </button>

        {/* Quick tips card */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <i className="bi bi-lightbulb-fill text-amber-500 text-sm"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">
              Quick Tip
            </p>
            <p className="text-sm text-amber-700 leading-snug">
              Complete your debriefing form as soon as possible after your
              voyage. Once confirmed, you can download a copy for your records.
            </p>
          </div>
        </div>

        {/* Debriefing Records */}
        <DebriefingListComponent key={refreshKey} />
      </div>

      <CrewDebriefingFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          handleSuccess();
        }}
        formId={activeFormId}
      />
    </div>
  );
}
