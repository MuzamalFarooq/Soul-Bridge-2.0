"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Key, AlertCircle, CheckCircle, Mail } from "lucide-react";
import { forgotPasswordRequest } from "@/actions/auth";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await forgotPasswordRequest(email);
      if (res.success) {
        setSuccess(`Reset request completed! Your reset token is: ${res.resetToken}`);
        setEmail("");
        
        // Auto redirect to reset-password page after 4s
        setTimeout(() => {
          router.push(`/reset-password?token=${res.resetToken}`);
        }, 4000);
      } else {
        setError(res.error || "Failed to request password reset");
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
          <h2 className="text-2xl font-bold">Reset Your Password</h2>
          <p className="text-xs text-foreground text-opacity-65 mt-1">
            Provide your email to receive a password recovery token.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 mb-5 rounded-xl bg-red-500 bg-opacity-10 border border-red-500 border-opacity-25 text-red-500 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex flex-col gap-1 p-3.5 mb-5 rounded-xl bg-emerald-500 bg-opacity-10 border border-emerald-500 border-opacity-25 text-emerald-500 text-xs text-left">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Reset Token Created!</span>
            </div>
            <p className="text-[10px] opacity-90 mt-1 break-all">
              {success}. Redirecting to reset form...
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-premium text-white font-semibold text-sm shadow-lg shadow-pink-500/25 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Key className="w-4 h-4" /> Request Reset Link
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-foreground text-opacity-60">
            Back to{" "}
            <Link href="/login" className="text-primary-pink font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
