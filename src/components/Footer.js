"use client";

import React from "react";
import Link from "next/link";
import { Heart, Mail, Sparkles, Shield, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 glass-panel-lux border-t border-white/10 mt-auto bg-[#09090B]/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center">
              <Heart className="w-7 h-7 text-[#FF4D8D] fill-[#FF4D8D] group-hover:scale-110 transition-transform filter drop-shadow-[0_0_10px_rgba(255,77,141,0.6)]" />
            </div>
            <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] via-[#FFB6C1] to-[#9C6BFF]">
              Soul Bridge
            </span>
          </Link>
          <p className="text-xs text-white/60 leading-relaxed font-medium">
            Bridging hearts and minds. Soul Bridge leverages state-of-the-art Gemini AI technology and 3D interactive matching to facilitate deep, lasting dating experiences.
          </p>
          <div className="flex items-center gap-3 mt-2 text-white/50">
            <Link href="#" className="p-2 rounded-full glass-panel-lux hover:text-[#FF4D8D] hover:border-[#FF4D8D]/40 transition-all" aria-label="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </Link>
            <Link href="#" className="p-2 rounded-full glass-panel-lux hover:text-[#FF4D8D] hover:border-[#FF4D8D]/40 transition-all" aria-label="Twitter">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Explore */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold tracking-widest text-[#FF4D8D] uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Explore
          </h4>
          <Link href="/discover" className="text-xs text-white/70 hover:text-white transition-colors">
            Discover Matches
          </Link>
          <Link href="#pricing" className="text-xs text-white/70 hover:text-white transition-colors">
            Premium Plans
          </Link>
          <Link href="#how-it-works" className="text-xs text-white/70 hover:text-white transition-colors">
            Success Stories
          </Link>
          <Link href="#" className="text-xs text-white/70 hover:text-white transition-colors">
            Safety Center
          </Link>
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold tracking-widest text-[#9C6BFF] uppercase flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Company
          </h4>
          <Link href="#" className="text-xs text-white/70 hover:text-white transition-colors">
            About Us
          </Link>
          <Link href="#" className="text-xs text-white/70 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="text-xs text-white/70 hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs text-white/70 hover:text-white transition-colors">
            Security & Encryption
          </Link>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold tracking-widest text-white uppercase">
            Exclusive Insights
          </h4>
          <p className="text-xs text-white/60 leading-relaxed font-medium">
            Join 50,000+ members receiving weekly AI dating tips & romance advice.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 mt-1">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2.5 rounded-xl glass-input-lux text-xs text-white placeholder-white/40"
              required
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      <div className="border-t border-white/10 py-6 text-center">
        <p className="text-[11px] text-white/40 font-medium">
          © {new Date().getFullYear()} Soul Bridge Inc. All rights reserved. Crafted with ❤️ for true connections worldwide.
        </p>
      </div>
    </footer>
  );
}
