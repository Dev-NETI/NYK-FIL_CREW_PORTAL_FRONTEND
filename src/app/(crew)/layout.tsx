"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { CrewUnreadCountProvider } from "@/contexts/CrewUnreadCountContext";
import { AuthService } from "@/services/auth";

export default function CrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = AuthService.getStoredUser();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  return (
    <CrewUnreadCountProvider userId={currentUser?.id || null}>
      <div className="min-h-screen">
        <Navigation />
        <main className="pb-25 md:pb-8 pt-5">{children}</main>
      </div>
    </CrewUnreadCountProvider>
  );
}
