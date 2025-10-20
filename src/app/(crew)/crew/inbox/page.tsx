"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import axios from "axios";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { count } from "console";
import { AuthService } from "@/services";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Mock data
const mockConversations = [
  {
    id: 1,
    name: "Jose Rizal",
    lastMessage: "Thanks for the update on the schedule!",
    timestamp: "2m ago",
    avatar: "JR",
    unread: true,
    active: true,
  },
  {
    id: 2,
    name: "Maria Santos",
    lastMessage: "Can you send me the document we discussed?",
    timestamp: "1h ago",
    avatar: "MS",
    unread: false,
    active: false,
  },
  {
    id: 3,
    name: "Juan dela Cruz",
    lastMessage: "See you at the meeting tomorrow!",
    timestamp: "3h ago",
    avatar: "JD",
    unread: false,
    active: false,
  },
  {
    id: 4,
    name: "Ana Reyes",
    lastMessage: "Have you completed the training module?",
    timestamp: "1d ago",
    avatar: "AR",
    unread: false,
    active: false,
  },
  {
    id: 5,
    name: "Carlos Mendoza",
    lastMessage: "Great work on the presentation!",
    timestamp: "2d ago",
    avatar: "CM",
    unread: false,
    active: false,
  },
  {
    id: 6,
    name: "Carlos Mendoza",
    lastMessage: "Great work on the presentation!",
    timestamp: "2d ago",
    avatar: "CM",
    unread: false,
    active: false,
  },
  {
    id: 7,
    name: "Carlos Mendoza",
    lastMessage: "Great work on the presentation!",
    timestamp: "2d ago",
    avatar: "CM",
    unread: false,
    active: false,
  },
];

