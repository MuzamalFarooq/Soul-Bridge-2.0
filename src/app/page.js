"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Heart, Sparkles, Shield, Zap, MessageCircle, Video, UserCheck, 
  ArrowRight, Check, ChevronDown, Award, Globe, Brain, Star, TrendingUp, Users, Lock, Flame
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroCanvas3D from "@/components/ui/HeroCanvas3D";

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [annualBilling, setAnnualBilling] = useState(false);

  const faqData = [
    {
      q: "How does the AI matching algorithm calculate compatibility?",
      a: "Soul Bridge uses advanced Gemini AI to evaluate over 30 psychological markers, personal values, communication styles, and life goals to calculate exact compatibility match percentages."
    },
    {
      q: "Is my personal data and gallery photo privacy protected?",
      a: "Yes! All communications and call feeds are end-to-end encrypted. We support incognito mode, private photo locks, screenshot prevention, and verified identity badges."
    },
    {
      q: "What features are included in Gold & Platinum memberships?",
      a: "Premium tiers include unlimited swipes, 5+ daily superlikes, see who liked you instantly, incognito mode, read receipts, priority matching, and unlimited Gemini AI dating coaching."
    },
    {
      q: "Can I use Soul Bridge on mobile devices?",
      a: "Yes! Soul Bridge is built with responsive Progressive Web App standards, delivering a native app feel on iOS and Android with bottom touch bar navigation and haptic swipe gestures."
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#09090B] text-foreground">
      <Navbar />

      {/* HERO SECTION WITH 3D CANVAS */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto w-full text-center">
        <HeroCanvas3D />

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-lux text-xs font-bold text-[#FF4D8D] mb-8 border border-[#FF4D8D]/30 shadow-lg shadow-pink-500/10"
          >
            <Sparkles className="w-4 h-4 text-[#FF4D8D] animate-spin" />
            <span>Next-Gen Gemini AI Matchmaker</span>
          </motion.div>
          
          {/* Animated Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6"
          >
            Find the Bridge to Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] via-[#FFB6C1] to-[#9C6BFF] filter drop-shadow-[0_0_25px_rgba(255,77,141,0.4)]">
              Ultimate Soulmate
            </span>
          </motion.h1>
          
          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-white/75 max-w-2xl mb-10 leading-relaxed font-medium"
          >
            Skip surface small talk. Connect deeply through AI personality compatibility, interactive 3D profile matching, and live socket conversations.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white font-bold text-base shadow-xl shadow-pink-500/25 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Start Free Today <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full glass-card-lux hover:bg-white/10 font-bold text-base text-white border border-white/15 transition-all"
            >
              Explore Features
            </Link>
          </motion.div>

          {/* Mock Interactive Card Stack Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full max-w-3xl rounded-3xl glass-card-lux border border-white/20 p-2.5 sm:p-3 shadow-2xl relative"
          >
            <div className="rounded-2xl overflow-hidden bg-[#09090B] py-6 sm:aspect-video relative flex items-center justify-center bg-gradient-to-tr from-[#9C6BFF]/30 to-[#FF4D8D]/30 border border-white/10">
              <div className="w-full max-w-[300px] sm:max-w-[320px] min-h-[380px] sm:h-[410px] glass-card-lux rounded-3xl p-4 sm:p-5 flex flex-col justify-between border border-white/20 shadow-2xl relative">
                <div className="w-full h-44 sm:h-52 rounded-2xl bg-slate-800 relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop"
                    alt="Sample Profile"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#FF4D8D] flex items-center gap-1 border border-white/10">
                    <Brain className="w-3 h-3 text-[#FF4D8D]" /> 98% Match
                  </div>
                </div>

                <div className="text-left mt-3">
                  <h3 className="font-extrabold text-white text-lg sm:text-xl flex items-center gap-2">
                    Sophia, 26 <Check className="w-4 h-4 text-emerald-400 bg-emerald-400/20 p-0.5 rounded-full" />
                  </h3>
                  <p className="text-xs text-white/70">Architect • San Francisco</p>
                  <p className="text-xs text-[#FFB6C1] italic mt-1 font-medium">"Coffee enthusiast & gallery hopper."</p>
                </div>

                <div className="flex justify-around items-center mt-2">
                  <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold hover:scale-110 transition-transform">✕</button>
                  <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] flex items-center justify-center text-white shadow-lg shadow-pink-500/30 hover:scale-110 transition-transform"><Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-white" /></button>
                  <button className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold hover:scale-110 transition-transform">★</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="relative z-10 py-12 border-y border-white/10 bg-[#09090B]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#FFB6C1]">
              1.2M+
            </span>
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Active Connections</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#9C6BFF] to-[#FF4D8D]">
              98.4%
            </span>
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">AI Match Accuracy</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF]">
              450K+
            </span>
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Successful Couples</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFB6C1] to-[#9C6BFF]">
              4.9★
            </span>
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">User Rating</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">How Soul Bridge Connects You</h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm font-medium">
            Three simple steps to transition from surface swiping to meaningful, lasting relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card-lux rounded-3xl p-8 flex flex-col gap-5 border border-white/10 hover:border-[#FF4D8D]/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#FF4D8D]/20 text-[#FF4D8D] font-black text-2xl flex items-center justify-center border border-[#FF4D8D]/30 shadow-lg">
              01
            </div>
            <h3 className="text-xl font-extrabold text-white">Create AI Profile</h3>
            <p className="text-xs text-white/70 leading-relaxed font-medium">
              Complete our personality assessment. Use the integrated Gemini AI Bio Generator to craft an authentic summary of your traits and goals.
            </p>
          </div>

          <div className="glass-card-lux rounded-3xl p-8 flex flex-col gap-5 border border-white/10 hover:border-[#9C6BFF]/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#9C6BFF]/20 text-[#9C6BFF] font-black text-2xl flex items-center justify-center border border-[#9C6BFF]/30 shadow-lg">
              02
            </div>
            <h3 className="text-xl font-extrabold text-white">Smart Match Scoring</h3>
            <p className="text-xs text-white/70 leading-relaxed font-medium">
              Explore profiles calculated with deep compatibility percentages based on psychological values, hobbies, religion, and lifestyle choices.
            </p>
          </div>

          <div className="glass-card-lux rounded-3xl p-8 flex flex-col gap-5 border border-white/10 hover:border-[#FFB6C1]/40 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#FFB6C1]/20 text-[#FFB6C1] font-black text-2xl flex items-center justify-center border border-[#FFB6C1]/30 shadow-lg">
              03
            </div>
            <h3 className="text-xl font-extrabold text-white">Real-Time Interaction</h3>
            <p className="text-xs text-white/70 leading-relaxed font-medium">
              Engage through private socket messaging, live WebRTC video calls, reactions, read receipts, and Gemini conversation assistance.
            </p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4">World-Class Capabilities</h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm font-medium">
            Designed with Apple-level aesthetic polish, interactive 3D physics, and advanced security.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="glass-card-lux rounded-3xl p-6 flex items-start gap-4">
            <Brain className="w-10 h-10 text-[#FF4D8D] shrink-0" />
            <div>
              <h3 className="font-extrabold text-base mb-1 text-white">Gemini AI Coach</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Receive live advice on profile improvements and conversation icebreakers tailored to your match.
              </p>
            </div>
          </div>

          <div className="glass-card-lux rounded-3xl p-6 flex items-start gap-4">
            <Flame className="w-10 h-10 text-[#9C6BFF] shrink-0" />
            <div>
              <h3 className="font-extrabold text-base mb-1 text-white">Interactive Swipe Deck</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Touch gesture drag physics with card stack elevation, like/pass stamps, and undo memory.
              </p>
            </div>
          </div>

          <div className="glass-card-lux rounded-3xl p-6 flex items-start gap-4">
            <MessageCircle className="w-10 h-10 text-[#FFB6C1] shrink-0" />
            <div>
              <h3 className="font-extrabold text-base mb-1 text-white">Real-Time Messaging</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Socket.io real-time chat with typing bubbles, read indicators, emoji reactions, and media sharing.
              </p>
            </div>
          </div>

          <div className="glass-card-lux rounded-3xl p-6 flex items-start gap-4">
            <Video className="w-10 h-10 text-purple-400 shrink-0" />
            <div>
              <h3 className="font-extrabold text-base mb-1 text-white">WebRTC Audio/Video Calls</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Initiate end-to-end encrypted video or audio calls directly inside the browser.
              </p>
            </div>
          </div>

          <div className="glass-card-lux rounded-3xl p-6 flex items-start gap-4">
            <Shield className="w-10 h-10 text-indigo-400 shrink-0" />
            <div>
              <h3 className="font-extrabold text-base mb-1 text-white">Incognito & Safety</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Browse privately, secure private photos in your gallery, and trigger instant safety checks.
              </p>
            </div>
          </div>

          <div className="glass-card-lux rounded-3xl p-6 flex items-start gap-4">
            <UserCheck className="w-10 h-10 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-extrabold text-base mb-1 text-white">Profile Verification</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Verified identity badges to build trust and guarantee authentic member interactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LUXURY PRICING SECTION */}
      <section id="pricing" className="relative z-10 py-24 px-6 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Luxury Premium Plans</h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm font-medium">
            Unlock VIP capabilities and multiply your match success rate.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-xs font-bold ${!annualBilling ? "text-[#FF4D8D]" : "text-white/50"}`}>Monthly</span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-14 h-7 rounded-full bg-white/10 border border-white/20 p-1 flex items-center transition-colors cursor-pointer"
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] transition-transform ${annualBilling ? "translate-x-7" : "translate-x-0"}`} />
            </button>
            <span className={`text-xs font-bold ${annualBilling ? "text-[#FF4D8D]" : "text-white/50"}`}>
              Annual <span className="text-[10px] bg-[#FF4D8D]/20 text-[#FF4D8D] px-2 py-0.5 rounded-full ml-1">Save 25%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* FREE */}
          <div className="glass-card-lux rounded-3xl p-8 flex flex-col justify-between border border-white/10">
            <div>
              <h3 className="text-xl font-extrabold text-white mb-1">Free</h3>
              <p className="text-xs text-white/50 mb-6 font-medium">Standard Exploration</p>
              <div className="text-4xl font-black text-white mb-6">$0 <span className="text-xs text-white/40 font-normal">/ month</span></div>
              <ul className="flex flex-col gap-3.5 text-xs text-white/80 mb-8 font-medium">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 30 Swipes per day</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Standard chat with matches</li>
                <li className="flex items-center gap-2 text-white/30">✕ Advanced search filters</li>
                <li className="flex items-center gap-2 text-white/30">✕ See who viewed your profile</li>
                <li className="flex items-center gap-2 text-white/30">✕ Gemini AI dating coach</li>
              </ul>
            </div>
            <Link href="/register" className="w-full text-center py-3 rounded-full border border-white/20 text-xs font-bold text-white hover:bg-white/10 transition-all">
              Get Started Free
            </Link>
          </div>

          {/* GOLD */}
          <div className="glass-card-lux rounded-3xl p-8 flex flex-col justify-between border border-[#FF4D8D]/50 relative shadow-2xl shadow-pink-500/10">
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" /> Most Popular
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#FF4D8D] mb-1">Gold</h3>
              <p className="text-xs text-white/50 mb-6 font-medium">Enhanced Discovery</p>
              <div className="text-4xl font-black text-white mb-6">
                {annualBilling ? "$11.99" : "$14.99"} <span className="text-xs text-white/40 font-normal">/ month</span>
              </div>
              <ul className="flex flex-col gap-3.5 text-xs text-white/80 mb-8 font-medium">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Swipes & Likes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 5 Super Likes daily</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> See who viewed your profile</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Advanced age & location filters</li>
                <li className="flex items-center gap-2 text-white/30">✕ Incognito invisible mode</li>
              </ul>
            </div>
            <Link href="/register" className="w-full text-center py-3.5 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:scale-105 transition-all">
              Upgrade to Gold
            </Link>
          </div>

          {/* PLATINUM */}
          <div className="glass-card-lux rounded-3xl p-8 flex flex-col justify-between border border-[#9C6BFF]/50">
            <div>
              <h3 className="text-xl font-extrabold text-[#9C6BFF] mb-1">Platinum</h3>
              <p className="text-xs text-white/50 mb-6 font-medium">VIP Matchmaking</p>
              <div className="text-4xl font-black text-white mb-6">
                {annualBilling ? "$22.99" : "$29.99"} <span className="text-xs text-white/40 font-normal">/ month</span>
              </div>
              <ul className="flex flex-col gap-3.5 text-xs text-white/80 mb-8 font-medium">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Everything in Gold</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Incognito & invisible mode</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Gemini AI analysis</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Read receipts in chat</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority discovery deck placement</li>
              </ul>
            </div>
            <Link href="/register" className="w-full text-center py-3 rounded-full border border-[#9C6BFF] text-xs font-bold text-white hover:bg-[#9C6BFF]/20 transition-all">
              Go Platinum
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="relative z-10 py-20 px-6 max-w-4xl mx-auto w-full border-t border-white/10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Frequently Asked Questions</h2>
          <p className="text-white/60 text-xs font-medium">Everything you need to know about Soul Bridge.</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqData.map((faq, index) => (
            <div key={index} className="glass-card-lux rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm text-left text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#FF4D8D] transition-transform duration-300 ${activeFaq === index ? "rotate-180" : ""}`} />
              </button>
              
              {activeFaq === index && (
                <div className="px-6 pb-6 pt-1 text-xs text-white/70 leading-relaxed border-t border-white/10 font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
