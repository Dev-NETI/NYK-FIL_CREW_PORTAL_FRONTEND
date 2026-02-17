import { motion } from "motion/react";

// Map document types to their logo images
const documentLogos: Record<string, string> = {
  TIN: "/BIR.png",
  SSS: "/SSS.png",
  PAGIBIG: "/PAGIBIG.svg",
  PHILHEALTH: "/PHILHEALTH.png",
  SRN: "/MARINA.svg",
  "DMW e-REG": "/DMW.svg",
  "MARCO PAY": "/MARCOPAY.png",
};

// Map document types to their full descriptions
const documentDescriptions: Record<string, string> = {
  TIN: "Tax Identification Number",
  SSS: "Social Security System",
  "PAG-IBIG": "Home Development Mutual Fund",
  PAGIBIG: "Home Development Mutual Fund",
  PHILHEALTH: "Philippine Health Insurance",
  SRN: "Seafarer Registration Number",
  "DMW e-REG": "Department of Migrant Workers Registration",
  "MARCO PAY": "Maritime Crew Online Payment",
};

interface MissingEmploymentDocumentCardProps {
  documentType: string;
  onAdd: () => void;
  index?: number;
}

export default function MissingEmploymentDocumentCardComponent({
  documentType,
  onAdd,
  index = 0,
}: MissingEmploymentDocumentCardProps) {
  return (
    <motion.div
      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-300 border-dashed hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden p-2 opacity-50">
            <img
              src={documentLogos[documentType] || "/BIR.png"}
              alt={documentType}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain grayscale"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700">
            {documentType}
          </h3>
          {documentDescriptions[documentType] && (
            <p className="text-xs sm:text-sm text-gray-400">
              {documentDescriptions[documentType]}
            </p>
          )}
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
    </motion.div>
  );
}
