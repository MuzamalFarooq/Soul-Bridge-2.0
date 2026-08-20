"use client";

import React from "react";
import Link from "next/link";
import { Heart, Mail, Sparkles, Shield, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 glass-panel-lux border-t border-white/10 mt-auto bg-dark/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center">
              <Heart className="w-7 h-7 text-[#FF4D8D] fill-[#FF4D8D] group-hover:scale-110 transition-transform filter drop-shadow-[0_0_10px_rgba(255,77,141,0.6)]" />
            </div>
            <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-r from-[#FF4D8D] via-[#FFB6C1] to-[#9C6BFF]">
              Soul Bridge
            </span>
          </Link>
          <p className="text-xs text-white/60 leading-relaxed font-medium">
            Bridging hearts and minds. Soul Bridge leverages state-of-the-art Gemini AI technology and 3D interactive matching to facilitate deep, lasting dating experiences.
          </p>
          <div className="flex items-center gap-3 mt-2 text-white/50">
            <Link href="https://www.instagram.com/tigerstyle786" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass-panel-lux hover:text-[#FF4D8D] hover:border-[#FF4D8D]/40 transition-all" aria-label="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </Link>
            <Link href="https://www.tiktok.com/@tigerstyle786" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass-panel-lux hover:text-[#FF4D8D] hover:border-[#FF4D8D]/40 transition-all" aria-label="TikTok">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
              </svg>
            </Link>
            <Link href="https://www.linkedin.com/in/muzamal-farooq-1232693a9" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass-panel-lux hover:text-[#FF4D8D] hover:border-[#FF4D8D]/40 transition-all" aria-label="LinkedIn">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </Link>
            <Link href="https://www.facebook.com/tigerstyle786.M" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass-panel-lux hover:text-[#FF4D8D] hover:border-[#FF4D8D]/40 transition-all" aria-label="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full glass-panel-lux hover:text-[#FF4D8D] hover:border-[#FF4D8D]/40 transition-all" aria-label="Twitter / X">
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
          <Link href="/#pricing" className="text-xs text-white/70 hover:text-white transition-colors">
            Premium Plans
          </Link>
          <Link href="/stories" className="text-xs text-white/70 hover:text-white transition-colors">
            Success Stories
          </Link>
          <Link href="/safety" className="text-xs text-white/70 hover:text-white transition-colors">
            Safety Center
          </Link>
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold tracking-widest text-[#9C6BFF] uppercase flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Company
          </h4>
          <Link href="/about" className="text-xs text-white/70 hover:text-white transition-colors">
            About Us
          </Link>
          <Link href="/privacy" className="text-xs text-white/70 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/privacy#sec-4" className="text-xs text-white/70 hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/safety" className="text-xs text-white/70 hover:text-white transition-colors">
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
              className="flex-1 px-4 py-2.5 rounded-xl glass-input-lux text-xs  placeholder-white/40"
              required
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-linear-to-r from-[#FF4D8D] to-[#9C6BFF] text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      <div className="border-t border-white/10 py-6 pb-24 md:pb-6 text-center">
        <p className="text-[11px] text-white/40 font-medium px-4">
          © {new Date().getFullYear()} Soul Bridge Inc. All rights reserved. Crafted with ❤️ for true connections worldwide.
        </p>
      </div>
    </footer>
  );
}
