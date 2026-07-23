"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Heart, Sparkles, Shield, Zap, MessageCircle, Video, UserCheck, 
  ArrowRight, Check, ChevronDown, Award, Globe, Brain 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [floatingHearts, setFloatingHearts] = useState([]);

  // Create floating hearts for hero animation
  useEffect(() => {
    const hearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 85 + 5}%`,
      delay: `${Math.random() * 8}s`,
      size: `${Math.random() * 20 + 10}px`,
      duration: `${Math.random() * 10 + 6}s`,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setFloatingHearts(hearts);
  }, []);

  const faqData = [
    {
      q: "How does the AI matching system work?",
      a: "Our AI engine analyzes your detailed profile questionnaire, hobbies, writing style, and preferences. It calculates a detailed compatibility percentage based on psychological traits and interests, helping you bypass small talk and connect on a deeper level."
    },
    {
      q: "Is Soul Bridge safe and secure?",
      a: "Absolutely. Safety is our number one priority. We implement end-to-end encryption for video and audio calls, screenshot detection guidelines, direct profile report mechanisms, and quick verification badges to ensure every user is verified."
    },
    {
      q: "What features are included in the Premium plans?",
      a: "Premium memberships (Gold & Platinum) unlock features like unlimited swipes, advanced filtering (religion, height, education), profile boosts to place you on top of discovery decks, read receipts, incognito browsing, and unlimited access to the Gemini AI Dating Coach."
    },
    {
      q: "Can I use Soul Bridge on mobile and desktop?",
      a: "Yes! Soul Bridge is built with progressive web app (PWA) standards, ensuring it feels like a native app on iOS or Android, while offering a fully responsive experience on tablets and desktop browsers."
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Floating hearts container */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute bottom-0 text-primary-pink animate-bounce fill-current opacity-40"
            style={{
              left: heart.left,
              fontSize: heart.size,
              animationDelay: heart.delay,
              animationDuration: heart.duration,
              opacity: heart.opacity,
              animationName: "heartBurst",
              animationIterationCount: "infinite",
              animationTimingFunction: "linear"
            }}
          >
            ♥
          </div>
        ))}
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto w-full text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-opacity-30 text-xs font-semibold text-primary-pink mb-8 animate-pulse-slow">
          <Sparkles className="w-4 h-4" /> Powered by Gemini Advanced AI
        </div>
        
        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mb-6">
          Find the Bridge to Your <br />
          <span className="text-gradient">Ultimate Soulmate</span>
        </h1>
        
        <p className="text-base md:text-xl text-foreground text-opacity-80 max-w-3xl mb-10 leading-relaxed">
          Skip the endless small talk. Soul Bridge uses psychological analysis and deep personality matching to pair you with partners who share your values, dreams, and life rhythm.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-premium text-white font-semibold text-base shadow-xl shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Create Your Account <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full glass-panel hover:bg-white hover:bg-opacity-10 font-semibold text-base transition-all"
          >
            See How it Works
          </Link>
        </div>

        {/* Dynamic illustration frame */}
        <div className="w-full max-w-4xl rounded-2xl glass-card border border-opacity-30 overflow-hidden relative shadow-2xl p-2 animate-float">
          <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video relative flex items-center justify-center bg-gradient-purple-pink">
            {/* Mock Swipe Interface Preview */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6">
              <div className="w-[300px] h-[400px] glass-card rounded-2xl p-4 flex flex-col justify-between border border-white/20 shadow-2xl animate-pulse">
                <div className="w-full h-48 rounded-xl bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center relative">
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                    <Brain className="w-3 h-3 text-pink-400" /> 97% Match
                  </div>
                  <Heart className="w-12 h-12 text-white/40" />
                </div>
                <div className="text-left mt-4">
                  <h3 className="font-bold text-white text-lg">Amara, 27</h3>
                  <p className="text-xs text-white/80">UX Designer • New York</p>
                  <p className="text-[10px] text-pink-300 italic mt-2">\"Always up for coffee and gallery walks.\"</p>
                </div>
                <div className="flex justify-around items-center mt-3">
                  <button className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-sm font-bold">✕</button>
                  <button className="w-12 h-12 rounded-full bg-gradient-premium flex items-center justify-center text-white"><Heart className="w-6 h-6 fill-white" /></button>
                  <button className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 text-sm font-bold">★</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full border-t border-white border-opacity-5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How Soul Bridge Connects You</h2>
          <p className="text-foreground text-opacity-70 max-w-2xl mx-auto">
            Three simple steps to transition from surface swipes to meaningful, long-term conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-primary-pink font-bold text-xl border border-pink-500/30">
              1
            </div>
            <h3 className="text-xl font-bold">Craft Your AI Profile</h3>
            <p className="text-sm text-foreground text-opacity-70 leading-relaxed">
              Answer our questionnaire. Use our AI Bio Generator to easily write a detailed representation of your values, hobbies, and personality type.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-primary-purple font-bold text-xl border border-purple-500/30">
              2
            </div>
            <h3 className="text-xl font-bold">Unlock Smart Matches</h3>
            <p className="text-sm text-foreground text-opacity-70 leading-relaxed">
              Explore profiles with deep compatibility calculations. Our system dynamically scores each match based on traits, religion, goals, and lifestyle.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl border border-indigo-500/30">
              3
            </div>
            <h3 className="text-xl font-bold">Converse and Meet</h3>
            <p className="text-sm text-foreground text-opacity-70 leading-relaxed">
              Chat in real-time with automatic Ice Breakers, typing indicators, call capabilities, and conversation guides powered by Gemini.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full border-t border-white border-opacity-5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Core Platform Capabilities</h2>
          <p className="text-foreground text-opacity-70 max-w-2xl mx-auto">
            Everything you need in a modern, secure, and advanced dating workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex gap-4 p-6 glass-card rounded-2xl">
            <Brain className="w-10 h-10 text-primary-pink shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1">AI Dating Assistant</h3>
              <p className="text-xs text-foreground text-opacity-70 leading-relaxed">
                Generate bio bios, score match alignments, and consult live tips on how to build confidence.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-6 glass-card rounded-2xl">
            <Zap className="w-10 h-10 text-primary-purple shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1">Interactive Swipe Cards</h3>
              <p className="text-xs text-foreground text-opacity-70 leading-relaxed">
                Smooth tinder-like touch gestures to quickly pass, like, or superlike, with instant match checking.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-6 glass-card rounded-2xl">
            <MessageCircle className="w-10 h-10 text-pink-400 shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1">Real-time Socket Chat</h3>
              <p className="text-xs text-foreground text-opacity-70 leading-relaxed">
                Private chatting with read indicators, reactions, image attachments, and typing bubbles.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-6 glass-card rounded-2xl">
            <Video className="w-10 h-10 text-purple-400 shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1">WebRTC Audio/Video Calls</h3>
              <p className="text-xs text-foreground text-opacity-70 leading-relaxed">
                Verify matches securely by initiating video or voice calls directly through the browser.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-6 glass-card rounded-2xl">
            <Shield className="w-10 h-10 text-indigo-400 shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1">Safety & Incognito Mode</h3>
              <p className="text-xs text-foreground text-opacity-70 leading-relaxed">
                Hide your profile, secure your gallery photos as private, and block or report users instantly.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-6 glass-card rounded-2xl">
            <UserCheck className="w-10 h-10 text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1">Profile Verification</h3>
              <p className="text-xs text-foreground text-opacity-70 leading-relaxed">
                Verified badges for authenticated users to ensure authenticity and build confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories / Testimonials */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full border-t border-white border-opacity-5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Soul Bridge Success Stories</h2>
          <p className="text-foreground text-opacity-70 max-w-2xl mx-auto">
            Read how couples found each other through our AI matching algorithm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between border border-pink-500/10">
            <p className="text-sm italic text-foreground text-opacity-80 mb-6 leading-relaxed">
              \"I was skeptical about AI matching, but Soul Bridge proved me wrong. When I matched with Mark, our compatibility score was 96%. We both loved hiking, indie music, and shared the same relationship goals. After talking for a few days, we met. The rest is history!\"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-400 flex items-center justify-center font-bold text-white text-sm">
                S
              </div>
              <div>
                <h4 className="font-bold text-sm">Sarah & Mark</h4>
                <p className="text-[10px] text-foreground text-opacity-50">Matched in October 2025</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between border border-purple-500/10">
            <p className="text-sm italic text-foreground text-opacity-80 mb-6 leading-relaxed">
              \"The AI conversation recommendations were a lifesaver. NextAuth registration was simple, and the swiping animations are beautiful. But what mattered most is that I found Jessica. We connected over our favorite movies and our shared religious values.\"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center font-bold text-white text-sm">
                J
              </div>
              <div>
                <h4 className="font-bold text-sm">Jessica & Daniel</h4>
                <p className="text-[10px] text-foreground text-opacity-50">Matched in January 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section id="pricing" className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full border-t border-white border-opacity-5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Premium Plan</h2>
          <p className="text-foreground text-opacity-70 max-w-2xl mx-auto">
            Upgrade your experience and double your match rate with our premium capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between border border-white border-opacity-5">
            <div>
              <h3 className="text-lg font-bold mb-1">Free</h3>
              <p className="text-xs text-foreground text-opacity-60 mb-6">Standard Matchmaking</p>
              <div className="text-3xl font-extrabold mb-6">$0 <span className="text-xs font-normal text-foreground text-opacity-50">/ month</span></div>
              <ul className="flex flex-col gap-3 text-xs mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 30 Likes per day</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Standard chat with matches</li>
                <li className="flex items-center gap-2 text-foreground text-opacity-40">✕ Advanced filters</li>
                <li className="flex items-center gap-2 text-foreground text-opacity-40">✕ See who viewed you</li>
                <li className="flex items-center gap-2 text-foreground text-opacity-40">✕ AI coach consults</li>
              </ul>
            </div>
            <Link href="/register" className="w-full text-center py-2.5 rounded-full border border-foreground border-opacity-20 text-xs font-semibold hover:bg-white hover:bg-opacity-5 transition-all">
              Get Started
            </Link>
          </div>

          {/* Gold Tier */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between border border-primary-pink/30 relative">
            <div className="absolute -top-3 right-6 bg-gradient-premium text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase">
              <Award className="w-3.5 h-3.5" /> Popular
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1 text-primary-pink">Gold</h3>
              <p className="text-xs text-foreground text-opacity-60 mb-6">Enhanced Exploration</p>
              <div className="text-3xl font-extrabold mb-6">$14.99 <span className="text-xs font-normal text-foreground text-opacity-50">/ month</span></div>
              <ul className="flex flex-col gap-3 text-xs mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Likes & Swipes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 5 Super Likes per day</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> See who viewed your profile</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Advanced discovery filters</li>
                <li className="flex items-center gap-2 text-foreground text-opacity-40">✕ Incognito browsing mode</li>
              </ul>
            </div>
            <Link href="/register" className="w-full text-center py-2.5 rounded-full bg-gradient-premium text-white text-xs font-semibold shadow-lg shadow-pink-500/20 hover:scale-[1.02] transition-all">
              Upgrade to Gold
            </Link>
          </div>

          {/* Platinum Tier */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between border border-primary-purple/30">
            <div>
              <h3 className="text-lg font-bold mb-1 text-primary-purple">Platinum</h3>
              <p className="text-xs text-foreground text-opacity-60 mb-6">VIP AI Matchmaker</p>
              <div className="text-3xl font-extrabold mb-6">$29.99 <span className="text-xs font-normal text-foreground text-opacity-50">/ month</span></div>
              <ul className="flex flex-col gap-3 text-xs mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Everything in Gold</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Incognito & invisible mode</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited Gemini AI analysis</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Read receipts in chat</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority matching queue</li>
              </ul>
            </div>
            <Link href="/register" className="w-full text-center py-2.5 rounded-full border border-primary-purple hover:bg-primary-purple hover:text-white text-xs font-semibold transition-all">
              Go Platinum
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20 px-6 max-w-4xl mx-auto w-full border-t border-white border-opacity-5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-foreground text-opacity-70">
            Got questions? We have answers.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqData.map((faq, index) => (
            <div key={index} className="glass-card rounded-2xl overflow-hidden border border-white border-opacity-5">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm md:text-base text-left hover:bg-white hover:bg-opacity-5 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-primary-pink transition-transform duration-300 ${activeFaq === index ? "rotate-180" : ""}`} />
              </button>
              
              {activeFaq === index && (
                <div className="px-6 pb-6 pt-2 text-xs md:text-sm text-foreground text-opacity-70 leading-relaxed border-t border-white border-opacity-5 animate-in fade-in slide-in-from-top-1 duration-200">
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
