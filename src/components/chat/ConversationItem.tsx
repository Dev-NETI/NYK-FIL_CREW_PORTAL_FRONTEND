import React from "react";

type TicketStatus = "open" | "pending" | "closed";

interface Conversation {
  id: number;
  ticketNumber: string;
  userName: string;
  userEmail: string;
  avatar: string | null;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  status: TicketStatus;
  priority: string;
  subject: string;
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

// Status badge configuration
const statusConfig = {
  open: {
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
    label: "Open",
  },
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    dot: "bg-yellow-500",
    label: "Pending",
  },
  closed: {
    bg: "bg-red-100",
    text: "text-red-800",
    dot: "bg-red-500",
    label: "Closed",
  },
};

// Priority badge configuration
const priorityConfig = {
  high: { bg: "bg-red-50", text: "text-red-700", label: "High" },
  medium: { bg: "bg-orange-50", text: "text-orange-700", label: "Medium" },
  low: { bg: "bg-blue-50", text: "text-blue-700", label: "Low" },
};

export default function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const statusStyle = statusConfig[conversation.status];
  const priorityStyle = priorityConfig[conversation.priority as keyof typeof priorityConfig];

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? "bg-blue-50 border-l-4 border-l-blue-600 shadow-sm"
          : "hover:bg-gray-50 border-l-4 border-l-transparent"
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold shadow-md">
            {conversation.userName.charAt(0).toUpperCase()}
          </div>
          {conversation.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Ticket Number & Timestamp */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-blue-600">
              {conversation.ticketNumber}
            </span>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {conversation.timestamp}
            </span>
          </div>

          {/* User Name */}
          <h3
            className={`text-sm font-semibold truncate mb-1 ${
              isSelected ? "text-blue-900" : "text-gray-900"
            }`}
          >
            {conversation.userName}
          </h3>

          {/* Subject */}
          <p className="text-xs text-gray-700 font-medium mb-2 truncate">
            {conversation.subject}
          </p>

          {/* Last Message */}
          <p
            className={`text-xs truncate mb-2 ${
              conversation.unreadCount > 0
                ? "font-semibold text-gray-900"
                : "text-gray-600"
            }`}
          >
            {conversation.lastMessage}
          </p>

          {/* Status & Priority Badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusStyle.dot}`}></span>
                {statusStyle.label}
              </span>

              {/* Priority Badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}
              >
                {priorityStyle.label}
              </span>
            </div>

            {/* Unread Count */}
            {conversation.unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0 shadow-sm">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
