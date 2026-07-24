"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CursorGlow() {
  const [mounted, setMounted] = useState(false);
  const cursorX = useSpring(-100, { stiffness: 250, damping: 25 });
  const cursorY = useSpring(-100, { stiffness: 250, damping: 25 });

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      className="fixed pointer-events-none z-50 w-72 h-72 rounded-full hidden md:block opacity-30 mix-blend-screen"
    >
      <div className="w-full h-full rounded-full bg-radial from-[#FF4D8D]/40 via-[#9C6BFF]/20 to-transparent blur-2xl animate-pulse" />
    </motion.div>
  );
}
