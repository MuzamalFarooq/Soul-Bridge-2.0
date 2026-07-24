"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Heart, Sparkles, User, Award, ShieldAlert, Zap, MessageSquare, 
  Eye, Activity, HelpCircle, RefreshCw, Crown, CheckCircle2, TrendingUp, Compass, Flame
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDashboardData } from "@/actions/dashboard";
import { getProfileReviewAction as getAIReviewAction } from "@/actions/profile";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiReview, setAiReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getDashboardData();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load dashboard metrics.");
      }
    } catch (err) {
      setError("An unexpected error occurred while loading dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAIProfileReview = async () => {
    setReviewLoading(true);
    setAiReview(null);
    try {
      const res = await getAIReviewAction();
      if (res.success) {
        setAiReview(res.tips);
      } else {
        setAiReview(["Highlight your hobbies and life values in your bio.", "Add photo variations showing your interests and travel."]);
      }
    } catch (err) {
      setAiReview(["Ensure your photo gallery reflects different aspects of your life."]);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#09090B]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FF4D8D] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-white/50 font-semibold">Assembling your luxury matchmaking space...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const profile = data?.profile;
  const isPremium = profile?.premiumStatus && profile?.premiumStatus !== "FREE";

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 relative z-10">
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-2">
              Welcome Back, {profile?.fullName || "User"}! 
              {isPremium && <Crown className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />}
            </h1>
            <p className="text-xs text-white/60 mt-1 font-medium">
              Here is your daily matchmaking metrics & activity dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/discover"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white text-xs font-bold shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" /> Start Discovering
            </Link>
            <button
              onClick={fetchDashboard}
              className="p-3 rounded-full glass-panel-lux hover:border-[#FF4D8D]/40 text-white transition-all cursor-pointer"
              title="Refresh Metrics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: User Overview & Completion */}
          <div className="flex flex-col gap-6">
            
            {/* Profile Info Card */}
            <div className="glass-card-lux rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF4D8D] to-[#9C6BFF] flex items-center justify-center text-white font-black text-2xl uppercase border border-white/20 shadow-lg">
                  {profile?.fullName ? profile.fullName[0] : "U"}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">{profile?.fullName}</h3>
                  <p className="text-xs text-white/50 font-medium">@{profile?.username || "username"}</p>
                  <div className="inline-flex items-center gap-1 mt-1.5 px-3 py-0.5 rounded-full bg-[#9C6BFF]/20 border border-[#9C6BFF]/30 text-[10px] font-bold text-[#9C6BFF]">
                    <User className="w-3 h-3" /> {profile?.gender}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-white/70">Profile Completion</span>
                  <span className="text-[#FF4D8D]">{data?.completionPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] rounded-full transition-all duration-500"
                    style={{ width: `${data?.completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-white/50 border-t border-white/10 pt-3 font-semibold">
                <span>Account Tier:</span>
                <span className="font-bold text-[#9C6BFF] flex items-center gap-1 uppercase">
                  {profile?.premiumStatus} {isPremium && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                </span>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card-lux rounded-3xl p-5 border border-white/10 text-center flex flex-col items-center justify-center">
                <Heart className="w-7 h-7 text-[#FF4D8D] fill-[#FF4D8D]/20 mb-2" />
                <span className="text-3xl font-black text-white">{data?.likesCount || 0}</span>
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-1">Likes Received</span>
              </div>

              <div className="glass-card-lux rounded-3xl p-5 border border-white/10 text-center flex flex-col items-center justify-center">
                <MessageSquare className="w-7 h-7 text-[#9C6BFF] fill-[#9C6BFF]/20 mb-2" />
                <span className="text-3xl font-black text-white">{data?.matchesCount || 0}</span>
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-1">Total Matches</span>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="glass-card-lux rounded-3xl p-6 border border-white/10">
              <h3 className="font-extrabold text-xs mb-4 flex items-center gap-2 uppercase tracking-wider text-white/80">
                <Activity className="w-4 h-4 text-[#FF4D8D]" /> Recent Activity
              </h3>
              <div className="flex flex-col gap-3">
                {data?.activityLogs?.map((log, index) => (
                  <div key={index} className="flex gap-3 text-xs leading-normal border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-[#FF4D8D] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-white/80 font-medium">{log.details || log.action}</p>
                      <span className="text-[9px] text-white/40 font-semibold block mt-0.5">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: AI Counterparts & Audit Coach */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* AI Suggested Matches */}
            <div className="glass-card-lux rounded-3xl p-6 border border-white/10">
              <h3 className="font-extrabold text-xs mb-5 flex items-center gap-2 uppercase tracking-wider text-[#FF4D8D]">
                <Sparkles className="w-4 h-4 text-[#FF4D8D]" /> AI Suggested Counterparts
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data?.suggestions?.map((sug) => (
                  <div key={sug.id} className="glass-panel-lux rounded-2xl overflow-hidden border border-white/10 flex flex-col hover:scale-105 transition-transform duration-300">
                    <div className="h-40 relative overflow-hidden bg-slate-800">
                      <img src={sug.photo} alt={sug.fullName} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-bold text-[#FF4D8D] flex items-center gap-1 border border-white/10">
                        <TrendingUp className="w-3 h-3" /> {sug.compatibility}% Match
                      </div>
                    </div>
                    
                    <div className="p-3.5 flex flex-col gap-1.5">
                      <h4 className="font-extrabold text-sm text-white">{sug.fullName}, {sug.age}</h4>
                      <p className="text-[10px] text-white/50 font-medium">{sug.profession} • {sug.city}</p>
                      <p className="text-[11px] text-white/80 line-clamp-2 italic font-medium">
                        "{sug.bio || "No bio description set."}"
                      </p>
                      
                      <Link
                        href={`/discover?user=${sug.id}`}
                        className="w-full text-center mt-3 py-2 rounded-xl bg-[#FF4D8D]/20 hover:bg-[#FF4D8D] text-[#FF4D8D] hover:text-white text-[10px] font-bold transition-all"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Visitors & Who Liked Me */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Visitors */}
              <div className="glass-card-lux rounded-3xl p-6 border border-white/10">
                <h3 className="font-extrabold text-xs mb-4 flex items-center gap-2 uppercase tracking-wider text-white/80">
                  <Eye className="w-4 h-4 text-indigo-400" /> Recent Visitors
                </h3>
                
                <div className="flex flex-col gap-3">
                  {data?.visitors?.map((visitor) => (
                    <div key={visitor.id} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img src={visitor.photo} alt={visitor.fullName} className="w-9 h-9 rounded-xl object-cover" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{visitor.fullName}</h4>
                          <span className="text-[9px] text-white/40 font-semibold">{visitor.time}</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold uppercase">Viewed</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Likes Received */}
              <div className="glass-card-lux rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-xs mb-4 flex items-center gap-2 uppercase tracking-wider text-[#9C6BFF]">
                    <Heart className="w-4 h-4" /> Who Liked Me
                  </h3>

                  {isPremium ? (
                    <div className="flex flex-col gap-3">
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-medium text-white/80">
                        You have Premium status! Head to discover deck to check your swiped profiles.
                      </div>
                    </div>
                  ) : (
                    <div className="relative py-4 text-center flex flex-col items-center">
                      <div className="w-full flex flex-col gap-2 filter blur-sm opacity-30 select-none pointer-events-none mb-4">
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl"><div className="w-6 h-6 rounded bg-white/30" /><div className="h-3 w-20 bg-white/30 rounded" /></div>
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl"><div className="w-6 h-6 rounded bg-white/30" /><div className="h-3 w-28 bg-white/30 rounded" /></div>
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <Crown className="w-8 h-8 text-amber-400 fill-amber-400 animate-pulse mb-1.5" />
                        <h4 className="text-xs font-black text-white">Unlock Likes Received</h4>
                        <p className="text-[10px] text-white/60 max-w-[200px] leading-normal mt-1 font-medium">
                          Gold & Platinum members see who liked them instantly.
                        </p>
                        <button
                          onClick={() => alert("Redirecting to Premium Plan Upgrade...")}
                          className="mt-3.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF] text-white text-[10px] font-bold shadow-lg"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Gemini AI Profile Coach Widget */}
            <div className="glass-card-lux rounded-3xl p-6 border border-white/10">
              <h3 className="font-extrabold text-xs mb-3 flex items-center gap-2 uppercase tracking-wider text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Gemini AI Profile Audit Coach
              </h3>
              <p className="text-xs text-white/70 leading-relaxed mb-4 font-medium">
                Consult our AI dating coach to analyze your profile details and provide personalized suggestions to maximize match compatibility.
              </p>

              {aiReview && (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex flex-col gap-2 mb-4 animate-in fade-in duration-300 text-left">
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Coaching Recommendations:
                  </h4>
                  <ul className="list-disc pl-4 flex flex-col gap-1 text-xs text-white/80 font-medium">
                    {aiReview.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleAIProfileReview}
                disabled={reviewLoading}
                className="px-6 py-3 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {reviewLoading ? "Analyzing Profile Data..." : (
                  <>
                    <HelpCircle className="w-4 h-4" /> Audit My Profile
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
