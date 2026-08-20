"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { Heart, X, Star, RotateCcw, MapPin, Briefcase, Eye, ChevronDown, Award } from "lucide-react";

export default function TinderCard({ candidate, onSwipe, onUndo, canUndo }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map drag x-position to rotation and stamp opacities
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacityLike = useTransform(x, [0, 120], [0, 1]);
  const opacityPass = useTransform(x, [-120, 0], [1, 0]);

  // Reset photos when candidate changes
  useEffect(() => {
    setPhotoIndex(0);
    setExpanded(false);
    controls.set({ x: 0, y: 0, rotate: 0 });
  }, [candidate, controls]);

  const handleDragEnd = async (event, info) => {
    const threshold = 150;
    const swipeX = info.offset.x;

    if (swipeX > threshold) {
      // Swipe Right (Like)
      await controls.start({ x: 500, rotate: 45, opacity: 0, transition: { duration: 0.2 } });
      onSwipe("LIKE");
    } else if (swipeX < -threshold) {
      // Swipe Left (Pass)
      await controls.start({ x: -500, rotate: -45, opacity: 0, transition: { duration: 0.2 } });
      onSwipe("PASS");
    } else {
      // Snap back to center
      controls.start({ x: 0, y: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const triggerSwipe = async (dir) => {
    if (dir === "LIKE") {
      await controls.start({ x: 500, rotate: 45, opacity: 0, transition: { duration: 0.25 } });
      onSwipe("LIKE");
    } else if (dir === "PASS") {
      await controls.start({ x: -500, rotate: -45, opacity: 0, transition: { duration: 0.25 } });
      onSwipe("PASS");
    } else if (dir === "SUPERLIKE") {
      await controls.start({ y: -600, opacity: 0, transition: { duration: 0.25 } });
      onSwipe("SUPERLIKE");
    }
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (candidate.photos && candidate.photos.length > 0) {
      setPhotoIndex((prev) => (prev + 1) % candidate.photos.length);
    }
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    if (candidate.photos && candidate.photos.length > 0) {
      setPhotoIndex((prev) => (prev - 1 + candidate.photos.length) % candidate.photos.length);
    }
  };

  return (
    <div className="relative w-full max-w-[330px] sm:max-w-[360px] h-[490px] sm:h-[520px] select-none mx-auto flex flex-col justify-between">
      {/* Cards Deck */}
      <motion.div
        drag={!expanded}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={1}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, y, rotate }}
        onClick={() => setExpanded(!expanded)}
        className="w-full h-[410px] sm:h-[440px] rounded-3xl overflow-hidden glass-card border border-white/10 relative shadow-2xl cursor-pointer"
      >
        {/* Current Gallery Image */}
        <div className="absolute inset-0 bg-slate-900">
          <img
            src={candidate.photos[photoIndex] || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400"}
            alt={candidate.fullName}
            className="w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
          />
          {/* Black shadow overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-black/35 pointer-events-none"></div>
        </div>

        {/* Swipe stamps */}
        <motion.div
          style={{ opacity: opacityLike }}
          className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 text-2xl font-black uppercase tracking-widest px-4 py-1.5 rounded-lg rotate-[-12deg] pointer-events-none"
        >
          LIKE
        </motion.div>
        
        <motion.div
          style={{ opacity: opacityPass }}
          className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 text-2xl font-black uppercase tracking-widest px-4 py-1.5 rounded-lg rotate-[12deg] pointer-events-none"
        >
          NOPE
        </motion.div>

        {/* Gallery tap regions */}
        {candidate.photos.length > 1 && !expanded && (
          <div className="absolute top-2 left-0 right-0 h-1 px-4 flex gap-1">
            {candidate.photos.map((_, idx) => (
              <div
                key={idx}
                className={`h-full flex-1 rounded-full transition-colors ${idx === photoIndex ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}

        {/* Image Tapper Indicators */}
        {!expanded && candidate.photos.length > 1 && (
          <div className="absolute top-0 bottom-20 left-0 right-0 flex">
            <div onClick={prevPhoto} className="w-1/2 h-full cursor-left-arrow"></div>
            <div onClick={nextPhoto} className="w-1/2 h-full cursor-right-arrow"></div>
          </div>
        )}

        {/* Profile details overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-1.5 text-white pointer-events-none">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold flex items-center gap-1.5">
              {candidate.fullName}, {candidate.age}
            </h3>
            <span className="bg-gradient-premium px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider flex items-center gap-1 shadow-md">
              <Award className="w-3.5 h-3.5 fill-white" /> {candidate.compatibility}% MATCH
            </span>
          </div>

          <div className="flex items-center gap-4 text-white/80 text-xs">
            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {candidate.profession}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {candidate.city}</span>
          </div>

          <p className="text-xs text-white/90 line-clamp-2 italic mt-1 leading-normal">
            "{candidate.bio}"
          </p>

          <div className="flex justify-center mt-2 animate-bounce">
            <ChevronDown className="w-5 h-5 text-white/50" />
          </div>
        </div>

        {/* Expanded Profile Info Panel */}
        {expanded && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-md p-6 overflow-y-auto text-left z-20 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-xl font-bold">{candidate.fullName}, {candidate.age}</h3>
              <span className="text-xs font-bold text-primary-pink uppercase">{candidate.relationshipGoal}</span>
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-foreground/80 leading-relaxed">
              <h4 className="font-bold text-foreground">About Me</h4>
              <p className="italic bg-white/5 p-3 rounded-xl border border-white/5">"{candidate.bio}"</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-foreground/45 uppercase font-semibold">Location</span>
                <p className="font-semibold mt-0.5">{candidate.city}, {candidate.country}</p>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] text-foreground/45 uppercase font-semibold">Profession</span>
                <p className="font-semibold mt-0.5">{candidate.profession}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <h4 className="font-bold text-foreground">Interests & Hobbies</h4>
              <div className="flex flex-wrap gap-1.5">
                {candidate.hobbies.map((h, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-primary-pink/15 text-primary-pink text-[10px] font-bold">
                    {h}
                  </span>
                ))}
              </div>
            </div>
            
            <p className="text-[9px] text-center text-foreground/40 mt-4">Tap anywhere to collapse view</p>
          </div>
        )}
      </motion.div>

      {/* Swipe action triggers */}
      <div className="flex justify-around items-center px-2 sm:px-4 gap-2">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/10 glass-panel flex items-center justify-center transition-all cursor-pointer ${
            canUndo ? "hover:scale-105 active:scale-95 text-yellow-500 hover:bg-yellow-500/10" : "opacity-35 cursor-not-allowed"
          }`}
          title="Undo Swipe"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Pass (Left) */}
        <button
          onClick={() => triggerSwipe("PASS")}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
          title="Pass"
        >
          <X className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Superlike */}
        <button
          onClick={() => triggerSwipe("SUPERLIKE")}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
          title="Super Like"
        >
          <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
        </button>

        {/* Like (Right) */}
        <button
          onClick={() => triggerSwipe("LIKE")}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
          title="Like"
        >
          <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
        </button>
      </div>
    </div>
  );
}
