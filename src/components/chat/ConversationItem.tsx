import React from "react";

type TicketStatus = "open" | "pending" | "closed" | "in_progress";

interface Message {
  id: number;
  message: string;
  created_at: string;
  read_at: string | null;
  is_staff_reply: boolean;
}

interface Conversation {
  id: number;
  ticketNumber?: string;
  userName?: string;
  userEmail?: string;
  avatar?: string | null;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isOnline?: boolean;
  status: TicketStatus;
  priority?: string;
  subject: string;
  updated_at: string;
  messages: Message[];
  crew: {
    profile: {
      first_name: string;
      last_name: string;
    };
  };
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
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

export function formatRetentionTime(start: string | number | Date): string {
  const startDate = new Date(start);
  const now = new Date();

  const diffMs = now.getTime() - startDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30); // approximate months

  if (diffMonths >= 1) return `${diffMonths}mo`;
  if (diffDays >= 1) return `${diffDays}d`;
  if (diffHours >= 1) return `${diffHours}h`;
  if (diffMinutes >= 1) return `${diffMinutes}m`;
  return `${diffSeconds}s`;
}

// Status badge configuration
const statusConfig = {
  open: {
    bg: "bg-green-100",
    text: "text-green-800",
    dot: "bg-green-500",
    label: "Open",
  },
  in_progress: {
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
  const statusStyle = statusConfig[conversation.status] || statusConfig.open;

  // Calculate unread count - count messages from crew (is_staff_reply === false or 0) that haven't been read
  const unreadCount = conversation.messages.filter(
    (msg) => (msg.is_staff_reply === false || msg.is_staff_reply === 0) && msg.read_at === null
  ).length;

  return (
    <div
      onClick={onClick}
      className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-all hover:shadow-md  ${
        statusStyle.bg
      } ${
        isSelected
          ? "bg-blue-50 border-l-4 border-l-blue-600 shadow-sm"
          : "hover:bg-gray-50 border-l-4 border-l-transparent"
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold shadow-md">
            {getInitials(
              conversation.crew.profile.first_name +
                " " +
                conversation.crew.profile.last_name
            )}
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
              {conversation.crew.profile.first_name +
                " " +
                conversation.crew.profile.last_name}
            </span>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatRetentionTime(conversation.updated_at)}
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
              unreadCount > 0
                ? "font-semibold text-gray-900"
                : "text-gray-600"
            }`}
          >
            {conversation.messages && conversation.messages.length > 0
              ? conversation.messages[0].message
              : "No messages yet"}
          </p>

          {/* Status & Priority Badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusStyle.dot}`}></span>
                {statusStyle.label}
              </span>
            </div>

            {/* Unread Count */}
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0 shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
