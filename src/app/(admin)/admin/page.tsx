"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import DataPrivacyModal from "@/components/DataPrivacyModal";
import { DashboardService, DashboardData } from "@/services/dashboard";

// ─── Colour tokens ─────────────────────────────────────────────────────────
const COLORS = {
  blue: "#3b82f6",
  indigo: "#6366f1",
  green: "#10b981",
  teal: "#14b8a6",
  yellow: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280",
};

const PIE_COLORS = [
  COLORS.blue,
  COLORS.green,
  COLORS.yellow,
  COLORS.purple,
  COLORS.teal,
  COLORS.pink,
];
const APPT_COLORS: Record<string, string> = {
  pending: COLORS.yellow,
  confirmed: COLORS.blue,
  completed: COLORS.green,
  cancelled: COLORS.red,
  "no-show": COLORS.gray,
};

// ─── Skeleton loader ─────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// ─── Stat card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: string;
  gradient: string;
  iconBg: string;
  loading?: boolean;
  badge?: { label: string; color: string };
}
function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  iconBg,
  loading,
  badge,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <Skeleton className="h-9 w-20 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-sm border border-gray-100 p-6 ${gradient}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <p className="text-4xl font-bold text-white tracking-tight">
            {value.toLocaleString()}
          </p>
          {subtitle && <p className="text-sm text-white/70 mt-2">{subtitle}</p>}
          {badge && (
            <span
              className={`inline-flex items-center mt-3 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}
            >
              {badge.label}
            </span>
          )}
        </div>
        <div
          className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}
        >
          <i className={`${icon} text-2xl text-white`}></i>
        </div>
      </div>
      {/* Decorative blob */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
    </div>
  );
}

// ─── Alert chip ───────────────────────────────────────────────────────────────
interface AlertItemProps {
  count: number;
  label: string;
  href: string;
  color: string;
  icon: string;
}
function AlertItem({ count, label, href, color, icon }: AlertItemProps) {
  if (count === 0) return null;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 ${color}`}
    >
      <i className={`${icon} text-base`}></i>
      <span className="text-lg font-bold">{count}</span>
      <span>{label}</span>
      <i className="bi bi-arrow-right ml-1 text-xs"></i>
    </Link>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  children,
  loading,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}
    >
      <SectionHeader title={title} subtitle={subtitle} />
      {loading ? <Skeleton className="h-48 w-full rounded-xl" /> : children}
    </div>
  );
}

