"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import toast from "react-hot-toast";
import { CrewAppointmentService } from "@/services/crew-appointments";

export default function QrModal({
  open,
  appointmentId,
  onClose,
}: {
  open: boolean;
  appointmentId: number | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!open || !appointmentId) return;

    let mounted = true;
    setLoading(true);
    setToken("");

    CrewAppointmentService.getQrToken(appointmentId)
      .then((t) => {
        if (!mounted) return;
        setToken(t);
      })
      .catch((e: any) => {
        const msg = e?.response?.data?.message || "Failed to load QR";
        toast.error(msg);
        if (!mounted) return;
        setToken("");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, appointmentId]);

  useEffect(() => {
    if (!open) {
      setToken("");
      setLoading(false);
    }
  }, [open]);


  const qrValue = useMemo(() => {
    if (!token) return "";
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${base}/guard/verify?token=${encodeURIComponent(token)}`;
  }, [token]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Appointment QR</DialogTitle>
      <DialogContent>
        <div className="flex flex-col items-center gap-4 py-5">
          {loading ? (
            <CircularProgress />
          ) : token ? (
            <>
              <div className="bg-white p-3 rounded-md border">
                <QRCode value={qrValue} size={220} />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Present this QR to the guard. It will open the verification page.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600">
              QR is not available for this appointment.
            </p>
          )}

          <Button onClick={onClose} variant="outlined" fullWidth>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
