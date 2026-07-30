"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, CalendarDays, Compass, Crown, Heart, MapPin, Sparkles, UserRound, Briefcase, MessageCircle, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDashboardData } from "@/actions/dashboard";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getDashboardData();
        if (response?.success) {
          setProfileData(response.data);
        } else {
          setError(response?.error || "Unable to load your profile right now.");
        }
      } catch (err) {
        setError("Unable to load your profile right now.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const profile = profileData?.profile;
  const isPremium = profile?.premiumStatus && profile?.premiumStatus !== "FREE";
  const completion = profileData?.completionPercentage || 0;

  const highlights = useMemo(() => [
    { label: "Matches", value: profileData?.matchesCount || 0, icon: Heart },
    { label: "Likes", value: profileData?.likesCount || 0, icon: Sparkles },
    { label: "City", value: profile?.city || "TBD", icon: MapPin },
    { label: "Goal", value: profile?.relationshipGoal || "Open", icon: Compass },
  ], [profile, profileData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#FF4D8D] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-28 md:pb-12">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
        </div>

        {error ? (
          <div className="glass-card-lux rounded-3xl p-6 border border-rose-500/25 text-rose-300">{error}</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-lux rounded-3xl p-6 border border-white/10"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF4D8D] to-[#9C6BFF] flex items-center justify-center text-3xl font-black uppercase shadow-lg">
                    {profile?.fullName ? profile.fullName[0] : (session?.user?.fullName ? session.user.fullName[0] : "U")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-black text-white">{profile?.fullName || session?.user?.fullName || "Your Profile"}</h1>
                      {isPremium && <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />}
                    </div>
                    <p className="text-sm text-white/60 mt-1">@{profile?.username || "your-username"}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#9C6BFF]/30 bg-[#9C6BFF]/15 px-3 py-1 text-[11px] font-semibold text-[#9C6BFF]">
                      <BadgeCheck className="w-3.5 h-3.5" /> {profile?.premiumStatus || "FREE"} Plan
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                  <div className="font-semibold text-white">Profile completion</div>
                  <div className="mt-2 text-2xl font-black text-[#FF4D8D]">{completion}%</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                  <span>Completion progress</span>
                  <span>{completion}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#FF4D8D] to-[#9C6BFF]" style={{ width: `${completion}%` }} />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {highlights.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/50">
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </div>
                    <div className="mt-2 text-lg font-black text-white">{value}</div>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card-lux rounded-3xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-[#9C6BFF]">
                <ShieldCheck className="w-4 h-4" /> About you
              </div>
              <div className="mt-5 space-y-4 text-sm text-white/80">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <Briefcase className="w-4 h-4 mt-0.5 text-[#FF4D8D]" />
                  <div>
                    <div className="font-semibold text-white">Profession</div>
                    <div>{profile?.profession || "Add your profession to stand out."}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <CalendarDays className="w-4 h-4 mt-0.5 text-[#FF4D8D]" />
                  <div>
                    <div className="font-semibold text-white">Age</div>
                    <div>{profile?.age || "Add your age for more relevant matches."}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <MessageCircle className="w-4 h-4 mt-0.5 text-[#FF4D8D]" />
                  <div>
                    <div className="font-semibold text-white">Bio</div>
                    <div>{profile?.bio || "Write a short bio that reflects your personality."}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <UserRound className="w-4 h-4 mt-0.5 text-[#FF4D8D]" />
                  <div>
                    <div className="font-semibold text-white">Gender</div>
                    <div>{profile?.gender || "Share how you identify."}</div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
