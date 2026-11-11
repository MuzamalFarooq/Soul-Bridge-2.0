'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SoulBridgeLoader from './SoulBridgeLoader';

/**
 * AuthLoader — Dedicated branded loading modal for authentication flows (Google OAuth, Sign In, Sign Up).
 *
 * @param {boolean} isLoading - Controls visibility of the auth loader
 * @param {string} message - Custom message (defaults to "Preparing your SoulBridge experience...")
 */
export default function AuthLoader({ 
  isLoading = false, 
  message = 'Preparing your SoulBridge experience...' 
}) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="soul-bridge-auth-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 select-none"
          style={{
            backgroundColor: 'rgba(255, 253, 250, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          role="status"
          aria-live="polite"
          aria-label={message}
        >
          <div className="w-full max-w-md">
            <SoulBridgeLoader fullScreen={false} customMessage={message} variant="auth" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

