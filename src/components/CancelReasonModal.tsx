"use client";

import { X } from "lucide-react";

interface CancelReasonModalProps {
  title?: string;
  description?: string;
  reason: string;
  setReason: (value: string) => void;
  onClose: () => void;
  onProceed: () => void;
}

export default function CancelReasonModal({
  title = "Cancel Appointment",
  description = "Please provide a reason for cancelling this appointment. This action cannot be undone.",
  reason,
  setReason,
  onClose,
  onProceed,
}: CancelReasonModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-3">{description}</p>

        <textarea
          className="w-full min-h-[120px] resize-none rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Enter cancellation reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>

          <button
            onClick={onProceed}
            disabled={!reason.trim()}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${
              reason.trim()
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
