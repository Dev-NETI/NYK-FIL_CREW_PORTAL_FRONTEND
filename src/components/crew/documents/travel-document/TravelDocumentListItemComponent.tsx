import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { TravelDocumentService } from "@/services/travel-document";
import {
  TravelDocumentApprovalService,
  TravelDocumentUpdate,
} from "@/services/travel-document-approval";
import ViewTravelDocumentModal from "./ViewTravelDocumentModal";
import DeleteConfirmationModalComponent from "./DeleteConfirmationModalComponent";
import EditTravelDocumentModal from "./EditTravelDocumentModal";

// Map document types to their logo images
const documentLogos: Record<string, string> = {
  Passport: "/PASSPORT.png",
  SIRB: "/MARINA.svg",
  "Seafarer's Identification and Record Book (SIRB)": "/MARINA.svg",
  SID: "/MARINA.svg",
  "US VISA": "/globe.svg",
};

// Map document types to their full descriptions
const documentDescriptions: Record<string, string> = {
  Passport: "Philippines Department of Foreign Affairs",
  SIRB: "Seafarer's Identification and Record Book",
  "Seafarer's Identification and Record Book (SIRB)":
    "Seafarer's Identification and Record Book",
  SID: "Seafarer's Identity Document",
  "US VISA": "United States Travel Visa",
};

interface TravelDocument {
  id: number;
  crew_id: string;
  documentType: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingCountry: string;
  createdAt: string;
  modifiedBy: string;
  icon: string;
  travel_document_type_id: number;
  remaining_pages?: number;
  visa_type?: string;
  file_path?: string;
  file_ext?: string;
}

interface TravelDocumentListItemComponentProps {
  document: TravelDocument;
  onUpdate?: () => void;
  index?: number;
}

