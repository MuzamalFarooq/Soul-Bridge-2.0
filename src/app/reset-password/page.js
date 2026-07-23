"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { resetUserPassword } from "@/actions/auth";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset token is missing. Please check your recovery link.");
      return;
    }

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
      const res = await resetUserPassword(token, password);
      if (res.success) {
        setSuccess(res.message);
        setPassword("");
        setConfirmPassword("");
        
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(res.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white border-opacity-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex items-center gap-1.5 mb-2">
            <Heart className="w-7 h-7 text-primary-pink fill-primary-pink" />
            <span className="text-xl font-bold tracking-tight bg-gradient-premium bg-clip-text text-transparent">
              Soul Bridge
            </span>
          </Link>
          <h2 className="text-2xl font-bold">Choose New Password</h2>
          <p className="text-xs text-foreground text-opacity-65 mt-1">
            Complete the form below to reset your credentials.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 mb-5 rounded-xl bg-red-500 bg-opacity-10 border border-red-500 border-opacity-25 text-red-500 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3.5 mb-5 rounded-xl bg-emerald-500 bg-opacity-10 border border-emerald-500 border-opacity-25 text-emerald-500 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success} Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-foreground text-opacity-70 px-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground text-opacity-40" />
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                required
                disabled={loading || !token}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-foreground text-opacity-70 px-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground text-opacity-40" />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                required
                disabled={loading || !token}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-premium text-white font-semibold text-sm shadow-lg shadow-pink-500/25 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : "Reset Password"}
          </button>
        </form>

        {!token && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-center text-xs">
            A valid token query parameter (e.g. ?token=...) is required to reset your password.
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-foreground text-opacity-60">
            Remembered it?{" "}
            <Link href="/login" className="text-primary-pink font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
