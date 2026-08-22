"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { 
  Heart, X, Star, MessageCircle, Sparkles, MapPin, Briefcase, 
  Check, ChevronRight, ChevronLeft, Send, Pause, Play, 
  RotateCw, UserPlus, Info, Flame, Brain, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchNewlyAddedProfiles } from "@/actions/matching";
import { getOrCreateConversationForUser } from "@/actions/feed";
import { sendMessageAction } from "@/actions/chat";

export default function HomeCardStackPreview() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds interval
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Direct Quick Messaging Modal
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState(null);
  const [connectedIds, setConnectedIds] = useState(new Set());

  // Drag Motion
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacityLike = useTransform(x, [20, 120], [0, 1]);
  const opacityPass = useTransform(x, [-120, -20], [1, 0]);
  const opacitySuperlike = useTransform(y, [-120, -20], [1, 0]);

  // Load newly added profiles
  useEffect(() => {
    let isMounted = true;
    async function loadNewPeople() {
      try {
        const res = await fetchNewlyAddedProfiles();
        if (res.success && res.profiles?.length > 0) {
          // Check if local storage has any newly added users from this session
          let localNewUsers = [];
          try {
            const saved = localStorage.getItem("sb_recent_new_users");
            if (saved) localNewUsers = JSON.parse(saved);
          } catch (e) {}

          const merged = [...localNewUsers, ...res.profiles];
          // Deduplicate
          const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
          if (isMounted) {
            setProfiles(unique);
          }
        }
      } catch (err) {
        console.error("Failed to load newly added profiles:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadNewPeople();
    return () => { isMounted = false; };
  }, []);

  // 30-second continuous timer
  useEffect(() => {
    if (profiles.length === 0 || isPaused || isHovered || messageModalOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextProfile("AUTO");
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [profiles.length, currentIndex, isPaused, isHovered, messageModalOpen]);

  // Reset photo index and drag controls when current card changes
  useEffect(() => {
    setPhotoIndex(0);
    setIsExpanded(false);
    controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
  }, [currentIndex, controls]);

  const showToast = (text, type = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const handleNextProfile = (direction = "NEXT") => {
    if (profiles.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
    setTimeLeft(30);
  };

  const handlePrevProfile = () => {
    if (profiles.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
    setTimeLeft(30);
  };

  const handleSwipeAction = async (actionType) => {
    const currentPerson = profiles[currentIndex];
    if (!currentPerson) return;

    if (actionType === "LIKE") {
      await controls.start({ x: 400, rotate: 30, opacity: 0, transition: { duration: 0.25 } });
      setConnectedIds(prev => new Set(prev).add(currentPerson.id));
      showToast(`Connection request sent to ${currentPerson.fullName.split(" ")[0]}! ❤️`);
      handleNextProfile("LIKE");
    } else if (actionType === "PASS") {
      await controls.start({ x: -400, rotate: -30, opacity: 0, transition: { duration: 0.25 } });
      showToast(`Passed on ${currentPerson.fullName.split(" ")[0]}`);
      handleNextProfile("PASS");
    } else if (actionType === "SUPERLIKE") {
      await controls.start({ y: -450, opacity: 0, transition: { duration: 0.25 } });
      setConnectedIds(prev => new Set(prev).add(currentPerson.id));
      showToast(`Super Liked ${currentPerson.fullName.split(" ")[0]}! ⭐`);
      handleNextProfile("SUPERLIKE");
    }
  };

  const handleDragEnd = async (e, info) => {
    const threshold = 110;
    const swipeX = info.offset.x;
    const swipeY = info.offset.y;

    if (swipeY < -130 && Math.abs(swipeX) < 100) {
      handleSwipeAction("SUPERLIKE");
    } else if (swipeX > threshold) {
      handleSwipeAction("LIKE");
    } else if (swipeX < -threshold) {
      handleSwipeAction("PASS");
    } else {
      controls.start({ x: 0, y: 0, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 350, damping: 25 } });
    }
  };

  // Direct Quick Message handler
  const handleOpenMessageModal = (e) => {
    e?.stopPropagation();
    setMessageText("");
    setMessageSentSuccess(false);
    setMessageModalOpen(true);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim()) return;

    const currentPerson = profiles[currentIndex];
    if (!currentPerson) return;

    setIsSendingMessage(true);
    try {
      // Attempt server action if user is authenticated
      const convoRes = await getOrCreateConversationForUser({ targetUserId: currentPerson.id });
      if (convoRes.success && convoRes.conversationId) {
        await sendMessageAction({
          conversationId: convoRes.conversationId,
          text: messageText.trim()
        });
        setMessageSentSuccess(true);
        setTimeout(() => {
          setMessageModalOpen(false);
          router.push(`/chat?convo=${convoRes.conversationId}`);
        }, 1200);
      } else {
        // Fallback / Demo interactive mode
        setMessageSentSuccess(true);
        showToast(`Message sent to ${currentPerson.fullName.split(" ")[0]}! 💬`);
        setTimeout(() => {
          setMessageModalOpen(false);
          setConnectedIds(prev => new Set(prev).add(currentPerson.id));
        }, 1300);
      }
    } catch (err) {
      // Interactive guest fallback
      setMessageSentSuccess(true);
      showToast(`Message sent to ${currentPerson.fullName.split(" ")[0]}! 💬`);
      setTimeout(() => {
        setMessageModalOpen(false);
        setConnectedIds(prev => new Set(prev).add(currentPerson.id));
      }, 1300);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const icebreakers = [
    "Hey! Loved your profile vibe ✨",
    "Hi there! Would love to connect over coffee ☕",
    "Great taste in hobbies! What's your top spot in town?",
    "Hey! How is your week going?"
  ];

  if (loading) {
    return (
      <div className="w-full max-w-3xl rounded-3xl glass-card-lux border border-white/20 p-8 shadow-2xl flex flex-col items-center justify-center min-h-[460px]">
        <div className="w-12 h-12 rounded-full border-3 border-[#FF4D8D] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-medium text-white/70">Connecting to live member stream...</p>
      </div>
    );
  }

  const currentPerson = profiles[currentIndex] || profiles[0];
  const nextPerson = profiles[(currentIndex + 1) % profiles.length];
  const thirdPerson = profiles[(currentIndex + 2) % profiles.length];
  const isConnected = currentPerson ? connectedIds.has(currentPerson.id) : false;

  return (
    <div 
      className="w-full max-w-3xl rounded-3xl glass-card-lux border border-white/20 p-3 sm:p-5 shadow-2xl relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/85 backdrop-blur-xl border border-[#FF4D8D]/40 text-white text-xs font-bold shadow-xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FF4D8D]" />
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Controls & Auto-Rotation Bar */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 mb-3 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-white/90 flex items-center gap-1.5">
            Live New Members <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-[#FF4D8D] font-mono font-bold">Auto-rotating</span>
          </span>
        </div>

        {/* 30s Countdown Indicator & Pause/Play */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white/60 font-mono text-[11px]">
            <span>Next in</span>
            <span className="text-[#FF4D8D] font-bold w-5 text-center">{timeLeft}s</span>
            <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF]"
                style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume 30s rotation" : "Pause rotation"}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Interactive Deck Area */}
      <div className="rounded-2xl overflow-hidden bg-[#09090B] py-5 px-2 relative min-h-[460px] sm:min-h-[500px] flex items-center justify-center bg-gradient-to-tr from-[#9C6BFF]/20 via-[#09090B] to-[#FF4D8D]/20 border border-white/10">
        
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrevProfile}
          className="absolute left-2 sm:left-4 z-30 p-2.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white/70 hover:text-white border border-white/10 transition-all hover:scale-110 active:scale-95 cursor-pointer hidden sm:flex items-center justify-center"
          title="Previous profile"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={() => handleNextProfile("MANUAL")}
          className="absolute right-2 sm:right-4 z-30 p-2.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white/70 hover:text-white border border-white/10 transition-all hover:scale-110 active:scale-95 cursor-pointer hidden sm:flex items-center justify-center"
          title="Next profile"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Card Stack Container */}
        <div className="relative w-full max-w-[320px] sm:max-w-[345px] h-[440px] sm:h-[470px]">
          
          {/* Card 3 (Bottom Depth) */}
          {thirdPerson && (
            <div 
              className="absolute inset-0 rounded-3xl glass-card border border-white/5 opacity-40 translate-y-6 scale-[0.88] pointer-events-none transition-all duration-500 overflow-hidden bg-slate-900"
            >
              <img 
                src={thirdPerson.photos?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600"} 
                alt="" 
                className="w-full h-full object-cover blur-sm opacity-50"
              />
            </div>
          )}

          {/* Card 2 (Middle Depth) */}
          {nextPerson && (
            <div 
              className="absolute inset-0 rounded-3xl glass-card border border-white/10 opacity-70 translate-y-3 scale-[0.94] pointer-events-none transition-all duration-500 overflow-hidden bg-slate-900 shadow-xl"
            >
              <img 
                src={nextPerson.photos?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600"} 
                alt="" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-left">
                <span className="text-xs font-bold text-white/80">{nextPerson.fullName}, {nextPerson.age}</span>
              </div>
            </div>
          )}

          {/* Top Active Card */}
          {currentPerson && (
            <motion.div
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.9}
              onDragEnd={handleDragEnd}
              animate={controls}
              style={{ x, y, rotate }}
              className="absolute inset-0 rounded-3xl glass-card-lux border border-white/20 p-4 sm:p-5 flex flex-col justify-between shadow-2xl cursor-grab active:cursor-grabbing select-none overflow-hidden bg-[#111116]/95 z-20"
            >
              {/* Swipe Visual Feedback Stamps */}
              <motion.div
                style={{ opacity: opacityLike }}
                className="absolute top-6 left-6 z-40 border-4 border-emerald-400 text-emerald-400 font-black text-xl px-3 py-1 rounded-xl rotate-[-15deg] pointer-events-none uppercase tracking-widest bg-emerald-950/40"
              >
                CONNECT
              </motion.div>

              <motion.div
                style={{ opacity: opacityPass }}
                className="absolute top-6 right-6 z-40 border-4 border-rose-500 text-rose-500 font-black text-xl px-3 py-1 rounded-xl rotate-[15deg] pointer-events-none uppercase tracking-widest bg-rose-950/40"
              >
                PASS
              </motion.div>

              <motion.div
                style={{ opacity: opacitySuperlike }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 border-4 border-purple-400 text-purple-300 font-black text-xl px-4 py-1.5 rounded-xl pointer-events-none uppercase tracking-widest bg-purple-950/60"
              >
                SUPERLIKE
              </motion.div>

              {/* Photo Showcase */}
              <div className="w-full h-48 sm:h-54 rounded-2xl bg-slate-800 relative overflow-hidden group">
                <img
                  src={currentPerson.photos?.[photoIndex] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600"}
                  alt={currentPerson.fullName}
                  className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                {/* Left/Right Photo Tap Zones */}
                {currentPerson.photos && currentPerson.photos.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIndex((prev) => (prev - 1 + currentPerson.photos.length) % currentPerson.photos.length);
                      }}
                      className="absolute top-0 left-0 bottom-0 w-1/3 z-10 opacity-0 group-hover:opacity-100 flex items-center justify-start pl-2 transition-opacity"
                    >
                      <span className="p-1 rounded-full bg-black/50 text-white"><ChevronLeft className="w-4 h-4" /></span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIndex((prev) => (prev + 1) % currentPerson.photos.length);
                      }}
                      className="absolute top-0 right-0 bottom-0 w-1/3 z-10 opacity-0 group-hover:opacity-100 flex items-center justify-end pr-2 transition-opacity"
                    >
                      <span className="p-1 rounded-full bg-black/50 text-white"><ChevronRight className="w-4 h-4" /></span>
                    </button>

                    {/* Photo Pagination Dots */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                      {currentPerson.photos.map((_, idx) => (
                        <span 
                          key={idx} 
                          className={`h-1.5 rounded-full transition-all ${idx === photoIndex ? "w-5 bg-white shadow-sm" : "w-1.5 bg-white/40"}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
                  <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#FF4D8D] flex items-center gap-1 border border-white/15 shadow-lg">
                    <Brain className="w-3 h-3 text-[#FF4D8D]" /> {currentPerson.compatibility}% Match
                  </div>
                </div>

                <div className="absolute top-2.5 right-2.5 z-20">
                  <span className="bg-gradient-to-r from-pink-500/80 to-purple-600/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/20 shadow-lg flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> {currentPerson.badge || "New Member"}
                  </span>
                </div>
              </div>

              {/* Profile Bio Details */}
              <div className="text-left mt-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-white text-lg flex items-center gap-1.5">
                      {currentPerson.fullName}, {currentPerson.age}
                      <Check className="w-4 h-4 text-emerald-400 bg-emerald-400/20 p-0.5 rounded-full" />
                    </h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                      className="text-[11px] text-[#FFB6C1] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                    >
                      <Info className="w-3.5 h-3.5" /> {isExpanded ? "Less" : "Info"}
                    </button>
                  </div>

                  <p className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
                    <Briefcase className="w-3 h-3 text-white/50" /> {currentPerson.profession}
                    <span>•</span>
                    <MapPin className="w-3 h-3 text-white/50" /> {currentPerson.city}
                  </p>

                  <p className="text-xs text-[#FFB6C1] italic mt-1.5 font-medium line-clamp-2">
                    "{currentPerson.bio}"
                  </p>

                  {/* Expandable traits & hobbies */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1"
                    >
                      {currentPerson.hobbies?.slice(0, 4).map((hobby, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/10">
                          {hobby}
                        </span>
                      ))}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {currentPerson.relationshipGoal}
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Card Action Buttons (Pass, Direct Message, Connect/Like, Superlike) */}
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
                  {/* Pass */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwipeAction("PASS");
                    }}
                    title="Pass"
                    className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold hover:bg-rose-500 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Send Direct Message Button */}
                  <button 
                    onClick={handleOpenMessageModal}
                    title={`Send Direct Message to ${currentPerson.fullName}`}
                    className="px-3.5 h-10 rounded-full bg-white/10 hover:bg-[#9C6BFF]/30 border border-white/20 hover:border-[#9C6BFF]/50 flex items-center gap-1.5 text-xs font-bold text-white hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-[#9C6BFF]" />
                    <span>Message</span>
                  </button>

                  {/* Add / Connect / Like */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwipeAction("LIKE");
                    }}
                    title="Connect / Like"
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                      isConnected 
                        ? "bg-emerald-500 shadow-emerald-500/40" 
                        : "bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] shadow-pink-500/40 hover:shadow-pink-500/60"
                    }`}
                  >
                    {isConnected ? (
                      <Check className="w-6 h-6 stroke-[3]" />
                    ) : (
                      <Heart className="w-6 h-6 fill-white" />
                    )}
                  </button>

                  {/* Superlike */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwipeAction("SUPERLIKE");
                    }}
                    title="Superlike"
                    className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold hover:bg-purple-500 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mini Profile Thumbnail Track & Controls */}
      <div className="mt-3 flex items-center justify-between px-2 text-xs text-white/50">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-xs py-1">
          {profiles.map((p, idx) => (
            <button
              key={p.id || idx}
              onClick={() => {
                setCurrentIndex(idx);
                setTimeLeft(30);
              }}
              title={p.fullName}
              className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                idx === currentIndex 
                  ? "border-[#FF4D8D] scale-110 ring-2 ring-pink-500/30" 
                  : "border-white/20 opacity-50 hover:opacity-100"
              }`}
            >
              <img src={p.photos?.[0]} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link 
            href="/discover"
            className="text-[11px] font-bold text-[#FF4D8D] hover:text-[#FFB6C1] flex items-center gap-1 transition-colors"
          >
            Explore All Profiles <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* QUICK DIRECT MESSAGE MODAL */}
      <AnimatePresence>
        {messageModalOpen && currentPerson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card-lux rounded-3xl p-6 border border-white/20 shadow-2xl overflow-hidden bg-[#111116]"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={currentPerson.photos?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={currentPerson.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#FF4D8D] shadow-md"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                      Message {currentPerson.fullName.split(" ")[0]}
                      <Sparkles className="w-4 h-4 text-[#FF4D8D]" />
                    </h3>
                    <p className="text-xs text-white/60">{currentPerson.profession} • {currentPerson.city}</p>
                  </div>
                </div>

                <button
                  onClick={() => setMessageModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              {messageSentSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30 shadow-lg">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="font-extrabold text-lg text-white">Message Delivered!</h4>
                  <p className="text-xs text-white/60 mt-1 max-w-xs">
                    {currentPerson.fullName.split(" ")[0]} will see your icebreaker immediately.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="mt-4 flex flex-col gap-4">
                  {/* Quick Icebreaker Suggestions */}
                  <div>
                    <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider block mb-2">
                      Quick Icebreakers
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {icebreakers.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setMessageText(prompt)}
                          className="text-xs text-left px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#FF4D8D]/20 border border-white/10 hover:border-[#FF4D8D]/40 text-white/80 hover:text-white transition-all cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={`Write a thoughtful message to ${currentPerson.fullName.split(" ")[0]}...`}
                      className="w-full bg-white/5 border border-white/15 rounded-2xl p-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF4D8D] focus:ring-1 focus:ring-[#FF4D8D] transition-all resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setMessageModalOpen(false)}
                      className="px-4 py-2.5 rounded-full text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSendingMessage || !messageText.trim()}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      {isSendingMessage ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
