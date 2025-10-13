import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface ViewTravelDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  documentId: number;
  fileExt?: string;
}

export default function ViewTravelDocumentModal({
  isOpen,
  onClose,
  documentType,
  documentId,
  fileExt,
}: ViewTravelDocumentModalProps) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const fileUrl = `${backendUrl}/api/travel-documents/${documentId}/view-file`;

  const isPDF = fileExt?.toLowerCase() === "pdf";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
    fileExt?.toLowerCase() || ""
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {documentType} Document
                  </Dialog.Title>
                  <div className="flex items-center gap-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1.5"
                    >
                      <i className="bi bi-box-arrow-up-right"></i>
                      <span>Open in New Tab</span>
                    </a>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <i className="bi bi-x-lg text-xl"></i>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-gray-100">
                  {isPDF ? (
                    <iframe
                      src={fileUrl}
                      className="w-full h-[70vh] border-0"
                      title={`${documentType} Document`}
                    />
                  ) : isImage ? (
                    <div className="flex items-center justify-center p-6 min-h-[70vh]">
                      <img
                        src={fileUrl}
                        alt={`${documentType} Document`}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 min-h-[70vh]">
                      <i className="bi bi-file-earmark text-6xl text-gray-400 mb-4"></i>
                      <p className="text-gray-600 mb-4">
                        Preview not available for this file type
                      </p>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <i className="bi bi-download"></i>
                        <span>Download File</span>
                      </a>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
