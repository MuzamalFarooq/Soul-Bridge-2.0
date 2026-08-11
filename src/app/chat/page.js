"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, Heart, Star, Sparkles, Send, ShieldAlert, CircleUser, UserCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWindow from "@/components/chat/ChatWindow";
import ConnectionRequestsModal from "@/components/chat/ConnectionRequestsModal";
import CelebrationModal from "@/components/chat/CelebrationModal";
import { fetchConversations } from "@/actions/chat";

import { useSocket } from "@/context/SocketContext";

function ChatContent() {
  const searchParams = useSearchParams();
  const initialConvoId = searchParams.get("convo");
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Connection Requests & Celebration State
  const [requestsModalOpen, setRequestsModalOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);

  const loadChats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchConversations();
      if (res.success) {
        setConversations(res.conversations || []);
        
        // Auto-select convo from query param if matched
        if (initialConvoId && res.conversations) {
          const matched = res.conversations.find((c) => c.id === initialConvoId);
          if (matched) setSelectedConvo(matched);
        }
      } else {
        setError(res.error || "Failed to load active threads");
      }
    } catch (err) {
      setError("An unexpected error occurred while loading chat history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [initialConvoId]);

  // Live Socket listener to update thread list
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (msg) => {
      if (!msg || !msg.conversationId) return;

      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === msg.conversationId);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const textStr = msg.isSms ? `[SMS] ${msg.text}` : (msg.text || "Sent an attachment");

        if (index !== -1) {
          const updatedConvo = {
            ...prev[index],
            lastMessageText: textStr,
            lastMessageAt: timeStr
          };
          const rest = prev.filter((_, i) => i !== index);
          return [updatedConvo, ...rest];
        } else {
          // Re-fetch conversations if a thread from a new match arrived
          loadChats();
          return prev;
        }
      });
    };

    const handleConnAccepted = () => {
      loadChats();
    };

    socket.on("new_message", handleIncoming);
    socket.on("new_sms", handleIncoming);
    socket.on("connection_accepted", handleConnAccepted);

    return () => {
      socket.off("new_message", handleIncoming);
      socket.off("new_sms", handleIncoming);
      socket.off("connection_accepted", handleConnAccepted);
    };
  }, [socket]);

  const handleConnectionAccepted = async (matchData, convoId) => {
    setRequestsModalOpen(false);
    setCelebrationData(matchData);
    
    // Refresh chats to include newly connected thread
    const res = await fetchConversations();
    if (res.success && res.conversations) {
      setConversations(res.conversations);
      const target = res.conversations.find((c) => c.id === convoId || c.recipientId === matchData.user2Id);
      if (target) setSelectedConvo(target);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10 flex flex-col">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 min-h-145 rounded-3xl overflow-hidden glass-card border border-white/5 shadow-2xl p-2 bg-black/5">
          
          {/* LEFT THREADS PANE */}
          <div className={`flex flex-col border-r border-white/5 p-4 ${selectedConvo ? "hidden md:flex" : "flex"}`}>
            <div className="px-2 mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  My Messages <MessageCircle className="w-5 h-5 text-primary-pink" />
                </h2>
                <p className="text-[10px] text-foreground/50 uppercase tracking-wider font-semibold mt-1">Active Discussions</p>
              </div>

              {/* Connection Requests Trigger Button */}
              <button
                onClick={() => setRequestsModalOpen(true)}
                className="px-3 py-1.5 rounded-full bg-[#FF4D8D]/15 hover:bg-[#FF4D8D] text-[#FF4D8D] hover:text-white text-[10px] font-bold border border-[#FF4D8D]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="View Requests"
              >
                <UserCheck className="w-3.5 h-3.5" /> Requests
              </button>
            </div>

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-foreground/40 py-10">
                <div className="w-6 h-6 border-2 border-primary-pink border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px]">Loading active rooms...</span>
              </div>
            )}

            {!loading && error && (
              <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20 my-4">
                <p className="text-[11px] text-red-500">{error}</p>
              </div>
            )}

            {!loading && !error && conversations.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-foreground/45">
                <Heart className="w-8 h-8 text-primary-pink/20 fill-primary-pink/5 mb-2" />
                <p className="text-xs font-semibold">No Active Chats</p>
                <p className="text-[9px] opacity-80 mt-1">Start swiping in discover to find matches and begin chatting!</p>
              </div>
            )}

            {!loading && !error && conversations.length > 0 && (
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
                {conversations.map((convo) => {
                  const isSelected = selectedConvo?.id === convo.id;
                  return (
                    <button
                      key={convo.id}
                      onClick={() => setSelectedConvo(convo)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                        isSelected 
                          ? "bg-gradient-premium border-transparent text-white" 
                          : "bg-white/5 border-white/5 text-foreground hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 max-w-[70%]">
                        <div className="relative">
                          <img src={convo.photo} alt={convo.fullName} className="w-10 h-10 rounded-xl object-cover" />
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${convo.isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-xs truncate flex items-center gap-1">
                            {convo.fullName}
                            {convo.fullName.includes("Vanessa") && <Star className={`w-3 h-3 ${isSelected ? "text-white fill-white" : "text-yellow-400 fill-yellow-400"}`} />}
                          </h4>
                          <p className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-white/80" : "text-foreground/60"}`}>
                            {convo.lastMessageText || "Start your conversation."}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`text-[9px] font-semibold self-start mt-0.5 ${isSelected ? "text-white/70" : "text-foreground/40"}`}>
                        {convo.lastMessageAt}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT CHAT WINDOW PANE */}
          <div className={`md:col-span-2 flex flex-col ${!selectedConvo ? "hidden md:flex" : "flex"}`}>
            {selectedConvo ? (
              <ChatWindow 
                conversation={selectedConvo} 
                onBack={() => setSelectedConvo(null)} 
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-foreground/40">
                <Heart className="w-12 h-12 text-primary-pink/15 fill-primary-pink/5 mb-3" />
                <h3 className="font-extrabold text-base mb-1">Select a Conversation</h3>
                <p className="text-xs text-foreground/60 max-w-xs leading-normal">
                  Pick one of your matched partners on the left to start sending messages, starting calls, and getting live advice.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />

      {/* Connection Requests Modal */}
      <ConnectionRequestsModal
        isOpen={requestsModalOpen}
        onClose={() => setRequestsModalOpen(false)}
        onConnectionAccepted={handleConnectionAccepted}
      />

      {/* Celebration Modal when request accepted */}
      {celebrationData && (
        <CelebrationModal
          matchData={celebrationData}
          onClose={() => setCelebrationData(null)}
          onChat={() => setCelebrationData(null)}
        />
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-foreground/50">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