// ─── Custom Donut label ───────────────────────────────────────────────────────
function DonutCenter({
  cx,
  cy,
  value,
  label,
}: {
  cx: number;
  cy: number;
  value: number;
  label: string;
}) {
  return (
    <text textAnchor="middle" dominantBaseline="middle">
      <tspan
        x={cx}
        y={cy - 10}
        className="text-2xl font-bold fill-gray-800"
        style={{ fontSize: 24, fontWeight: 700 }}
      >
        {value.toLocaleString()}
      </tspan>
      <tspan
        x={cx}
        y={cy + 14}
        className="fill-gray-500"
        style={{ fontSize: 11 }}
      >
        {label}
      </tspan>
    </text>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-2.5 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}:{" "}
          <span className="font-bold">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Progress bar row ─────────────────────────────────────────────────────────
function ProgressRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-600 capitalize">
          {label}
        </span>
        <span className="text-xs font-bold text-gray-800">
          {value.toLocaleString()}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Pending feed item ────────────────────────────────────────────────────────
function FeedItem({
  icon,
  name,
  time,
  color,
}: {
  icon: string;
  name: string;
  time: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <i className={`${icon} text-sm`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
      <i className="bi bi-clock text-xs text-yellow-500"></i>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("privacy_consented")) {
      setShowPrivacyModal(true);
    }
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      const result = await DashboardService.getAdminDashboard();
      setData(result);
    } catch (e: any) {
      setError("Data coming soon.");
    } finally {
      setLoading(false);
    }
  }

  // Derived values
  const totalAlerts = data
    ? data.documents.total_pending +
      data.documents.expiring_travel_30_days +
      data.documents.expiring_certificates_30_days +
      data.contracts.expiring_30_days +
      data.profile_updates.pending
    : 0;

  // Crew status pie data
  const crewStatusData = data
    ? [
        { name: "On Board", value: data.crew.on_board },
        { name: "On Vacation", value: data.crew.on_vacation },
        {
          name: "Other",
          value: Math.max(
            0,
            data.crew.total - data.crew.on_board - data.crew.on_vacation,
          ),
        },
      ].filter((d) => d.value > 0)
    : [];

  // Appointment status pie data
  const apptStatusData = data
    ? Object.entries(data.appointments.by_status).map(([status, count]) => ({
        name: status
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        value: count as number,
        color: APPT_COLORS[status] ?? COLORS.gray,
      }))
    : [];

  // Document pending bar data
  const docQueueData = data
    ? [
        {
          name: "Employment",
          count: data.documents.pending_employment,
          fill: COLORS.blue,
        },
        {
          name: "Travel",
          count: data.documents.pending_travel,
          fill: COLORS.purple,
        },
        {
          name: "Certificates",
          count: data.documents.pending_certificates,
          fill: COLORS.orange,
        },
      ]
    : [];

  // Debriefing by status
  const debriefData = data
    ? Object.entries(data.debriefing_forms.by_status).map(([k, v]) => ({
        name: k.charAt(0).toUpperCase() + k.slice(1),
        value: v as number,
      }))
    : [];

  return (
    <>
      <DataPrivacyModal
        open={showPrivacyModal}
        onConsent={() => {
          sessionStorage.setItem("privacy_consented", "true");
          setShowPrivacyModal(false);
        }}
      />

      <div className="space-y-6 p-4 lg:p-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Operations Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Real-time crew management overview ·{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <i className="bi bi-arrow-clockwise"></i>
            Refresh
          </button>
        </div>

        {/* ── Error banner ────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            {error}
          </div>
        )}

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Total Crew Members"
            value={data?.crew.total ?? 0}
            subtitle={`${data?.crew.with_active_contracts ?? 0} with active contracts`}
            icon="bi bi-people-fill"
            gradient="bg-gradient-to-br from-blue-600 to-blue-500"
            iconBg="bg-blue-400/40"
            loading={loading}
            badge={{
              label: `${data?.crew.new_hires ?? 0} new hires`,
              color: "bg-white/25 text-white",
            }}
          />
          <StatCard
            title="Active Contracts"
            value={data?.contracts.active ?? 0}
            subtitle={`${data?.contracts.expiring_30_days ?? 0} expiring in 30 days`}
            icon="bi bi-file-earmark-check-fill"
            gradient="bg-gradient-to-br from-emerald-600 to-teal-500"
            iconBg="bg-emerald-400/40"
            loading={loading}
            badge={{
              label: `${data?.contracts.total ?? 0} total`,
              color: "bg-white/25 text-white",
            }}
          />
          <StatCard
            title="Pending Approvals"
            value={data?.documents.total_pending ?? 0}
            subtitle={`Emp: ${data?.documents.pending_employment ?? 0}  ·  Travel: ${data?.documents.pending_travel ?? 0}  ·  Cert: ${data?.documents.pending_certificates ?? 0}`}
            icon="bi bi-folder-check"
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
            iconBg="bg-amber-400/40"
            loading={loading}
            badge={
              (data?.documents.total_pending ?? 0) > 0
                ? { label: "Needs review", color: "bg-white/25 text-white" }
                : { label: "All clear", color: "bg-white/25 text-white" }
            }
          />
          <StatCard
            title="Today's Appointments"
            value={data?.appointments.today ?? 0}
            subtitle={`${data?.appointments.this_month ?? 0} this month`}
            icon="bi bi-calendar2-check-fill"
            gradient="bg-gradient-to-br from-violet-600 to-purple-500"
            iconBg="bg-violet-400/40"
            loading={loading}
            badge={{
              label: `${data?.profile_updates.pending ?? 0} profile updates pending`,
              color: "bg-white/25 text-white",
            }}
          />
        </div>

        {/* ── Secondary KPI row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Vessels",
              value: data?.vessels.total ?? 0,
              sub: `${data?.vessels.active ?? 0} active`,
              icon: "bi bi-water",
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "On Board",
              value: data?.crew.on_board ?? 0,
              sub: "Currently deployed",
              icon: "bi bi-person-check",
              color: "text-green-600 bg-green-50",
            },
            {
              label: "On Vacation",
              value: data?.crew.on_vacation ?? 0,
              sub: "Resting ashore",
              icon: "bi bi-umbrella",
              color: "text-amber-600 bg-amber-50",
            },
            {
              label: "Debriefing Forms",
              value: data?.debriefing_forms.total ?? 0,
              sub: `${data?.debriefing_forms.by_status?.submitted ?? 0} awaiting review`,
              icon: "bi bi-clipboard2-data",
              color: "text-purple-600 bg-purple-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
            >
              {loading ? (
                <Skeleton className="h-16 w-full rounded-xl" />
              ) : (
                <>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}
                  >
                    <i className={`${s.icon} text-xl`}></i>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      {s.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {s.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">{s.sub}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* ── Alerts ──────────────────────────────────────────────────────── */}
        {!loading && totalAlerts > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <i className="bi bi-exclamation-triangle-fill text-amber-500"></i>
              <span className="text-sm font-bold text-amber-800">
                {totalAlerts} items require your attention
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <AlertItem
                count={data!.documents.pending_employment}
                label="Pending Employment Docs"
                href="/admin/documents"
                icon="bi bi-file-earmark-text"
                color="bg-blue-100 text-blue-800 hover:bg-blue-200"
              />
              <AlertItem
                count={data!.documents.pending_travel}
                label="Pending Travel Docs"
                href="/admin/documents"
                icon="bi bi-passport"
                color="bg-purple-100 text-purple-800 hover:bg-purple-200"
              />
              <AlertItem
                count={data!.documents.pending_certificates}
                label="Pending Certificates"
                href="/admin/documents"
                icon="bi bi-award"
                color="bg-orange-100 text-orange-800 hover:bg-orange-200"
              />
              <AlertItem
                count={data!.documents.expiring_travel_30_days}
                label="Travel Docs Expiring (30d)"
                href="/admin/documents"
                icon="bi bi-clock-history"
                color="bg-red-100 text-red-800 hover:bg-red-200"
              />
              <AlertItem
                count={data!.documents.expiring_certificates_30_days}
                label="Certs Expiring (30d)"
                href="/admin/documents"
                icon="bi bi-shield-exclamation"
                color="bg-red-100 text-red-800 hover:bg-red-200"
              />
              <AlertItem
                count={data!.contracts.expiring_30_days}
                label="Contracts Expiring (30d)"
                href="/admin/crew"
                icon="bi bi-calendar-x"
                color="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              />
              <AlertItem
                count={data!.profile_updates.pending}
                label="Profile Update Requests"
                href="/admin/crew/profile-update-approvals"
                icon="bi bi-person-gear"
                color="bg-teal-100 text-teal-800 hover:bg-teal-200"
              />
            </div>
          </div>
        )}

        {/* ── Row 1: Crew Status + Monthly Registrations ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Crew Status Donut */}
          <ChartCard
            title="Crew Status Distribution"
            subtitle="Current deployment breakdown"
            loading={loading}
          >
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={crewStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {crewStatusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [Number(v).toLocaleString(), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1">
                {crewStatusData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 py-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                    <span className="text-xs text-gray-600 flex-1">
                      {d.name}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {d.value.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="pt-3 mt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Total Crew</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.crew.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* New Registrations Area Chart */}
          <ChartCard
            title="New Crew Registrations"
            subtitle="Last 6 months"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={data?.crew.registrations_by_month ?? []}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.blue}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.blue}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="New Crew"
                  stroke={COLORS.blue}
                  fill="url(#regGrad)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS.blue }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Row 2: Contracts timeline + Appointment status ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Contracts ending by month */}
          <ChartCard
            title="Contracts Ending by Month"
            subtitle="Next 6 months forecast"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={data?.contracts.ending_by_month ?? []}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Contracts ending"
                  radius={[6, 6, 0, 0]}
                >
                  {(data?.contracts.ending_by_month ?? []).map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.count >=
                          (data?.contracts.expiring_30_days ?? 0) && i === 0
                          ? COLORS.red
                          : COLORS.indigo
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Appointment status donut */}
          <ChartCard
            title="Appointment Status"
            subtitle="All-time breakdown"
            loading={loading}
          >
            {apptStatusData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No appointment data available
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie
                      data={apptStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {apptStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [Number(v).toLocaleString(), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1">
                  {apptStatusData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center gap-2 py-0.5"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-xs text-gray-600 flex-1">
                        {d.name}
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {d.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 mt-1 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data?.appointments.today ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* ── Row 3: Document queue + Contract expiry + Gender ────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Document Approval Queue */}
          <ChartCard
            title="Document Approval Queue"
            subtitle="Pending reviews by type"
            loading={loading}
          >
            <div className="mt-2 space-y-2">
              {docQueueData.map((d) => (
                <ProgressRow
                  key={d.name}
                  label={d.name}
                  value={d.count}
                  max={data?.documents.total_pending || 1}
                  color={d.fill}
                />
              ))}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Total Pending</span>
                <span className="text-lg font-bold text-gray-900">
                  {data?.documents.total_pending ?? 0}
                </span>
              </div>
              <Link
                href="/admin/documents"
                className="flex items-center justify-center gap-1 w-full mt-2 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Review All <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </ChartCard>

          {/* Contract Expiry Breakdown */}
          <ChartCard
            title="Contract Expiry Outlook"
            subtitle="Expiring within time windows"
            loading={loading}
          >
            <div className="mt-2 space-y-3">
              {[
                {
                  label: "Within 30 days",
                  value: data?.contracts.expiring_30_days ?? 0,
                  color: COLORS.red,
                },
                {
                  label: "Within 60 days",
                  value: data?.contracts.expiring_60_days ?? 0,
                  color: COLORS.orange,
                },
                {
                  label: "Within 90 days",
                  value: data?.contracts.expiring_90_days ?? 0,
                  color: COLORS.yellow,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        {item.label}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: item.color }}
                      >
                        {item.value}
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, (item.value / Math.max(data?.contracts.active ?? 1, 1)) * 100)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Active Contracts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.contracts.active ?? 0}
                </p>
              </div>
            </div>
          </ChartCard>

          {/* Gender & Hire Distribution */}
          <ChartCard
            title="Crew Distribution"
            subtitle="Gender & hire type"
            loading={loading}
          >
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Gender
              </p>
              {(data?.crew.gender_distribution ?? []).map((g, i) => (
                <ProgressRow
                  key={g.gender}
                  label={g.gender}
                  value={g.count}
                  max={data?.crew.total || 1}
                  color={PIE_COLORS[i % PIE_COLORS.length]}
                />
              ))}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-4">
                Hire Type
              </p>
              <ProgressRow
                label="New Hire"
                value={data?.crew.new_hires ?? 0}
                max={data?.crew.total || 1}
                color={COLORS.teal}
              />
              <ProgressRow
                label="Re-Hire"
                value={data?.crew.re_hires ?? 0}
                max={data?.crew.total || 1}
                color={COLORS.indigo}
              />
            </div>
          </ChartCard>
        </div>

        {/* ── Row 4: Top Vessels + Pending Feed + Debriefing ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Top Vessels by Active Crew */}
          <ChartCard
            title="Top Vessels by Crew"
            subtitle="Active crew count"
            loading={loading}
          >
            {(data?.contracts.top_vessels ?? []).length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                No active vessel data
              </div>
            ) : (
              <div className="space-y-3 mt-1">
                {(data?.contracts.top_vessels ?? []).map((v, i) => (
                  <div key={v.id} className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-gray-400">
                      #{i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700 truncate max-w-[140px]">
                          {v.name}
                        </span>
                        <span className="text-xs font-bold text-blue-600">
                          {v.active_crew}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                          style={{
                            width: `${(v.active_crew / (data?.contracts.top_vessels[0]?.active_crew || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>

          {/* Pending Documents Feed */}
          <ChartCard
            title="Pending Approvals Feed"
            subtitle="Most recent submissions"
            loading={loading}
          >
            {(data?.documents.recent_pending_employment ?? []).length === 0 &&
            (data?.documents.recent_pending_travel ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-2">
                <i className="bi bi-check-circle text-2xl text-green-400"></i>
                All documents reviewed
              </div>
            ) : (
              <div>
                {(data?.documents.recent_pending_employment ?? []).map(
                  (item) => (
                    <FeedItem
                      key={`emp-${item.id}`}
                      icon="bi bi-file-earmark-text"
                      name={item.crew_name}
                      time={item.created_at}
                      color="bg-blue-50 text-blue-500"
                    />
                  ),
                )}
                {(data?.documents.recent_pending_travel ?? []).map((item) => (
                  <FeedItem
                    key={`trv-${item.id}`}
                    icon="bi bi-passport"
                    name={item.crew_name}
                    time={item.created_at}
                    color="bg-purple-50 text-purple-500"
                  />
                ))}
                <Link
                  href="/admin/documents"
                  className="flex items-center justify-center gap-1 w-full mt-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  View All Pending <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            )}
          </ChartCard>

          {/* Debriefing Forms */}
          <ChartCard
            title="Debriefing Forms"
            subtitle="Status overview"
            loading={loading}
          >
            <div className="space-y-3 mt-1">
              {debriefData.map((d, i) => (
                <ProgressRow
                  key={d.name}
                  label={d.name}
                  value={d.value}
                  max={data?.debriefing_forms.total || 1}
                  color={
                    [COLORS.gray, COLORS.yellow, COLORS.green][i] ?? COLORS.blue
                  }
                />
              ))}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {data?.debriefing_forms.total ?? 0}
                </span>
              </div>
              <Link
                href="/admin/debriefing-form"
                className="flex items-center justify-center gap-1 w-full mt-2 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Manage Forms <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </ChartCard>
        </div>
      </div>
    </>
  );
}
