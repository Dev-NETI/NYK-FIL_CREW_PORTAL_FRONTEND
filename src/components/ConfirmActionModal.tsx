"use client";

import { useState } from "react";

type ConfirmType = "confirm" | "cancel";

interface ConfirmActionModalProps {
  type: ConfirmType;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
  );
}

export default function ConfirmActionModal({
  type,
  title,
  message,
  confirmLabel,
  onClose,
  onConfirm,
}: ConfirmActionModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const isCancel = type === "cancel";

  const resolvedTitle =
    title ?? (isCancel ? "Confirm Cancellation" : "Confirm Appointment");

  const resolvedMessage =
    message ??
    (isCancel
      ? "Are you sure you want to cancel this appointment? This action cannot be undone."
      : "Are you sure you want to confirm this appointment?");

  const resolvedConfirmLabel =
    confirmLabel ??
    (isCancel ? "Yes, Cancel Appointment" : "Confirm Appointment");

  const handleConfirm = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => {
          if (submitting) return;
          onClose();
        }}
      />

      <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-fade-in">
        <h2
          className={`text-lg font-semibold mb-3 ${
            isCancel ? "text-red-600" : "text-green-600"
          }`}
        >
          {resolvedTitle}
        </h2>

        <p className="text-sm text-gray-700 mb-6">{resolvedMessage}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className={`px-4 py-2 rounded-lg border border-gray-300 text-sm transition ${
              submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-100"
            }`}
          >
            No
          </button>

          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition inline-flex items-center gap-2 ${
              isCancel
                ? submitting
                  ? "bg-red-600/80 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
                : submitting
                ? "bg-green-600/80 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {submitting && <Spinner />}
            {submitting ? "Processing..." : resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
