"use client";

import { ReactNode } from "react";

export default function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white border rounded-xl p-4 sm:p-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}
