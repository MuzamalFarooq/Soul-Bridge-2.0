"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

export default function Loader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-[100] bg-[#09090B] flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          {/* Glowing Radial Background */}
          <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-[#FF4D8D]/20 to-[#9C6BFF]/20 rounded-full blur-[120px] animate-pulse" />

          <div className="relative flex flex-col items-center gap-6">
            {/* Animated 3D Glass Heart Loader */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="relative z-10"
              >
                <Heart className="w-16 h-16 text-[#FF4D8D] fill-[#FF4D8D] filter drop-shadow-[0_0_20px_rgba(255,77,141,0.8)]" />
              </motion.div>

              <motion.div
                animate={{
                  scale: [1.2, 1.8, 1.2],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                className="absolute"
              >
                <Heart className="w-16 h-16 text-[#9C6BFF] fill-[#9C6BFF] blur-md opacity-60" />
              </motion.div>
            </div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center gap-1.5"
            >
              <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] via-[#FFB6C1] to-[#9C6BFF]">
                Soul Bridge
              </h1>
              <p className="text-xs text-white/50 tracking-widest font-semibold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FF4D8D]" /> Premium Dating Experience
              </p>
            </motion.div>

            {/* Progress bar */}
            <div className="w-36 h-1 rounded-full bg-white/10 overflow-hidden relative mt-2">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="w-full h-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
