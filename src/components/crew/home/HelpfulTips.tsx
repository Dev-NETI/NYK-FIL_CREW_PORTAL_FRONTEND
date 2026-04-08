"use client";

interface HelpfulTipsProps {
  isLoaded?: boolean;
}

export default function HelpfulTips({ isLoaded = true }: HelpfulTipsProps) {
  return (
    <div
      className={`mt-4 sm:mt-6 transform transition-all duration-1000 delay-800 ${
        isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500/30 border border-blue-400/30 rounded-lg p-2.5 flex-shrink-0">
            <i className="bi bi-lightbulb-fill text-yellow-300 text-base leading-none"></i>
          </div>
          <div className="min-w-0">
            <h3 className="text-white/90 text-sm font-semibold mb-1 tracking-tight">
              Quick Tip
            </h3>
            <p className="text-white/55 text-xs leading-relaxed">
              Keep your documents up to date to ensure smooth operations. Check
              expiration dates regularly and upload renewals promptly.
            </p>
            <div className="flex items-center gap-1.5 mt-2.5 text-blue-300/80 text-xs">
              <i className="bi bi-arrow-repeat text-xs"></i>
              <span>Tap your ID card above to reveal the QR code</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
