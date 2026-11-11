'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const LOADING_MESSAGES = [
  'Bringing meaningful connections closer...',
  'Finding beautiful possibilities...',
  'Creating moments that matter...',
  'Almost there...',
];

/**
 * SoulBridgeLoader — Signature romantic loading experience.
 *
 * @param {boolean} fullScreen - Whether to render as fixed fullscreen overlay
 * @param {string} customMessage - Optional static message (overrides message rotation)
 * @param {string} variant - 'default' | 'compact' | 'auth'
 */
export default function SoulBridgeLoader({ 
  fullScreen = false, 
  customMessage,
  variant = 'default' 
}) {
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate messages smoothly every 2.4 seconds if no custom message is specified
  useEffect(() => {
    if (customMessage) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [customMessage]);

  const currentMessage = customMessage || LOADING_MESSAGES[messageIndex];

  // Subtle floating background elements
  const floatingHearts = [
    { id: 1, left: '15%', delay: 0, duration: 16, size: 16, xOffset: 20 },
    { id: 2, left: '32%', delay: 3, duration: 20, size: 12, xOffset: -25 },
    { id: 3, left: '72%', delay: 1.5, duration: 18, size: 14, xOffset: 25 },
    { id: 4, left: '85%', delay: 4, duration: 22, size: 18, xOffset: -18 },
  ];

  const content = (
    <div 
      className={`relative flex flex-col items-center justify-center select-none ${
        fullScreen 
          ? 'fixed inset-0 z-[120] overflow-hidden' 
          : 'w-full py-12 px-4'
      }`}
      style={{
        backgroundColor: fullScreen ? 'rgba(255, 253, 250, 0.94)' : 'transparent',
        backdropFilter: fullScreen ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: fullScreen ? 'blur(16px)' : 'none',
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading SoulBridge"
    >
      {/* Ambient background glows for fullScreen mode */}
      {fullScreen && (
        <>
          <div 
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none opacity-40 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #FCE7E5 0%, #D99AA3 40%, transparent 70%)',
            }}
          />
          <div 
            className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-40 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #FCE7E5 0%, #D99AA3 40%, transparent 70%)',
            }}
          />

          {/* Floating translucent ambient hearts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {floatingHearts.map((heart) => (
              <motion.div
                key={heart.id}
                initial={{ y: '105vh', opacity: 0 }}
                animate={{ 
                  y: '-10vh', 
                  opacity: [0, 0.5, 0.5, 0],
                  x: [0, heart.xOffset, 0] 
                }}
                transition={{
                  duration: heart.duration,
                  delay: heart.delay,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  position: 'absolute',
                  left: heart.left,
                  width: heart.size,
                  height: heart.size,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path 
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                    fill="rgba(128, 13, 50, 0.12)"
                    stroke="rgba(128, 13, 50, 0.18)"
                    strokeWidth="1"
                  />
                </svg>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Main Glass Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center max-w-sm w-full mx-auto px-6 py-8 rounded-3xl"
        style={{
          backgroundColor: fullScreen ? 'rgba(255, 255, 255, 0.78)' : 'transparent',
          border: fullScreen ? '1px solid rgba(255, 255, 255, 0.85)' : 'none',
          boxShadow: fullScreen ? '0 16px 40px rgba(128, 13, 50, 0.08)' : 'none',
        }}
      >
        {/* Animated Connecting Hearts ("The Soul Bridge") */}
        <div className="relative w-72 h-32 flex items-center justify-center">
          <svg 
            width="280" 
            height="120" 
            viewBox="0 0 280 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Burgundy Gradient */}
              <linearGradient id="sbWineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#800D32" />
                <stop offset="50%" stopColor="#650D2B" />
                <stop offset="100%" stopColor="#540b1f" />
              </linearGradient>

              {/* Connecting Bridge Track Gradient */}
              <linearGradient id="sbBridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#800D32" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#D99AA3" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#800D32" stopOpacity="0.25" />
              </linearGradient>

              {/* Soft Glow Filter */}
              <filter id="sbHeartGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Bridge Arch Curve */}
            <path 
              d="M 68 62 C 100 22, 180 22, 212 62" 
              stroke="url(#sbBridgeGrad)" 
              strokeWidth="2.5" 
              strokeDasharray="4 4"
              strokeLinecap="round"
              fill="none" 
            />

            {/* Animated Energy Flow along the Bridge */}
            <motion.path
              d="M 68 62 C 100 22, 180 22, 212 62"
              stroke="#800D32"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 0],
                opacity: [0, 0.85, 0]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            {/* Left Heart (Soul 1) with Organic Heartbeat */}
            <motion.g
              animate={{
                scale: [1, 1.08, 1, 1.04, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: 'easeInOut',
              }}
              style={{ originX: '52px', originY: '60px' }}
            >
              <path 
                d="M 52 42 C 52 42, 34 32, 28 47 C 22 62, 52 82, 52 82 C 52 82, 82 62, 76 47 C 70 32, 52 42, 52 42 Z" 
                stroke="url(#sbWineGrad)" 
                strokeWidth="2.6" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="rgba(252, 231, 229, 0.65)" 
                filter="url(#sbHeartGlow)"
              />
            </motion.g>

            {/* Right Heart (Soul 2) with Organic Heartbeat (Slightly Offset) */}
            <motion.g
              animate={{
                scale: [1, 1.04, 1, 1.08, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: 'easeInOut',
                delay: 0.15
              }}
              style={{ originX: '228px', originY: '60px' }}
            >
              <path 
                d="M 228 42 C 228 42, 210 32, 204 47 C 198 62, 228 82, 228 82 C 228 82, 258 62, 252 47 C 246 32, 228 42, 228 42 Z" 
                stroke="url(#sbWineGrad)" 
                strokeWidth="2.6" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="rgba(252, 231, 229, 0.65)" 
                filter="url(#sbHeartGlow)"
              />
            </motion.g>

            {/* Glowing Traveling Soul Pulse moving across the bridge */}
            <motion.g
              animate={{
                x: [68, 140, 212, 140, 68],
                y: [62, 30, 62, 30, 62],
                scale: [0.9, 1.25, 0.9, 1.25, 0.9],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <circle cx="0" cy="0" r="10" fill="#FCE7E5" opacity="0.8" />
              <circle cx="0" cy="0" r="5" fill="#800D32" />
            </motion.g>
          </svg>
        </div>

        {/* Brand Heading */}
        <div className="flex flex-col items-center text-center mt-2 mb-3">
          <h2 
            className="text-2xl font-bold tracking-tight text-[#800D32]"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            SoulBridge
          </h2>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#800D32]/70 uppercase tracking-widest mt-1">
            <Sparkles className="w-3 h-3 text-[#D99AA3]" />
            Meaningful Connections
          </span>
        </div>

        {/* Smoothly Rotating Messages (Fixed Height to Prevent Layout Shift) */}
        <div className="h-9 flex items-center justify-center text-center px-4 w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-xs sm:text-sm font-medium text-[#5c4a52] leading-tight"
            >
              {currentMessage}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Indeterminate Romantic Progress Indicator */}
        <div 
          className="w-48 h-1.5 rounded-full overflow-hidden relative mt-4"
          style={{ backgroundColor: '#FCE7E5' }}
          aria-hidden="true"
        >
          <motion.div
            animate={{
              x: ['-100%', '150%'],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-2/3 h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #800D32 50%, #650D2B 100%)',
            }}
          />
        </div>
      </motion.div>
    </div>
  );

  return content;
}

