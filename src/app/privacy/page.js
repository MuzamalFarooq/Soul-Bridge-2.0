"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Lock, Eye, Key, FileText, CheckCircle2, 
  Search, ArrowRight, Sparkles, UserCheck, AlertTriangle, 
  Download, Trash2, Globe, Mail, HelpCircle, HardDrive, RefreshCw
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const lastUpdated = "August 1, 2026";

  const keyCommitments = [
    {
      icon: Lock,
      title: "End-to-End Encrypted",
      desc: "All personal messages, video feeds, and private photos use AES-256 encryption. Only you and your match hold the keys.",
      color: "text-[#FF4D8D]"
    },
    {
      icon: Eye,
      title: "Zero Data Monetization",
      desc: "We never sell, trade, or rent your personal information or dating preferences to advertisers or third-party brokers.",
      color: "text-[#9C6BFF]"
    },
    {
      icon: Trash2,
      title: "Right to Instant Erasure",
      desc: "Delete your account anytime with a single click. All vectors, message logs, and images are purged within 24 hours.",
      color: "text-rose-400"
    },
    {
      icon: UserCheck,
      title: "Granular Privacy Controls",
      desc: "Toggle incognito browsing, restrict photo view permissions, and disable location tracking whenever you desire.",
      color: "text-emerald-400"
    }
  ];

  const categories = [
    { id: "all", label: "All Sections" },
    { id: "collection", label: "Data Collection" },
    { id: "ai", label: "AI Processing" },
    { id: "sharing", label: "Data Sharing" },
    { id: "rights", label: "Your Rights" },
    { id: "security", label: "Security & Cookies" }
  ];

  const sections = [
    {
      id: "sec-1",
      category: "collection",
      title: "1. Information We Collect",
      summary: "What data is collected when you create an account, upload photos, or use Soul Bridge.",
      content: [
        "Account Data: When you register, we collect basic identifiers such as your name, email address, date of birth, gender identity, and romantic preferences.",
        "Profile & Bio Attributes: Information you voluntarily share on your profile, including hobbies, values, relationship goals, lifestyle preferences, and bio text.",
        "Biometric Selfie Verification: If you choose to get a Verified Badge, our facial recognition AI extracts non-persistent vector embeddings to confirm you match your uploaded photos. Raw facial geometry vectors are never saved permanently.",
        "Device & Technical Data: IP address, app version, browser type, and operating system to protect against fraudulent logins and malicious activity."
      ]
    },
    {
      id: "sec-2",
      category: "ai",
      title: "2. How Gemini AI Processes Your Compatibility Vector",
      summary: "How our artificial intelligence engine calculates compatibility while preserving privacy.",
      content: [
        "Privacy-Preserving Vectorization: Soul Bridge converts your personality questionnaire responses and relationship preferences into anonymized high-dimensional mathematical vectors.",
        "No Model Training on Private Messages: We explicitly guarantee that your personal chat conversations, video calls, or private gallery photos are NEVER used to train external public LLMs.",
        "Dynamic Compatibility Scoring: Vector math computes compatibility percentages (e.g., 94% SoulMatch) in memory without exposing raw personal notes to other members."
      ]
    },
    {
      id: "sec-3",
      category: "sharing",
      title: "3. Information Sharing & Third Parties",
      summary: "Strict guidelines governing sub-processors and cloud service infrastructure.",
      content: [
        "No Commercial Selling: We do not sell your personal data, contact information, or usage habits to third-party ad networks.",
        "Essential Infrastructure Providers: We work with trusted cloud hosts (e.g., AWS, GCP) and database providers who strictly operate under GDPR and SOC-2 security agreements.",
        "Legal & Protection Compliance: We may disclose information only if strictly compelled by a valid law enforcement subpoena, court order, or to prevent immediate physical harm or severe fraud."
      ]
    },
    {
      id: "sec-4",
      category: "rights",
      title: "4. Your Rights Under GDPR, CCPA & Global Laws",
      summary: "Complete authority over your personal information.",
      content: [
        "Right to Access & Export: You can request a complete JSON machine-readable archive of all data associated with your account from your Profile Settings.",
        "Right to Erasure (Forget Me): When you click 'Delete Account', all profile data, chat history, match records, and media files are permanently purged within 24 hours.",
        "Stealth & Incognito Control: You can hide your profile from public discovery at any time while retaining active conversations with existing matches."
      ]
    },
    {
      id: "sec-5",
      category: "security",
      title: "5. Security Standards & Encryption Protocol",
      summary: "How we shield your communication and credentials from unauthorized access.",
      content: [
        "TLS 1.3 Transmission Security: All traffic between your browser or mobile app and Soul Bridge servers is encrypted using modern TLS 1.3 protocol.",
        "AES-256 Storage Encryption: Passwords, sensitive tokens, and media attachments are encrypted at rest using AES-256 algorithms.",
        "Continuous Vulnerability Auditing: Automated security scanners and third-party penetration testing ensure zero unauthorized intrusions."
      ]
    },
    {
      id: "sec-6",
      category: "security",
      title: "6. Cookies & Local Browser Storage",
      summary: "How session cookies keep you securely authenticated.",
      content: [
        "Essential Session Cookies: We use HTTP-only secure cookies exclusively for maintaining your logged-in state and security session verification.",
        "No Cross-Site Ad Tracking: Soul Bridge does not embed tracking pixels or third-party remarketing cookies."
      ]
    }
  ];

  const filteredSections = sections.filter((sec) => {
    const matchesCat = activeCategory === "all" || sec.category === activeCategory;
    const matchesQuery = 
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.content.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#09090B] text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-lux border border-[#9C6BFF]/30 mb-8"
        >
          <Shield className="w-4 h-4 text-[#9C6BFF]" />
          <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">
            Data Trust & Privacy Policy
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6 max-w-4xl mx-auto"
        >
          Your Privacy Is Our <span className="text-gradient-lux">Sacred Contract</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-6 font-medium"
        >
          Soul Bridge is built on absolute transparency. Learn how we protect your personal identity, encrypt your messages, and give you complete control over your data.
        </motion.p>

        <div className="inline-flex items-center gap-2 text-xs text-white/50 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <RefreshCw className="w-3.5 h-3.5 text-[#FF4D8D]" />
          <span>Last Updated: <strong className="text-white">{lastUpdated}</strong></span>
        </div>
      </section>

      {/* Key Commitments Grid */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyCommitments.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card-lux rounded-2xl p-6 border border-white/10 hover:border-[#9C6BFF]/40"
              >
                <div className="p-3 rounded-xl bg-white/5 inline-flex mb-4">
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Search & Interactive Section Filters */}
      <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="glass-card-lux rounded-3xl p-6 md:p-8 border border-white/10 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search policy (e.g. cookies, encryption, delete)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl glass-input-lux text-xs text-white placeholder-white/40"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white shadow-md shadow-[#FF4D8D]/20"
                      : "glass-panel-lux text-white/60 hover:text-white border border-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Policy Content Sections */}
          <div className="flex flex-col gap-8">
            {filteredSections.length > 0 ? (
              filteredSections.map((sec) => (
                <motion.div
                  key={sec.id}
                  id={sec.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel-lux rounded-2xl p-6 md:p-8 border border-white/10"
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#FF4D8D]" />
                      <span>{sec.title}</span>
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#9C6BFF]">
                      {sec.category}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mb-6 italic">{sec.summary}</p>
                  
                  <div className="space-y-3">
                    {sec.content.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-3 text-xs text-white/80 leading-relaxed font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">No policy section matching "{searchQuery}"</p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                  className="mt-3 text-xs text-[#FF4D8D] underline cursor-pointer"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Data Protection Officer */}
      <section className="py-12 px-6 md:px-12 max-w-5xl mx-auto w-full mb-12">
        <div className="glass-card-lux rounded-3xl p-8 md:p-12 border border-white/15 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <Mail className="w-10 h-10 text-[#9C6BFF] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Questions Regarding Your Personal Privacy?
            </h2>
            <p className="text-xs md:text-sm text-white/70 mb-6 leading-relaxed">
              Our dedicated Data Protection Officer (DPO) and Legal Security Squad are available 24/7 to address any data requests, GDPR inquiries, or privacy concerns.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/10 border border-white/15 text-xs text-white font-mono font-bold">
              <span>dpo@soulbridge.app</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
