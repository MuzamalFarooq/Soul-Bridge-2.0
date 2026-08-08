"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, Send, Award, MapPin, Briefcase, 
  ChevronLeft, ChevronRight, CheckCircle2, Sparkles, User, Smile
} from "lucide-react";
import { togglePostLikeAction, addPostCommentAction } from "@/actions/feed";

export default function UserFeedPost({ candidate, onOpenMessage }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(candidate.isLiked || false);
  const [likesCount, setLikesCount] = useState(candidate.likesCount || 142);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsList, setCommentsList] = useState(candidate.comments || []);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Photo slider navigation
  const nextPhoto = (e) => {
    e?.stopPropagation();
    if (candidate.photos && candidate.photos.length > 1) {
      setPhotoIndex((prev) => (prev + 1) % candidate.photos.length);
    }
  };

  const prevPhoto = (e) => {
    e?.stopPropagation();
    if (candidate.photos && candidate.photos.length > 1) {
      setPhotoIndex((prev) => (prev - 1 + candidate.photos.length) % candidate.photos.length);
    }
  };

  // Toggle Like button click
  const handleToggleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (nextState) {
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 900);
    }

    try {
      await togglePostLikeAction({ targetUserId: candidate.id });
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  // Double tap on image to like
  const handleDoubleTap = () => {
    if (!isLiked) {
      handleToggleLike();
    } else {
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 900);
    }
  };

  // Submit new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmittingComment) return;

    const textToSubmit = newCommentText.trim();
    setNewCommentText("");
    setIsSubmittingComment(true);

    try {
      const res = await addPostCommentAction({
        targetUserId: candidate.id,
        commentText: textToSubmit
      });

      if (res.success && res.comment) {
        setCommentsList((prev) => [res.comment, ...prev]);
      }
    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-8 transition-all hover:border-white/20">
      {/* 1. POST HEADER */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={candidate.photos[0] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120"}
              alt={candidate.fullName}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary-pink/60 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-base text-foreground flex items-center gap-1">
                {candidate.fullName}, {candidate.age}
              </h3>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3 text-primary-pink" /> {candidate.profession}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-pink" /> {candidate.city}</span>
            </div>
          </div>
        </div>

        {/* Compatibility Match Badge */}
        <div className="flex flex-col items-end gap-1">
          <span className="bg-gradient-premium px-3 py-1 rounded-full text-[11px] font-black tracking-wide text-white flex items-center gap-1 shadow-lg">
            <Award className="w-3.5 h-3.5 fill-white" /> {candidate.compatibility}% MATCH
          </span>
          <span className="text-[10px] text-foreground/50">{candidate.postedAt || "Recently active"}</span>
        </div>
      </div>

      {/* 2. MEDIA / IMAGE SECTION */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-slate-950 overflow-hidden group select-none">
        <img
          src={candidate.photos[photoIndex] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600"}
          alt={`${candidate.fullName}'s photo`}
          onDoubleClick={handleDoubleTap}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-[1.01]"
        />

        {/* Floating Heart animation overlay on double tap or like */}
        <AnimatePresence>
          {showHeartOverlay && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradient shadow at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Image carousel arrows */}
        {candidate.photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
              {candidate.photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(idx); }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === photoIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 3. ACTION BUTTONS BAR (LIKE, COMMENT, MESSAGE) BELOW IMAGE */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/5 bg-white/2a">
        <div className="flex items-center gap-5">
          {/* LIKE BUTTON */}
          <button
            onClick={handleToggleLike}
            className="flex items-center gap-2 group cursor-pointer transition-all active:scale-95"
            title="Like Post"
          >
            <div className={`p-2 rounded-full transition-colors ${isLiked ? "bg-rose-500/15 text-rose-500" : "bg-white/5 text-foreground/70 group-hover:text-rose-500 group-hover:bg-rose-500/10"}`}>
              <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
            </div>
            <span className={`text-xs font-bold ${isLiked ? "text-rose-500" : "text-foreground/80"}`}>
              {likesCount} <span className="font-medium text-foreground/50 hidden sm:inline">Likes</span>
            </span>
          </button>

          {/* COMMENT BUTTON */}
          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="flex items-center gap-2 group cursor-pointer transition-all active:scale-95"
            title="View Comments"
          >
            <div className={`p-2 rounded-full transition-colors ${commentsOpen ? "bg-sky-500/15 text-sky-400" : "bg-white/5 text-foreground/70 group-hover:text-sky-400 group-hover:bg-sky-500/10"}`}>
              <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-xs font-bold text-foreground/80">
              {commentsList.length} <span className="font-medium text-foreground/50 hidden sm:inline">Comments</span>
            </span>
          </button>
        </div>

        {/* MESSAGE BUTTON */}
        <button
          onClick={() => onOpenMessage(candidate)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-premium hover:opacity-95 text-white text-xs font-extrabold shadow-lg hover:shadow-pink-500/25 transition-all active:scale-95 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          Message
        </button>
      </div>

      {/* 4. POST CAPTION / BIO & INTEREST TAGS */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Relationship Goal Pill */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-0.5 rounded-full bg-primary-pink/15 text-primary-pink text-[11px] font-extrabold uppercase tracking-wider">
            Goal: {candidate.relationshipGoal || "Long-term"}
          </span>
          <span className="text-xs text-foreground/40">• {candidate.country}</span>
        </div>

        {/* User Bio Quote */}
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal italic bg-white/5 p-3.5 rounded-2xl border border-white/5">
          &quot;{candidate.bio}&quot;
        </p>

        {/* Hobbies / Interest Tags */}
        {candidate.hobbies && candidate.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {candidate.hobbies.map((hobby, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg glass-input text-foreground/70 font-medium">
                #{hobby.replace(/\s+/g, '')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 5. INTERACTIVE COMMENT DRAWER */}
      <AnimatePresence>
        {commentsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-white/2 p-4 sm:p-5 overflow-hidden"
          >
            <h4 className="text-xs font-bold text-foreground/70 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-primary-pink" /> Comments ({commentsList.length})
            </h4>

            {/* Write New Comment Input Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={`Comment as Soul Bridge member...`}
                className="flex-1 px-4 py-2 rounded-xl glass-input text-xs text-foreground focus:outline-none focus:border-primary-pink"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim() || isSubmittingComment}
                className="px-4 py-2 rounded-xl bg-gradient-premium text-white text-xs font-bold disabled:opacity-40 hover:opacity-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                Post
              </button>
            </form>

            {/* Comments List */}
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {commentsList.length === 0 ? (
                <p className="text-xs text-foreground/40 italic py-2 text-center">No comments yet. Be the first to leave a friendly note!</p>
              ) : (
                commentsList.map((cmt) => (
                  <div key={cmt.id} className="flex gap-2.5 items-start bg-white/5 p-3 rounded-2xl border border-white/5 text-xs">
                    <img
                      src={cmt.userPhoto}
                      alt={cmt.userName}
                      className="w-7 h-7 rounded-full object-cover border border-white/20 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-extrabold text-foreground">{cmt.userName}</span>
                        <span className="text-[10px] text-foreground/40">{cmt.createdAt}</span>
                      </div>
                      <p className="text-foreground/80 leading-normal">{cmt.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
