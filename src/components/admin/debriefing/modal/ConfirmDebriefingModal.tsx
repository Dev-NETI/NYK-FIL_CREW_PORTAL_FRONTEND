"use client";

import { X, FileCheck2 } from "lucide-react";

interface ConfirmDebriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  formId?: number;
}

export default function ConfirmDebriefingModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  formId,
}: ConfirmDebriefingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
              <FileCheck2 className="text-green-700" size={20} />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-gray-900">Confirm Debriefing Form</p>
              <p className="text-xs text-gray-500">
                {formId ? `Form #${formId}` : "This will lock the form for edits."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Close"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-gray-700">
            Once confirmed, the form becomes <span className="font-semibold">read-only</span> and the
            system will start generating the official PDF.
          </p>

          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-3">
            <p className="text-xs text-amber-800">
              PDF generation may take a moment. You can keep this page open — the status will update
              automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              loading
                ? "bg-green-200 text-green-800 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                Confirming…
              </>
            ) : (
              <>
                <FileCheck2 size={16} />
                Confirm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
