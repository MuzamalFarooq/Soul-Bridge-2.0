"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heart, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { verifyUserEmail } from "@/actions/auth";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!token) {
      setError("Verification token is missing. Please check your email registration.");
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
        setError(res.error || "Failed to verify email");
      }
    } catch (err) {
      setError("An unexpected error occurred during verification");
    } finally {
      setVerifying(false);
    }
  };

  // Auto trigger verification if token exists
  useEffect(() => {
    if (token) {
      handleVerify();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white border-opacity-10 shadow-2xl text-center">
        <div className="flex flex-col items-center mb-6">
          <Heart className="w-12 h-12 text-primary-pink fill-primary-pink animate-pulse mb-3" />
          <h2 className="text-2xl font-bold">Email Verification</h2>
          <p className="text-xs text-foreground text-opacity-65 mt-1.5">
            Verifying your security credentials.
          </p>
        </div>

        {verifying && (
          <div className="py-8 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary-pink border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-foreground text-opacity-60">Validating token...</p>
          </div>
        )}

        {!verifying && error && (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500 bg-opacity-15 flex items-center justify-center border border-red-500 border-opacity-25">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <p className="text-xs text-foreground text-opacity-60 max-w-xs mx-auto">
              Please make sure your token is correct, or try registering your account again.
            </p>
          </div>
        )}

        {!verifying && success && (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 bg-opacity-15 flex items-center justify-center border border-emerald-500 border-opacity-25">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-emerald-500">{success}</p>
            <p className="text-xs text-foreground text-opacity-60">
              Your email is successfully verified. You can now login.
            </p>
          </div>
        )}

        {!token && !verifying && (
          <div className="py-6 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Paste verification token here"
              id="manual-token"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-center"
            />
            <button
              onClick={() => {
                const tokenVal = document.getElementById("manual-token").value;
                window.location.search = `?token=${tokenVal}`;
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-premium text-white font-semibold text-xs cursor-pointer"
            >
              Verify Token
            </button>
          </div>
        )}

        <div className="mt-8 border-t border-white border-opacity-5 pt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-primary-pink font-semibold hover:underline"
          >
            Go to Login Page <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
