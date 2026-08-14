"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { verifyUserEmail } from "@/actions/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!token) {
      setError("Verification token missing.");
      return;
    }

    setVerifying(true);
    setError("");
    setSuccess("");

    try {
      const res = await verifyUserEmail(token);
      if (res.success) {
        setSuccess(res.message);
      } else {
        setError(res.error || "Failed to verify email address.");
      }
    } catch (err) {
      setError("An unexpected error occurred during verification.");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (token) {
      handleVerify();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10 bg-[#09090B]">
      <div className="absolute w-125 h-125 bg-radial from-[#FF4D8D]/20 via-[#9C6BFF]/10 to-transparent blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card-lux rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl text-center relative"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <Heart className="w-12 h-12 text-[#FF4D8D] fill-[#FF4D8D] animate-bounce filter drop-shadow-[0_0_12px_rgba(255,77,141,0.6)]" />
          </div>
          <h2 className="text-2xl font-black text-white">Email Verification</h2>
          <p className="text-xs text-white/60 mt-1 font-medium">
            Validating security token...
          </p>
        </div>

        {verifying && (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#FF4D8D] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-white/60 font-semibold">Checking database token...</p>
          </div>
        )}

        {!verifying && error && (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <p className="text-sm font-bold text-rose-400">{error}</p>
            <p className="text-xs text-white/60 max-w-xs font-medium">
              Check your token string or register a new user account.
            </p>
          </div>
        )}

        {!verifying && success && (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-emerald-400">{success}</p>
            <p className="text-xs text-white/60 font-medium">
              Account activated! You can now log in and complete your profile.
            </p>
          </div>
        )}

        {!token && !verifying && (
          <div className="py-6 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Paste verification token here"
              id="manual-token"
              className="w-full px-4 py-3 rounded-2xl glass-input-lux text-xs text-center text-white"
            />
            <button
              onClick={() => {
                const tokenVal = document.getElementById("manual-token").value;
                window.location.search = `?token=${tokenVal}`;
              }}
              className="w-full py-3 rounded-2xl bg-linear-to-r from-[#FF4D8D] to-[#9C6BFF] text-white font-bold text-xs shadow-lg cursor-pointer"
            >
              Verify Token Now
            </button>
          </div>
        )}

        <div className="mt-8 border-t border-white/10 pt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-[#FF4D8D] font-bold hover:underline"
          >
            Proceed to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-foreground/50">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
