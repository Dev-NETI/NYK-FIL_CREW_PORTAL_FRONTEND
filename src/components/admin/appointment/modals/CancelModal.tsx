"use client";

interface CancelModalProps {
  reason: string;
  setReason: (value: string) => void;
  onClose: () => void;
  onProceed: () => void;
}

export default function CancelModal({
  reason,
  setReason,
  onClose,
  onProceed,
}: CancelModalProps) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-3">Cancel Appointment</h2>
        <p className="text-sm text-gray-600 mb-4">
          Reason for cancellation.
        </p>

        <textarea
          className="w-full border rounded-lg p-2 min-h-[120px]"
          placeholder="Enter cancellation reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            Close
          </button>

          <button
            onClick={onProceed}
            className="px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
