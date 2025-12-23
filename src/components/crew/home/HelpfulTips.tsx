"use client";

interface HelpfulTipsProps {
  isLoaded?: boolean;
}

export default function HelpfulTips({ isLoaded = true }: HelpfulTipsProps) {
  return (
    <div
      className={`mt-6 sm:mt-8 transform transition-all duration-1000 delay-800 ${
        isLoaded
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0"
      }`}
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-100">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="bg-blue-500 rounded-lg p-2 sm:p-3 flex-shrink-0">
            <i className="bi bi-lightbulb text-white text-sm sm:text-lg"></i>
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Helpful Tip
            </h3>
            <p className="text-gray-700 text-xs sm:text-sm mb-3">
              Keep your documents up to date to ensure smooth
              operations. Check expiration dates regularly and upload
              renewals promptly.
            </p>
            <div className="flex items-center text-xs sm:text-sm text-blue-600">
              <i className="bi bi-info-circle mr-2 flex-shrink-0"></i>
              <span>
                Click on your ID card above to view the QR code
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
