"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "@/lib/axios";

interface CrewUnreadCountContextType {
  unreadCount: number;
  refetchUnreadCount: () => Promise<void>;
}

const CrewUnreadCountContext = createContext<CrewUnreadCountContextType | undefined>(undefined);

interface CrewUnreadCountProviderProps {
  children: ReactNode;
  userId: number | null;
}

export function CrewUnreadCountProvider({ children, userId }: CrewUnreadCountProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await api.get(`/inquiry/${userId}`);
      const inquiries = response.data;

      // Calculate total unread staff replies (is_staff_reply = 1)
      let totalUnread = 0;
      inquiries.forEach((inquiry: any) => {
        if (inquiry.messages) {
          const unreadStaffMessages = inquiry.messages.filter(
            (msg: any) => msg.is_staff_reply && msg.read_at === null
          );
          totalUnread += unreadStaffMessages.length;
        }
      });

      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [userId]);

  // Initial fetch and auto-refresh every 10 seconds
  useEffect(() => {
    fetchUnreadCount();

    const intervalId = setInterval(fetchUnreadCount, 10000);

    return () => clearInterval(intervalId);
  }, [fetchUnreadCount]);

  const refetchUnreadCount = useCallback(async () => {
    await fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <CrewUnreadCountContext.Provider value={{ unreadCount, refetchUnreadCount }}>
      {children}
    </CrewUnreadCountContext.Provider>
  );
}

export function useCrewUnreadCount() {
  const context = useContext(CrewUnreadCountContext);
  if (context === undefined) {
    throw new Error("useCrewUnreadCount must be used within a CrewUnreadCountProvider");
  }
  return context;
}
