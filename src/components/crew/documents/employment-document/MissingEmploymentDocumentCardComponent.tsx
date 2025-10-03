interface MissingEmploymentDocumentCardProps {
  documentType: string;
  icon: string;
  onAdd: () => void;
}

export default function MissingEmploymentDocumentCardComponent({
  documentType,
  icon,
  onAdd,
}: MissingEmploymentDocumentCardProps) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-300 border-dashed hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-400 rounded-xl flex items-center justify-center shadow-md">
            <i className={`bi ${icon} text-white text-xl sm:text-2xl`}></i>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700">
            {documentType}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Missing document - Click to add
          </p>
        </div>

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="bg-gray-500 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-colors shadow-md flex-shrink-0"
        >
          <i className="bi bi-plus-lg text-2xl sm:text-3xl"></i>
        </button>
      </div>
    </div>
  );
}
