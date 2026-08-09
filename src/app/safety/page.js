"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Lock, AlertTriangle, UserCheck, Eye, CheckCircle2, 
  PhoneCall, Flag, HeartHandshake, Zap, Sparkles, HelpCircle, 
  ShieldCheck, FileText, ChevronRight, X, AlertCircle, LifeBuoy, MapPin
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SafetyCenterPage() {
  const [activeTab, setActiveTab] = useState("online");
  const [checklist, setChecklist] = useState({
    videoCall: false,
    publicPlace: false,
    shareLocation: false,
    ownTransport: false,
    chargePhone: false,
    trustGut: false
  });

  const toggleCheck = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCheckCount = Object.values(checklist).filter(Boolean).length;
  const isDateReady = completedCheckCount >= 5;

  const safetyPillars = [
    {
      icon: ShieldCheck,
      title: "AI Biometric Verification",
      desc: "Profiles with blue checkmarks undergo liveness facial scanning to guarantee you interact with real humans.",
      color: "text-[#FF4D8D]"
    },
    {
      icon: Lock,
      title: "Anti-Scam AI Sentinel",
      desc: "Our real-time AI monitors message patterns to detect financial requests, suspicious link sharing, or phishing.",
      color: "text-[#9C6BFF]"
    },
    {
      icon: Eye,
      title: "Stealth & Incognito Control",
      desc: "Browse invisibly, control gallery permissions, and restrict who can see your location or profile card.",
      color: "text-emerald-400"
    },
    {
      icon: LifeBuoy,
      title: "24/7 Moderation & Report",
      desc: "Dedicated safety squad reviews reported profiles within 15 minutes with zero tolerance for harassment.",
      color: "text-amber-400"
    }
  ];

  const redFlags = [
    {
      title: "Financial Requests & Wire Transfers",
      desc: "Never transfer money, crypto, or gift cards to someone you met online, regardless of their story or emergency."
    },
    {
      title: "Rushing Off Platform Quickly",
      desc: "Be cautious if a match pressures you to communicate exclusively on encrypted third-party apps immediately."
    },
    {
      title: "Inconsistent Photos or Vague Answers",
      desc: "Look for verified badges. If a match refuses video calls or direct photo verification, proceed with extreme caution."
    },
    {
      title: "Overly Flattering or Emotional Pressure",
      desc: "Be wary of 'love bombing' — excessive declarations of affection within hours or days of matching."
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#09090B] text-foreground">
      <Navbar />

      {/* Emergency Hotline Alert Ribbon */}
      <div className="bg-gradient-to-r from-rose-900/80 via-[#09090B] to-purple-900/80 border-b border-rose-500/20 pt-28 pb-4 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-white/90">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>In immediate danger or emergency? Contact your local emergency services (e.g. 911 / 112) immediately.</span>
          <span className="hidden sm:inline text-white/40">•</span>
          <a href="tel:911" className="font-bold text-rose-400 underline hover:text-rose-300">
            Emergency Helpline Direct Call
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-lux border border-emerald-500/30 mb-8"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">
            Soul Bridge Safety Center
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6 max-w-4xl mx-auto"
        >
          Your Safety & Peace of Mind{" "}
          <span className="text-gradient-lux">Are Our Highest Priority</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-10 font-medium"
        >
          Whether chatting in our encrypted rooms or meeting your match in real life, we equip you with smart AI safeguards and essential dating guidelines.
        </motion.p>
      </section>

      {/* Safety Pillars Grid */}
      <section className="py-8 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {safetyPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card-lux rounded-2xl p-6 border border-white/10 hover:border-emerald-500/40"
              >
                <div className="p-3 rounded-xl bg-white/5 inline-flex mb-4">
                  <Icon className={`w-6 h-6 ${pillar.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed font-medium">{pillar.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Interactive Pre-Date Safety Checklist */}
      <section className="py-16 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <div className="glass-card-lux rounded-3xl p-8 md:p-12 border border-white/15 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-bold text-[#FF4D8D] uppercase tracking-widest block mb-1">
                Interactive Tool
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Pre-First-Date Safety Checklist
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Going to meet your match in person? Complete these 6 vital safety checks first.
              </p>
            </div>

            <div className="glass-panel-lux px-5 py-3 rounded-2xl border border-white/10 text-center shrink-0">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF]">
                {completedCheckCount} / 6
              </span>
              <p className="text-[10px] font-bold uppercase text-white/50">Checked Steps</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => toggleCheck("videoCall")}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer flex items-center justify-between ${
                checklist.videoCall
                  ? "bg-emerald-500/10 border-emerald-500 text-white"
                  : "glass-panel-lux border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${checklist.videoCall ? "text-emerald-400" : "text-white/20"}`} />
                <span className="text-xs font-bold">1. Conducted Video Call on Soul Bridge</span>
              </div>
            </button>

            <button
              onClick={() => toggleCheck("publicPlace")}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer flex items-center justify-between ${
                checklist.publicPlace
                  ? "bg-emerald-500/10 border-emerald-500 text-white"
                  : "glass-panel-lux border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${checklist.publicPlace ? "text-emerald-400" : "text-white/20"}`} />
                <span className="text-xs font-bold">2. Meeting in Busy Public Cafe or Venue</span>
              </div>
            </button>

            <button
              onClick={() => toggleCheck("shareLocation")}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer flex items-center justify-between ${
                checklist.shareLocation
                  ? "bg-emerald-500/10 border-emerald-500 text-white"
                  : "glass-panel-lux border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${checklist.shareLocation ? "text-emerald-400" : "text-white/20"}`} />
                <span className="text-xs font-bold">3. Shared Live Location with Friend/Family</span>
              </div>
            </button>

            <button
              onClick={() => toggleCheck("ownTransport")}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer flex items-center justify-between ${
                checklist.ownTransport
                  ? "bg-emerald-500/10 border-emerald-500 text-white"
                  : "glass-panel-lux border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${checklist.ownTransport ? "text-emerald-400" : "text-white/20"}`} />
                <span className="text-xs font-bold">4. Arranged Independent Ride (Rideshare/Car)</span>
              </div>
            </button>

            <button
              onClick={() => toggleCheck("chargePhone")}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer flex items-center justify-between ${
                checklist.chargePhone
                  ? "bg-emerald-500/10 border-emerald-500 text-white"
                  : "glass-panel-lux border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${checklist.chargePhone ? "text-emerald-400" : "text-white/20"}`} />
                <span className="text-xs font-bold">5. Smartphone Battery Fully Charged</span>
              </div>
            </button>

            <button
              onClick={() => toggleCheck("trustGut")}
              className={`p-4 rounded-xl text-left transition-all border cursor-pointer flex items-center justify-between ${
                checklist.trustGut
                  ? "bg-emerald-500/10 border-emerald-500 text-white"
                  : "glass-panel-lux border-white/10 text-white/70 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-5 h-5 ${checklist.trustGut ? "text-emerald-400" : "text-white/20"}`} />
                <span className="text-xs font-bold">6. Prepared to Leave if Anything Feels Off</span>
              </div>
            </button>
          </div>

          {isDateReady ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-center text-xs font-bold text-emerald-300 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Great job! You have satisfied key safety protocols for a great first date.</span>
            </div>
          ) : (
            <p className="text-center text-xs text-white/40 italic">
              Tap the checklist items above to prepare safely before heading out.
            </p>
          )}
        </div>
      </section>

      {/* Red Flags & Online Scams Section */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">
            Red Flags & <span className="text-gradient-lux">Scam Prevention</span>
          </h2>
          <p className="text-xs md:text-sm text-white/60 max-w-2xl mx-auto">
            Stay vigilant against common scam techniques. Recognizing these red flags will protect your heart and your wallet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {redFlags.map((flag, idx) => (
            <div
              key={idx}
              className="glass-card-lux rounded-2xl p-6 border border-white/10 hover:border-rose-500/40"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <Flag className="w-4 h-4" />
                </div>
                <h4 className="text-base font-bold text-white">{flag.title}</h4>
              </div>
              <p className="text-xs text-white/60 leading-relaxed font-medium pl-9">
                {flag.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Reporting Portal Info */}
      <section className="py-16 px-6 md:px-12 max-w-5xl mx-auto w-full mb-12">
        <div className="glass-card-lux rounded-3xl p-8 md:p-12 border border-white/15 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <Flag className="w-10 h-10 text-[#FF4D8D] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Need to Report a User or Concern?
            </h2>
            <p className="text-xs md:text-sm text-white/70 mb-6 leading-relaxed">
              You can instantly block and report any profile directly inside their chat thread or profile card. Our Trust & Safety team acts on reports 24 hours a day, 7 days a week.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/chat"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Go to Active Chats to Report
              </Link>
              <Link
                href="/privacy"
                className="px-6 py-3 rounded-xl glass-panel-lux border border-white/20 text-white font-bold text-xs hover:bg-white/10 transition-all"
              >
                Read Privacy Standards
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
