"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/axios";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { AuthService } from "@/services";
import toast from "react-hot-toast";
import { useCrewUnreadCount } from "@/contexts/CrewUnreadCountContext";
import { motion } from "motion/react";

function getRelativeTime(timestamp: string | Date): string {
  const now = new Date();
  const createdAt = new Date(timestamp);
  const diffInSeconds = Math.floor(
    (now.getTime() - createdAt.getTime()) / 1000,
  );

  const months = Math.floor(diffInSeconds / (30 * 24 * 60 * 60));
  const days = Math.floor(diffInSeconds / (24 * 60 * 60));
  const hours = Math.floor(diffInSeconds / (60 * 60));
  const minutes = Math.floor(diffInSeconds / 60);

  if (months > 0) return `${months}mo`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  if (diffInSeconds > 0) return `${diffInSeconds}s`;
  return "just now";
}

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

export default function InboxPage() {
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newDepartmentCategory, setNewDepartmentCategory] = useState("");
  const [newDepartments, setNewDepartments] = useState("");
  const [newSubjectText, setNewSubjectText] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState("");
  const [departmentCategory, setDepartmentCategory] = useState([]);
  const [department, setDepartment] = useState([]);
  const currentUserData = AuthService.getStoredUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true); // Track if we should auto-scroll
  const { refetchUnreadCount } = useCrewUnreadCount();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  const fetchInquiries = async () => {
    try {
      const response = await api.get(`/inquiry/${currentUserData!.id}`);
      setInquiries(response.data);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    }
  };

  const refreshMessages = async (shouldScroll = false) => {
    if (!selectedConversation) return;

    try {
      const response = await api.get(`/inquiry/${currentUserData!.id}`);
      const updatedInquiries = response.data;
      setInquiries(updatedInquiries);

      // Find and update messages for the selected conversation
      const selectedInquiry = updatedInquiries.find(
        (inq: any) => inq.id === selectedConversation,
      );
      if (selectedInquiry && selectedInquiry.messages) {
        shouldScrollRef.current = shouldScroll; // Control scrolling
        const formattedMessages = selectedInquiry.messages.map((msg: any) => ({
          id: msg.id,
          senderId:
            msg.sender_id === currentUserData!.id ? "me" : msg.sender_id,
          text: msg.message,
          timestamp: formatTimestamp(msg.created_at),
          isSent: msg.sender_id === currentUserData!.id,
          created_at: msg.created_at,
          read_at: msg.read_at,
          is_staff_reply: msg.is_staff_reply,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error refreshing messages:", error);
    }
  };

  const markMessagesAsRead = async (inquiryId: number) => {
    try {
      await api.patch(`/crew-inquiry-messages/${inquiryId}/mark-read`);
      // Trigger immediate refetch of unread count
      await refetchUnreadCount();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const getUnreadStaffMessageCount = (inquiry: any): number => {
    if (!inquiry.messages) return 0;
    return inquiry.messages.filter(
      (msg: any) => msg.is_staff_reply && msg.read_at === null,
    ).length;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "open":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          dot: "bg-green-500",
          label: "Open",
        };
      case "in_progress":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          dot: "bg-yellow-500",
          label: "Pending",
        };
      case "closed":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          dot: "bg-red-500",
          label: "Closed",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          dot: "bg-gray-500",
          label: "Unknown",
        };
    }
  };

  function handleNewMessage() {
    if (!newDepartments || !newSubjectText.trim() || !newMessageText.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      crew_id: currentUserData!.id,
      message: newMessageText,
      modified_by: currentUserData!.id,
      subject: newSubjectText,
      department_id: newDepartments,
    };

    const loadingToast = toast.loading("Sending message...");

    api
      .post("/inquiry", payload)
      .then((response) => {
        toast.success("Message sent successfully!", { id: loadingToast });
        setShowNewMessageModal(false);
        // Reset form
        setNewDepartmentCategory("");
        setNewDepartments("");
        setNewSubjectText("");
        setNewMessageText("");
        // Refresh inquiries list
        fetchInquiries();
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            "Failed to send message. Please try again.",
          { id: loadingToast },
        );
        console.error(
          "Error sending message:",
          error.response?.data || error.message,
        );
      });
  }

  // Fetch all department categories on mount
  useEffect(() => {
    api
      .get("/departmentTypes")
      .then((response) => {
        setDepartmentCategory(response.data);
      })
      .catch((error) => {
        console.error("Error fetching department types:", error);
      });

    fetchInquiries().then(() => setLoading(false));
  }, []);

  // Fetch departments when category changes
  useEffect(() => {
    if (!newDepartmentCategory) return;

    api
      .get(`/department/${newDepartmentCategory}`)
      .then((response) => {
        setDepartment(response.data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, [newDepartmentCategory]);

  // Auto-scroll to bottom when messages change (only if shouldScrollRef is true)
  useEffect(() => {
    if (shouldScrollRef.current) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Auto-refresh messages every 5 seconds when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const intervalId = setInterval(() => {
      refreshMessages(false); // Refresh without scrolling
    }, 5000);

    return () => clearInterval(intervalId);
  }, [selectedConversation]);

  const activeConversation = selectedConversation
    ? inquiries.find((inq: any) => inq.id === selectedConversation)
    : null;

  const handleSelectConversation = async (id: number) => {
    setSelectedConversation(id);
    setShowChat(true);
    shouldScrollRef.current = true; // Enable scrolling when selecting a conversation

    // Find the selected inquiry and load its messages
    const selectedInquiry = inquiries.find((inq: any) => inq.id === id);
    if (selectedInquiry && selectedInquiry.messages) {
      const formattedMessages = selectedInquiry.messages.map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender_id === currentUserData!.id ? "me" : msg.sender_id,
        text: msg.message,
        timestamp: formatTimestamp(msg.created_at),
        isSent: msg.sender_id === currentUserData!.id,
        created_at: msg.created_at,
        read_at: msg.read_at,
        is_staff_reply: msg.is_staff_reply,
      }));
      setMessages(formattedMessages);

      // Mark unread staff messages as read
      const unreadStaffCount = getUnreadStaffMessageCount(selectedInquiry);
      if (unreadStaffCount > 0) {
        await markMessagesAsRead(id);
        // Refresh inquiries to update the UI
        fetchInquiries();
      }
    }
  };

  const handleBackToInbox = () => {
    setShowChat(false);
    setSelectedConversation(null);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    const originalMessageText = messageInput;
    const payload = {
      inquiry_id: selectedConversation,
      message: messageInput,
      user_id: currentUserData!.id,
      modified_by: currentUserData!.name,
    };

    // Optimistically add the message to UI
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const currentTime = new Date().toISOString();
    const optimisticMessage = {
      id: tempId,
      senderId: "me",
      text: messageInput,
      timestamp: formatTimestamp(currentTime),
      isSent: true,
      created_at: currentTime,
      read_at: null,
      is_staff_reply: false,
    };

    // Enable scrolling when user sends a message
    shouldScrollRef.current = true;

    // Add to beginning since backend stores newest first
    setMessages([optimisticMessage, ...messages]);
    setMessageInput("");

    try {
      const response = await api.post("/crew-inquiry-messages", payload);

      // Extract message data - could be in response.data or response.data.data
      const messageData = response.data.data || response.data;

      // Replace optimistic message with real one from server
      const newMessage = {
        id: messageData.id,
        senderId: "me",
        text: originalMessageText,
        timestamp: formatTimestamp(messageData.created_at),
        isSent: true,
        created_at: messageData.created_at,
        read_at: messageData.read_at || null,
        is_staff_reply: messageData.is_staff_reply || false,
      };

      // Update the messages state with the confirmed message
      setMessages((prev) =>
        prev.map((msg) => (msg.id === optimisticMessage.id ? newMessage : msg)),
      );

      // Update inquiries list to show the new message at the beginning
      const updatedInquiries = inquiries.map((inq: any) => {
        if (inq.id === selectedConversation) {
          // Check if message already exists to prevent duplicates
          const messageExists = inq.messages.some(
            (msg: any) => msg.id === messageData.id,
          );

          if (messageExists) {
            return inq;
          }

          return {
            ...inq,
            messages: [
              {
                id: messageData.id,
                sender_id: currentUserData!.id,
                message: originalMessageText,
                created_at: messageData.created_at,
                read_at: messageData.read_at || null,
                is_staff_reply: messageData.is_staff_reply || false,
              },
              ...inq.messages,
            ],
          };
        }
        return inq;
      });

      setInquiries(updatedInquiries);

      // Reload messages from the updated inquiry to ensure we have complete data
      const updatedInquiry = updatedInquiries.find(
        (inq: any) => inq.id === selectedConversation,
      );
      if (updatedInquiry && updatedInquiry.messages) {
        const reloadedMessages = updatedInquiry.messages.map((msg: any) => ({
          id: msg.id,
          senderId:
            msg.sender_id === currentUserData!.id ? "me" : msg.sender_id,
          text: msg.message,
          timestamp: formatTimestamp(msg.created_at),
          isSent: msg.sender_id === currentUserData!.id,
          created_at: msg.created_at,
          read_at: msg.read_at,
          is_staff_reply: msg.is_staff_reply,
        }));
        setMessages(reloadedMessages);
      }
    } catch (error: any) {
      // Remove optimistic message on error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id),
      );
      toast.error(error.response?.data?.message || "Failed to send message");
      console.error("Error sending message:", error);
    }
  };

  function ConversationSkeleton() {
    return (
      <div className="p-4 border-b border-gray-100 animate-pulse">
        <div className="flex items-start gap-3">
          {/* Avatar Skeleton */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-300" />
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <div className="w-1/3 h-3 bg-gray-300 rounded" />
              <div className="w-10 h-3 bg-gray-200 rounded" />
            </div>
            <div className="w-2/3 h-3 bg-gray-200 rounded" />
          </div>

          {/* Unread Badge Placeholder */}
          <div className="w-2 h-2 rounded-full bg-transparent flex-shrink-0 mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen overflow-hidden flex flex-col bg-cover bg-center bg-no-repeat bg-fixed relative pt-15"
      style={{ backgroundImage: "url('/home1.png')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        {/* Hero Header */}
        <motion.div
          className="px-4 sm:px-6 py-4 sm:py-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <i className="bi bi-chat-dots text-xl sm:text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                Inbox
              </h1>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                View and send messages within your crew portal.
              </p>
            </div>
          </div>
        </motion.div>
        {/* Content Container */}
        <div
          className={`flex-1 flex flex-col bg-white rounded-t-4xl overflow-hidden ${
            showChat ? "" : "pb-16 md:pb-0"
          }`}
        >
          {/* Main Container */}
          <div className="flex flex-1 w-full overflow-hidden">
            {/* Inbox List - Left Column */}
            <div
              className={`${
                showChat ? "hidden md:flex" : "flex"
              } flex-col w-full md:w-[380px] lg:w-[400px] h-full bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}
            >
              {/* Header */}
              <div className="p-4 lg:p-6 border-b border-gray-200">
                {/* Search Box */}
                <div className="relative">
                  <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div>
                    {Array.from({ length: 10 }).map((_, index) => (
                      <ConversationSkeleton key={`skeleton-${index}`} />
                    ))}
                  </div>
                ) : inquiries.length > 0 ? (
                  inquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      onClick={() => handleSelectConversation(inquiry.id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation === inquiry.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div
                            className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium"
                            title={`${inquiry.department.department_category.name} - ${inquiry.department.name}`}
                          >
                            {getInitials(
                              inquiry.department.department_category.name,
                            )}
                          </div>
                          {/* {conv.active && (
                        <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white absolute -mt-3 ml-9"></div>
                      )} */}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            {/* <h3
                            className={`text-sm font-semibold text-gray-900 truncate ${
                              conv.unread ? "font-bold" : ""
                            }`}
                          > */}
                            <h3
                              className={`text-sm font-semibold text-gray-900 truncate`}
                            >
                              {inquiry.subject}
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {getRelativeTime(inquiry.messages[0].created_at)}
                            </span>
                          </div>
                          {/* <p
                          className={`text-sm text-gray-600 truncate mt-0.5 ${
                            conv.unread ? "font-medium" : ""
                          }`}
                        >
                          {conv.lastMessage}
                        </p> */}
                          <p
                            className={`text-sm text-gray-600 truncate mt-0.5`}
                          >
                            {inquiry.messages[0].message}
                          </p>
                          {/* Status Badge */}
                          <div className="mt-2">
                            {(() => {
                              const statusStyle = getStatusStyle(
                                inquiry.status,
                              );
                              return (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                                  ></span>
                                  {statusStyle.label}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Unread Staff Messages Count */}
                        {(() => {
                          const unreadCount =
                            getUnreadStaffMessageCount(inquiry);
                          return unreadCount > 0 ? (
                            <div className="flex-shrink-0 mt-2">
                              <div className="min-w-[20px] h-5 px-1.5 bg-blue-600 text-white rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold">
                                  {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-72 text-slate-600">
                    <div className="text-center">
                      <i className="bi bi-chat-dots text-5xl text-gray-300 mb-3"></i>
                      <p className="text-gray-500">No Conversations</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Chat View - Right Column */}
            <div
              className={`${
                showChat ? "flex" : "hidden md:flex"
              } flex-col flex-1 bg-white transition-all duration-300 overflow-hidden`}
            >
              {selectedConversation && activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
                    {/* Back Button (Mobile) */}
                    <button
                      onClick={handleBackToInbox}
                      className="md:hidden text-gray-600 hover:text-blue-600 transition-transform duration-200 hover:-translate-x-1 p-2 -ml-2"
                    >
                      <i className="bi bi-arrow-left text-xl"></i>
                    </button>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                      {getInitials(
                        activeConversation.department.department_category.name,
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900">
                        {activeConversation.subject}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {activeConversation.department.department_category.name}{" "}
                        - {activeConversation.department.name}
                      </p>
                    </div>

                    {/* Menu Button */}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <i className="bi bi-three-dots-vertical text-xl text-gray-700"></i>
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div
                    className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-gray-50 min-h-0 pb-22"
                    id="messages-container"
                  >
                    {messages
                      .slice()
                      .reverse()
                      .map((message, index) => (
                        <div
                          key={`${message.id}-${index}`}
                          className={`flex ${
                            message.is_staff_reply
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] lg:max-w-[60%] ${
                              message.is_staff_reply
                                ? "bg-white text-gray-900 rounded-2xl rounded-tl-sm border border-gray-200"
                                : "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                            } px-4 py-2.5 shadow-sm`}
                          >
                            <p className="text-sm leading-relaxed">
                              {message.text}
                            </p>
                            <div
                              className={`flex items-center gap-1 mt-1 ${
                                message.is_staff_reply
                                  ? "text-gray-500"
                                  : "text-blue-100"
                              }`}
                            >
                              <span className="text-xs">
                                {message.timestamp}
                              </span>
                              {!message.is_staff_reply && (
                                <span className="text-xs">
                                  {message.read_at ? (
                                    <i className="bi bi-eye" title="Read"></i>
                                  ) : (
                                    <i
                                      className="bi bi-check2"
                                      title="Sent"
                                    ></i>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    <div className="h-4"></div>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input / Closed Label */}
                  <div className="fixed w-full lg:w-[calc(100%-25rem)] bottom-19 lg:bottom-0 p-4 border-t border-gray-200 bg-white flex-shrink-0">
                    {activeConversation.status === "closed" ? (
                      // Closed Inquiry Label
                      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 border border-gray-300 rounded-2xl">
                        <i className="bi bi-lock-fill text-gray-600"></i>
                        <span className="text-sm font-medium text-gray-700">
                          This inquiry has been closed. No further messages can
                          be sent.
                        </span>
                      </div>
                    ) : (
                      // Message Input
                      <div className="flex items-end gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Type your message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleSendMessage()
                            }
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                        </div>
                        <button
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim()}
                          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <i className="bi bi-send-fill text-lg"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="bi bi-chat-dots text-4xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-sm text-gray-500">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>{" "}
        {/* Content Container */}
        {/* Floating New Message Button */}
        <button
          onClick={() => setShowNewMessageModal(true)}
          className={`fixed w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10 mb-8 ${
            showChat
              ? "hidden md:flex bottom-6 md:right-auto md:left-[calc(380px-4.5rem)] lg:left-[calc(400px-4.5rem)]"
              : "bottom-24 right-6"
          }`}
        >
          <i className="bi bi-plus-lg text-2xl"></i>
        </button>
        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  New Message
                </h2>
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="bi bi-x-lg text-xl text-gray-700"></i>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <FormControl fullWidth>
                    <InputLabel id="select-department-category-label">
                      Select Department Category
                    </InputLabel>
                    <Select
                      labelId="select-department-category-label"
                      value={newDepartmentCategory}
                      onChange={(e) => setNewDepartmentCategory(e.target.value)}
                      label="Select Department Category"
                    >
                      {departmentCategory.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className="mt-3">
                  <FormControl fullWidth>
                    <InputLabel id="select-department-label">
                      Select Department
                    </InputLabel>
                    <Select
                      labelId="select-department-label"
                      value={newDepartments}
                      onChange={(e) => setNewDepartments(e.target.value)}
                      label="Select Department"
                      disabled={!newDepartmentCategory}
                    >
                      {department.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                {/* Message Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    value={newSubjectText}
                    onChange={(e) => setNewSubjectText(e.target.value)}
                    placeholder="Type your subject here..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewMessage}
                  disabled={
                    !newDepartments || !newSubjectText || !newMessageText.trim()
                  }
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
