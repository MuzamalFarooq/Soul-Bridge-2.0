"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Heart, MessageSquare, ArrowRight } from "lucide-react";

export default function CelebrationModal({ matchData, onClose, onChat }) {
  // Fire confetti upon mounting
  useEffect(() => {
    // Left-side blast
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.2, y: 0.6 }
    });
    // Right-side blast
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.8, y: 0.6 }
    });
    
    // Heart explosion emulation
    const interval = setInterval(() => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ff4d80", "#ff85a1"]
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#8b5cf6", "#a78bfa"]
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      {/* Background radial glow */}
      <div className="absolute w-[400px] h-[400px] bg-gradient-premium rounded-full filter blur-[100px] opacity-25 animate-pulse-slow"></div>

      <div className="w-full max-w-md p-8 relative flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        
        {/* Heart Burst Frame */}
        <div className="relative mb-6">
          <Heart className="w-20 h-20 text-primary-pink fill-primary-pink animate-bounce" />
          <Heart className="w-20 h-20 text-primary-purple fill-primary-purple absolute inset-0 opacity-40 blur-md scale-125 animate-ping" />
        </div>

        <h2 className="text-4xl font-black tracking-tight text-white mb-2 uppercase">
          It's a Match!
        </h2>
        <p className="text-sm text-white/70 max-w-xs mb-8">
          You and <span className="text-primary-pink font-bold">{matchData.fullName}</span> liked each other.
        </p>

        {/* Intersection Profiles */}
        <div className="flex justify-center items-center gap-6 mb-10 relative">
          {/* User profile placeholder */}
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-2xl relative rotate-[-6deg] hover:rotate-0 transition-transform duration-300">
            <div className="w-full h-full bg-gradient-premium flex items-center justify-center text-white text-3xl font-bold">
              You
            </div>
          </div>
          
          <Heart className="w-10 h-10 text-primary-pink fill-primary-pink animate-pulse absolute z-10" />

          {/* Match profile avatar */}
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-2xl relative rotate-[6deg] hover:rotate-0 transition-transform duration-300">
            <img src={matchData.photo} alt={matchData.fullName} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Interaction Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onChat}
            className="w-full py-3.5 rounded-full bg-gradient-premium text-white font-bold text-sm shadow-xl shadow-pink-500/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 fill-white" /> Send First Message
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-full border border-white/20 hover:bg-white/5 text-white font-bold text-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            Keep Swiping <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
