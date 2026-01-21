"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import jsQR from "jsqr";
import { formatDate } from "@/lib/utils";
import {
  AdminAppointmentService,
  VerifiedAppointment,
} from "@/services/admin-appointment";

type ErrorKind = "missing" | "expired" | "invalid" | "unknown";

function extractToken(raw: string) {
  try {
    const v = String(raw || "").trim();
    if (!v) return "";

    if (v.startsWith("http://") || v.startsWith("https://")) {
      const u = new URL(v);
      return u.searchParams.get("token") || v;
    }
    return v;
  } catch {
    return String(raw || "").trim();
  }
}

export default function QrScanner() {
  const params = useSearchParams();
  const router = useRouter();
  const urlToken = params.get("token");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const scanningRef = useRef(false);
  const openRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VerifiedAppointment | null>(null);
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState<ErrorKind>("unknown");

  const stopCamera = () => {
    scanningRef.current = false;
    openRef.current = false;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyToken = async (token: string) => {
    const t = extractToken(token).trim();
    if (!t) {
      setErrorKind("missing");
      setError("Missing token.");
      return;
    }

    setLoading(true);
    setError("");
    setErrorKind("unknown");
    setData(null);

    try {
      const res = await AdminAppointmentService.verifyQrToken(t);
      setData(res);
      toast.success("QR verified");
    } catch (e: any) {
      const status = e?.response?.status as number | undefined;
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Invalid QR code.";

      const lower = String(msg).toLowerCase();

      if (status === 410 || lower.includes("expired")) {
        setErrorKind("expired");
        setError(msg);
      } else if (status === 404 || lower.includes("invalid")) {
        setErrorKind("invalid");
        setError(msg);
      } else {
        setErrorKind("unknown");
        setError(msg);
      }

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!urlToken) return;
    verifyToken(urlToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlToken]);

  const handleFound = (raw: string) => {
    const token = extractToken(raw).trim();
    if (!token) return;

    stopCamera();
    setOpen(false);
    verifyToken(token);
  };

  const scanLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const loop = () => {
      if (!scanningRef.current || !openRef.current) return;

      const w = video.videoWidth;
      const h = video.videoHeight;

      if (w && h) {
        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(video, 0, 0, w, h);
        const img = ctx.getImageData(0, 0, w, h);
        const qr = jsQR(img.data, w, h);

        if (qr?.data) {
          handleFound(qr.data);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  };

  const startCamera = async () => {
    try {
      setData(null);
      setError("");
      setErrorKind("unknown");

      setOpen(true);
      openRef.current = true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      scanningRef.current = true;
      scanLoop();
    } catch (err) {
      console.error(err);
      toast.error("Unable to access camera. Check browser permissions.");
      setOpen(false);
      stopCamera();
    }
  };

  const clearResult = () => {
    setData(null);
    setError("");
    setErrorKind("unknown");
    router.replace("/admin/qr-scanner");
  };

  const crewName = useMemo(() => {
    const p = data?.user?.profile;
    if (!p) return `Crew #${data?.user_id ?? "N/A"}`;

    const middleInitial = p.middle_name ? ` ${p.middle_name[0]}.` : "";
    return `${p.last_name}, ${p.first_name}${middleInitial}`.trim();
  }, [data]);

  const crewId = data?.user?.profile?.crew_id ?? "N/A";

  const statusClass = useMemo(() => {
    const s = (data?.status || "").toLowerCase();
    if (s === "confirmed") return "bg-green-50 text-green-700 border-green-200";
    if (s === "cancelled") return "bg-red-50 text-red-700 border-red-200";
    if (s === "pending")
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  }, [data?.status]);

  const ErrorCard = () => {
    if (errorKind === "expired") {
      return (
        <div className="bg-white rounded-2xl p-6 border border-amber-200">
          <h2 className="text-sm font-semibold text-amber-800">
            QR Code Expired
          </h2>
          <p className="text-sm text-amber-800 mt-1">{error}</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-6 border border-red-200">
        <h2 className="text-sm font-semibold text-red-800">
          Verification Failed
        </h2>
        <p className="text-sm text-red-800 mt-1">{error}</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 space-y-4">
      <div className="border-2 border-dashed rounded-xl p-6 text-center">
        <h2 className="text-lg font-semibold">Scan QR here</h2>
        <p className="text-sm text-gray-600 mt-1">
          Open camera and scan appointment QR
        </p>

        {!open ? (
          <button
            onClick={startCamera}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
          >
            Open Camera
          </button>
        ) : (
          <button
            onClick={() => {
              stopCamera();
              setOpen(false);
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold"
          >
            Close Camera
          </button>
        )}

        <button
          onClick={clearResult}
          className="mt-3 ml-3 px-4 py-2 rounded-lg border text-sm font-semibold"
          type="button"
        >
          Clear Result
        </button>
      </div>

      {open && (
        <div className="rounded-xl overflow-hidden border bg-black relative">
          <video
            ref={videoRef}
            className="w-full h-[320px] object-cover"
            playsInline
            muted
            autoPlay
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl p-6 border">
          <p className="text-sm text-gray-700">Verifying QR code…</p>
        </div>
      )}

      {!loading && error && <ErrorCard />}

      {!loading && data && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-end">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize ${statusClass}`}
            >
              {data.status}
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Crew Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-xs text-gray-500">Crew Name</div>
                  <div className="text-sm font-semibold">{crewName}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="text-xs text-gray-500">Crew ID</div>
                  <div className="text-sm font-semibold">{crewId}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">
                Appointment Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500">Type</div>
                  <div className="text-sm font-semibold">
                    {data.type?.name ?? "N/A"}
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500">Department</div>
                  <div className="text-sm font-semibold">
                    {data.department?.name ?? "N/A"}
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500">Date</div>
                  <div className="text-sm font-semibold">
                    {formatDate(data.date)}
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-xs text-gray-500">Session</div>
                  <div className="text-sm font-semibold">{data.session}</div>
                </div>

                <div className="sm:col-span-2 rounded-xl border p-4">
                  <div className="text-xs text-gray-500">Purpose</div>
                  <div className="text-sm font-semibold break-words">
                    {data.purpose ?? "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              If details do not match, coordinate with the department.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
