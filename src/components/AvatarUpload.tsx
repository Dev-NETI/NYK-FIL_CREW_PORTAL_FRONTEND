"use client";

import { useState, useRef } from "react";

interface AvatarUploadProps {
  /** Used to generate initials when no image is set */
  displayName: string;
  /** Full URL of the current profile image */
  imageUrl?: string | null;
  /** Called with the selected File; should throw on failure */
  onUpload: (file: File) => Promise<void>;
  /** Extra Tailwind classes applied to the avatar circle */
  className?: string;
  /** When true the upload overlay is hidden */
  readOnly?: boolean;
  /** When true, shows a pending badge and disables upload */
  pendingApproval?: boolean;
}

/**
 * Circular avatar with a social-media-style hover overlay for uploading /
 * taking a new profile photo.  Shows a preview modal before confirming.
 */
export default function AvatarUpload({
  displayName,
  imageUrl,
  onUpload,
  className = "w-40 h-40 lg:w-48 lg:h-48",
  readOnly = false,
  pendingApproval = false,
}: AvatarUploadProps) {
  const [hovered, setHovered] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setSelectedFile(file);
    // reset so the same file can be re-selected after cancelling
    e.target.value = "";
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      await onUpload(selectedFile);
      setPreview(null);
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  const uploadDisabled = readOnly || pendingApproval;

  return (
    <>
      {/* ── Avatar circle ── */}
      <div
        className={`relative ${className} rounded-full overflow-hidden flex-shrink-0 shadow-2xl border-4 border-white/20 ${
          !uploadDisabled ? "cursor-pointer" : ""
        }`}
        onMouseEnter={() => !uploadDisabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => !uploadDisabled && fileInputRef.current?.click()}
        title={
          pendingApproval
            ? "Photo update pending approval"
            : readOnly
              ? undefined
              : "Change profile photo"
        }
      >
        {/* Image or gradient + initials */}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-4xl lg:text-5xl font-bold text-white drop-shadow-lg select-none">
              {initials || "?"}
            </span>
          </div>
        )}

        {/* Pending approval overlay */}
        {pendingApproval && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
            <i className="bi bi-hourglass-split text-yellow-400 text-2xl"></i>
            <span className="text-yellow-300 text-xs font-semibold tracking-wide text-center px-1">
              Pending
            </span>
          </div>
        )}

        {/* Hover overlay */}
        {!uploadDisabled && (
          <div
            className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 transition-opacity duration-200 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <i className="bi bi-camera-fill text-white text-2xl"></i>
            <span className="text-white text-xs font-semibold tracking-wide">
              Change Photo
            </span>
          </div>
        )}
      </div>

      {/* Hidden file input – accept images; on mobile the browser offers camera */}
      {!uploadDisabled && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {/* ── Preview modal ── */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">
              Preview Photo
            </h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Confirm to save this as your profile photo.
            </p>

            {/* Circular preview */}
            <div className="w-44 h-44 rounded-full overflow-hidden mx-auto mb-6 ring-4 ring-blue-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Uploading…
                  </>
                ) : (
                  "Save Photo"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