export default function TravelDocumentListItemComponent({
  document,
  onUpdate,
  index = 0,
}: TravelDocumentListItemComponentProps) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<TravelDocumentUpdate[]>(
    [],
  );
  const [loadingPending, setLoadingPending] = useState(true);

  // Swipe gesture states
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch pending updates for this document
  useEffect(() => {
    const fetchPendingUpdates = async () => {
      try {
        setLoadingPending(true);
        const history = await TravelDocumentApprovalService.getHistory(
          document.id,
        );
        // Filter for pending updates only
        const pending = history.filter((update) => update.status === "pending");
        setPendingUpdates(pending);
      } catch (error) {
        console.error("Error fetching pending updates:", error);
      } finally {
        setLoadingPending(false);
      }
    };

    fetchPendingUpdates();
  }, [document.id]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);

    try {
      const loadingToast = toast.loading("Deleting travel document...");
      await TravelDocumentService.deleteTravelDocument(document.id);
      toast.dismiss(loadingToast);
      toast.success(`${document.documentType} document deleted successfully!`);

      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete travel document",
      );
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Check if document has pending updates
  const hasPendingUpdates = !loadingPending && pendingUpdates.length > 0;

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Disable swiping if there are pending updates
    if (hasPendingUpdates) return;

    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || hasPendingUpdates) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Only allow swiping left (negative diff)
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -160)); // Max swipe of 160px
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || hasPendingUpdates) return;
    setIsDragging(false);

    // If swiped more than 80px, lock it open, otherwise close
    if (swipeOffset < -80) {
      setSwipeOffset(-160);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Disable swiping if there are pending updates
    if (hasPendingUpdates) return;

    startX.current = e.clientX;
    currentX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || hasPendingUpdates) return;
    currentX.current = e.clientX;
    const diff = currentX.current - startX.current;

    // Only allow swiping left (negative diff)
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -160)); // Max swipe of 160px
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || hasPendingUpdates) return;
    setIsDragging(false);

    // If swiped more than 80px, lock it open, otherwise close
    if (swipeOffset < -80) {
      setSwipeOffset(-160);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const closeSwipe = () => {
    setSwipeOffset(0);
  };

  const handleEditClick = () => {
    closeSwipe();
    setIsEditModalOpen(true);
  };

  const handleDeleteClickSwipe = () => {
    closeSwipe();
    handleDeleteClick();
  };

  const handleCardClick = () => {
    // Disable clicking if there are pending updates
    if (hasPendingUpdates) return;

    if (swipeOffset === 0) {
      setIsViewModalOpen(true);
    } else {
      closeSwipe();
    }
  };

  const getDaysUntilExpiry = () => {
    const today = new Date();
    const expiry = new Date(document.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = () => {
    const daysUntilExpiry = getDaysUntilExpiry();

    if (daysUntilExpiry < 0) {
      return {
        text: "Expired",
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-200",
      };
    } else if (daysUntilExpiry <= 90) {
      return {
        text: "Expiring Soon",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        borderColor: "border-orange-200",
      };
    } else {
      return {
        text: "Valid",
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
      };
    }
  };

  const getColorClasses = (documentType: string) => {
    const colorMap: Record<
      string,
      { bg: string; border: string; icon: string; gradient: string }
    > = {
      Passport: {
        bg: "bg-blue-600",
        border: "border-blue-200",
        icon: "text-blue-600",
        gradient: "from-blue-50 to-blue-100",
      },
      SIRB: {
        bg: "bg-purple-600",
        border: "border-purple-200",
        icon: "text-purple-600",
        gradient: "from-purple-50 to-purple-100",
      },
      SID: {
        bg: "bg-green-600",
        border: "border-green-200",
        icon: "text-green-600",
        gradient: "from-green-50 to-green-100",
      },
      "US VISA": {
        bg: "bg-red-600",
        border: "border-red-200",
        icon: "text-red-600",
        gradient: "from-red-50 to-red-100",
      },
    };
    return (
      colorMap[documentType] || {
        bg: "bg-blue-600",
        border: "border-blue-200",
        icon: "text-blue-600",
        gradient: "from-blue-50 to-blue-100",
      }
    );
  };

  const colors = getColorClasses(document.documentType);
  const expiryStatus = getExpiryStatus();

  return (
    <>
      <motion.div
        className="relative overflow-hidden rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.1,
          ease: "easeOut",
        }}
      >
        {/* Background action buttons - revealed on swipe left */}
        <div className="absolute inset-0 flex items-center justify-end gap-2 pr-3">
          <button
            onClick={handleEditClick}
            className={`w-16 h-full ${colors.bg} text-white flex flex-col items-center justify-center rounded-lg gap-1 shadow-lg hover:opacity-90 transition-opacity`}
          >
            <i className="bi bi-pencil-square text-xl"></i>
            <span className="text-xs font-semibold">Edit</span>
          </button>
          <button
            onClick={handleDeleteClickSwipe}
            className="w-16 h-full bg-red-600 text-white flex flex-col items-center justify-center rounded-lg gap-1 shadow-lg hover:bg-red-700 transition-colors"
          >
            <i className="bi bi-trash text-xl"></i>
            <span className="text-xs font-semibold">Delete</span>
          </button>
        </div>

        {/* Main content - swipeable */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={handleCardClick}
          style={{
            transform: `translateX(${swipeOffset}px)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
          className={`bg-gradient-to-r ${
            colors.gradient
          } rounded-xl p-5 border ${colors.border} ${
            hasPendingUpdates
              ? "opacity-70 cursor-not-allowed"
              : "hover:shadow-lg cursor-pointer"
          } transition-all duration-300 select-none relative`}
        >
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden p-2">
                <img
                  src={documentLogos[document.documentType] || "/nykfil.png"}
                  alt={document.documentType}
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {document.documentType}
                </h3>
                {!loadingPending && pendingUpdates.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                    <i className="bi bi-clock-history mr-1"></i>
                    Pending Approval
                  </span>
                )}
              </div>
              {documentDescriptions[document.documentType] && (
                <p className="text-xs sm:text-sm text-gray-500">
                  {documentDescriptions[document.documentType]}
                </p>
              )}
              {!loadingPending && pendingUpdates.length > 0 && (
                <p className="text-xs sm:text-sm text-yellow-700 mt-1 font-medium">
                  <i className="bi bi-info-circle mr-1"></i>
                  Update request is awaiting admin review
                </p>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              <span
                className={`${expiryStatus.bgColor} ${expiryStatus.color} px-3 py-1.5 rounded-lg text-sm font-semibold border ${expiryStatus.borderColor}`}
              >
                {expiryStatus.text}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* View Document Modal */}
      <ViewTravelDocumentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        document={document}
      />

      {/* Edit Document Modal */}
      <EditTravelDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          if (onUpdate) {
            onUpdate();
          }
        }}
        document={document}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModalComponent
        isOpen={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        documentType={document.documentType}
        documentNumber={document.documentNumber}
      />
    </>
  );
}
