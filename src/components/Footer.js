"use client";

import React from "react";
import Link from "next/link";
import { Heart, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="glass-panel border-t border-opacity-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-pink fill-primary-pink" />
            <span className="text-xl font-bold tracking-tight bg-gradient-premium bg-clip-text text-transparent">
              Soul Bridge
            </span>
          </Link>
          <p className="text-xs text-foreground text-opacity-70 leading-relaxed">
            Bridging hearts and minds. Soul Bridge leverages state-of-the-art Gemini AI technology to facilitate profound, lasting dating experiences.
          </p>
          <div className="flex items-center gap-3 mt-2 text-foreground text-opacity-60">
            <Link href="#" className="hover:text-primary-pink transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </Link>
            <Link href="#" className="hover:text-primary-pink transition-colors" aria-label="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </Link>
            <Link href="#" className="hover:text-primary-pink transition-colors" aria-label="Twitter">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Explore Links */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold tracking-wider text-primary-pink uppercase">Explore</h4>
          <Link href="/discover" className="text-xs text-foreground text-opacity-80 hover:text-primary-pink transition-colors">
            Discover Matches
          </Link>
          <Link href="#pricing" className="text-xs text-foreground text-opacity-80 hover:text-primary-pink transition-colors">
            Premium Plans
          </Link>
          <Link href="#how-it-works" className="text-xs text-foreground text-opacity-80 hover:text-primary-pink transition-colors">
            Success Stories
          </Link>
          <Link href="#" className="text-xs text-foreground text-opacity-80 hover:text-primary-pink transition-colors">
            Safety Center
          </Link>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold tracking-wider text-primary-purple uppercase">Resources</h4>
          <Link href="#" className="text-xs text-foreground text-opacity-80 hover:text-primary-pink transition-colors">
            Dating Tips
          </Link>
          <Link href="#" className="text-xs text-foreground text-opacity-80 hover:text-primary-pink transition-colors">
            FAQ
          </Link>
          <Link href="#" className="text-xs text-foreground text-opacity-80 hover:text-primary-pink transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="text-xs text-foreground text-opacity-80 hover:text-primary-pink transition-colors">
            Terms of Service
          </Link>
        </div>

        {/* Contact/Newsletter */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold tracking-wider text-foreground uppercase">Newsletter</h4>
          <p className="text-xs text-foreground text-opacity-70 leading-relaxed">
            Subscribe to get direct dating tips, success stories, and platform updates.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 mt-1">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs"
              required
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-gradient-premium text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white border-opacity-5 py-6 text-center">
        <p className="text-[10px] text-foreground text-opacity-50">
          © {new Date().getFullYear()} Soul Bridge Inc. All rights reserved. Made with ❤️ for true lovers.
        </p>
      </div>
    </footer>
  );
}
