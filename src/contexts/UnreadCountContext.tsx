"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "@/lib/axios";

interface UnreadCountContextType {
  unreadCount: number;
  refetchUnreadCount: () => Promise<void>;
}

const UnreadCountContext = createContext<UnreadCountContextType | undefined>(undefined);

interface UnreadCountProviderProps {
  children: ReactNode;
  userId: number | null;
}

export function UnreadCountProvider({ children, userId }: UnreadCountProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await api.get(`/admin-inquiry-messages/${userId}`);
      const inquiries = response.data;

      // Calculate total unread messages where is_staff_reply = 0 (crew messages)
      let totalUnread = 0;
      inquiries.forEach((inquiry: any) => {
        if (inquiry.messages) {
          const unreadCrewMessages = inquiry.messages.filter(
            (msg: any) => !msg.is_staff_reply && msg.read_at === null
          );
          totalUnread += unreadCrewMessages.length;
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
    <UnreadCountContext.Provider value={{ unreadCount, refetchUnreadCount }}>
      {children}
    </UnreadCountContext.Provider>
  );
}

export function useUnreadCount() {
  const context = useContext(UnreadCountContext);
  if (context === undefined) {
    throw new Error("useUnreadCount must be used within an UnreadCountProvider");
  }
  return context;
}
