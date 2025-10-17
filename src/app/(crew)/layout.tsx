"use client";

import Navigation from "@/components/Navigation";

export default function CrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pb-20 md:pb-8">{children}</main>
    </div>
  );
}
