"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, X, Check, ShieldCheck, Sparkles, Phone, MessageSquare, 
  UserCheck, AlertCircle, RefreshCcw, Star 
} from "lucide-react";
import { fetchPendingConnectionRequests, acceptConnectionRequest, declineConnectionRequest } from "@/actions/matching";
import { useSocket } from "@/context/SocketContext";

export default function ConnectionRequestsModal({ isOpen, onClose, onConnectionAccepted }) {
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchPendingConnectionRequests();
      if (res.success) {
        setRequests(res.requests || []);
      } else {
        setError(res.error || "Failed to load connection requests");
      }
    } catch (err) {
      setError("Failed to load connection requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const handleAccept = async (req) => {
    setActionLoadingId(req.id);
    try {
      const res = await acceptConnectionRequest({ requesterId: req.requesterId });
      if (res.success) {
        // Remove from list
        setRequests((prev) => prev.filter((r) => r.id !== req.id));

        // Notify socket
        if (socket) {
          socket.emit("accept_connection", {
            requesterId: req.requesterId,
            acceptorData: res.matchData,
            convoId: res.convoId
          });
        }

        // Trigger callback to parent (open chat & celebration modal)
        if (onConnectionAccepted) {
          onConnectionAccepted(res.matchData, res.convoId);
        }
      } else {
        alert(res.error || "Failed to accept connection request");
      }
    } catch (err) {
      console.error("Accept error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (req) => {
    setActionLoadingId(req.id);
    try {
      const res = await declineConnectionRequest({ requesterId: req.requesterId });
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.id !== req.id));
      }
    } catch (err) {
      console.error("Decline error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl bg-[#09090B] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF4D8D] to-[#9C6BFF] p-0.5 flex items-center justify-center text-white shadow-lg">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  Connection Requests <Sparkles className="w-4 h-4 text-[#FF4D8D]" />
                </h3>
                <p className="text-xs text-white/50 font-medium">
                  Accept requests to establish connections and enable SMS & direct messaging.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
            {loading && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/50">
                <div className="w-8 h-8 border-4 border-[#FF4D8D] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Loading pending connection requests...</span>
              </div>
            )}

            {!loading && error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center text-xs text-red-400">
                {error}
              </div>
            )}

            {!loading && !error && requests.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center p-6 text-white/40">
                <Heart className="w-12 h-12 text-[#FF4D8D]/30 fill-[#FF4D8D]/10 mb-3" />
                <h4 className="font-bold text-sm text-white">No Pending Requests</h4>
                <p className="text-xs opacity-75 mt-1 max-w-xs leading-relaxed">
                  When other members send you a connection request or right swipe, they will appear here for your review!
                </p>
              </div>
            )}

            {!loading && !error && requests.length > 0 && (
              <div className="flex flex-col gap-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#FF4D8D]/40 transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={req.photo}
                          alt={req.fullName}
                          className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                        />
                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-[8px] font-black text-white shadow-md">
                          {req.compatibility}%
                        </div>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                          {req.fullName}, {req.age}
                          {req.requestType === "SUPERLIKE" && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-bold border border-amber-400/30 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-300" /> Super Like
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-[#9C6BFF] font-semibold">{req.profession}</p>
                        <p className="text-xs text-white/70 line-clamp-1 mt-0.5 italic">
                          "{req.bio}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleDecline(req)}
                        disabled={actionLoadingId === req.id}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 border border-white/10 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => handleAccept(req)}
                        disabled={actionLoadingId === req.id}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] hover:scale-105 active:scale-95 text-white text-xs font-bold shadow-lg shadow-pink-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {actionLoadingId === req.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Accept Connection
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
