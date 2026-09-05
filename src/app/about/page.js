"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Sparkles, Shield, Brain, Globe, Users, Award, 
  ArrowRight, CheckCircle2, Lock, Flame, Eye, Compass, 
  Zap, Star, HeartHandshake, ChevronRight, MessageSquare
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const [activePillar, setActivePillar] = useState(0);

  const stats = [
    { label: "Soulmates Matched", value: "50,000+", icon: Heart, color: "text-[#FF4D8D]" },
    { label: "AI Compatibility Accuracy", value: "98.4%", icon: Brain, color: "text-[#9C6BFF]" },
    { label: "Active Global Cities", value: "120+", icon: Globe, color: "text-pink-400" },
    { label: "Community Rating", value: "4.9 / 5.0", icon: Star, color: "text-amber-400" },
  ];

  const pillars = [
    {
      title: "Groq AI Compatibility Engine",
      subtitle: "Beyond surface-level swipes",
      description: "Our neural matching model analyzes over 35 psychological dimensions, core values, communication dynamics, and long-term vision to compute meaningful alignment scores.",
      icon: Brain,
      gradient: "from-[#FF4D8D] to-[#9C6BFF]",
      features: [
        "Dynamic value alignment scoring",
        "Real-time conversation harmony analysis",
        "Deep emotional & lifestyle matching",
        "Continuous self-learning recommendation updates"
      ]
    },
    {
      title: "Privacy-First Stealth Architecture",
      subtitle: "Your personal life belongs strictly to you",
      description: "We employ zero-knowledge design patterns, end-to-end encrypted messaging, private photo vault unlocks, and incognito browsing modes to ensure absolute discretion.",
      icon: Lock,
      gradient: "from-[#9C6BFF] to-indigo-500",
      features: [
        "End-to-end encrypted chat & call logs",
        "Private picture locks & timed access",
        "Incognito & stealth discovery controls",
        "Biometric AI identity verification"
      ]
    },
    {
      title: "3D Immersive Social Spaces",
      subtitle: "Bringing digital connections into vivid life",
      description: "Experience date nights before meeting in person. Our interactive 3D virtual lounges allow couples to listen to music together, play icebreaker games, and bond naturally.",
      icon: Compass,
      gradient: "from-pink-500 to-rose-500",
      features: [
        "Interactive 3D avatar lounges",
        "Shared virtual music & movie sync",
        "Guided deep conversation prompt games",
        "Low-latency real-time video audio rooms"
      ]
    },
    {
      title: "Authentic & Verified Community",
      subtitle: "Zero tolerance for bots or catfish",
      description: "Every member undergoes AI liveness selfie verification and ongoing trust monitoring, fostering a high-intent community dedicated to genuine relationships.",
      icon: Shield,
      gradient: "from-amber-400 to-[#FF4D8D]",
      features: [
        "100% Verified blue checkmark profiles",
        "AI Sentinel anti-scam message monitoring",
        "Active human moderation squad 24/7",
        "Zero commercial ad tracking or spam"
      ]
    }
  ];

  const teamMembers = [
    {
      name: "Sophia Vance",
      role: "Founder & Chief Executive Officer",
      bio: "Former AI researcher with a vision to heal modern digital loneliness through empathetic machine intelligence.",
      badge: "Visionary",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Dr. Marcus Chen",
      role: "Head of AI & Relationship Psychology",
      bio: "PhD in Cognitive Science. Pioneer in multi-dimensional compatibility modeling and computational emotional alignment.",
      badge: "AI Lead",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Elena Rostova",
      role: "VP of Product Experience & 3D Tech",
      bio: "Ex-3D graphics lead creating breathtaking virtual environments that bring digital dating closer to real life.",
      badge: "Design & 3D",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400"
    },
    {
      name: "Darius Thorne",
      role: "Chief Information Security Officer",
      bio: "Cybersecurity veteran dedicated to implementing banking-grade encryption and anti-catfish biometric protocols.",
      badge: "Trust & Safety",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
    }
  ];

  const milestones = [
    { year: "2023", title: "The Soul Bridge Spark", desc: "Soul Bridge was founded with a mission to replace addictive swipe mechanics with deep AI matchmaking." },
    { year: "2024", title: "Groq AI Engine Launch", desc: "Introduced multi-modal personality vectors, achieving a 98.4% compatibility satisfaction rate among early adopters." },
    { year: "2025", title: "3D Virtual Lounge Rollout", desc: "Launched interactive 3D spatial date environments and real-time audio/video encrypted rooms." },
    { year: "2026", title: "Global Expansion", desc: "Over 50,000 matches facilitated across 120+ countries with industry-leading safety standards." }
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#09090B] text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-lux border border-[#FF4D8D]/30 mb-8"
        >
          <Sparkles className="w-4 h-4 text-[#FF4D8D]" />
          <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">
            About Soul Bridge
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6 max-w-4xl mx-auto"
        >
          Connecting Hearts & Minds Through{" "}
          <span className="text-gradient-lux">Next-Gen Intelligence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-12 font-medium"
        >
          Soul Bridge was born out of a simple belief: online dating shouldn't feel like endless superficial swiping. We blend cutting-edge Groq AI matchmaking, 3D interactive environments, and bank-grade privacy to foster authentic, lifelong love.
        </motion.p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                className="glass-card-lux rounded-2xl p-6 text-center border border-white/10 hover:border-[#FF4D8D]/40"
              >
                <div className="inline-flex items-center justify-center p-3 rounded-xl bg-white/5 mb-3">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-1">{item.value}</h3>
                <p className="text-xs text-white/60 font-medium">{item.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Core Innovation Pillars */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            How Soul Bridge <span className="text-gradient-lux">Redefines Romance</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-base">
            Four foundational pillars engineered to elevate your relationship journey from first match to everlasting connection.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Tabs Navigation */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isSelected = activePillar === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePillar(idx)}
                  className={`text-left p-5 rounded-2xl transition-all duration-300 flex items-start gap-4 cursor-pointer border ${
                    isSelected
                      ? "glass-card-lux border-[#FF4D8D] shadow-lg shadow-[#FF4D8D]/10 bg-white/10 scale-[1.02]"
                      : "glass-panel-lux border-white/5 hover:border-white/20 text-white/70"
                  }`}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${pillar.gradient} text-white shrink-0 mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-base font-bold mb-1 ${isSelected ? "text-white" : "text-white/80"}`}>
                      {pillar.title}
                    </h4>
                    <p className="text-xs text-white/50 font-medium">
                      {pillar.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Pillar Card Display */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePillar}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="glass-card-lux rounded-3xl p-8 border border-white/15 relative overflow-hidden"
              >
                <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-r ${pillars[activePillar].gradient} opacity-20 blur-3xl`} />
                
                <div className="relative z-10">
                  <span className="text-xs font-bold tracking-widest text-[#FF4D8D] uppercase mb-2 block">
                    Pillar 0{activePillar + 1}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
                    {pillars[activePillar].title}
                  </h3>
                  <p className="text-sm md:text-base text-white/70 leading-relaxed mb-6">
                    {pillars[activePillar].description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
                    {pillars[activePillar].features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#FF4D8D] shrink-0" />
                        <span className="text-xs font-medium text-white/90">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Our Journey Timeline */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Our Journey & <span className="text-gradient-lux">Milestones</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm">
            How we evolved from a bold concept into a global platform for authentic human bonding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {milestones.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card-lux rounded-2xl p-6 border border-white/10 relative flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] block mb-3">
                  {m.year}
                </span>
                <h4 className="text-lg font-bold text-white mb-2">{m.title}</h4>
                <p className="text-xs text-white/60 leading-relaxed">{m.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs text-[#FF4D8D] font-semibold gap-1">
                <span>Phase Completed</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Meet the <span className="text-gradient-lux">Visionaries</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto text-sm">
            A diverse team of AI researchers, psychologists, and 3D designers committed to bringing genuine connection to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card-lux rounded-2xl overflow-hidden border border-white/10 group hover:border-[#FF4D8D]/40 transition-all"
            >
              <div className="h-56 relative overflow-hidden bg-white/5">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-[#09090B]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-[#FF4D8D]">
                  {member.badge}
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-bold text-white group-hover:text-[#FF4D8D] transition-colors">
                  {member.name}
                </h4>
                <p className="text-xs font-semibold text-[#9C6BFF] mb-3">{member.role}</p>
                <p className="text-xs text-white/60 leading-relaxed">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <div className="glass-card-lux rounded-3xl p-10 md:p-14 border border-white/15 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF4D8D]/10 via-[#9C6BFF]/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <Heart className="w-12 h-12 text-[#FF4D8D] fill-[#FF4D8D] mx-auto mb-6 filter drop-shadow-[0_0_15px_rgba(255,77,141,0.6)]" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Ready to Experience Intelligent Matchmaking?
            </h2>
            <p className="text-sm md:text-base text-white/70 mb-8">
              Join thousands of single professionals using Soul Bridge to discover deep, authentic, and lasting relationships.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#FF4D8D]/25 flex items-center justify-center gap-2"
              >
                <span>Create Free Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/discover"
                className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel-lux border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Matches</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
