"use client";

import React from "react";
import { User } from "@/types/api";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { Nationality } from "@/services/nationality";
import { Rank } from "@/services/rank";
import { Fleet } from "@/services/fleet";
import { Company } from "@/services/company";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ValidationError from "@/components/ui/ValidationError";
import { useValidation } from "@/hooks/useValidation";

interface BasicInformationProps {
  profile: User;
  editedProfile: User | null;
  isEditing: boolean;
  saving: boolean;
  canEdit?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onNestedInputChange: (parent: string, field: string, value: string | number | null) => void;
  nationalities: Nationality[];
  ranks?: Rank[];
  fleets?: Fleet[];
  companies?: Company[];
  validationErrors?: Record<string, string[]>;
}

const GENDER_OPTIONS = ["Male", "Female"];
const CIVIL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];

// ── Shared helpers ────────────────────────────────────────────────────────────

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

/** A single labelled info row used in view mode */
function InfoRow({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100`}>
        <i className={`bi ${icon} ${iconColor} text-sm`}></i>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold leading-none mb-0.5">
          {label}
        </p>
        <p className={`text-sm font-semibold leading-snug ${value ? "text-gray-800" : "text-gray-300"}`}>
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

/** Section card wrapper */
function SectionCard({
  icon,
  iconBg,
  iconColor,
  title,
  children,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
          <i className={`bi ${icon} ${iconColor} text-sm`}></i>
        </div>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-5 divide-y divide-gray-100">{children}</div>
    </div>
  );
}

/** Edit section card wrapper */
function EditSectionCard({
  icon,
  iconBg,
  iconColor,
  title,
  children,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-200">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
          <i className={`bi ${icon} ${iconColor} text-sm`}></i>
        </div>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

/** Action buttons row */
function ActionBar({
  isEditing,
  saving,
  canEdit,
  onEdit,
  onSave,
  onCancel,
  editLabel,
}: {
  isEditing: boolean;
  saving: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  editLabel: string;
}) {
  if (!isEditing) {
    return (
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
        {editLabel}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all border border-gray-200"
      >
        <i className="bi bi-x-lg text-xs"></i>
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        {saving ? (
          <>
            <i className="bi bi-arrow-clockwise animate-spin text-xs"></i>
            Saving…
          </>
        ) : (
          <>
            <i className="bi bi-check-lg text-xs"></i>
            Save Changes
          </>
        )}
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BasicInformation({
  profile,
  editedProfile,
  isEditing,
  saving,
  canEdit = true,
  onEdit,
  onSave,
  onCancel,
  onNestedInputChange,
  nationalities,
  ranks = [],
  fleets = [],
  companies = [],
  validationErrors = {},
}: BasicInformationProps) {
  const { getValidationError, hasValidationError } = useValidation({ validationErrors });

  const val = (parent: string, field: string): string =>
    ((editedProfile?.[parent as keyof User] as Record<string, unknown>)?.[field] as string) || "";

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <i className="bi bi-person-lines-fill text-blue-600"></i>
            Basic Information
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">Personal identity and employment details</p>
        </div>
        <ActionBar
          isEditing={isEditing}
          saving={saving}
          canEdit={canEdit}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          editLabel="Edit Profile"
        />
      </div>

      {/* ══════════════════════════════════════════ VIEW MODE */}
      {!isEditing && (
        <div className="space-y-4">
          {/* Full Name — prominent display */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
            <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mb-1">Full Name</p>
            <p className="text-2xl font-black leading-tight">
              {profile.profile?.full_name || "—"}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: "Last", value: profile.profile?.last_name },
                { label: "First", value: profile.profile?.first_name },
                { label: "Middle", value: profile.profile?.middle_name },
                { label: "Suffix", value: profile.profile?.suffix },
              ].map((n) =>
                n.value ? (
                  <span key={n.label} className="bg-white/15 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    {n.label}: {n.value}
                  </span>
                ) : null
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Demographics */}
            <SectionCard icon="bi-globe2" iconBg="bg-indigo-100" iconColor="text-indigo-600" title="Demographics">
              <InfoRow icon="bi-flag-fill" iconColor="text-emerald-500" label="Nationality" value={profile.profile?.nationality as string} />
              <InfoRow icon="bi-gender-ambiguous" iconColor="text-pink-500" label="Gender" value={profile.profile?.gender as string} />
              <InfoRow icon="bi-heart-fill" iconColor="text-rose-500" label="Civil Status" value={profile.profile?.civil_status as string} />
            </SectionCard>

            {/* Birth & Personal */}
            <SectionCard icon="bi-calendar-heart" iconBg="bg-orange-100" iconColor="text-orange-600" title="Birth & Personal">
              <InfoRow icon="bi-calendar3" iconColor="text-blue-500" label="Birth Date" value={formatDate(profile.profile?.birth_date as string)} />
              <InfoRow icon="bi-geo" iconColor="text-teal-500" label="Birth Place" value={profile.profile?.birth_place as string} />
              <InfoRow icon="bi-book" iconColor="text-violet-500" label="Religion" value={profile.profile?.religion as string} />
            </SectionCard>

            {/* Employment */}
            <SectionCard icon="bi-briefcase-fill" iconBg="bg-blue-100" iconColor="text-blue-600" title="Employment">
              <InfoRow icon="bi-award-fill" iconColor="text-amber-500" label="Rank" value={profile.profile?.rank_name || ranks.find((r) => r.id === profile.profile?.rank_id)?.name || null} />
              <InfoRow icon="bi-ship" iconColor="text-cyan-500" label="Fleet" value={profile.profile?.fleet_name || fleets.find((f) => f.id === profile.profile?.fleet_id)?.name || null} />
              <InfoRow icon="bi-building" iconColor="text-slate-500" label="Company" value={profile.profile?.company_name || companies.find((c) => c.id === (profile.profile as any)?.company_id)?.name || null} />
            </SectionCard>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════ EDIT MODE */}
      {isEditing && (
        <div className="space-y-5">
          {/* Full Name */}
          <EditSectionCard icon="bi-person-badge" iconBg="bg-blue-100" iconColor="text-blue-600" title="Full Name">
            <div>
              <TextField
                label="Last Name"
                value={val("profile", "last_name")}
                onChange={(e) => onNestedInputChange("profile", "last_name", e.target.value)}
                fullWidth variant="outlined" required
                error={hasValidationError("profile.last_name")}
              />
              <ValidationError errors={getValidationError("profile.last_name")} />
            </div>
            <div>
              <TextField
                label="First Name"
                value={val("profile", "first_name")}
                onChange={(e) => onNestedInputChange("profile", "first_name", e.target.value)}
                fullWidth variant="outlined" required
                error={hasValidationError("profile.first_name")}
              />
              <ValidationError errors={getValidationError("profile.first_name")} />
            </div>
            <div>
              <TextField
                label="Middle Name"
                value={val("profile", "middle_name")}
                onChange={(e) => onNestedInputChange("profile", "middle_name", e.target.value)}
                fullWidth variant="outlined"
                error={hasValidationError("profile.middle_name")}
              />
              <ValidationError errors={getValidationError("profile.middle_name")} />
            </div>
            <div>
              <TextField
                label="Suffix (Jr., Sr., III…)"
                value={val("profile", "suffix")}
                onChange={(e) => onNestedInputChange("profile", "suffix", e.target.value)}
                fullWidth variant="outlined"
                error={hasValidationError("profile.suffix")}
              />
              <ValidationError errors={getValidationError("profile.suffix")} />
            </div>
          </EditSectionCard>

          {/* Demographics */}
          <EditSectionCard icon="bi-globe2" iconBg="bg-indigo-100" iconColor="text-indigo-600" title="Demographics">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Nationality</label>
              <FormControl fullWidth variant="outlined" error={hasValidationError("profile.nationality")}>
                <Select
                  value={val("profile", "nationality")}
                  onChange={(e: SelectChangeEvent) => onNestedInputChange("profile", "nationality", e.target.value)}
                  displayEmpty
                  renderValue={(v) => {
                    if (!v) return <span className="text-gray-400">Select Nationality</span>;
                    return nationalities.find((n) => n.nationality === v)?.nationality ?? v;
                  }}
                >
                  <MenuItem value="">Select Nationality</MenuItem>
                  {nationalities.map((n) => <MenuItem key={n.id} value={n.nationality}>{n.nationality}</MenuItem>)}
                </Select>
              </FormControl>
              <ValidationError errors={getValidationError("profile.nationality")} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Gender</label>
              <FormControl fullWidth variant="outlined" error={hasValidationError("profile.gender")}>
                <Select
                  value={val("profile", "gender")}
                  onChange={(e: SelectChangeEvent) => onNestedInputChange("profile", "gender", e.target.value)}
                  displayEmpty
                  renderValue={(v) => v || <span className="text-gray-400">Select Gender</span>}
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  {GENDER_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
              <ValidationError errors={getValidationError("profile.gender")} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Civil Status</label>
              <FormControl fullWidth variant="outlined" error={hasValidationError("profile.civil_status")}>
                <Select
                  value={val("profile", "civil_status")}
                  onChange={(e: SelectChangeEvent) => onNestedInputChange("profile", "civil_status", e.target.value)}
                  displayEmpty
                  renderValue={(v) => v || <span className="text-gray-400">Select Civil Status</span>}
                >
                  <MenuItem value="">Select Civil Status</MenuItem>
                  {CIVIL_STATUS_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </Select>
              </FormControl>
              <ValidationError errors={getValidationError("profile.civil_status")} />
            </div>
          </EditSectionCard>

          {/* Birth & Personal */}
          <EditSectionCard icon="bi-calendar-heart" iconBg="bg-orange-100" iconColor="text-orange-600" title="Birth & Personal">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Birth Date</label>
              <DatePicker
                value={(() => {
                  const d = val("profile", "birth_date") || profile.profile?.birth_date;
                  if (!d) return null;
                  try { return dayjs(d).isValid() ? dayjs(d) : null; } catch { return null; }
                })()}
                onChange={(newVal) => {
                  try {
                    onNestedInputChange("profile", "birth_date", newVal && dayjs(newVal).isValid() ? dayjs(newVal).format("YYYY-MM-DD") : "");
                  } catch { onNestedInputChange("profile", "birth_date", ""); }
                }}
                slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
              />
            </div>
            <div>
              <TextField
                label="Birth Place"
                value={val("profile", "birth_place")}
                onChange={(e) => onNestedInputChange("profile", "birth_place", e.target.value)}
                fullWidth variant="outlined"
                error={hasValidationError("profile.birth_place")}
              />
              <ValidationError errors={getValidationError("profile.birth_place")} />
            </div>
            <div>
              <TextField
                label="Religion"
                value={val("profile", "religion")}
                onChange={(e) => onNestedInputChange("profile", "religion", e.target.value)}
                fullWidth variant="outlined"
                error={hasValidationError("profile.religion")}
              />
              <ValidationError errors={getValidationError("profile.religion")} />
            </div>
          </EditSectionCard>

          {/* Rank, Fleet & Company */}
          <EditSectionCard icon="bi-award" iconBg="bg-amber-100" iconColor="text-amber-600" title="Rank, Fleet & Company">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Rank</label>
              <FormControl fullWidth variant="outlined" error={hasValidationError("profile.rank_id")}>
                <Select
                  value={(editedProfile?.profile as any)?.rank_id != null ? String((editedProfile?.profile as any).rank_id) : ""}
                  onChange={(e: SelectChangeEvent) => onNestedInputChange("profile", "rank_id", e.target.value === "" ? null : Number(e.target.value))}
                  displayEmpty
                  renderValue={(v) => {
                    if (!v) return <span className="text-gray-400">Select Rank</span>;
                    return ranks.find((r) => String(r.id) === v)?.name ?? v;
                  }}
                >
                  <MenuItem value="">Select Rank</MenuItem>
                  {ranks.map((r) => <MenuItem key={r.id} value={String(r.id)}>{r.name}</MenuItem>)}
                </Select>
              </FormControl>
              <ValidationError errors={getValidationError("profile.rank_id")} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Fleet</label>
              <FormControl fullWidth variant="outlined" error={hasValidationError("profile.fleet_id")}>
                <Select
                  value={(editedProfile?.profile as any)?.fleet_id != null ? String((editedProfile?.profile as any).fleet_id) : ""}
                  onChange={(e: SelectChangeEvent) => onNestedInputChange("profile", "fleet_id", e.target.value === "" ? null : Number(e.target.value))}
                  displayEmpty
                  renderValue={(v) => {
                    if (!v) return <span className="text-gray-400">Select Fleet</span>;
                    return fleets.find((f) => String(f.id) === v)?.name ?? v;
                  }}
                >
                  <MenuItem value="">Select Fleet</MenuItem>
                  {fleets.map((f) => <MenuItem key={f.id} value={String(f.id)}>{f.name}</MenuItem>)}
                </Select>
              </FormControl>
              <ValidationError errors={getValidationError("profile.fleet_id")} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Company</label>
              <FormControl fullWidth variant="outlined" error={hasValidationError("profile.company_id")}>
                <Select
                  value={(editedProfile?.profile as any)?.company_id != null ? String((editedProfile?.profile as any).company_id) : ""}
                  onChange={(e: SelectChangeEvent) => onNestedInputChange("profile", "company_id", e.target.value === "" ? null : Number(e.target.value))}
                  displayEmpty
                  renderValue={(v) => {
                    if (!v) return <span className="text-gray-400">Select Company</span>;
                    return companies.find((c) => String(c.id) === v)?.name ?? v;
                  }}
                >
                  <MenuItem value="">Select Company</MenuItem>
                  {companies.map((c) => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <ValidationError errors={getValidationError("profile.company_id")} />
            </div>
          </EditSectionCard>
        </div>
      )}
    </div>
  );
}
