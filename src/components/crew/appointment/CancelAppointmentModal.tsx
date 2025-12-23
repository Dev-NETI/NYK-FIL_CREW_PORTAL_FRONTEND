"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => void;
}

export default function CancelAppointmentModal({
  isOpen,
  onClose,
  onConfirm,
}: Props) {
  if (!isOpen) return null;

  let remarks = "";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold text-red-600">
          Cancel Appointment
        </h3>

        <p className="text-sm text-gray-600">
          Please provide a reason for cancellation. This action cannot be undone.
        </p>

        <textarea
          rows={4}
          className="w-full border rounded-lg p-2 text-sm"
          placeholder="Cancellation remarks"
          onChange={(e) => (remarks = e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border"
          >
            Close
          </button>

          <button
            onClick={() => onConfirm(remarks)}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white"
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
