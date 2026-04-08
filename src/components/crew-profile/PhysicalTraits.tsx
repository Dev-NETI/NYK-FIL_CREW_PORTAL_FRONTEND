"use client";

import { User } from "@/types/api";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import ValidationError from "@/components/ui/ValidationError";
import { useValidation } from "@/hooks/useValidation";

interface PhysicalTraitsProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  canEdit?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onNestedInputChange: (parent: string, field: string, value: string) => void;
  validationErrors?: Record<string, string[]>;
}

const BLOOD_TYPE_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BLOOD_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "A+":  { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
  "A-":  { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200" },
  "B+":  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  "B-":  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  "AB+": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "AB-": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "O+":  { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200" },
  "O-":  { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200" },
};

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function MeasurementCard({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  unit,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number | null | undefined;
  unit?: string;
}) {
  const hasValue = value !== null && value !== undefined && value !== "";
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border border-gray-200 bg-white text-center">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
        <i className={`bi ${icon} ${iconColor} text-xl`}></i>
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold leading-none mb-1">
          {label}
        </p>
        {hasValue ? (
          <p className="text-2xl font-black text-gray-900 leading-none">
            {value}
            {unit && <span className="text-sm font-semibold text-gray-400 ml-1">{unit}</span>}
          </p>
        ) : (
          <p className="text-base font-semibold text-gray-300">—</p>
        )}
      </div>
    </div>
  );
}

function ColorTraitRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <i className={`bi ${icon} text-gray-500 text-sm`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold leading-none mb-0.5">{label}</p>
        <p className={`text-sm font-semibold ${value ? "text-gray-800" : "text-gray-300"}`}>
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

export default function PhysicalTraits({
  profile,
  editedProfile,
  isEditing,
  saving,
  canEdit = true,
  onEdit,
  onSave,
  onCancel,
  onNestedInputChange,
  validationErrors = {},
}: PhysicalTraitsProps) {
  const { getValidationError, hasValidationError } = useValidation({ validationErrors });

  const val = (field: string): string =>
    ((editedProfile?.physical_traits as Record<string, unknown>)?.[field] as string) || "";

  const bloodType = profile.physical_traits?.blood_type;
  const bloodColors = bloodType ? BLOOD_TYPE_COLORS[bloodType] ?? { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" } : null;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <i className="bi bi-body-text text-violet-600"></i>
            Physical Traits
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">Body measurements and physical characteristics</p>
        </div>

        {/* Action buttons */}
        {!isEditing ? (
          <button
            onClick={onEdit}
            disabled={!canEdit}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              canEdit
                ? "bg-slate-900 text-white hover:bg-slate-700 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <i className="bi bi-pencil-fill text-xs"></i>
            Edit Physical
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-all"
            >
              <i className="bi bi-x-lg text-xs"></i>
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              {saving ? (
                <><i className="bi bi-arrow-clockwise animate-spin text-xs"></i>Saving…</>
              ) : (
                <><i className="bi bi-check-lg text-xs"></i>Save Changes</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════ VIEW MODE */}
      {!isEditing && (
        <div className="space-y-5">
          {/* Blood type — hero card */}
          {bloodType && bloodColors ? (
            <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 ${bloodColors.bg} ${bloodColors.border}`}>
              <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm flex-shrink-0">
                <i className="bi bi-droplet-fill text-red-500 text-2xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-0.5">Blood Type</p>
                <p className={`text-4xl font-black ${bloodColors.text}`}>{bloodType}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
                <i className="bi bi-droplet text-gray-300 text-2xl"></i>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Blood Type</p>
                <p className="text-gray-400 text-sm">Not specified</p>
              </div>
            </div>
          )}

          {/* Measurements grid */}
          <div className="grid grid-cols-2 gap-3">
            <MeasurementCard
              icon="bi-arrows-vertical"
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
              label="Height"
              value={profile.physical_traits?.height}
              unit="cm"
            />
            <MeasurementCard
              icon="bi-speedometer2"
              iconColor="text-violet-600"
              iconBg="bg-violet-100"
              label="Weight"
              value={profile.physical_traits?.weight}
              unit="kg"
            />
          </div>

          {/* Color traits */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <i className="bi bi-palette-fill text-amber-600 text-sm"></i>
              </div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Appearance</h3>
            </div>
            <div className="px-5">
              <ColorTraitRow icon="bi-eye-fill" label="Eye Color" value={profile.physical_traits?.eye_color} />
              <ColorTraitRow icon="bi-stars" label="Hair Color" value={profile.physical_traits?.hair_color} />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════ EDIT MODE */}
      {isEditing && (
        <div className="space-y-5">
          {/* Measurements */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <i className="bi bi-rulers text-blue-600 text-sm"></i>
              </div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Measurements</h3>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <TextField
                  label="Height (cm)"
                  type="number"
                  value={val("height")}
                  onChange={(e) => onNestedInputChange("physical_traits", "height", e.target.value)}
                  fullWidth variant="outlined"
                  placeholder="e.g. 175"
                  error={hasValidationError("physical_traits.height")}
                  slotProps={{ htmlInput: { min: 0, max: 300 } }}
                />
                <ValidationError errors={getValidationError("physical_traits.height")} />
              </div>
              <div>
                <TextField
                  label="Weight (kg)"
                  type="number"
                  value={val("weight")}
                  onChange={(e) => onNestedInputChange("physical_traits", "weight", e.target.value)}
                  fullWidth variant="outlined"
                  placeholder="e.g. 70"
                  error={hasValidationError("physical_traits.weight")}
                  slotProps={{ htmlInput: { min: 0, max: 500 } }}
                />
                <ValidationError errors={getValidationError("physical_traits.weight")} />
              </div>
            </div>
          </div>

          {/* Blood Type */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                <i className="bi bi-droplet-fill text-red-600 text-sm"></i>
              </div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Blood Type</h3>
            </div>
            <div className="p-5">
              <FormControl fullWidth variant="outlined" error={hasValidationError("physical_traits.blood_type")}>
                <Select
                  value={val("blood_type")}
                  onChange={(e: SelectChangeEvent) => onNestedInputChange("physical_traits", "blood_type", e.target.value)}
                  displayEmpty
                  renderValue={(v) => v || <span className="text-gray-400">Select Blood Type</span>}
                >
                  <MenuItem value="">Select Blood Type</MenuItem>
                  {BLOOD_TYPE_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
              <ValidationError errors={getValidationError("physical_traits.blood_type")} />
            </div>
          </div>

          {/* Appearance */}
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <i className="bi bi-palette-fill text-amber-600 text-sm"></i>
              </div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Appearance</h3>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <TextField
                  label="Eye Color"
                  value={val("eye_color")}
                  onChange={(e) => onNestedInputChange("physical_traits", "eye_color", e.target.value)}
                  fullWidth variant="outlined"
                  placeholder="e.g. Brown"
                  error={hasValidationError("physical_traits.eye_color")}
                />
                <ValidationError errors={getValidationError("physical_traits.eye_color")} />
              </div>
              <div>
                <TextField
                  label="Hair Color"
                  value={val("hair_color")}
                  onChange={(e) => onNestedInputChange("physical_traits", "hair_color", e.target.value)}
                  fullWidth variant="outlined"
                  placeholder="e.g. Black"
                  error={hasValidationError("physical_traits.hair_color")}
                />
                <ValidationError errors={getValidationError("physical_traits.hair_color")} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
