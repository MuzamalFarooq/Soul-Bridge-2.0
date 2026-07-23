"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, AlertCircle, CheckCircle, Mail, Lock } from "lucide-react";
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
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({ email, password });
      
      if (!res.success) {
        setError(res.error || "Failed to register user");
        setLoading(false);
        return;
      }

      setSuccess(`Registration successful! Your verification token is: ${res.verificationToken}`);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      // Auto redirect to verify-email page with token after 3s
      setTimeout(() => {
        router.push(`/verify-email?token=${res.verificationToken}`);
      }, 3000);

    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white border-opacity-10 shadow-2xl relative">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex items-center gap-1.5 mb-2">
            <Heart className="w-7 h-7 text-primary-pink fill-primary-pink" />
            <span className="text-xl font-bold tracking-tight bg-gradient-premium bg-clip-text text-transparent">
              Soul Bridge
            </span>
          </Link>
          <h2 className="text-2xl font-bold">Create Your Account</h2>
          <p className="text-xs text-foreground text-opacity-65 mt-1.5 flex items-center gap-1 justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary-purple" /> Meet your AI-matched companion today.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 mb-5 rounded-xl bg-red-500 bg-opacity-10 border border-red-500 border-opacity-25 text-red-500 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex flex-col gap-1 p-3.5 mb-5 rounded-xl bg-emerald-500 bg-opacity-10 border border-emerald-500 border-opacity-25 text-emerald-500 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Registration Success!</span>
            </div>
            <p className="text-[10px] opacity-90 mt-1 break-all">
              {success}. Redirecting to email verification...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-foreground text-opacity-70 px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground text-opacity-40" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-foreground text-opacity-70 px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground text-opacity-40" />
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-foreground text-opacity-70 px-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground text-opacity-40" />
              <input
                type="password"
                placeholder="Verify password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-premium text-white font-semibold text-sm shadow-lg shadow-pink-500/25 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-foreground text-opacity-60">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-pink font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
