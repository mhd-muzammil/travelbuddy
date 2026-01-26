import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { api, filesBaseUrl } from "../../lib/api.js";
import { useAuth } from "../../contexts/AuthContext";; // Assuming you have this, or use localStorage

// Connect to your backend URL
const SOCKET_URL = "http://localhost:5000";

export function ChatPage() {
  const { userId } = useParams(); // The person we want to chat with
  const { user: currentUser } = useAuth(); // Your logged-in info

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();

  // 1. Initialize Chat & Socket
  useEffect(() => {
    let newSocket;

    async function init() {
      try {
        // A. Get or Create Conversation ID from Backend
        const res = await api.post("/chat/conversation", {
          targetUserId: userId,
        });
        const conv = res.data.data.conversation;
        setConversation(conv);

        // B. Fetch History
        const historyRes = await api.get(`/chat/${conv._id}/messages`);
        setMessages(historyRes.data.data.messages || []);

        // C. Connect Socket
        newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        // D. Join the specific Room
        newSocket.emit("joinConversation", conv._id);

        // E. Listen for incoming messages
        newSocket.on("receiveMessage", (msg) => {
          setMessages((prev) => [...prev, msg]);
        });
      } catch (e) {
        console.error("Chat init failed", e);
      }
    }

    if (userId && currentUser) {
      init();
    }

    // Cleanup
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [userId, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. Send Message Handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !conversation) return;

    // Emit to Backend (Server will save DB & Broadcast back)
    socket.emit("sendMessage", {
      conversationId: conversation._id,
      senderId: currentUser._id,
      content: newMessage,
    });

    setNewMessage("");
  };

  // Helper: Find the "other" participant details for the header
  const otherUser = conversation?.participants.find(
    (p) => p._id !== currentUser._id,
  );

  if (!conversation) return <div className="p-10">Loading chat...</div>;

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        {otherUser?.avatarUrl ? (
          <img
            src={`${filesBaseUrl}${otherUser.avatarUrl}`}
            className="h-10 w-10 rounded-full object-cover"
            alt=""
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        )}
        <div>
          <div className="font-semibold">{otherUser?.fullName || "Chat"}</div>
          <div className="text-xs text-zinc-500">@{otherUser?.username}</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-black/20">
        {messages.map((msg, i) => {
          const isMe =
            msg.senderId._id === currentUser._id ||
            msg.senderId === currentUser._id;
          return (
            <div
              key={i}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? "bg-zinc-900 text-white rounded-tr-none dark:bg-white dark:text-black"
                    : "bg-white border border-zinc-200 rounded-tl-none dark:bg-zinc-900 dark:border-zinc-800"
                }`}
              >
                {msg.content}
                <div className={`text-[10px] mt-1 text-right opacity-70`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
      >
        <div className="flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:ring-white"
          />
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
