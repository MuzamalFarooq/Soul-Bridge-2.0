"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Heart, AlertCircle, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [customError, setCustomError] = useState("");

  const authError = searchParams.get("error");
  const queryError = authError
    ? authError === "CredentialsSignin"
      ? "Invalid email address or password."
      : authError === "OAuthSignin" || authError === "OAuthCallback"
      ? "Could not authenticate with Google. Please try again."
      : authError
    : "";

  const error = customError || queryError;
  const setError = setCustomError;

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      const callbackUrl = searchParams.get("callbackUrl") || "/discover";
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Failed to sign in with Google. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanEmail = email.toLowerCase().trim();

      const result = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        if (result?.error === "CredentialsSignin") {
          setError("Invalid email address or password.");
        } else {
          setError(result?.error || "Failed to sign in. Please check your credentials.");
        }
        setLoading(false);
        return;
      }

      try {
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
      } catch (syncErr) {
        console.error("Auth sync error:", syncErr);
      }

      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl) {
        router.replace(callbackUrl);
      } else if (cleanEmail === "admin" || cleanEmail.startsWith("admin@")) {
        router.replace("/admin");
      } else {
        router.replace("/discover");
      }
      router.refresh();
    } catch (err) {
      console.error("Login page submit error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10 bg-[#09090B]">
      {/* Radial backdrop */}
      <div className="absolute w-[500px] h-[500px] bg-radial from-[#FF4D8D]/20 via-[#9C6BFF]/10 to-transparent blur-[120px] pointer-events-none" />

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
          <h2 className="text-2xl font-black text-white">Welcome Back</h2>
          <p className="text-xs text-white/60 mt-1 font-medium">
            Sign in to check your matches, chats, and daily scores.
          </p>
        </div>

        {/* Errors */}
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/70 px-1">Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="you@example.com or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input-lux text-xs text-white placeholder-white/40"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-white/70">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-[#FF4D8D] font-bold hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl glass-input-lux text-xs text-white placeholder-white/40"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white font-bold text-xs shadow-xl shadow-pink-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Log In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40 bg-[#09090B]">
            Or continue with
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="w-full py-3 px-4 rounded-2xl glass-card-lux border border-white/15 hover:border-white/30 text-white font-bold text-xs shadow-lg hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {googleLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="mt-6 text-center border-t border-white/10 pt-4">
          <p className="text-xs text-white/60 font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#FF4D8D] font-bold hover:underline ml-1">
              Join Free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-foreground/50">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
