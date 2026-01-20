"use client";

import QrScanner from "@/components/admin/scanner/QrScanner";

export default function AdminScannerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl shadow p-5 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold">QR Scanner</h1>
          <p className="text-sm text-gray-600 mt-1">
            Scan the appointment QR using your phone camera, laptop webcam, or an external camera.
          </p>
        </div>

        <QrScanner />
      </div>
    </div>
  );
}
