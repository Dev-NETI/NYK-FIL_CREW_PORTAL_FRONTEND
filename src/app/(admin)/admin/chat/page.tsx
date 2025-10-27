"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import api from "@/lib/axios";
import { AuthService } from "@/services";
import { useUnreadCount } from "@/contexts/UnreadCountContext";

// Ticket status type
export type TicketStatus = "open" | "pending" | "closed" | "in_progress";

function formatTimestamp(dateString: string | Date | null | undefined): string {
  if (!dateString) return "--:--";

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "--:--";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "--:--";
  }
}

function ConversationCardSkeleton() {
  return (
    <div className="px-4 py-3 border-b border-gray-100 animate-pulse">
      <div className="flex items-start space-x-3">
        {/* Avatar Skeleton */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-gray-300" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 min-w-0">
          {/* Top Row (Name + Time) */}
          <div className="flex items-center justify-between mb-1">
            <div className="h-3 w-20 bg-gray-300 rounded" />
            <div className="h-3 w-10 bg-gray-200 rounded" />
          </div>

          {/* User Name */}
          <div className="h-4 w-32 bg-gray-300 rounded mb-2" />

          {/* Subject */}
          <div className="h-3 w-48 bg-gray-200 rounded mb-2" />

          {/* Last Message */}
          <div className="h-3 w-40 bg-gray-300 rounded mb-3" />

          {/* Bottom Row (Status + Unread Count) */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-gray-200 rounded-full" />
            <div className="h-4 w-6 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inquiry, setInquiry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserData = useRef(AuthService.getStoredUser());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { refetchUnreadCount } = useUnreadCount();

  // Function to mark messages as read
  const markMessagesAsRead = async (inquiryId: number) => {
    try {
      await api.patch(`/admin-messages/${inquiryId}/mark-read`);
      console.log("✅ Messages marked as read for inquiry:", inquiryId);
      // Trigger immediate refetch of unread count
      await refetchUnreadCount();
    } catch (error) {
      console.error("❌ Error marking messages as read:", error);
    }
  };

  // Function to fetch inquiries
  const fetchInquiries = async () => {
    try {
      const response = await api.get(
        `/admin-inquiry-messages/${currentUserData.current!.id}`
      );
      let updatedInquiries = response.data;

      // Sort inquiries by most recent message (newest first)
      updatedInquiries = updatedInquiries.sort((a: any, b: any) => {
        // Use updated_at timestamp for sorting (most recently updated conversations first)
        const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;

        // Sort descending (newest first)
        return bTime - aTime;
      });

      setInquiry(updatedInquiries);

      // If a conversation is selected, update it with fresh data
      setSelectedConversation((prevSelected: any) => {
        if (!prevSelected?.id) return prevSelected;

        const updatedSelectedConversation = updatedInquiries.find(
          (inq: any) => inq.id === prevSelected.id
        );
        return updatedSelectedConversation || prevSelected;
      });
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchInquiries();
  }, []);

  // Auto-refresh messages every 10 seconds when a conversation is selected
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      console.log("🛑 Clearing existing interval");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!selectedConversation?.id) {
      console.log("⏸️ No conversation selected, interval not started");
      return;
    }

    console.log(
      "🔄 Starting auto-refresh for conversation:",
      selectedConversation.id
    );

    // Set up interval to refresh every 10 seconds
    intervalRef.current = setInterval(() => {
      console.log("⏰ Auto-refreshing messages...");
      fetchInquiries();
    }, 10000); // 10 seconds

    // Cleanup interval when conversation changes or component unmounts
    return () => {
      if (intervalRef.current) {
        console.log("🛑 Stopping auto-refresh");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [selectedConversation?.id]);

  // Get messages from selectedConversation
  const selectedMessages =
    selectedConversation && selectedConversation.messages
      ? selectedConversation.messages
          .sort((a: any, b: any) => {
            // Sort by created_at timestamp in ascending order (oldest first)
            return (
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            );
          })
          .map((msg: any) => ({
            id: msg.id,
            sender: msg.is_staff_reply ? "admin" : "user",
            message: msg.message,
            timestamp: formatTimestamp(msg.created_at),
          }))
      : [];

  // Calculate ticket statistics
  const totalTickets = inquiry.length;
  const openTickets = inquiry.filter(
    (inquiry) => inquiry.status === "open"
  ).length;
  const pendingTickets = inquiry.filter(
    (inquiry) => inquiry.status === "in_progress"
  ).length;
  const closedTickets = inquiry.filter(
    (inquiry) => inquiry.status === "closed"
  ).length;

  // Handle conversation selection
  const handleSelectConversation = async (conversation: any) => {
    // Set the selected conversation
    setSelectedConversation(conversation);

    // Mark messages as read
    if (conversation?.id) {
      await markMessagesAsRead(conversation.id);
      // Refresh inquiries to update unread counts
      setTimeout(() => fetchInquiries(), 500);
    }
  };

  // Handle status change
  const handleStatusChange = (ticketId: number, newStatus: TicketStatus) => {
    console.log(
      "📝 Parent handleStatusChange - Ticket ID:",
      ticketId,
      "New Status:",
      newStatus
    );

    // Update inquiry list
    setInquiry((prev) => {
      const updated = prev.map((inq) =>
        inq.id === ticketId ? { ...inq, status: newStatus } : inq
      );
      console.log(
        "📝 Updated inquiry list:",
        updated.find((inq) => inq.id === ticketId)?.status
      );
      return updated;
    });

    // Update selected conversation if it's the one being modified
    if (selectedConversation?.id === ticketId) {
      setSelectedConversation((prev: any) => {
        const updated = { ...prev, status: newStatus };
        console.log("📝 Updated selected conversation status:", updated.status);
        return updated;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Stats */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Ticket Dashboard
        </h1>
        <div className="grid grid-cols-4 gap-4">
          {/* Total Tickets Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">
                  Total Tickets
                </p>
                <p className="text-white text-3xl font-bold">{totalTickets}</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="bi bi-ticket-perforated text-white text-2xl"></i>
              </div>
            </div>
            <div className="mt-3 flex items-center text-blue-100 text-xs">
              <i className="bi bi-info-circle mr-1"></i>
              <span>All support tickets</span>
            </div>
          </div>

          {/* Open Tickets Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">
                  Open Tickets
                </p>
                <p className="text-white text-3xl font-bold">{openTickets}</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="bi bi-check-circle text-white text-2xl"></i>
              </div>
            </div>
            <div className="mt-3 flex items-center text-green-100 text-xs">
              <i className="bi bi-arrow-up-right mr-1"></i>
              <span>Active tickets</span>
            </div>
          </div>

          {/* Pending Tickets Card */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-1">
                  Pending Tickets
                </p>
                <p className="text-white text-3xl font-bold">
                  {pendingTickets}
                </p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="bi bi-clock-history text-white text-2xl"></i>
              </div>
            </div>
            <div className="mt-3 flex items-center text-yellow-100 text-xs">
              <i className="bi bi-hourglass-split mr-1"></i>
              <span>Awaiting response</span>
            </div>
          </div>

          {/* Closed Tickets Card */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium mb-1">
                  Closed Tickets
                </p>
                <p className="text-white text-3xl font-bold">{closedTickets}</p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="bi bi-x-circle text-white text-2xl"></i>
              </div>
            </div>
            <div className="mt-3 flex items-center text-red-100 text-xs">
              <i className="bi bi-check-all mr-1"></i>
              <span>Resolved tickets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Helpdesk Ticket UI */}
      <div className="flex h-[calc(100vh-185px)] max-h-[calc(100vh-185px)] overflow-hidden">
        {/* Left Sidebar - Ticket List */}
        {loading ? (
          <div className="flex-col">
            <ConversationCardSkeleton />
            <ConversationCardSkeleton />
            <ConversationCardSkeleton />
            <ConversationCardSkeleton />
            <ConversationCardSkeleton />
            <ConversationCardSkeleton />
          </div>
        ) : (
          <ConversationList
            conversations={inquiry}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* Right Side - Ticket Chat Window */}
        <ChatWindow
          key={selectedConversation?.id || "no-conversation"}
          conversation={selectedConversation}
          messages={selectedMessages}
          onStatusChange={handleStatusChange}
          onMessageSent={fetchInquiries}
        />
      </div>
    </div>
  );
}
