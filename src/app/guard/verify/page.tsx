"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CrewAppointmentService,
  VerifiedAppointment,
} from "@/services/crew-appointments";
import { formatDate, formatTime } from "@/lib/utils";

type ErrorKind = "missing" | "expired" | "invalid" | "unknown";

export default function GuardVerifyPage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VerifiedAppointment | null>(null);
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState<ErrorKind>("unknown");

  useEffect(() => {
    if (!token) {
      setErrorKind("missing");
      setError("Missing token.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setErrorKind("unknown");
    setData(null);

    CrewAppointmentService.verifyQrToken(token)
      .then((res) => {
        setData(res);
      })
      .catch((e) => {
        const status = e?.response?.status as number | undefined;
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Invalid QR code.";

        if (status === 410 || String(msg).toLowerCase().includes("expired")) {
          setErrorKind("expired");
          setError(msg || "QR code has expired.");
          return;
        }

        if (status === 404 || String(msg).toLowerCase().includes("invalid")) {
          setErrorKind("invalid");
          setError(msg || "Invalid QR code.");
          return;
        }

        setErrorKind("unknown");
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const crewName = useMemo(() => {
    const p = data?.user?.profile;
    if (!p) return `Crew #${data?.user_id ?? "N/A"}`;

    const first = p.first_name?.trim() || "";
    const last = p.last_name?.trim() || "";
    const middle = p.middle_name?.trim() || "";

    const middleInitial = middle ? ` ${middle[0].toUpperCase()}.` : "";
    const name = `${last}, ${first}${middleInitial}`.trim();

    return name.replace(/^, /, "") || `Crew #${data?.user_id ?? "N/A"}`;
  }, [data]);

  const crewId = data?.user?.profile?.crew_id ?? "N/A";

  const statusClass = useMemo(() => {
    const s = (data?.status || "").toLowerCase();
    if (s === "confirmed") return "bg-green-50 text-green-700 border-green-200";
    if (s === "cancelled") return "bg-red-50 text-red-700 border-red-200";
    if (s === "pending") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  }, [data?.status]);

  const ErrorCard = () => {
    const commonWrap =
      "bg-white rounded-2xl p-6 shadow-sm border overflow-hidden";

    if (errorKind === "expired") {
      return (
        <div className={`${commonWrap} border-amber-200`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-10 w-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
              <span className="text-amber-700 font-bold">!</span>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-amber-800">
                QR Code Expired
              </h2>
              <p className="text-sm text-amber-800 mt-1">{error}</p>
              <p className="text-xs text-gray-500 mt-3">
                Ask the crew to coordinate with the department to re-confirm /
                regenerate the appointment QR.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // missing / invalid / unknown
    return (
      <div className={`${commonWrap} border-red-200`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-10 w-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <span className="text-red-700 font-bold">!</span>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-red-800">
              Verification Failed
            </h2>
            <p className="text-sm text-red-800 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Appointment Verification
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Scanned QR verification details
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-sm text-gray-700">Verifying QR code…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && !!error && <ErrorCard />}

        {/* Content */}
        {!loading && data && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Status */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-end">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${statusClass}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                {data.status}
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Crew Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Crew Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      Crew Name
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {crewName}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      Crew ID
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {crewId}
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Appointment Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      Appointment Type
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {data.type?.name ?? "N/A"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      Department
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {data.department?.name ?? "N/A"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      Scheduled Date
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {formatDate(data.date)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      Scheduled Time
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {formatTime(data.time)}
                    </div>
                  </div>

                  <div className="sm:col-span-2 rounded-xl border border-gray-100 p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase">
                      Purpose
                    </div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 break-words">
                      {data.purpose ?? "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                If the details do not match the crew member, coordinate with the
                department.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