const mockMessages = [
  {
    id: 1,
    senderId: 1,
    text: "Hi! How are you doing?",
    timestamp: "10:30 AM",
    isSent: false,
  },
  {
    id: 2,
    senderId: "me",
    text: "I'm doing well, thanks! How about you?",
    timestamp: "10:32 AM",
    isSent: true,
  },
  {
    id: 3,
    senderId: 1,
    text: "I'm good! Just wanted to check if you've seen the updated schedule for next week.",
    timestamp: "10:33 AM",
    isSent: false,
  },
  {
    id: 4,
    senderId: "me",
    text: "Yes, I saw it. Everything looks good to me.",
    timestamp: "10:35 AM",
    isSent: true,
  },
  {
    id: 5,
    senderId: 1,
    text: "Thanks for the update on the schedule!",
    timestamp: "10:36 AM",
    isSent: false,
  },
  {
    id: 10,
    senderId: 1,
    text: "Thanks for the update on the schedule!",
    timestamp: "10:36 AM",
    isSent: false,
  },
  {
    id: 6,
    senderId: 1,
    text: "Thanks for the update on the schedule!",
    timestamp: "10:36 AM",
    isSent: false,
  },
  {
    id: 7,
    senderId: 1,
    text: "Thanks for the update on the schedule!",
    timestamp: "10:36 AM",
    isSent: false,
  },
  {
    id: 8,
    senderId: 1,
    text: "Thanks for the update on the schedule!",
    timestamp: "10:36 AM",
    isSent: false,
  },
  {
    id: 9,
    senderId: 1,
    text: "Thanks for the update on the schedule!",
    timestamp: "10:36 AM",
    isSent: false,
  },
];

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
  const [messages, setMessages] = useState(mockMessages);
  const [departmentCategory, setDepartmentCategory] = useState([]);
  const [department, setDepartment] = useState([]);
  const currentUserData = AuthService.getStoredUser();

  function handleNewMessage() {
    if (!newDepartments || !newSubjectText.trim() || !newMessageText.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      crew_id: currentUserData.id,
      message: newMessageText,
      subject: newSubjectText,
      department_id: newDepartments,
    };

    const loadingToast = toast.loading("Sending message...");

    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inquiry`, payload)
      .then((response) => {
        toast.success("Message sent successfully!", { id: loadingToast });
        setShowNewMessageModal(false);
        // Reset form
        setNewDepartmentCategory("");
        setNewDepartments("");
        setNewSubjectText("");
        setNewMessageText("");
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            "Failed to send message. Please try again.",
          { id: loadingToast }
        );
        console.error(
          "Error sending message:",
          error.response?.data || error.message
        );
      });
  }

  // Fetch all department categories on mount
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departmentTypes`)
      .then((response) => {
        setDepartmentCategory(response.data);
      })
      .catch((error) => {
        console.error("Error fetching department types:", error);
      });

    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/inquiry/${currentUserData.id}`
      )
      .then((response) => {
        setInquiries(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching department types:", error);
      });
  }, []);

  // Fetch departments when category changes
  useEffect(() => {
    if (!newDepartmentCategory) return;

    axios
      .get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/department/${newDepartmentCategory}`
      )
      .then((response) => {
        setDepartment(response.data);
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  }, [newDepartmentCategory]);

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConversation = mockConversations.find(
    (conv) => conv.id === selectedConversation
  );

  const handleSelectConversation = (id: number) => {
    setSelectedConversation(id);
    setShowChat(true);
  };

  const handleBackToInbox = () => {
    setShowChat(false);
    setSelectedConversation(null);
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: messages.length + 1,
        senderId: "me",
        text: messageInput,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSent: true,
      };
      setMessages([...messages, newMessage]);
      setMessageInput("");
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
    <div className="h-screen overflow-hidden">
      <Navigation currentPath="/crew/inbox" hideBottomNav={showChat} />
      <div
        className={`h-screen bg-gray-50 overflow-hidden ${
          showChat ? "pt-16" : ""
        }`}
      >
        {/* Main Container */}
        <div className={`flex ${showChat ? "h-[calc(100vh-4rem)]" : "h-full"}`}>
          {/* Inbox List - Left Column */}
          <div
            className={`${
              showChat ? "hidden md:flex" : "flex"
            } flex-col w-full md:w-[380px] lg:w-[400px] h-full bg-white border-r border-gray-200 transition-all duration-300`}
          >
            {/* Header */}
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
              <p className="text-sm text-gray-600 mt-1">
                View and send messages within your crew portal.
              </p>

              {/* Search Box */}
              <div className="mt-4 relative">
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
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                  <ConversationSkeleton />
                  <ConversationSkeleton />
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
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                          {/* {conv.avatar} */} JR
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
                            Sample
                          </h3>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            Sample
                          </span>
                        </div>
                        {/* <p
                          className={`text-sm text-gray-600 truncate mt-0.5 ${
                            conv.unread ? "font-medium" : ""
                          }`}
                        >
                          {conv.lastMessage}
                        </p> */}
                        <p className={`text-sm text-gray-600 truncate mt-0.5`}>
                          sample
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {inquiry.messages?.some(
                        (msg) => msg.read_at === null
                      ) && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                      )}
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
            } flex-col flex-1 h-full bg-white transition-all duration-300`}
          >
            {selectedConversation && activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  {/* Back Button (Mobile) */}
                  <button
                    onClick={handleBackToInbox}
                    className="md:hidden text-gray-600 hover:text-blue-600 transition-transform duration-200 hover:-translate-x-1 p-2 -ml-2"
                  >
                    <i className="bi bi-arrow-left text-xl"></i>
                  </button>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                    {activeConversation.avatar}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900">
                      {activeConversation.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {activeConversation.active
                        ? "Active now"
                        : "Last seen 2h ago"}
                    </p>
                  </div>

                  {/* Menu Button */}
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <i className="bi bi-three-dots-vertical text-xl text-gray-700"></i>
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isSent ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] lg:max-w-[60%] ${
                          message.isSent
                            ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                            : "bg-white text-gray-900 rounded-2xl rounded-tl-sm border border-gray-200"
                        } px-4 py-2.5 shadow-sm`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.text}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isSent ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
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

        {/* Floating New Message Button */}
        <button
          onClick={() => setShowNewMessageModal(true)}
          className={`fixed w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-10 ${
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
