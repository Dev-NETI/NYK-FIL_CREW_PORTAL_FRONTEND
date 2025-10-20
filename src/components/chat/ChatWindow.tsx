"use client";

import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

type TicketStatus = "open" | "pending" | "closed";

interface Message {
  id: number;
  sender: "user" | "admin";
  message: string;
  timestamp: string;
}

interface Conversation {
  id: number;
  ticketNumber: string;
  userName: string;
  userEmail: string;
  isOnline: boolean;
  status: TicketStatus;
  priority: string;
  subject: string;
}

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onStatusChange: (ticketId: number, newStatus: TicketStatus) => void;
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
  pending: {
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

export default function ChatWindow({ conversation, messages, onStatusChange }: ChatWindowProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    // Here you would integrate with your API to send the message
    console.log("Sending message:", inputMessage);

    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    onStatusChange(conversation.id, newStatus);
    setShowStatusDropdown(false);
  };

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
                {conversation.userName.charAt(0).toUpperCase()}
              </div>
              {conversation.isOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>

            {/* User Details */}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-900">
                  {conversation.userName}
                </h2>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {conversation.ticketNumber}
                </span>
              </div>
              <p className="text-sm text-gray-600">{conversation.userEmail}</p>
              <p className="text-xs text-gray-500 mt-0.5 italic">{conversation.subject}</p>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center space-x-3">
            {/* Current Status Badge */}
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${currentStatusStyle.bg} ${currentStatusStyle.text} shadow-sm`}
            >
              <i className={`bi ${currentStatusStyle.icon} mr-1.5`}></i>
              {currentStatusStyle.label}
            </span>

            {/* Status Change Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center space-x-2"
              >
                <i className="bi bi-gear"></i>
                <span>Change Status</span>
                <i className={`bi ${showStatusDropdown ? 'bi-chevron-up' : 'bi-chevron-down'} text-xs`}></i>
              </button>

              {/* Dropdown Menu */}
              {showStatusDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Update Status
                    </p>
                  </div>
                  {(Object.keys(statusConfig) as TicketStatus[]).map((status) => {
                    const style = statusConfig[status];
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={conversation.status === status}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2 ${
                          conversation.status === status
                            ? "opacity-50 cursor-not-allowed bg-gray-50"
                            : ""
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`}></span>
                        <span className={`font-medium ${style.text}`}>{style.label}</span>
                        {conversation.status === status && (
                          <i className="bi bi-check-lg ml-auto text-blue-600"></i>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleStatusChange("closed")}
            disabled={conversation.status === "closed"}
            className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <i className="bi bi-x-circle"></i>
            <span>Mark as Closed</span>
          </button>
          <button
            onClick={() => handleStatusChange("pending")}
            disabled={conversation.status === "pending"}
            className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <i className="bi bi-clock-history"></i>
            <span>Set Pending</span>
          </button>
          <button
            onClick={() => handleStatusChange("open")}
            disabled={conversation.status === "open"}
            className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span>Reopen</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response to this ticket..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === ""}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium shadow-sm flex items-center space-x-2"
          >
            <i className="bi bi-send"></i>
            <span>Send</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
