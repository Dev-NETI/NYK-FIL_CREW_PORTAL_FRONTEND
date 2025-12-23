"use client";

interface ConfirmCancelProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmCancelModal({
  onClose,
  onConfirm,
}: ConfirmCancelProps) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-red-600">
          Confirm Cancellation
        </h2>

        <p className="text-gray-700 mb-6">
          Are you sure you want to cancel this appointment?
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            No
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            Yes, Cancel Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
