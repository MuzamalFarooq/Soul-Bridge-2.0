'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SoulBridgeLoader from './SoulBridgeLoader';

export default function Loader() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const hasLoaded = sessionStorage.getItem('soul-bridge-loader-shown');
      if (!hasLoaded) {
        const timer = setTimeout(() => {
          setLoading(true);
          const dismissTimer = setTimeout(() => {
            setLoading(false);
            try {
              sessionStorage.setItem('soul-bridge-loader-shown', 'true');
            } catch {
              // ignore storage errors
            }
          }, 850);
          return () => clearTimeout(dismissTimer);
        }, 10);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="soul-bridge-app-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[120] pointer-events-none"
        >
          <SoulBridgeLoader fullScreen={true} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
