"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Sparkles, AlertCircle, CheckCircle, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { registerUser } from "@/actions/auth";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    try {
      let res;
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password })
        });
        res = await response.json();
      } catch (fetchErr) {
        res = await registerUser({ email: cleanEmail, password });
      }
      
      if (!res || !res.success) {
        setError(res?.error || "Failed to register account.");
        setLoading(false);
        return;
      }

      setSuccess("Registration successful! Account created and data saved.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      setTimeout(() => {
        router.push(`/verify-email?token=${res.verificationToken || "success"}`);
      }, 1500);

    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10 bg-[#09090B]">
      <div className="absolute w-[500px] h-[500px] bg-radial from-[#9C6BFF]/20 via-[#FF4D8D]/10 to-transparent blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card-lux rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl relative"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex items-center gap-2 mb-3 group">
            <Heart className="w-8 h-8 text-[#FF4D8D] fill-[#FF4D8D] group-hover:scale-110 transition-transform filter drop-shadow-[0_0_10px_rgba(255,77,141,0.6)]" />
            <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] via-[#FFB6C1] to-[#9C6BFF]">
              Soul Bridge
            </span>
          </Link>
          <h2 className="text-2xl font-black text-white">Create Your Account</h2>
          <p className="text-xs text-white/60 mt-1 font-medium flex items-center gap-1 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#9C6BFF]" /> Begin your AI matchmaking journey today.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2.5 p-3.5 mb-6 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-col gap-1 p-3.5 mb-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs"
          >
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Registration Complete!</span>
            </div>
            <p className="text-[11px] opacity-90 mt-1 font-medium">
              Redirecting to email verification...
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/70 px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input-lux text-xs text-white placeholder-white/40"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/70 px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input-lux text-xs text-white placeholder-white/40"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/70 px-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input-lux text-xs text-white placeholder-white/40"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white font-bold text-xs shadow-xl shadow-pink-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Join Soul Bridge <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-5">
          <p className="text-xs text-white/60 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-[#FF4D8D] font-bold hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
