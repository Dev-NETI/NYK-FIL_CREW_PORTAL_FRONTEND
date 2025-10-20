"use client";

import { useState } from "react";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";

// Ticket status type
export type TicketStatus = "open" | "pending" | "closed";

// Mock data - replace with your API calls
const mockConversations = [
  {
    id: 1,
    ticketNumber: "TKT-001",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    avatar: null,
    lastMessage: "Hello, I need help with my documents",
    timestamp: "2 min ago",
    unreadCount: 2,
    isOnline: true,
    status: "open" as TicketStatus,
    priority: "high",
    subject: "Document Upload Issue",
  },
  {
    id: 2,
    ticketNumber: "TKT-002",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    avatar: null,
    lastMessage: "Thank you for your assistance",
    timestamp: "1 hour ago",
    unreadCount: 0,
    isOnline: false,
    status: "closed" as TicketStatus,
    priority: "low",
    subject: "General Inquiry",
  },
  {
    id: 3,
    ticketNumber: "TKT-003",
    userName: "Mike Johnson",
    userEmail: "mike.j@example.com",
    avatar: null,
    lastMessage: "Can I schedule an appointment?",
    timestamp: "3 hours ago",
    unreadCount: 5,
    isOnline: true,
    status: "pending" as TicketStatus,
    priority: "medium",
    subject: "Appointment Request",
  },
  {
    id: 4,
    ticketNumber: "TKT-004",
    userName: "Sarah Williams",
    userEmail: "sarah.w@example.com",
    avatar: null,
    lastMessage: "My contract expires next month",
    timestamp: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    status: "open" as TicketStatus,
    priority: "high",
    subject: "Contract Renewal",
  },
];

const mockMessages = {
  1: [
    {
      id: 1,
      sender: "user",
      message: "Hello, I need help with my documents",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      sender: "user",
      message: "I can't find the upload section for my passport",
      timestamp: "10:31 AM",
    },
    {
      id: 3,
      sender: "admin",
      message: "Hello! I'd be happy to help you with that. Let me guide you through the process.",
      timestamp: "10:32 AM",
    },
  ],
  2: [
    {
      id: 1,
      sender: "user",
      message: "I have a question about my employment contract",
      timestamp: "9:15 AM",
    },
    {
      id: 2,
      sender: "admin",
      message: "Sure, what would you like to know?",
      timestamp: "9:16 AM",
    },
    {
      id: 3,
      sender: "user",
      message: "Thank you for your assistance",
      timestamp: "9:20 AM",
    },
  ],
  3: [
    {
      id: 1,
      sender: "user",
      message: "Can I schedule an appointment?",
      timestamp: "7:45 AM",
    },
  ],
  4: [
    {
      id: 1,
      sender: "user",
      message: "My contract expires next month",
      timestamp: "Yesterday",
    },
    {
      id: 2,
      sender: "admin",
      message: "Thank you for letting us know. We'll reach out to you soon regarding contract renewal.",
      timestamp: "Yesterday",
    },
  ],
};

export default function ChatPage() {
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = mockMessages[selectedConversation.id as keyof typeof mockMessages] || [];

  // Calculate ticket statistics
  const totalTickets = conversations.length;
  const openTickets = conversations.filter((conv) => conv.status === "open").length;
  const pendingTickets = conversations.filter((conv) => conv.status === "pending").length;
  const closedTickets = conversations.filter((conv) => conv.status === "closed").length;

  // Handle status change
  const handleStatusChange = (ticketId: number, newStatus: TicketStatus) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === ticketId ? { ...conv, status: newStatus } : conv
      )
    );

    // Update selected conversation if it's the one being modified
    if (selectedConversation.id === ticketId) {
      setSelectedConversation((prev) => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Stats */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Ticket Dashboard</h1>
        <div className="grid grid-cols-4 gap-4">
          {/* Total Tickets Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Tickets</p>
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
                <p className="text-green-100 text-sm font-medium mb-1">Open Tickets</p>
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
                <p className="text-yellow-100 text-sm font-medium mb-1">Pending Tickets</p>
                <p className="text-white text-3xl font-bold">{pendingTickets}</p>
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
                <p className="text-red-100 text-sm font-medium mb-1">Closed Tickets</p>
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
        <ConversationList
          conversations={filteredConversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Right Side - Ticket Chat Window */}
        <ChatWindow
          conversation={selectedConversation}
          messages={currentMessages}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
