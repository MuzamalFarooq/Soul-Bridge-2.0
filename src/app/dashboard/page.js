"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Heart, Sparkles, User, Award, ShieldAlert, Zap, MessageSquare, 
  Eye, Activity, HelpCircle, RefreshCw, Crown, CheckCircle2, TrendingUp 
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
        setError(res.error || "Failed to load dashboard metrics");
      }
    } catch (err) {
      setError("An unexpected error occurred while loading dashboard");
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
        setAiReview(["Try writing a slightly longer bio focusing on your long-term goals.", "Add more hobbies to make it easy for matches to ask questions."]);
      }
    } catch (err) {
      setAiReview(["Ensure your photo gallery highlights different aspects of your life (travel, hobbies)."]);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-pink border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-foreground/60">Assembling your dating space...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const profile = data?.profile;
  const isPremium = profile?.premiumStatus && profile?.premiumStatus !== "FREE";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 relative z-10">
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              Hello, {profile?.fullName || "User"}! 
              {isPremium && <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce" />}
            </h1>
            <p className="text-sm text-foreground/60 mt-1">
              Here is your daily matchmaking activity report.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/discover"
              className="px-5 py-2.5 rounded-xl bg-gradient-premium text-white text-xs font-bold shadow-lg shadow-pink-500/10 hover:shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 fill-current" /> Start Discovering
            </Link>
            <button
              onClick={fetchDashboard}
              className="p-3 rounded-xl glass-panel hover:bg-white/10 text-foreground transition-all cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: User Summary & Completion */}
          <div className="flex flex-col gap-6">
            {/* User Profile Info Card */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-premium flex items-center justify-center text-white font-extrabold text-2xl uppercase border border-white/10 shadow-md">
                  {profile?.fullName ? profile.fullName[0] : "U"}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{profile?.fullName}</h3>
                  <p className="text-xs text-foreground/60">@{profile?.username || "username"}</p>
                  <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-[10px] font-bold text-indigo-400">
                    <User className="w-3 h-3" /> {profile?.gender}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span>Profile Completion</span>
                  <span className="text-primary-pink">{data?.completionPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-premium rounded-full"
                    style={{ width: `${data?.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-foreground/50 border-t border-white/5 pt-3">
                <span>Account Tier:</span>
                <span className="font-bold text-primary-purple flex items-center gap-1 uppercase">
                  {profile?.premiumStatus} {isPremium && <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                </span>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel rounded-2xl p-4 border border-white/5 text-center flex flex-col items-center justify-center">
                <Heart className="w-6 h-6 text-primary-pink fill-primary-pink/10 mb-1" />
                <span className="text-2xl font-black">{data?.likesCount || 0}</span>
                <span className="text-[10px] text-foreground/50 font-semibold uppercase mt-0.5">Likes Received</span>
              </div>

              <div className="glass-panel rounded-2xl p-4 border border-white/5 text-center flex flex-col items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary-purple fill-primary-purple/10 mb-1" />
                <span className="text-2xl font-black">{data?.matchesCount || 0}</span>
                <span className="text-[10px] text-foreground/50 font-semibold uppercase mt-0.5">Total Matches</span>
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider text-foreground/70">
                <Activity className="w-4 h-4 text-primary-pink" /> Recent Activity
              </h3>
              <div className="flex flex-col gap-3">
                {data?.activityLogs?.map((log, index) => (
                  <div key={index} className="flex gap-3 text-xs leading-normal border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-primary-pink mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-foreground/80 font-medium">{log.details || log.action}</p>
                      <span className="text-[9px] text-foreground/45 mt-0.5 block">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Suggested Matches & Likes Blur */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Suggested Matches */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h3 className="font-bold text-sm mb-5 flex items-center gap-2 uppercase tracking-wider text-primary-pink">
                <Sparkles className="w-4 h-4" /> AI Suggested Counterparts
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data?.suggestions?.map((sug) => (
                  <div key={sug.id} className="glass-panel rounded-2xl overflow-hidden border border-white/5 flex flex-col hover:scale-[1.02] transition-transform duration-300">
                    <div className="h-36 relative overflow-hidden bg-slate-800">
                      <img src={sug.photo} alt={sug.fullName} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-primary-pink flex items-center gap-1 shadow-md">
                        <TrendingUp className="w-3 h-3" /> {sug.compatibility}% Match
                      </div>
                    </div>
                    
                    <div className="p-3.5 flex flex-col gap-1">
                      <h4 className="font-bold text-xs">{sug.fullName}, {sug.age}</h4>
                      <p className="text-[9px] text-foreground/50">{sug.profession} • {sug.city}</p>
                      <p className="text-[10px] text-foreground/80 leading-snug line-clamp-2 italic mt-1.5">
                        "{sug.bio || "No bio description set yet."}"
                      </p>
                      
                      <Link
                        href={`/discover?user=${sug.id}`}
                        className="w-full text-center mt-3 py-1.5 rounded-lg bg-primary-pink/15 hover:bg-primary-pink text-primary-pink hover:text-white text-[10px] font-bold transition-all"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visitors / Who Viewed Me Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Visitors */}
              <div className="glass-card rounded-2xl p-6 border border-white/5">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider text-foreground/70">
                  <Eye className="w-4 h-4 text-indigo-400" /> Recent Visitors
                </h3>
                
                <div className="flex flex-col gap-3">
                  {data?.visitors?.map((visitor) => (
                    <div key={visitor.id} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <img src={visitor.photo} alt={visitor.fullName} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <h4 className="text-xs font-bold">{visitor.fullName}</h4>
                          <span className="text-[9px] text-foreground/45">{visitor.time}</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-foreground/60 font-semibold uppercase">Profile View</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Likes Received / Blur Lock */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider text-primary-purple">
                    <Heart className="w-4 h-4" /> Who Liked Me
                  </h3>

                  {isPremium ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-white/5 border border-white/10">
                        <p className="font-semibold text-foreground/80">Looks like you have premium status! Move to discover deck to check swiped profiles.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative py-4 text-center flex flex-col items-center">
                      {/* Blurred list layout */}
                      <div className="w-full flex flex-col gap-2 filter blur-sm opacity-35 select-none pointer-events-none mb-4">
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg"><div className="w-6 h-6 rounded bg-white/30"></div><div className="h-3 w-20 bg-white/30 rounded"></div></div>
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg"><div className="w-6 h-6 rounded bg-white/30"></div><div className="h-3 w-28 bg-white/30 rounded"></div></div>
                      </div>

                      {/* Upgrade Prompt */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                        <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse mb-1.5" />
                        <h4 className="text-xs font-black text-foreground">Unlock Likes Received</h4>
                        <p className="text-[9px] text-foreground/60 max-w-[200px] leading-normal mt-1">
                          Gold & Platinum accounts can see who liked them instantly.
                        </p>
                        <button
                          onClick={() => alert("Stripe payment modal: Upgrade flow.")}
                          className="mt-3.5 px-4 py-1.5 rounded-full bg-gradient-premium text-white text-[9px] font-bold shadow-lg"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Optimization Review Call */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider text-indigo-400">
                <Sparkles className="w-4 h-4" /> AI Profile Review Coach
              </h3>
              <p className="text-xs text-foreground/75 leading-relaxed mb-4">
                Ask our Gemini AI dating coach to analyze your profile details and give constructive feedback to increase your match alignment rate by up to 80%.
              </p>

              {aiReview && (
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-2 mb-4 animate-in fade-in duration-300 text-left">
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Coaching Recommendations:
                  </h4>
                  <ul className="list-disc pl-4 flex flex-col gap-1 text-xs text-foreground/80">
                    {aiReview.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleAIProfileReview}
                disabled={reviewLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {reviewLoading ? "Analyzing profile..." : (
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
