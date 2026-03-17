"use client";

interface DataPrivacyModalProps {
  open: boolean;
  onConsent: () => void;
}

export default function DataPrivacyModal({ open, onConsent }: DataPrivacyModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-t-2xl px-6 py-5 flex-shrink-0">
          <h2 className="text-white font-bold text-lg sm:text-xl leading-tight">
            Voyager: Connecting and Empowering NYK-Fil Seafarers App
          </h2>
          <p className="text-blue-200 text-sm mt-1 font-medium">
            Data Privacy Statement
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 text-sm text-gray-700 space-y-4">
          <section>
            <h3 className="font-bold text-blue-900 mb-1">I. Purpose of Data Collection</h3>
            <p>
              The Voyager: Connecting and Empowering NYK-Fil Seafarers is developed by NYK-Fil Ship Management, Inc. to enhance documentation, communication, efficiency, and access to services for its seafarers and employees. To achieve this, the app collects personal and employment-related information necessary for crew management, deployment, training, and welfare programs.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-blue-900 mb-1">II. Information We Collect</h3>
            <p className="mb-2">The following types of data may be collected, stored, and processed through the NYK-FIL App:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><span className="font-medium">Personal Identification Information:</span> Name, birthdate, nationality, contact details, passport, seaman&apos;s book, and government-issued IDs.</li>
              <li><span className="font-medium">Employment and Training Records:</span> Employment history, rank, vessel assignment, licenses, certificates, and training results.</li>
              <li><span className="font-medium">Health and Medical Information:</span> Pre-employment medical results, vaccination records, and other health-related documents required for deployment and compliance with maritime regulations.</li>
              <li><span className="font-medium">App Usage Data:</span> Log-in details, activity logs, device information, and location data (for deployment tracking, embarkation and debarkation of NYK-Fil Crew).</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-blue-900 mb-1">III. Use of Information</h3>
            <p className="mb-2">Your data will be used for:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Crew recruitment, deployment, and repatriation processes.</li>
              <li>Compliance with statutory and regulatory requirements (DMW, MARINA, POEA, and international and other local maritime standards).</li>
              <li>Training, validation of licenses, performance monitoring, and career development programs.</li>
              <li>Communication regarding company updates, welfare initiatives, and safety alerts.</li>
              <li>Digital services such as document verification, schedule notifications, and crew tracking.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-blue-900 mb-1">IV. Data Sharing and Disclosure</h3>
            <p className="mb-2">NYK-FIL Ship Management, Inc. may share your information only with:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><span className="font-medium">Affiliated Companies</span> within the NYK Group for operational and management purposes.</li>
              <li><span className="font-medium">Principals and Vessel Owners</span> for crew selection, assignment, and management.</li>
              <li><span className="font-medium">Authorized Government Agencies</span> (e.g., DMW, MARINA, POEA, DOH, DFA) as required by law.</li>
              <li><span className="font-medium">Accredited Third Parties</span> such as medical clinics, training centers, and service providers, bound by confidentiality and data sharing agreements.</li>
            </ul>
            <p className="mt-2 text-blue-800 font-medium">No personal data will be sold, distributed, or disclosed for commercial gain.</p>
          </section>

          <section>
            <h3 className="font-bold text-blue-900 mb-1">V. Data Storage and Retention</h3>
            <p>Your information is securely stored in NYK-FIL&apos;s protected servers and digital systems with access limited to authorized personnel. Data will be retained only as long as necessary to fulfill the purposes stated above or as required by law and company policy.</p>
          </section>

          <section>
            <h3 className="font-bold text-blue-900 mb-1">VI. Data Protection Measures</h3>
            <p className="mb-2">NYK-FIL implements organizational, physical, and technical safeguards including:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Encryption of sensitive data</li>
              <li>Regular security audits and monitoring</li>
              <li>Compliance with the Data Privacy Act of 2012 (R.A. 10173) and other relevant international privacy standards</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-blue-900 mb-1">VII. Your Rights</h3>
            <p className="mb-2">As a data subject, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Be informed about the processing of your personal data</li>
              <li>Access, correct, or update your personal information</li>
              <li>Withdraw consent, subject to legal or contractual restrictions</li>
              <li>File a complaint with the National Privacy Commission (NPC) in case of any privacy violations</li>
            </ul>
            <p className="mt-2">Requests for data access or correction may be directed to NYK-FIL&apos;s Data Protection Officer:</p>
            <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="font-semibold text-blue-900">Data Protection Officer</p>
              <p>NYK-FIL Ship Management, Inc.</p>
              <p>Email: <a href="mailto:dpo@nykfil.com.ph" className="text-blue-600 underline">dpo@nykfil.com.ph</a></p>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-blue-900 mb-1">VIII. Consent</h3>
            <p>By downloading, accessing, or using the Voyager: Connecting and Empowering NYK-Fil Seafarers App, you signify your consent to the collection, use, and processing of your personal data in accordance with this Privacy Statement.</p>
          </section>

          <p className="text-gray-500 italic text-xs border-t pt-3">
            By tapping &quot;I Consent&quot;, you acknowledge that you have read and agree to the collection, use, and processing of your personal data in accordance with this Privacy Notice.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onConsent}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            I Consent
          </button>
        </div>
      </div>
    </div>
  );
}
