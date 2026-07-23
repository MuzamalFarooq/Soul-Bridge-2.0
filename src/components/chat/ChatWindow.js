"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/context/SocketContext";
import { 
  Send, Phone, Video, Star, Smile, Image, Mic, MoreVertical, 
  CornerUpLeft, CheckCheck, Crown, ShieldAlert, Sparkles, Brain,
  PhoneCall, PhoneOff, VideoOff, Volume2, Camera
} from "lucide-react";
import { fetchMessages, sendMessageAction, markMessagesReadAction, addMessageReactionAction, getConversationSuggestionsAction } from "@/actions/chat";

export default function ChatWindow({ conversation, onBack }) {
  const { data: session } = useSession();
  const { 
    socket, onlineUsers, initiateCall, incomingCall, callState, 
    acceptCall, declineCall, endCall, localVideoRef, remoteVideoRef 
  } = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  
  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // UI state
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch message history
  useEffect(() => {
    const loadMessages = async () => {
      const res = await fetchMessages(conversation.id);
      if (res.success) {
        setMessages(res.messages || []);
        scrollToBottom();
      }
    };
    loadMessages();
    
    // Mark as read
    markMessagesReadAction(conversation.id);
    if (socket) {
      socket.emit("mark_read", {
        conversationId: conversation.id,
        senderId: session.user.id,
        receiverId: conversation.recipientId
      });
    }

    setAiSuggestions([]);
  }, [conversation.id, socket]);

  // 2. Setup socket listeners for this specific chat
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.conversationId === conversation.id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
        
        // Auto mark read
        markMessagesReadAction(conversation.id);
        socket.emit("mark_read", {
          conversationId: conversation.id,
          senderId: session.user.id,
          receiverId: conversation.recipientId
        });
      }
    };

    const handleTypingStatus = ({ conversationId, senderId, isTyping: typingVal }) => {
      if (conversationId === conversation.id && senderId === conversation.recipientId) {
        setPartnerTyping(typingVal);
      }
    };

    const handleMessagesRead = ({ conversationId, readerId }) => {
      if (conversationId === conversation.id && readerId === conversation.recipientId) {
        setMessages((prev) => 
          prev.map((m) => m.senderId === session.user.id ? { ...m, status: "READ" } : m)
        );
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing_status", handleTypingStatus);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing_status", handleTypingStatus);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket, conversation.id]);

  // 3. Handle sending text
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText("");
    
    // Stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    socket?.emit("typing", {
      conversationId: conversation.id,
      senderId: session.user.id,
      receiverId: conversation.recipientId,
      isTyping: false
    });

    // Optimistic UI push
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversationId: conversation.id,
      senderId: session.user.id,
      text: textToSend,
      createdAt: new Date(),
      status: "SENT",
      reactions: []
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await sendMessageAction({
        conversationId: conversation.id,
        text: textToSend
      });

      if (res.success) {
        // Swap optimistic msg with real one
        setMessages((prev) => 
          prev.map((m) => m.id === tempId ? res.message : m)
        );
        // Emit to socket
        socket?.emit("send_message", {
          ...res.message,
          receiverId: conversation.recipientId
        });
      }
    } catch (err) {
      console.error("Message send failed:", err);
    }
  };

  // 4. Handle typing triggers
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        conversationId: conversation.id,
        senderId: session.user.id,
        receiverId: conversation.recipientId,
        isTyping: true
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing", {
        conversationId: conversation.id,
        senderId: session.user.id,
        receiverId: conversation.recipientId,
        isTyping: false
      });
    }, 2500);
  };

  // 5. Handle AI suggestions call
  const handleAIAssistance = async () => {
    setAiLoading(true);
    setAiSuggestions([]);
    try {
      const res = await getConversationSuggestionsAction(conversation.id);
      if (res.success) {
        setAiSuggestions(res.suggestions || []);
      } else {
        setAiSuggestions([
          "That sounds amazing, tell me more!",
          "Wow, I'd love to visit that museum with you sometime.",
          "What is your favorite weekend activity?"
        ]);
      }
    } catch (err) {
      setAiSuggestions(["That sounds super interesting!"]);
    } finally {
      setAiLoading(false);
    }
  };

  // 6. Handle reactions
  const handleReaction = async (messageId, reaction) => {
    try {
      const res = await addMessageReactionAction({ messageId, reaction });
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => m.id === messageId ? { ...m, reactions: res.reactions } : m)
        );
      }
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  const isPartnerOnline = onlineUsers.includes(conversation.recipientId);

  return (
    <div className="flex-1 flex flex-col h-[560px] glass-panel rounded-3xl border border-white/5 overflow-hidden relative">
      
      {/* HEADER SECTION */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-xs mr-1 p-1 hover:bg-white/10 rounded-lg">✕</button>
          
          <div className="relative">
            <img src={conversation.photo} alt={conversation.fullName} className="w-10 h-10 rounded-xl object-cover" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${isPartnerOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          </div>

          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              {conversation.fullName}
              {conversation.fullName.includes("Vanessa") && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
            </h3>
            <span className="text-[9px] text-foreground/50 font-semibold uppercase">
              {isPartnerOnline ? "Active Now" : "Offline"}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => initiateCall(conversation.recipientId, conversation.fullName, "voice")}
            className="p-2 rounded-xl hover:bg-white/10 text-foreground/80 hover:text-primary-pink transition-all cursor-pointer"
            title="Audio Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => initiateCall(conversation.recipientId, conversation.fullName, "video")}
            className="p-2 rounded-xl hover:bg-white/10 text-foreground/80 hover:text-primary-pink transition-all cursor-pointer"
            title="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CHAT MESSAGES BODY */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-black/15">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-foreground/40">
            <Heart className="w-10 h-10 text-primary-pink/20 fill-primary-pink/5 mb-2" />
            <p className="text-xs font-semibold">Matched on Soul Bridge</p>
            <p className="text-[10px] opacity-80 mt-1 max-w-[200px]">Send a greeting message or trigger Gemini AI Suggestions below.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === session.user.id;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%] ${isMe ? "self-end" : "self-start"} group`}>
                <div className={`p-3 rounded-2xl text-xs relative ${
                  isMe 
                    ? "bg-gradient-premium text-white rounded-tr-none" 
                    : "bg-white/10 text-foreground border border-white/5 rounded-tl-none"
                }`}>
                  <p>{m.text}</p>

                  {/* Reaction overlays */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div className="absolute -bottom-2 right-2 flex gap-0.5 bg-black/80 px-1.5 py-0.5 rounded-full text-[9px] border border-white/10">
                      {m.reactions.map((r, i) => (
                        <span key={i} title={r.split(":")[1]}>{r.split(":")[0]}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date / Reaction shortcuts */}
                <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] text-foreground/40">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {/* Read receipts */}
                  {isMe && m.status === "READ" && (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )}

                  {!isMe && (
                    <button
                      onClick={() => handleReaction(m.id, "❤️")}
                      className="text-[9px] hover:scale-125 transition-transform text-foreground/45 cursor-pointer"
                    >
                      ❤️
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {partnerTyping && (
          <div className="flex items-center gap-2 self-start bg-white/5 px-3 py-2 rounded-2xl rounded-tl-none border border-white/5 animate-pulse">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary-pink rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-primary-pink rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-primary-pink rounded-full animate-bounce delay-200"></span>
            </div>
            <span className="text-[9px] text-foreground/40 font-semibold uppercase">Typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI SUGGESTION ACCORDION */}
      {aiSuggestions.length > 0 && (
        <div className="p-3 bg-indigo-500/10 border-t border-indigo-500/25 flex flex-col gap-1.5 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="text-[9px] font-bold text-indigo-300 flex items-center gap-1">
            <Brain className="w-3 h-3 text-indigo-400" /> Gemini Conversation Suggestions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {aiSuggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(sug);
                  setAiSuggestions([]);
                }}
                className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500 hover:text-white text-[10px] font-medium transition-all text-left max-w-xs truncate cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT ACTION BOX */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-white/5 flex flex-col gap-2 relative z-10">
        <div className="flex items-center gap-2">
          {/* AI Helper trigger */}
          <button
            type="button"
            onClick={handleAIAssistance}
            disabled={aiLoading}
            className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-40"
            title="Ask AI what to say"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={handleInputChange}
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
          />

          <button
            type="submit"
            className="p-2.5 rounded-xl bg-gradient-premium text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* WEBRTC AUDIO/VIDEO CALL MODULE OVERLAY */}
      {(callState.peerId || incomingCall) && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
          {/* Call Incoming Panel */}
          {incomingCall && (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-200">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-premium border-4 border-white/10 flex items-center justify-center font-extrabold text-white text-3xl animate-pulse">
                  {incomingCall.name[0]}
                </div>
                <PhoneCall className="w-8 h-8 text-emerald-400 absolute -bottom-1 -right-1 bg-black p-1.5 rounded-full border border-white/10 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{incomingCall.name}</h3>
                <p className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">{incomingCall.callType} Call Request...</p>
              </div>
              <div className="flex gap-6 mt-4">
                <button
                  onClick={declineCall}
                  className="px-6 py-2.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" /> Decline
                </button>
                <button
                  onClick={acceptCall}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" /> Answer
                </button>
              </div>
            </div>
          )}

          {/* Call Active/Outbound Panel */}
          {callState.peerId && !incomingCall && (
            <div className="w-full h-full flex flex-col justify-between items-center py-6">
              <div>
                <h3 className="text-xl font-bold text-white">{callState.peerName}</h3>
                <p className="text-xs text-foreground/50 mt-1 uppercase tracking-wider">
                  {callState.active ? "Call Connected" : "Ringing..."}
                </p>
              </div>

              {/* WebRTC Video Frames */}
              <div className="w-full flex-1 max-h-[300px] flex gap-4 my-4 relative">
                {/* Remote Video (fill screen) */}
                <div className="flex-1 rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative flex items-center justify-center">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {!callState.active && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white/50 font-bold uppercase">
                      Waiting for answer...
                    </div>
                  )}
                </div>

                {/* Local Video (Floating pip) */}
                <div className="w-24 h-36 rounded-xl bg-slate-800 border-2 border-white/20 absolute bottom-3 right-3 overflow-hidden shadow-2xl">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <button
                  onClick={endCall}
                  className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  title="End Call"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
