interface EmploymentDocument {
  id: number;
  documentType: string;
  documentNumber: string;
  createdAt: string;
  modifiedBy: string;
  icon: string;
  color: string;
}

interface EmploymentDocumentListItemComponentProps {
  document: EmploymentDocument;
}

export default function EmploymentDocumentListItemComponent({
  document,
}: EmploymentDocumentListItemComponentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<
      string,
      { bg: string; border: string; icon: string; gradient: string }
    > = {
      blue: {
        bg: "bg-blue-600",
        border: "border-blue-200",
        icon: "text-blue-600",
        gradient: "from-blue-50 to-blue-100",
      },
      green: {
        bg: "bg-green-600",
        border: "border-green-200",
        icon: "text-green-600",
        gradient: "from-green-50 to-green-100",
      },
      purple: {
        bg: "bg-purple-600",
        border: "border-purple-200",
        icon: "text-purple-600",
        gradient: "from-purple-50 to-purple-100",
      },
      orange: {
        bg: "bg-orange-600",
        border: "border-orange-200",
        icon: "text-orange-600",
        gradient: "from-orange-50 to-orange-100",
      },
      indigo: {
        bg: "bg-indigo-600",
        border: "border-indigo-200",
        icon: "text-indigo-600",
        gradient: "from-indigo-50 to-indigo-100",
      },
      pink: {
        bg: "bg-pink-600",
        border: "border-pink-200",
        icon: "text-pink-600",
        gradient: "from-pink-50 to-pink-100",
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const colors = getColorClasses(document.color);

  return (
    <div
      className={`bg-gradient-to-r ${colors.gradient} rounded-xl p-5 border ${colors.border} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 ${colors.bg} rounded-xl flex items-center justify-center shadow-md`}
          >
            <i
              className={`bi ${document.icon} text-white text-xl sm:text-2xl`}
            ></i>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
            {document.documentType}
          </h3>

          <div className="space-y-2">
            {/* Document Number */}
            <div className="flex items-start gap-2">
              <i
                className={`bi bi-hash ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
              ></i>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 font-medium">
                  Document Number
                </p>
                <p className="text-sm sm:text-base text-gray-900 font-semibold break-all">
                  {document.documentNumber}
                </p>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start gap-2">
              <i
                className={`bi bi-calendar-check ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
              ></i>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 font-medium">Created At</p>
                <p className="text-sm sm:text-base text-gray-900">
                  {formatDate(document.createdAt)}
                </p>
              </div>
            </div>

            {/* Modified By */}
            <div className="flex items-start gap-2">
              <i
                className={`bi bi-person-badge ${colors.icon} text-sm mt-0.5 flex-shrink-0`}
              ></i>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-600 font-medium">Modified By</p>
                <p className="text-sm sm:text-base text-gray-900">
                  {document.modifiedBy}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
