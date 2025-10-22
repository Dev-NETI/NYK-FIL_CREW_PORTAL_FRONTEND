interface DeleteConfirmationModalComponentProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  documentType: string;
  documentNumber: string;
}

export default function DeleteConfirmationModalComponent({
  isOpen,
  onConfirm,
  onCancel,
  documentType,
  documentNumber,
}: DeleteConfirmationModalComponentProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="bi bi-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete {documentType} Document?
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Are you sure you want to delete this document? This action cannot
              be undone.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Document Number:</p>
              <p className="text-sm font-semibold text-gray-900">
                {documentNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
