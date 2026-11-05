/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Minus, 
  Maximize2, 
  ExternalLink,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { getOrCreateConversationForUser } from "@/actions/feed";
import { sendMessageAction } from "@/actions/chat";
import { useSocket } from "@/context/SocketContext";

const MAX_CHAR_COUNT = 500;

const DEFAULT_ICEBREAKERS = [
  "Hey! Loved your profile picture! ✨",
  "Hi there! Would love to connect over chai ☕",
  "Loved your interests! What's your favorite spot in town? 🌿",
  "Hey! How has your week been going so far?"
];

/**
 * FloatingChatPopup / QuickMessageModal
 *
 * Premium floating direct messaging widget anchored to the bottom-right.
 * Replaces intrusive full-screen modal overlays while preserving Discover feed visibility.
 */
export default function QuickMessageModal({ candidate, onClose }) {
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [createdConvoId, setCreatedConvoId] = useState(null);
  const [error, setError] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  const textareaRef = useRef(null);

  // Real-time online presence from SocketContext
  let isOnline = false;
  try {
    const socketCtx = useSocket();
    if (socketCtx?.onlineUsers && candidate?.id) {
      isOnline = socketCtx.onlineUsers.includes(candidate.id);
    }
  } catch (err) {
    // Graceful fallback if context isn't mounted
    isOnline = false;
  }

  const firstName = candidate?.fullName?.split(" ")[0] || "there";
  const avatarUrl = candidate?.photos?.[0] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop";

  const [prevCandidateId, setPrevCandidateId] = useState(candidate?.id);
  if (candidate?.id !== prevCandidateId) {
    setPrevCandidateId(candidate?.id);
    setIsMinimized(false);
    setSentSuccess(false);
    setMessageText("");
    setError("");
    setCreatedConvoId(null);
  }

  // Focus textarea when expanded
  useEffect(() => {
    if (!isMinimized && !sentSuccess && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isMinimized, sentSuccess]);

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

    try {
      // 1. Get or create conversation for the target user
      const convoRes = await getOrCreateConversationForUser({ targetUserId: candidate.id });

      if (convoRes?.success && convoRes.conversationId) {
        setCreatedConvoId(convoRes.conversationId);

        // 2. Send the initial direct message
        await sendMessageAction({
          conversationId: convoRes.conversationId,
          text: cleanText
        });

        setSentSuccess(true);
      } else {
        setError(convoRes?.error || "Could not open chat room. Please try again.");
      }
    } catch (err) {
      console.error("Direct floating chat error:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleResetForAnother = () => {
    setMessageText("");
    setSentSuccess(false);
    setError("");
  };

  return (
    <div
      className="fixed z-50 pointer-events-none bottom-4 right-4 sm:bottom-6 sm:right-6 left-4 sm:left-auto flex flex-col items-end"
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
            className="pointer-events-auto flex items-center gap-3 px-3.5 py-2.5 rounded-full bg-[#fffdfa]/95 dark:bg-[#2b1d24]/95 backdrop-blur-xl border border-[var(--sb-line)] dark:border-white/15 shadow-[0_12px_36px_rgba(74,23,44,0.18)] hover:shadow-[0_16px_40px_rgba(74,23,44,0.25)] transition-all cursor-pointer group select-none max-w-xs"
            onClick={() => setIsMinimized(false)}
          >
            {/* Avatar with status indicator */}
            <div className="relative flex-shrink-0">
              <img
                src={avatarUrl}
                alt={candidate?.fullName}
                className="w-8 h-8 rounded-full object-cover border border-[var(--sb-wine)]/30"
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
                {sentSuccess ? "Message sent" : "Chat minimized"}
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
                className="w-7 h-7 rounded-full bg-[var(--sb-blush)]/50 dark:bg-white/10 hover:bg-rose-500 hover:text-white flex items-center justify-center text-foreground/70 transition-all cursor-pointer"
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
            className="pointer-events-auto w-full sm:w-[380px] max-h-[550px] flex flex-col rounded-3xl bg-[#fffdfa]/95 dark:bg-[#2b1d24]/95 backdrop-blur-2xl border border-[var(--sb-line)] dark:border-white/15 shadow-[0_20px_60px_rgba(74,23,44,0.24)] overflow-hidden"
          >
            {/* 1. CHAT HEADER */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--sb-line)] dark:border-white/10 bg-gradient-to-r from-[var(--sb-wine)]/10 via-[var(--sb-blush)]/20 to-transparent">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={avatarUrl}
                    alt={candidate?.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[var(--sb-wine)] shadow-sm"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#fffdfa] dark:ring-[#2b1d24] ${
                      isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                    }`}
                    title={isOnline ? "Online" : "Offline"}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 truncate">
                    {candidate?.fullName}
                    <Sparkles className="w-3.5 h-3.5 text-[var(--sb-rose)] flex-shrink-0" />
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-foreground/60 truncate">
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
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-[var(--sb-wine)] hover:text-white flex items-center justify-center text-foreground/70 transition-all cursor-pointer"
                  title="Minimize"
                  aria-label="Minimize chat"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-rose-500 hover:text-white flex items-center justify-center text-foreground/70 transition-all cursor-pointer"
                  title="Close"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. CHAT BODY */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[460px]">
              {sentSuccess ? (
                /* Sent Confirmation State (keeps user on Discover!) */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 px-3 flex flex-col items-center text-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-foreground">Message Sent!</h4>
                    <p className="text-xs text-foreground/60 mt-1 max-w-[260px] mx-auto leading-relaxed">
                      Your note has been delivered to {firstName}. You can continue browsing profiles without leaving Discover.
                    </p>
                  </div>

                  {/* Action row */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
                    {createdConvoId && (
                      <Link
                        href={`/chat?convo=${createdConvoId}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[var(--sb-wine)] to-[var(--sb-wine-deep)] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Open Full Chat
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2 px-3 rounded-xl border border-[var(--sb-line)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-foreground/80 transition-all cursor-pointer"
                    >
                      Done Browsing
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetForAnother}
                    className="text-[11px] text-[var(--sb-rose)] hover:underline pt-1 cursor-pointer font-medium"
                  >
                    Send another follow-up note
                  </button>
                </motion.div>
              ) : (
                /* Active Message Compose Mode */
                <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                  {/* Quick Icebreaker suggestions */}
                  <div>
                    <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[var(--sb-rose)]" />
                      Quick Icebreakers
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {DEFAULT_ICEBREAKERS.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectIcebreaker(chip)}
                          className="text-left text-[11px] px-2.5 py-1 rounded-full bg-[var(--sb-blush)]/40 dark:bg-white/5 hover:bg-[var(--sb-wine)]/15 border border-[var(--sb-line)] dark:border-white/10 hover:border-[var(--sb-rose)]/40 text-foreground/80 hover:text-foreground transition-all cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message textarea with character counter */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="quick-message-input"
                        className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider"
                      >
                        Your Note
                      </label>
                      <span
                        className={`text-[10px] font-medium ${
                          messageText.length > MAX_CHAR_COUNT - 50
                            ? "text-rose-500 font-bold"
                            : "text-foreground/40"
                        }`}
                      >
                        {messageText.length}/{MAX_CHAR_COUNT}
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        id="quick-message-input"
                        ref={textareaRef}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value.slice(0, MAX_CHAR_COUNT))}
                        onKeyDown={handleKeyDown}
                        placeholder={`Say something nice to ${firstName}... (Press Enter to send)`}
                        rows={3}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--sb-paper)]/80 dark:bg-black/20 border border-[var(--sb-line)] dark:border-white/15 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-[var(--sb-wine)] focus:ring-2 focus:ring-[var(--sb-wine)]/15 transition-all resize-none shadow-inner"
                      />
                    </div>
                    <p className="text-[10px] text-foreground/40 italic">
                      Tip: Press <kbd className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[9px]">Shift+Enter</kbd> for newline
                    </p>
                  </div>

                  {error && (
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  {/* Composer Footer Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-2 rounded-xl border border-[var(--sb-line)] text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 text-foreground/70 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--sb-wine)] to-[var(--sb-wine-deep)] hover:opacity-95 active:scale-95 text-white text-xs font-bold shadow-md hover:shadow-[var(--sb-wine)]/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {sending ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Named alias export for explicit semantic naming
export { QuickMessageModal as FloatingChatPopup };
