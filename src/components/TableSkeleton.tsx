"use client";

type Align = "left" | "center" | "right";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
  colWidths?: string[];
  align?: Align[];
  className?: string;
}

export default function TableSkeleton({
  columns = 6,
  rows = 8,
  showHeader = true,
  colWidths,
  align,
  className = "",
}: TableSkeletonProps) {
  const widthFor = (i: number) =>
    colWidths?.[i] ?? `${Math.floor(100 / columns)}%`;

  const alignFor = (i: number) => {
    const a = align?.[i] ?? "left";
    if (a === "center") return "text-center";
    if (a === "right") return "text-right";
    return "text-left";
  };

  const shimmer =
    "relative overflow-hidden bg-gray-200 rounded-md before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  return (
    <div className={`bg-white rounded-xl shadow overflow-hidden ${className}`}>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          {showHeader && (
            <thead className="bg-gray-100">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 ${alignFor(i)}`}
                    style={{ width: widthFor(i) }}
                  >
                    <div className={`h-4 w-24 ${shimmer}`} />
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-t">
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className={`px-4 py-3 ${alignFor(c)}`}>
                    <div
                      className={`h-4 ${shimmer}`}
                      style={{
                        width:
                          c === 0
                            ? "70%"
                            : c === columns - 1
                            ? "40%"
                            : "55%",
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
