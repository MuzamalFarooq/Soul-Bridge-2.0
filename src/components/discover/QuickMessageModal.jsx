"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, MessageCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getOrCreateConversationForUser } from "@/actions/feed";
import { sendMessageAction } from "@/actions/chat";

export default function QuickMessageModal({ candidate, onClose }) {
  const router = useRouter();
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState("");

  const quickIcebreakers = [
    "Hey! I really loved your profile picture! ✨",
    "Hi there! Would love to connect over chai ☕",
    "Loved your bio interests! What's your favorite spot in town?",
    "Hey! How's your week going so far?"
  ];

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    setError("");

    try {
      // Get or create conversation with target user
      const convoRes = await getOrCreateConversationForUser({ targetUserId: candidate.id });
      if (convoRes.success && convoRes.conversationId) {
        // Send message
        await sendMessageAction({
          conversationId: convoRes.conversationId,
          text: messageText.trim()
        });

        setSentSuccess(true);
        setTimeout(() => {
          onClose();
          router.push(`/chat?convo=${convoRes.conversationId}`);
        }, 1200);
      } else {
        setError("Could not open chat room. Please try again.");
      }
    } catch (err) {
      console.error("Direct message error:", err);
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md glass-card rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <img
                src={candidate.photos[0] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"}
                alt={candidate.fullName}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-pink shadow-md"
              />
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-1.5 text-foreground">
                  Send Message to {candidate.fullName.split(" ")[0]} <Sparkles className="w-4 h-4 text-primary-pink" />
                </h3>
                <p className="text-xs text-foreground/60">{candidate.profession} • {candidate.city}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-foreground/60 hover:text-foreground transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {sentSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h4 className="font-bold text-lg text-emerald-400">Message Sent!</h4>
              <p className="text-xs text-foreground/60 mt-1">Redirecting you to the chat room...</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
              {/* Quick Icebreakers */}
              <div>
                <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-2 block">
                  Quick Icebreakers
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickIcebreakers.map((icebreaker, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessageText(icebreaker)}
                      className="text-left text-[11px] px-3 py-1.5 rounded-full bg-white/5 hover:bg-primary-pink/15 border border-white/10 hover:border-primary-pink/30 transition-all text-foreground/80 hover:text-foreground cursor-pointer"
                    >
                      {icebreaker}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input text area */}
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                  Your Message
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Write a friendly message to ${candidate.fullName.split(" ")[0]}...`}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-xs text-foreground focus:outline-none focus:border-primary-pink resize-none"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs text-rose-400 font-semibold">{error}</p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 text-foreground/70 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-premium text-white text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {sending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Direct Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
