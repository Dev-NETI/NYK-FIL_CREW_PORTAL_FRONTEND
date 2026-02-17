"use client";

export default function SubmitDebriefingModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Submit Debriefing Form</h2>

            <button
              onClick={onClose}
              disabled={loading}
              className={`transition ${
                loading ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-700"
              }`}
              type="button"
              title="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <p className="text-sm text-gray-600 mt-1">
            Once submitted, you won’t be able to edit this form unless reopened by admin.
          </p>
        </div>

        <div className="p-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
            Please review all sections before submitting.
          </div>

          <div className="mt-5 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="h-[42px] px-4 rounded-lg bg-gray-200 text-sm hover:bg-gray-300 transition disabled:opacity-70 disabled:cursor-not-allowed"
              type="button"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="h-[42px] px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              type="button"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Confirm Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
