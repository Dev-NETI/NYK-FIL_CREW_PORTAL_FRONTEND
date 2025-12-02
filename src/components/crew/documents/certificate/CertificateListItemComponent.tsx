import { useState, useRef, useEffect } from "react";

interface Certificate {
  id: number;
  name: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  certificateNumber: string;
  status: string;
  hasFile: boolean;
}

interface CertificateListItemComponentProps {
  certificate: Certificate;
  onUpdate?: () => void;
}

// Helper functions
function getStatusColor(status: string) {
  switch (status) {
    case "valid":
      return {
        badge: "bg-green-100 text-green-800 border-green-300",
        card: "border-green-200",
        gradient: "from-green-50 to-green-100",
        icon: "text-green-600",
        bg: "bg-green-600",
      };
    case "expiring_soon":
      return {
        badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
        card: "border-yellow-200",
        gradient: "from-yellow-50 to-yellow-100",
        icon: "text-yellow-600",
        bg: "bg-yellow-600",
      };
    case "expired":
      return {
        badge: "bg-red-100 text-red-800 border-red-300",
        card: "border-red-200",
        gradient: "from-red-50 to-red-100",
        icon: "text-red-600",
        bg: "bg-red-600",
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-800 border-gray-300",
        card: "border-gray-200",
        gradient: "from-gray-50 to-gray-100",
        icon: "text-gray-600",
        bg: "bg-gray-600",
      };
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "valid":
      return "Valid";
    case "expiring_soon":
      return "Expiring Soon";
    case "expired":
      return "Expired";
    default:
      return "Unknown";
  }
}

export default function CertificateListItemComponent({
  certificate,
  onUpdate,
}: CertificateListItemComponentProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);

  const colors = getStatusColor(certificate.status);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    startOffsetRef.current = swipeOffset;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    const newOffset = startOffsetRef.current + diff;

    // Limit swipe to left only (negative values) with max of -200px
    if (newOffset <= 0 && newOffset >= -200) {
      setSwipeOffset(newOffset);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap to open (-150px) or closed (0) based on threshold
    if (swipeOffset < -75) {
      setSwipeOffset(-150);
    } else {
      setSwipeOffset(0);
    }
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startOffsetRef.current = swipeOffset;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const currentX = e.clientX;
      const diff = currentX - startXRef.current;
      const newOffset = startOffsetRef.current + diff;

      // Limit swipe to left only (negative values) with max of -200px
      if (newOffset <= 0 && newOffset >= -200) {
        setSwipeOffset(newOffset);
      }
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      // Snap to open (-150px) or closed (0) based on threshold
      if (swipeOffset < -75) {
        setSwipeOffset(-150);
      } else {
        setSwipeOffset(0);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, swipeOffset]);

  const handleView = () => {
    setSwipeOffset(0);
    // TODO: Implement view functionality
    console.log("View certificate:", certificate.id);
  };

  const handleEdit = () => {
    setSwipeOffset(0);
    // TODO: Implement edit functionality
    console.log("Edit certificate:", certificate.id);
  };

  const handleDelete = () => {
    setSwipeOffset(0);
    // TODO: Implement delete functionality
    console.log("Delete certificate:", certificate.id);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action buttons background (shown when swiped) */}
      <div className="absolute inset-0 flex items-stretch justify-end bg-gray-100">
        <button
          onClick={handleView}
          disabled={!certificate.hasFile}
          className="w-16 flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="bi bi-eye text-xl"></i>
        </button>
        <button
          onClick={handleEdit}
          className="w-16 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <i className="bi bi-pencil-square text-xl"></i>
        </button>
        <button
          onClick={handleDelete}
          className="w-16 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          <i className="bi bi-trash text-xl"></i>
        </button>
      </div>

      {/* Main content (swipeable) */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        className={`bg-gradient-to-r ${colors.gradient} rounded-xl p-5 border ${
          colors.card
        } hover:shadow-lg transition-all duration-300 ${
          !isDragging && "cursor-grab active:cursor-grabbing"
        } relative`}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 ${colors.bg} rounded-xl flex items-center justify-center shadow-md`}
            >
              <i className="bi bi-award text-white text-xl sm:text-2xl"></i>
            </div>
          </div>

          {/* Certificate name and status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {certificate.name}
              </h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors.badge}`}
              >
                {getStatusLabel(certificate.status)}
              </span>
            </div>
            {certificate.hasFile ? (
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                <i className="bi bi-paperclip mr-1"></i>
                Document attached
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-red-600 mt-1 font-medium">
                <i className="bi bi-exclamation-circle mr-1"></i>
                No document attached
              </p>
            )}
          </div>

          {/* Chevron indicator */}
          <div className="flex-shrink-0">
            <i className="bi bi-chevron-right text-gray-400 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
