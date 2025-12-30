"use client";

type ConfirmType = "confirm" | "cancel";

interface ConfirmActionModalProps {
  type: ConfirmType;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmActionModal({
  type,
  title,
  message,
  confirmLabel,
  onClose,
  onConfirm,
}: ConfirmActionModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
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
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100 transition"
          >
            No
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${
              isCancel
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
