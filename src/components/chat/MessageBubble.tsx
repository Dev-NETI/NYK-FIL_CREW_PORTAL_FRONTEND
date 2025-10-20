import React from "react";

interface MessageBubbleProps {
  message: string;
  sender: "user" | "admin";
  timestamp: string;
}

export default function MessageBubble({
  message,
  sender,
  timestamp,
}: MessageBubbleProps) {
  const isAdmin = sender === "admin";

  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-md lg:max-w-lg xl:max-w-xl ${
          isAdmin ? "order-2" : "order-1"
        }`}
      >
        <div
          className={`px-4 py-3 rounded-lg shadow-sm ${
            isAdmin
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>
        </div>
        <div
          className={`flex items-center mt-1 space-x-2 ${
            isAdmin ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-xs text-gray-500">{timestamp}</span>
          {isAdmin && (
            <svg
              className="w-4 h-4 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
