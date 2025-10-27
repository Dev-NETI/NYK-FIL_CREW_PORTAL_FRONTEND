"use client";

import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { AuthService } from "@/services";

type TicketStatus = "open" | "pending" | "closed" | "in_progress";

interface Message {
  id: number;
  sender: "user" | "admin";
  message: string;
  timestamp: string;
}

interface Conversation {
  id: number;
  ticketNumber?: string;
  userName?: string;
  userEmail?: string;
  modified_by?: string;
  isOnline?: boolean;
  status: TicketStatus;
  priority?: string;
  subject: string;
  crew?: {
    profile?: {
      first_name?: string;
      last_name?: string;
    };
  };
}

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onStatusChange: (ticketId: number, newStatus: TicketStatus) => void;
  onMessageSent?: () => void; // Callback to refresh messages after sending
}

//Update Status
async function updateInquiryStatus(
  inquiryId: number,
  status: TicketStatus
): Promise<boolean> {
  try {
    const response = await api.put(`/admin-inquiry-messages/${inquiryId}`, {
      status: status,
    });

    return true;
  } catch (error: any) {
    console.error(
      "❌ Error updating status:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Send Admin Message
async function sendAdminMessage(
  inquiryId: number,
  message: string,
  userId: number,
  userName: string
): Promise<any> {
  try {
    const response = await api.post("/admin-messages", {
      inquiry_id: inquiryId,
      message: message,
      user_id: userId,
      modified_by: userName,
      is_staff_reply: true,
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error sending message:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Status configuration
const statusConfig = {
  open: {
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
    label: "Open",
    icon: "bi-check-circle",
  },
  in_progress: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
    label: "Pending",
    icon: "bi-clock-history",
  },
  closed: {
    bg: "bg-red-100",
    text: "text-red-800",
    dot: "bg-red-500",
    label: "Closed",
    icon: "bi-x-circle",
  },
};

export default function ChatWindow({
  conversation,
  messages,
  onStatusChange,
  onMessageSent,
}: ChatWindowProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true); // Flag to control auto-scroll
  const currentUser = AuthService.getStoredUser();

  function getInitials(name: string): string {
    if (!name || name.trim() === "") return "";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      // Single word: take first 2 characters
      return words[0].substring(0, 2).toUpperCase();
    }

    // Multiple words: take first letter of first 2 words
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  const scrollToBottom = (force = false) => {
    if (force || shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Check if user is near the bottom of the scroll area
  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const threshold = 150; // pixels from bottom
    const scrollBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return scrollBottom < threshold;
  };

  // Handle scroll events to update shouldScrollRef
  const handleScroll = () => {
    shouldScrollRef.current = isNearBottom();
  };

  // Auto-scroll only if user is near bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset updating status and scroll to bottom when conversation changes
  useEffect(() => {
    setIsUpdatingStatus(false);
    shouldScrollRef.current = true; // Always scroll to bottom when switching conversations
    setTimeout(() => scrollToBottom(true), 100);
  }, [conversation?.id]);

  // Add scroll listener to track user position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || isSendingMessage || !currentUser) return;

    const messageText = inputMessage.trim();
    setIsSendingMessage(true);

    // Clear input immediately for better UX
    setInputMessage("");

    const loadingToast = toast.loading("Sending message...");

    try {
      // Send admin message
      await sendAdminMessage(
        conversation.id,
        messageText,
        currentUser.id,
        currentUser.name
      );

      toast.success("Message sent successfully!", { id: loadingToast });

      // Trigger parent refresh to get updated messages
      if (onMessageSent) {
        onMessageSent();
      }

      // Force scroll to bottom after sending
      shouldScrollRef.current = true;
      setTimeout(() => scrollToBottom(true), 100);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send message";
      toast.error(errorMessage, { id: loadingToast });

      // Restore message on error
      setInputMessage(messageText);
      console.error("❌ Error sending message:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (isUpdatingStatus) return; // Prevent multiple simultaneous updates

    console.log(
      "🔄 Updating conversation ID:",
      conversation.id,
      "to status:",
      newStatus
    );
    setIsUpdatingStatus(true);
    const loadingToast = toast.loading(`Updating status to ${newStatus}...`);

    try {
      // Call API to update status in backend
      await updateInquiryStatus(conversation.id, newStatus);
      console.log(
        "✅ API update successful for conversation:",
        conversation.id
      );

      // Update UI through parent callback
      onStatusChange(conversation.id, newStatus);

      toast.success(`Status updated to ${newStatus} successfully!`, {
        id: loadingToast,
      });
      setShowStatusDropdown(false);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update status";
      toast.error(errorMessage, { id: loadingToast });
      console.error("❌ Error updating status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Show empty state when no conversation is selected
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <i className="bi bi-chat-square-text text-5xl text-gray-400"></i>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No Conversation Selected
            </h3>
            <p className="text-gray-500 text-lg mb-2">
              Select a ticket from the left sidebar to view and respond to
              messages
            </p>
            <p className="text-gray-400 text-sm">
              All your support conversations will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusStyle = statusConfig[conversation.status];
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Ticket Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between mb-3">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold shadow-md">
                {getInitials(
                  conversation.crew?.profile?.first_name &&
                    conversation.crew?.profile?.last_name
                    ? `${conversation.crew.profile.first_name} ${conversation.crew.profile.last_name}`
                    : conversation.userName || ""
                )}
              </div>
              {conversation.isOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>

            {/* User Details */}
            <div>
              <p className="text-sm text-gray-600">
                {conversation.crew?.profile?.first_name &&
                conversation.crew?.profile?.last_name
                  ? `${conversation.crew.profile.first_name} ${conversation.crew.profile.last_name}`
                  : conversation.userName || "Unknown User"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 italic">
                {conversation.subject}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleStatusChange("closed")}
            disabled={conversation.status === "closed" || isUpdatingStatus}
            className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            {isUpdatingStatus ? (
              <i className="bi bi-arrow-repeat animate-spin"></i>
            ) : (
              <i className="bi bi-x-circle"></i>
            )}
            <span>Mark as Closed</span>
          </button>
          <button
            onClick={() => handleStatusChange("in_progress")}
            disabled={conversation.status === "in_progress" || isUpdatingStatus}
            className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            {isUpdatingStatus ? (
              <i className="bi bi-arrow-repeat animate-spin"></i>
            ) : (
              <i className="bi bi-clock-history"></i>
            )}
            <span>Set Pending</span>
          </button>
          <button
            onClick={() => handleStatusChange("open")}
            disabled={conversation.status === "open" || isUpdatingStatus}
            className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            {isUpdatingStatus ? (
              <i className="bi bi-arrow-repeat animate-spin"></i>
            ) : (
              <i className="bi bi-arrow-clockwise"></i>
            )}
            <span>Reopen</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <i className="bi bi-chat-dots text-4xl text-gray-300 mb-3"></i>
              <p>No messages yet in this ticket.</p>
              <p className="text-sm">Start the conversation below!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message.message}
              sender={message.sender}
              timestamp={message.timestamp}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area / Closed Label */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        {conversation.status === "closed" ? (
          // Closed Conversation Label
          <div className="flex items-center justify-center gap-3 py-4 px-6 bg-red-50 border border-red-200 rounded-lg">
            <i className="bi bi-lock-fill text-red-600 text-xl"></i>
            <div className="text-center">
              <p className="text-sm font-semibold text-red-800">
                This conversation has been closed
              </p>
              <p className="text-xs text-red-600 mt-1">
                No further messages can be sent. Reopen the ticket to continue the conversation.
              </p>
            </div>
          </div>
        ) : (
          // Message Input
          <>
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response to this ticket..."
                  rows={3}
                  disabled={isSendingMessage}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === "" || isSendingMessage}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow-sm flex items-center space-x-2"
              >
                {isSendingMessage ? (
                  <>
                    <i className="bi bi-arrow-repeat animate-spin"></i>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-send"></i>
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift + Enter for new line
            </p>
          </>
        )}
      </div>
    </div>
  );
}
