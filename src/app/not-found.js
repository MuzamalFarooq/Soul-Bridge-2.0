'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  Users, 
  Heart, 
  Mail, 
  ChevronRight, 
  User, 
  Menu, 
  X,
  Compass
} from 'lucide-react';

export default function NotFound() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Floating rose petals configuration for subtle romantic ambience
  const floatingPetals = [
    { id: 1, left: '8%', delay: 0, duration: 18, size: 14, rotate: 25 },
    { id: 2, left: '22%', delay: 3, duration: 22, size: 10, rotate: -35 },
    { id: 3, left: '42%', delay: 6, duration: 19, size: 12, rotate: 45 },
    { id: 4, left: '68%', delay: 2, duration: 24, size: 11, rotate: -20 },
    { id: 5, left: '86%', delay: 5, duration: 20, size: 13, rotate: 30 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-[#271f22] bg-[#fcefed] flex flex-col justify-between selection:bg-[#7c2945] selection:text-white">
      {/* 1. Cinematic Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/404-bg.webp"
          alt="SoulBridge Romantic Sunset Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center lg:object-[center_top]"
          quality={95}
        />
        {/* Subtle romantic ambient lighting & vignette overlays */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'radial-gradient(circle at 18% 38%, rgba(255, 240, 243, 0.45) 0%, rgba(255, 230, 235, 0.15) 50%, transparent 100%)'
          }}
        />
      </div>

      {/* 2. Gentle Floating Rose Petals (Framer Motion) */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden" aria-hidden="true">
        {floatingPetals.map((petal) => (
          <motion.div
            key={petal.id}
            initial={{ y: -40, opacity: 0, rotate: 0 }}
            animate={{ 
              y: '105vh', 
              opacity: [0, 0.8, 0.8, 0],
              rotate: [petal.rotate, petal.rotate + 180],
              x: ['-15px', '15px', '-15px']
            }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              left: petal.left,
              width: petal.size,
              height: petal.size * 1.3,
            }}
          >
            {/* SVG Rose Petal Silhouette */}
            <svg viewBox="0 0 24 30" fill="none" className="w-full h-full drop-shadow-sm opacity-60">
              <path 
                d="M12 2C6 8 2 15 4 22C6 28 14 29 19 24C24 19 22 10 17 5C15 3 13 2 12 2Z" 
                fill="#8f1f3a" 
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* 3. Navigation Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <motion.nav 
          initial={{ y: -25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mx-auto rounded-full px-5 py-2.5 sm:px-8 sm:py-3 flex items-center justify-between border border-white/70 shadow-[0_4px_25px_rgba(124,41,69,0.06)]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          aria-label="404 Page Navigation"
        >
          {/* Logo & Brand */}
          <Link 
            href="/" 
            className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
            aria-label="SoulBridge Home"
          >
            {/* SoulBridge Heart Logo */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#7c2945] transition-transform group-hover:rotate-6">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M16 28C16 28 4 20 4 11.5C4 7.35786 7.35786 4 11.5 4C13.5 4 15.3 4.8 16 6.2C16.7 4.8 18.5 4 20.5 4C24.6421 4 28 7.35786 28 11.5C28 20 16 28 16 28Z" 
                  stroke="#7c2945" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="rgba(124, 41, 69, 0.08)"
                />
                <path 
                  d="M11 11.5C11 9 13.5 8 16 11.5" 
                  stroke="#7c2945" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                />
              </svg>
            </div>
            <span 
              className="text-xl sm:text-2xl font-bold tracking-tight text-[#7c2945]"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              SoulBridge
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7 lg:gap-9 text-sm font-medium">
            <Link 
              href="/" 
              className="text-[#7c2945] font-semibold relative py-1 transition-colors hover:text-[#5a1428]"
            >
              Home
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#7c2945] rounded-full" />
            </Link>
            <Link 
              href="/about" 
              className="text-[#4e3f45] hover:text-[#7c2945] transition-colors py-1"
            >
              About
            </Link>
            <Link 
              href="/#features" 
              className="text-[#4e3f45] hover:text-[#7c2945] transition-colors py-1"
            >
              Features
            </Link>
            <Link 
              href="/stories" 
              className="text-[#4e3f45] hover:text-[#7c2945] transition-colors py-1"
            >
              Community
            </Link>
            <Link 
              href="/about" 
              className="text-[#4e3f45] hover:text-[#7c2945] transition-colors py-1"
            >
              Contact
            </Link>
          </div>

          {/* Right: Sign In Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                backgroundColor: '#7c2945',
                color: '#ffffff',
              }}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span style={{ color: '#ffffff' }}>Sign In</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-[#7c2945] hover:bg-black/5 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.nav>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 mx-auto max-w-sm rounded-3xl p-5 border border-white/80 shadow-xl"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div className="flex flex-col gap-3 text-center font-medium text-[#4e3f45]">
                <Link 
                  href="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-[#7c2945] font-semibold border-b border-rose-100"
                >
                  Home
                </Link>
                <Link 
                  href="/about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 hover:text-[#7c2945] border-b border-rose-100"
                >
                  About
                </Link>
                <Link 
                  href="/#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 hover:text-[#7c2945] border-b border-rose-100"
                >
                  Features
                </Link>
                <Link 
                  href="/stories" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 hover:text-[#7c2945] border-b border-rose-100"
                >
                  Community
                </Link>
                <Link 
                  href="/about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 hover:text-[#7c2945]"
                >
                  Contact
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 4. Main Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 404 Typography, Heading, Description & Primary Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            {/* The Signature 404 with Heart Cutout & Romantic Swirl */}
            <div className="w-full max-w-[480px] sm:max-w-[560px] lg:max-w-[580px] mb-2 sm:mb-3">
              <svg 
                viewBox="0 0 680 200" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto drop-shadow-[0_8px_20px_rgba(114,20,47,0.18)]"
              >
                <defs>
                  <linearGradient id="wineGrad404" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#871a3b" />
                    <stop offset="60%" stopColor="#71132e" />
                    <stop offset="100%" stopColor="#530b1e" />
                  </linearGradient>
                  <filter id="softShadow404" x="-10%" y="-10%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#4a0e20" floodOpacity="0.16" />
                  </filter>
                </defs>

                {/* First numeral "4" */}
                <path 
                  d="M 125 152 L 125 118 L 62 118 L 62 90 L 122 18 L 154 18 L 154 90 L 178 90 L 178 118 L 154 118 L 154 152 Z M 125 90 L 125 54 L 94 90 Z" 
                  fill="url(#wineGrad404)" 
                  filter="url(#softShadow404)" 
                />

                {/* Middle numeral "0" with Heart Cutout */}
                <path 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                  d="M 245 18 
                     C 285 18, 312 45, 312 85 
                     C 312 125, 285 152, 245 152 
                     C 205 152, 178 125, 178 85 
                     C 178 45, 205 18, 245 18 Z 
                     
                     M 245 116 
                     C 243 114, 216 90, 216 73 
                     C 216 59, 227 50, 239 50 
                     C 246 50, 252 54, 254 58 
                     C 256 54, 262 50, 269 50 
                     C 281 50, 292 59, 292 73 
                     C 292 90, 265 114, 263 116 
                     L 245 125 Z" 
                  fill="url(#wineGrad404)" 
                  filter="url(#softShadow404)" 
                />

                {/* Second numeral "4" */}
                <path 
                  d="M 395 152 L 395 118 L 332 118 L 332 90 L 392 18 L 424 18 L 424 90 L 448 90 L 448 118 L 424 118 L 424 152 Z M 395 90 L 395 54 L 364 90 Z" 
                  fill="url(#wineGrad404)" 
                  filter="url(#softShadow404)" 
                />

                {/* Delicate connected flourish looping into romantic upright heart line */}
                <path 
                  d="M 448 106 
                     C 475 106, 490 125, 510 125 
                     C 530 125, 550 115, 565 95 
                     C 570 70, 560 48, 578 40 
                     C 592 34, 604 46, 604 58 
                     C 604 46, 616 34, 630 40 
                     C 648 48, 642 75, 622 98 
                     C 604 118, 595 110, 610 95 
                     C 625 80, 650 82, 665 92" 
                  stroke="url(#wineGrad404)" 
                  strokeWidth="2.6" 
                  strokeLinecap="round" 
                  fill="none" 
                />

                {/* Tiny solid accent heart at bottom dip of the wave */}
                <path 
                  d="M 510 126 
                     C 509 125, 502 118, 502 113 
                     C 502 109, 505 106, 509 106 
                     C 511 106, 513 107, 514 109 
                     C 515 107, 517 106, 519 106 
                     C 523 106, 526 109, 526 113 
                     C 526 118, 519 125, 518 126 
                     L 514 130 Z" 
                  fill="#71132e" 
                />
              </svg>
            </div>

            {/* Heading: Page Not Found */}
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 text-[#541426]"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Page Not Found
            </h1>

            {/* Description Subtitle */}
            <p className="text-base sm:text-lg text-[#5c4a52] max-w-md leading-relaxed mb-7 sm:mb-8 font-normal">
              Oops! The page you are looking for might have been moved, deleted, or never existed.
            </p>

            {/* Two Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full">
              {/* Primary Button: Go Back Home */}
              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold shadow-[0_6px_20px_rgba(124,41,69,0.22)] hover:shadow-[0_8px_25px_rgba(124,41,69,0.32)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #7c2945 0%, #60122a 100%)',
                  color: '#ffffff',
                }}
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform group-hover:-translate-y-0.5" />
                <span style={{ color: '#ffffff' }}>Go Back Home</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Secondary Button: Explore More */}
              <Link
                href="/discover"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold border transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                style={{
                  borderColor: '#caa0a9',
                  backgroundColor: 'rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(8px)',
                  color: '#7c2945',
                }}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#7c2945] transition-transform group-hover:scale-110" />
                <span>Explore More</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Kept visually open so the romantic couple and sunset shine through */}
          <div className="hidden lg:block lg:col-span-5 h-[360px] pointer-events-none" aria-hidden="true" />
        </div>

        {/* 5. Helpful Navigation Panel ("You might be looking for:") */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="w-full max-w-2xl mx-auto mt-8 sm:mt-12 lg:mt-10"
        >
          <div 
            className="rounded-3xl p-5 sm:p-7 border border-white/80 shadow-[0_12px_36px_rgba(124,41,69,0.08)]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.68)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          >
            {/* Header with Centered Heart and Divider Lines */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-5">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[#dbb3bc]" />
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-[#7c2945] fill-[#7c2945]" />
                <h2 
                  className="text-base sm:text-lg font-medium text-[#541426] tracking-tight whitespace-nowrap"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  You might be looking for:
                </h2>
                <Heart className="w-3.5 h-3.5 text-[#7c2945] fill-[#7c2945]" />
              </div>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[#dbb3bc]" />
            </div>

            {/* 4 Interactive Navigation Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Tile 1: Home */}
              <Link 
                href="/"
                className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md"
                style={{
                  backgroundColor: 'rgba(252, 237, 240, 0.85)',
                  border: '1px solid rgba(245, 215, 222, 0.6)',
                }}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-[#7c2945] bg-white/70 shadow-xs mb-2 transition-transform group-hover:scale-110">
                  <Home className="w-5 h-5 text-[#7c2945]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#4e3f45] group-hover:text-[#7c2945] transition-colors">
                  Home
                </span>
              </Link>

              {/* Tile 2: Our Community */}
              <Link 
                href="/stories"
                className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md"
                style={{
                  backgroundColor: 'rgba(252, 237, 240, 0.85)',
                  border: '1px solid rgba(245, 215, 222, 0.6)',
                }}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-[#7c2945] bg-white/70 shadow-xs mb-2 transition-transform group-hover:scale-110">
                  <Users className="w-5 h-5 text-[#7c2945]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#4e3f45] group-hover:text-[#7c2945] transition-colors">
                  Our Community
                </span>
              </Link>

              {/* Tile 3: Our Features */}
              <Link 
                href="/#features"
                className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md"
                style={{
                  backgroundColor: 'rgba(252, 237, 240, 0.85)',
                  border: '1px solid rgba(245, 215, 222, 0.6)',
                }}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-[#7c2945] bg-white/70 shadow-xs mb-2 transition-transform group-hover:scale-110">
                  <Heart className="w-5 h-5 text-[#7c2945] fill-[#7c2945]/20" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#4e3f45] group-hover:text-[#7c2945] transition-colors">
                  Our Features
                </span>
              </Link>

              {/* Tile 4: Contact Us */}
              <Link 
                href="/about"
                className="group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-md"
                style={{
                  backgroundColor: 'rgba(252, 237, 240, 0.85)',
                  border: '1px solid rgba(245, 215, 222, 0.6)',
                }}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-[#7c2945] bg-white/70 shadow-xs mb-2 transition-transform group-hover:scale-110">
                  <Mail className="w-5 h-5 text-[#7c2945]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-[#4e3f45] group-hover:text-[#7c2945] transition-colors">
                  Contact Us
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* 6. Subtle Copyright / Footer Watermark */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-[#876a73] select-none pointer-events-none">
        <p>&copy; {new Date().getFullYear()} SoulBridge. Crafted with love.</p>
      </footer>
    </div>
  );
}

