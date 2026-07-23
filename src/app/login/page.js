"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Heart, AlertCircle, Mail, Lock } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check for errors passed back from NextAuth page redirection
    const authError = searchParams.get("error");
    if (authError) {
      if (authError === "CredentialsSignin") {
        setError("Invalid email or password");
      } else {
        setError(authError);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white border-opacity-10 shadow-2xl">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex items-center gap-1.5 mb-2">
            <Heart className="w-7 h-7 text-primary-pink fill-primary-pink" />
            <span className="text-xl font-bold tracking-tight bg-gradient-premium bg-clip-text text-transparent">
              Soul Bridge
            </span>
          </Link>
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-xs text-foreground text-opacity-65 mt-1">
            Sign in to check your matches and chat.
          </p>
        </div>

        {/* Errors */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 mb-5 rounded-xl bg-red-500 bg-opacity-10 border border-red-500 border-opacity-25 text-red-500 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
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
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-semibold text-foreground text-opacity-70">Password</label>
              <Link href="/forgot-password" className="text-[10px] text-primary-pink hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground text-opacity-40" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            ) : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-foreground text-opacity-60">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary-pink font-semibold hover:underline">
              Register Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
