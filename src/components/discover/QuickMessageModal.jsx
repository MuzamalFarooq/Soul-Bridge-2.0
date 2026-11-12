/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Sparkles, 
  Minus, 
  Maximize2, 
  ExternalLink,
  MessageSquare,
  Check,
  CheckCheck
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getOrCreateConversationForUser } from '@/actions/feed';
import { sendMessageAction, fetchMessages, markMessagesReadAction } from '@/actions/chat';
import { useSocket } from '@/context/SocketContext';

const MAX_CHAR_COUNT = 500;

const DEFAULT_ICEBREAKERS = [
  "Hey! Loved your profile! ✨",
  "Hi! Would love to connect over chai ☕",
  "What's your favorite spot in town? 🌿",
  "Hey! How has your week been going so far?"
];

/**
 * QuickMessageModal / FloatingChatPopup
 *
 * Premium floating direct messenger anchored safely above navigation bars.
 * Supports continuous conversation, mobile virtual keyboards, safe-area insets,
 * and real-time Socket.io updates without obscuring the Discover feed.
 */
export default function QuickMessageModal({ candidate, onClose }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);

  // Real-time presence via SocketContext
  let isOnline = false;
  let socket = null;
  try {
    const socketCtx = useSocket();
    socket = socketCtx?.socket || null;
    if (socketCtx?.onlineUsers && candidate?.id) {
      isOnline = socketCtx.onlineUsers.includes(candidate.id);
    }
  } catch (_) {
    isOnline = false;
  }

  const firstName = candidate?.fullName?.split(" ")[0] || "there";
  const avatarUrl = candidate?.photos?.[0] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop";

  // Track user scroll inside message container to preserve reading position
  const handleMessagesScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 100;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  }, []);

  // Scroll to bottom strictly inside the container (never scrolls window/page)
  const scrollToBottom = useCallback((smooth = true, force = false) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (!force && !isNearBottomRef.current) return;

    if (smooth) {
      el.scrollTo({ 
        top: el.scrollHeight, 
        behavior: "smooth" 
      });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // 1. Listen for mobile virtual keyboard changes via Visual Viewport API
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleViewportChange = () => {
      const vv = window.visualViewport;
      // Calculate how much keyboard is pushing up
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      // Only treat as keyboard when offset is significant (usually >= 60px)
      setKeyboardOffset(offset > 60 ? offset : 0);
    };

    window.visualViewport.addEventListener("resize", handleViewportChange);
    window.visualViewport.addEventListener("scroll", handleViewportChange);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  // 2. Fetch or create conversation and load previous message history
  useEffect(() => {
    let isMounted = true;
    const initChat = async () => {
      if (!candidate?.id) return;
      setLoadingHistory(true);
      setError("");

      try {
        const convoRes = await getOrCreateConversationForUser({ targetUserId: candidate.id });
        if (!isMounted) return;

        if (convoRes?.success && convoRes.conversationId) {
          setConversationId(convoRes.conversationId);
          
          // Load existing messages
          const msgsRes = await fetchMessages(convoRes.conversationId);
          if (isMounted && msgsRes?.success && Array.isArray(msgsRes.messages)) {
            setMessages(msgsRes.messages);
            markMessagesReadAction(convoRes.conversationId);
          }
        } else {
          setError(convoRes?.error || "Could not open chat room.");
        }
      } catch (err) {
        console.error("Error opening chat session:", err);
        if (isMounted) setError("Could not load message history.");
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    initChat();
    return () => {
      isMounted = false;
    };
  }, [candidate?.id]);

  // 3. Socket.io listeners for live incoming messages
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join_room", conversationId);

    const handleIncoming = (newMsg) => {
      if (!newMsg) return;
      if (newMsg.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        markMessagesReadAction(conversationId);
      }
    };

    socket.on("new_message", handleIncoming);
    socket.on("new_sms", handleIncoming);

    return () => {
      socket.off("new_message", handleIncoming);
      socket.off("new_sms", handleIncoming);
    };
  }, [socket, conversationId]);

  // 4. Auto-scroll on new messages or keyboard adjustments
  useEffect(() => {
    scrollToBottom(false, false);
  }, [messages.length, keyboardOffset, scrollToBottom]);

  // Focus textarea when expanding from minimized
  useEffect(() => {
    if (!isMinimized && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isMinimized]);

  // Handle ESC key to minimize or close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (!isMinimized) {
          setIsMinimized(true);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMinimized, onClose]);

  const handleSelectIcebreaker = (chip) => {
    setMessageText(chip);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending && messageText.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const cleanText = messageText.trim();
    if (!cleanText || sending) return;

    if (cleanText.length > MAX_CHAR_COUNT) {
      setError(`Message exceeds limit of ${MAX_CHAR_COUNT} characters.`);
      return;
    }

    setSending(true);
    setError("");

    // Optimistic message entry
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      conversationId,
      senderId: currentUserId || "user_me",
      text: cleanText,
      createdAt: new Date().toISOString(),
      status: "SENDING",
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setMessageText("");
    setTimeout(() => scrollToBottom(true, true), 50);

    try {
      let activeConvoId = conversationId;
      if (!activeConvoId) {
        const convoRes = await getOrCreateConversationForUser({ targetUserId: candidate.id });
        if (convoRes?.success && convoRes.conversationId) {
          activeConvoId = convoRes.conversationId;
          setConversationId(activeConvoId);
        } else {
          throw new Error(convoRes?.error || "Could not open conversation room.");
        }
      }

      // Send the message to server action
      const res = await sendMessageAction({
        conversationId: activeConvoId,
        text: cleanText
      });

      if (res?.success && res.message) {
        // Replace optimistic entry with saved message
        setMessages((prev) => 
          prev.map((m) => (m.id === tempId ? res.message : m))
        );

        // Emit through socket for real-time peer delivery
        if (socket) {
          socket.emit("send_message", {
            ...res.message,
            recipientId: candidate.id
          });
        }
      } else {
        throw new Error(res?.error || "Failed to deliver message.");
      }
    } catch (err) {
      console.error("Direct floating chat send error:", err);
      setError(err?.message || "Failed to send message. Please try again.");
      // Mark optimistic message as failed
      setMessages((prev) => 
        prev.map((m) => (m.id === tempId ? { ...m, status: "FAILED" } : m))
      );
    } finally {
      setSending(false);
      setTimeout(() => scrollToBottom(true, false), 100);
    }
  };

  return (
    <div
      className={`fixed z-70 pointer-events-none left-2 right-2 sm:left-auto sm:right-4 md:right-6 md:w-[390px] flex flex-col items-end transition-[bottom] duration-200 ${
        keyboardOffset > 0 
          ? '' 
          : 'bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-6'
      }`}
      style={
        keyboardOffset > 0
          ? { bottom: `${keyboardOffset + 10}px` }
          : undefined
      }
      role="region"
      aria-label={`Direct Chat with ${candidate?.fullName}`}
    >
      <AnimatePresence mode="wait">
        {/* ========================================================= */}
        {/* CASE A: MINIMIZED DOCKED PILL                              */}
        {/* ========================================================= */}
        {isMinimized ? (
          <motion.div
            key="minimized-dock"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="pointer-events-auto flex items-center gap-3 px-3.5 py-2.5 rounded-full bg-[#fffdfa]/95 dark:bg-[#2b1d24]/95 backdrop-blur-2xl border border-[var(--sb-line)] dark:border-white/15 shadow-[0_12px_36px_rgba(74,23,44,0.18)] hover:shadow-[0_16px_40px_rgba(74,23,44,0.25)] transition-all cursor-pointer group select-none max-w-xs"
            onClick={() => setIsMinimized(false)}
          >
            {/* Avatar with status indicator */}
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt={candidate?.fullName}
                className="w-8 h-8 rounded-full object-cover border border-(--sb-wine)/30"
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#fffdfa] dark:ring-[#2b1d24] ${
                  isOnline ? "bg-emerald-500" : "bg-amber-400"
                }`}
                title={isOnline ? "Online" : "Away"}
              />
            </div>

            {/* Candidate summary text */}
            <div className="flex flex-col text-left overflow-hidden pr-1">
              <span className="text-xs font-bold text-foreground truncate flex items-center gap-1">
                {firstName}
                <Sparkles className="w-3 h-3 text-(--sb-rose) shrink-0" />
              </span>
              <span className="text-[10px] text-foreground/50 truncate">
                {messages.length > 0 ? `${messages.length} messages` : "Chat minimized"}
              </span>
            </div>

            {/* Restore and Close buttons */}
            <div className="flex items-center gap-1 ml-auto pl-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(false);
                }}
                className="w-7 h-7 rounded-full bg-(--sb-blush)/50 dark:bg-white/10 hover:bg-[var(--sb-wine)] hover:text-white flex items-center justify-center text-foreground/70 transition-all cursor-pointer"
                title="Restore chat"
                aria-label="Restore chat"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-7 h-7 rounded-full bg-(--sb-blush)/50 dark:bg-white/10 hover:bg-rose-500 hover:text-white flex items-center justify-center text-foreground/70 transition-all cursor-pointer"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* ========================================================= */
          /* CASE B: EXPANDED FLOATING CHAT CARD                       */
          /* ========================================================= */
          <motion.div
            key="expanded-card"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="pointer-events-auto w-full flex flex-col rounded-3xl bg-[#fffdfa]/95 dark:bg-[#2b1d24]/95 backdrop-blur-2xl border border-[var(--sb-line)] dark:border-white/15 shadow-[0_20px_60px_rgba(74,23,44,0.24)] overflow-hidden"
            style={{
              height: keyboardOffset > 0 
                ? 'min(360px, calc(100dvh - 120px))' 
                : 'min(520px, calc(100dvh - 6.5rem - env(safe-area-inset-bottom, 0px) - env(safe-area-inset-top, 0px)))',
              maxHeight: '560px',
            }}
          >
            {/* 1. CHAT HEADER (FIXED TOP, NEVER SCROLLS) */}
            <div className="shrink-0 flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-[var(--sb-line)] dark:border-white/10 bg-gradient-to-r from-[var(--sb-wine)]/10 via-[var(--sb-blush)]/20 to-transparent">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={avatarUrl}
                    alt={candidate?.fullName}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[var(--sb-wine)] shadow-xs"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ring-2 ring-[#fffdfa] dark:ring-[#2b1d24] ${
                      isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                    }`}
                    title={isOnline ? "Online" : "Offline"}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <h3 className="font-extrabold text-xs sm:text-sm text-foreground flex items-center gap-1.5 truncate">
                    {candidate?.fullName}
                    <Sparkles className="w-3.5 h-3.5 text-(--sb-rose) shrink-0" />
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-foreground/60 truncate">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        isOnline ? "bg-emerald-500" : "bg-foreground/40"
                      }`}
                    />
                    <span>{isOnline ? "Active now" : candidate?.city || "SoulBridge Member"}</span>
                    {candidate?.profession && (
                      <>
                        <span className="opacity-40">•</span>
                        <span className="truncate">{candidate.profession}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                {conversationId && (
                  <Link
                    href={`/chat?convo=${conversationId}`}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-[var(--sb-wine)] hover:text-white flex items-center justify-center text-foreground/70 transition-all"
                    title="Open in full chat page"
                    aria-label="Open full chat"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-[var(--sb-wine)] hover:text-white flex items-center justify-center text-foreground/70 transition-all cursor-pointer"
                  title="Minimize"
                  aria-label="Minimize chat"
                >
                  <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-rose-500 hover:text-white flex items-center justify-center text-foreground/70 transition-all cursor-pointer"
                  title="Close"
                  aria-label="Close chat"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* 2. CHAT BODY / SCROLL AREA (SCROLLS INDEPENDENTLY) */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleMessagesScroll}
              className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto space-y-3.5 overscroll-contain"
            >
              {/* Profile Intro / Icebreakers if no messages or short history */}
              {messages.length === 0 && !loadingHistory && (
                <div className="flex flex-col items-center text-center py-2 px-1">
                  <div className="w-12 h-12 rounded-full bg-[var(--sb-blush)]/60 text-[var(--sb-wine)] flex items-center justify-center mb-2 shadow-xs">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">
                    Start a chat with {firstName}
                  </h4>
                  <p className="text-[11px] text-foreground/60 max-w-[260px] mt-0.5 leading-relaxed">
                    Break the ice with a thoughtful note or choose a suggested opener below!
                  </p>

                  {/* Icebreakers Chips */}
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3 pt-1">
                    {DEFAULT_ICEBREAKERS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectIcebreaker(chip)}
                        className="text-left text-[11px] px-2.5 py-1 rounded-full bg-[var(--sb-blush)]/50 dark:bg-white/5 hover:bg-[var(--sb-wine)]/15 border border-[var(--sb-line)] dark:border-white/10 hover:border-[var(--sb-rose)]/40 text-foreground/80 hover:text-foreground transition-all cursor-pointer active:scale-95"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading history indicator */}
              {loadingHistory && (
                <div className="flex items-center justify-center py-6 gap-2 text-foreground/50">
                  <div className="w-4 h-4 border-2 border-[var(--sb-wine)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] font-medium">Connecting room...</span>
                </div>
              )}

              {/* Message Bubbles History */}
              {messages.length > 0 && (
                <div className="space-y-2.5">
                  {messages.map((m) => {
                    const isMe = m.senderId === currentUserId || m.senderId === "user_me" || (!m.senderId?.startsWith("mock_") && m.senderId !== candidate?.id);
                    const timeStr = m.createdAt 
                      ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : "";

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-xs ${
                            isMe
                              ? "bg-gradient-to-r from-[var(--sb-wine)] to-[var(--sb-wine-deep)] text-white rounded-br-xs"
                              : "bg-white/85 dark:bg-white/10 text-foreground border border-[var(--sb-line)] dark:border-white/10 rounded-bl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>

                        {/* Message status / time */}
                        <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] text-foreground/45">
                          <span>{timeStr}</span>
                          {isMe && (
                            <span>
                              {m.status === "SENDING" ? (
                                <span className="opacity-60">Sending...</span>
                              ) : m.status === "FAILED" ? (
                                <span className="text-rose-500 font-semibold">Failed</span>
                              ) : m.status === "READ" ? (
                                <CheckCheck className="w-3 h-3 text-[var(--sb-rose)] inline" />
                              ) : (
                                <Check className="w-3 h-3 text-foreground/40 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Message scroll anchor space */}
              <div className="h-1" />
            </div>

            {/* 3. CHAT COMPOSER (PINNED TO BOTTOM, NEVER OBSCURED) */}
            <div className="flex-shrink-0 p-2.5 sm:p-3 bg-[#fffdfa] dark:bg-[#2b1d24] border-t border-[var(--sb-line)] dark:border-white/10">
              <form onSubmit={handleSendMessage} className="flex flex-col gap-1.5">
                {error && (
                  <div className="p-1.5 px-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-semibold flex items-center justify-between">
                    <span>{error}</span>
                    <button 
                      type="button" 
                      onClick={() => setError("")} 
                      className="text-rose-500 hover:text-rose-700 ml-2"
                    >
                      &times;
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <div className="relative flex-1 min-w-0">
                    <textarea
                      id="quick-message-input"
                      ref={textareaRef}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value.slice(0, MAX_CHAR_COUNT))}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${firstName}...`}
                      rows={keyboardOffset > 0 ? 1 : 2}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--sb-paper)]/80 dark:bg-black/20 border border-[var(--sb-line)] dark:border-white/15 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-[var(--sb-wine)] focus:ring-1 focus:ring-[var(--sb-wine)]/20 transition-all resize-none shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-[var(--sb-wine)] to-[var(--sb-wine-deep)] hover:opacity-95 active:scale-95 text-white text-xs font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
                    title="Send (Enter)"
                    aria-label="Send message"
                  >
                    {sending ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span className="hidden sm:inline text-white">Send</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Footer hints & counter */}
                <div className="flex items-center justify-between px-1 text-[10px] text-foreground/40">
                  <span className="hidden sm:inline italic">
                    Press <kbd className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[9px]">Enter</kbd> to send
                  </span>
                  <span className="sm:hidden text-[9px] opacity-75">
                    SoulBridge Chat
                  </span>
                  <span className={messageText.length > MAX_CHAR_COUNT - 50 ? "text-rose-500 font-bold" : ""}>
                    {messageText.length}/{MAX_CHAR_COUNT}
                  </span>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Named alias export for backward compatibility
export { QuickMessageModal as FloatingChatPopup };
